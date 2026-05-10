import type { User } from "@supabase/supabase-js";

import { prisma } from "@repo/database";

/**
 * Garante uma linha em `profiles` após login (ex.: OAuth ou migrações).
 * Username inicial reservado e válido para o schema Zod.
 */
export async function ensureProfileForUser(user: User) {
  const existing = await prisma.profile.findUnique({ where: { id: user.id } });
  if (existing) return existing;

  const suffix = user.id.replace(/-/g, "").slice(0, 8).toLowerCase();
  const base = `user_${suffix}`;

  try {
    return await prisma.profile.create({
      data: {
        id: user.id,
        username: base,
      },
    });
  } catch {
    const raw = `user_${user.id.replace(/-/g, "").toLowerCase()}`;
    const fallback = raw.slice(0, 24);
    return prisma.profile.create({
      data: {
        id: user.id,
        username: fallback,
      },
    });
  }
}
