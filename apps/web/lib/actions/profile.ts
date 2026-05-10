"use server";

import { profileUpdateSchema } from "@repo/shared";
import { revalidatePath } from "next/cache";

import { Prisma, prisma } from "@repo/database";
import { getRequestIp } from "@/lib/request-ip";
import { rateLimit } from "@/lib/rate-limit";
import { getSessionUser } from "@/lib/auth/session";

export type ProfileMessageState = {
  error?: string;
  success?: string;
};

export async function updateProfileAction(
  _prev: ProfileMessageState | null,
  formData: FormData,
): Promise<ProfileMessageState> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const ip = await getRequestIp();
  const limited = rateLimit(`profile-update:${user.id}:${ip}`, 30, 60_000);
  if (!limited.ok) {
    return {
      error: `Muitas atualizações. Aguarde ${limited.retryAfterSeconds}s.`,
    };
  }

  const parsed = profileUpdateSchema.safeParse({
    username: formData.get("username"),
    displayName: formData.get("displayName"),
    bio: formData.get("bio"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors.join(" ") || "Dados inválidos." };
  }

  const { username, displayName, bio } = parsed.data;

  const conflict = await prisma.profile.findFirst({
    where: {
      username,
      NOT: { id: user.id },
    },
  });

  if (conflict) {
    return { error: "Este nome de usuário já está em uso." };
  }

  try {
    await prisma.profile.update({
      where: { id: user.id },
      data: {
        username,
        displayName,
        bio,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Este nome de usuário já está em uso." };
    }
    return { error: "Não foi possível salvar o perfil." };
  }

  revalidatePath("/profile");
  return { success: "Perfil atualizado." };
}
