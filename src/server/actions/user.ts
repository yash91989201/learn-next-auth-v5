"use server";
import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
// UTILS
import { db } from "@/server/db";
import { signIn, signOut } from "@/server/helpers/auth";
import {
  generatePasswordResetToken,
  generateVerificationToken,
  getPasswordResetTokenByToken,
  getUserByEmail,
  getVerificationTokenByToken,
  generateTwoFactorToken,
  getTwoFactorTokenByEmail,
  getTwoFactorConfirmationByUserId,
} from "@/server/helpers";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendTwoFactorTokenEmail,
} from "@/server/helpers/mail";
// SCHEMAS
import {
  verificationTokens,
  users,
  twoFactorToken,
  twoFactorConfimation,
} from "@/server/db/schema";
import {
  LoginSchema,
  NewPasswordSchema,
  ResetPasswordSchema,
  SignUpSchema,
} from "@/lib/schema";
// TYPES
import type {
  NewVerificationSchemaType,
  LoginSchemaType,
  SignUpSchemaType,
  ResetPasswordSchemaType,
  NewPasswordSchemaType,
} from "@/lib/schema";
// CONSTANTS
import { DEFAULT_LOGIN_REDIRECT } from "@/constants/routes";

async function loginWithCredentials(
  formData: LoginSchemaType,
): Promise<LoginFormStatusType> {
  const validatedFormData = LoginSchema.safeParse(formData);

  if (!validatedFormData.success) {
    let formFieldErrors: SignInFormErrorsType = {};

    validatedFormData.error.errors.map((error) => {
      formFieldErrors = {
        ...formFieldErrors,
        [`${error.path[0]}`]: error.message,
      };
    });

    return {
      status: "FAILED",
      errors: formFieldErrors,
      message: "Invalid data given.",
    };
  }

  const { email, password, twoFactorCode } = validatedFormData.data;
  const existingUser = await getUserByEmail(email);

  if (!existingUser?.email || !existingUser?.password) {
    return {
      status: "FAILED",
      message: "Email does not exist.",
    };
  }

  if (existingUser.emailVerified === null) {
    const verificationToken = await generateVerificationToken(
      existingUser.email,
    );
    await sendVerificationEmail({
      email: verificationToken.email,
      token: verificationToken.token,
    });
    return {
      status: "SUCCESS",
      message: "Confirmation Email Sent.",
      authType: "PASSWORD",
    };
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (twoFactorCode) {
      const twoFactorTokenFromEmail = await getTwoFactorTokenByEmail(
        existingUser.email,
      );
      if (!twoFactorTokenFromEmail) {
        return { status: "FAILED", message: "Invalid Code!" };
      }
      if (twoFactorTokenFromEmail.token !== twoFactorCode) {
        return { status: "FAILED", message: "Invalid Code!" };
      }
      const is2FACodeExpired =
        new Date(twoFactorTokenFromEmail.expires) < new Date();
      if (is2FACodeExpired) {
        return { status: "FAILED", message: "2FA Code Expired. Login Again!" };
      }
      await db
        .delete(twoFactorToken)
        .where(eq(twoFactorToken.id, twoFactorTokenFromEmail.id));

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id,
      );

      if (existingConfirmation) {
        await db
          .delete(twoFactorConfimation)
          .where(eq(twoFactorConfimation.id, existingConfirmation.id));
      }

      await db.insert(twoFactorConfimation).values({
        userId: existingUser.id,
      });
    } else {
      const twoFAToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail({
        email: twoFAToken.email,
        token: twoFAToken.token,
      });
      return {
        status: "SUCCESS",
        message: "2FA code sent to your email",
        authType: "PASSWORD_WITH_2FA",
      };
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });

    return {
      status: "SUCCESS",
      message: "SignIn Successful.",
      authType: "PASSWORD",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin": {
          return {
            status: "FAILED",
            message: "Invalid Credentials",
          };
        }
        default: {
          return {
            status: "FAILED",
            message: "Unable to SignIn.",
          };
        }
      }
    }
    throw error;
  }
}

