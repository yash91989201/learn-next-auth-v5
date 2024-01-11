import * as z from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  twoFactorCode: z.string().optional(),
});

const SignUpSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
});

const NewVerificationSchema = z.object({
  token: z.string(),
});

const ResetPasswordSchema = z.object({
  email: z.string().email(),
});

const NewPasswordSchema = z.object({
  password: z.string(),
  token: z.string(),
});

type LoginSchemaType = z.infer<typeof LoginSchema>;
type SignUpSchemaType = z.infer<typeof SignUpSchema>;
type NewVerificationSchemaType = z.infer<typeof NewVerificationSchema>;
type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>;
type NewPasswordSchemaType = z.infer<typeof NewPasswordSchema>;

export {
  LoginSchema,
  SignUpSchema,
  NewVerificationSchema,
  ResetPasswordSchema,
  NewPasswordSchema,
};

export type {
  LoginSchemaType,
  SignUpSchemaType,
  NewVerificationSchemaType,
  ResetPasswordSchemaType,
  NewPasswordSchemaType,
};
