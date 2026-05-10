import { z } from "zod";

/** Normaliza e valida username (único no banco, case-insensitive via armazenamento em minúsculas). */
export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Mínimo 3 caracteres")
  .max(24, "Máximo 24 caracteres")
  .regex(/^[a-zA-Z0-9_]+$/, "Apenas letras, números e _")
  .transform((value) => value.toLowerCase());

export const signUpSchema = z.object({
  email: z.string().trim().max(254).email("E-mail inválido"),
  password: z
    .string()
    .min(8, "Senha: mínimo 8 caracteres")
    .max(128, "Senha: máximo 128 caracteres"),
  username: usernameSchema,
});

export const signInSchema = z.object({
  email: z.string().trim().max(254).email("E-mail inválido"),
  password: z.string().min(1).max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().max(254).email("E-mail inválido"),
});

export const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Senha: mínimo 8 caracteres")
    .max(128, "Senha: máximo 128 caracteres"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