async function newVerification(
  formData: NewVerificationSchemaType,
): Promise<NewVerificationStatusType> {
  const existingToken = await getVerificationTokenByToken(formData.token);
  if (!existingToken) {
    return {
      status: "FAILED",
      message: "Invalid Token.",
    };
  }
  const isTokenExpired = new Date(existingToken.expires) < new Date();
  if (isTokenExpired) {
    return {
      status: "FAILED",
      errors: { token: "Token is Expired. SignIn Again." },
      message: "Token is Expired. SignIn Again.",
    };
  }

  const existingUser = await getUserByEmail(existingToken.email);
  if (!existingUser) {
    return {
      status: "FAILED",
      message: "Email doesnot exists.",
    };
  }
  const updateUserQuery = await db.update(users).set({
    emailVerified: new Date(),
    email: existingToken.email,
  });

  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.id, existingToken.id));

  if (updateUserQuery.rowsAffected > 0) {
    return { status: "SUCCESS", message: "SignUp Confirmed." };
  }

  return {
    status: "FAILED",
    message: "Some error occourred. Please try again.",
  };
}

async function loginWithGoogle(redirectTo: string | null) {
  await signIn("google", {
    redirectTo: redirectTo ?? DEFAULT_LOGIN_REDIRECT,
  });
}

async function loginWithGithub(redirectTo: string | null) {
  await signIn("github", {
    redirectTo: redirectTo ?? DEFAULT_LOGIN_REDIRECT,
  });
}

async function signUpWithCredentials(
  formData: SignUpSchemaType,
): Promise<SignUpFormStatusType> {
  const validatedFormData = SignUpSchema.safeParse(formData);

  if (!validatedFormData.success) {
    let formFieldErrors: SignInFormErrorsType = {};

    validatedFormData.error.errors.map((error) => {
      formFieldErrors = {
        ...formFieldErrors,
        [`${error.path[0]}`]: error.message,
      };
    });

    return {
      status: "FAILED",
      errors: formFieldErrors,
      message: "Invalid Credentials",
    };
  }

  const { name, email, password } = validatedFormData.data;

  const hashedPassword = await bcrypt.hash(password, 12);

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return {
      status: "FAILED",
      errors: { email: "Email already in use." },
      message: "Email already in use.",
    };
  }

  const createNewUser = await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  const verificationToken = await generateVerificationToken(email);
  await sendVerificationEmail({
    email: verificationToken.email,
    token: verificationToken.token,
  });

  if (createNewUser.rowsAffected === 1) {
    return {
      status: "SUCCESS",
      message: "Confirmation Email Sent.",
    };
  }

  return {
    status: "FAILED",
    message: "Error Occured! Try again.",
  };
}

async function resetPassword(
  formData: ResetPasswordSchemaType,
): Promise<ResetPasswordStatusType> {
  const validatedFormData = ResetPasswordSchema.safeParse(formData);
  if (!validatedFormData.success) {
    return {
      status: "FAILED",
      message: "Password reset failed.",
    };
  }

  const existingUser = await getUserByEmail(validatedFormData.data.email);
  if (!existingUser) {
    return {
      status: "FAILED",
      message: "Email doesnot exists.",
    };
  }

  const resetToken = await generatePasswordResetToken(existingUser.email);

  await sendPasswordResetEmail({
    email: existingUser.email,
    token: resetToken.token,
  });

  return { status: "SUCCESS", message: "Check your inbox for reset mail." };
}

async function newPassword(
  formData: NewPasswordSchemaType,
): Promise<NewPasswordStatusType> {
  const validatedFormData = NewPasswordSchema.safeParse(formData);

  if (!validatedFormData.success) {
    return {
      status: "FAILED",
      message: "Invalid data given.",
    };
  }

  const { password, token } = validatedFormData.data;

  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return { status: "FAILED", message: "Token is invalid." };
  }

  const isResetTokenExpired = new Date(existingToken.expires) < new Date();

  if (isResetTokenExpired) {
    return { status: "FAILED", message: "Token has expired" };
  }

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return {
      status: "FAILED",
      message: "User doesnot exists",
    };
  }

  const newPassword = await bcrypt.hash(password, 12);
  console.log(newPassword);

  await db
    .update(users)
    .set({
      password: newPassword,
    })
    .where(eq(users.id, existingToken.id));

  return { status: "SUCCESS", message: "Password reset done." };
}

async function signOutUser() {
  await signOut();
}

export {
  loginWithCredentials,
  newVerification,
  loginWithGoogle,
  loginWithGithub,
  signUpWithCredentials,
  signOutUser,
  resetPassword,
  newPassword,
};
