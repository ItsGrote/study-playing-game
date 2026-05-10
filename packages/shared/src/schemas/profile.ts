import { z } from "zod";

import { usernameSchema } from "./auth.js";

export const profileUpdateSchema = z.object({
  username: usernameSchema,
  displayName: z
    .string()
    .max(64, "Nome: máximo 64 caracteres")
    .transform((v) => {
      const t = v.trim();
      return t === "" ? null : t;
    }),
  bio: z
    .string()
    .max(500, "Bio: máximo 500 caracteres")
    .transform((v) => {
      const t = v.trim();
      return t === "" ? null : t;
    }),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
