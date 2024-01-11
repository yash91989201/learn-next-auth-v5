import { db } from "@/server/db";
import {
  users,
  verificationTokens,
  passwordResetToken,
  twoFactorToken,
  twoFactorConfimation,
} from "@/server/db/schema";

import { eq } from "drizzle-orm";

import { createId } from "@paralleldrive/cuid2";
import crypto from "crypto";

async function generateVerificationToken(email: string) {
  const token = createId();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getVerificationTokenByEmail(email);
  if (existingToken) {
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.id, existingToken.id));
  }

  await db.insert(verificationTokens).values({
    token,
    expires,
    email,
  });

  return {
    token,
    expires,
    email,
  };
}

async function getUserByEmail(email: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  return user;
}

async function getUserById(id: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });
  return user;
}

async function getVerificationTokenByEmail(email: string) {
  const verificationToken = await db.query.verificationTokens.findFirst({
    where: eq(verificationTokens.email, email),
  });
  return verificationToken;
}

async function getVerificationTokenByToken(token: string) {
  const verificationToken = await db.query.verificationTokens.findFirst({
    where: eq(verificationTokens.token, token),
  });
  return verificationToken;
}

async function getPasswordResetTokenByToken(token: string) {
  const resetToken = await db.query.passwordResetToken.findFirst({
    where: eq(passwordResetToken.token, token),
  });
  return resetToken;
}

async function getPasswordResetTokenByEmail(email: string) {
  const resetToken = await db.query.passwordResetToken.findFirst({
    where: eq(passwordResetToken.email, email),
  });
  return resetToken;
}

async function generatePasswordResetToken(email: string) {
  const resetToken = createId();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getPasswordResetTokenByEmail(email);
  if (existingToken) {
    await db
      .delete(passwordResetToken)
      .where(eq(passwordResetToken.id, existingToken.id));
  }

  await db.insert(passwordResetToken).values({
    email,
    token: resetToken,
    expires,
  });

  return {
    token: resetToken,
    expires,
    email,
  };
}

async function getTwoFactorTokenByToken(token: string) {
  const existingToken = await db.query.twoFactorToken.findFirst({
    where: eq(twoFactorToken.token, token),
  });
  return existingToken;
}

async function getTwoFactorTokenByEmail(email: string) {
  const existingToken = await db.query.twoFactorToken.findFirst({
    where: eq(twoFactorToken.email, email),
  });
  return existingToken;
}

async function getTwoFactorConfirmationByUserId(userId: string) {
  const existingConfirmation = await db.query.twoFactorConfimation.findFirst({
    where: eq(twoFactorConfimation.userId, userId),
  });
  return existingConfirmation;
}

async function generateTwoFactorToken(email: string) {
  const token = crypto.randomInt(100_000, 1_000_000).toString();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getTwoFactorTokenByEmail(email);
  if (existingToken) {
    await db
      .delete(twoFactorToken)
      .where(eq(twoFactorToken.id, existingToken.id));
  }

  await db.insert(twoFactorToken).values({
    email,
    token,
    expires,
  });

  return {
    email,
    token,
    expires,
  };
}

export {
  generateVerificationToken,
  getUserByEmail,
  getUserById,
  getVerificationTokenByEmail,
  getVerificationTokenByToken,
  generatePasswordResetToken,
  getPasswordResetTokenByToken,
  getTwoFactorTokenByEmail,
  getTwoFactorTokenByToken,
  getTwoFactorConfirmationByUserId,
  generateTwoFactorToken,
};
