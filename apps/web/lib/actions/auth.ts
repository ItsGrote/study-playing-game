"use server";

import {
  forgotPasswordSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from "@repo/shared";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Prisma, prisma } from "@repo/database";
import { getRequestIp } from "@/lib/request-ip";
import { rateLimit } from "@/lib/rate-limit";
import { getSiteUrl } from "@/lib/site-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeInternalPath(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "/profile";
  const path = value.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return "/profile";
  if (!/^\/[\w./-]*$/.test(path)) return "/profile";
  return path;
}

export type AuthMessageState = {
  error?: string;
  notice?: string;
};

export async function signUpAction(
  _prev: AuthMessageState | null,
  formData: FormData,
): Promise<AuthMessageState> {
  const ip = await getRequestIp();
  const limited = rateLimit(`signup:${ip}`, 8, 60_000);
  if (!limited.ok) {
    return {
      error: `Muitas tentativas de cadastro. Aguarde ${limited.retryAfterSeconds}s.`,
    };
  }

  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    username: formData.get("username"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors.join(" ") || "Dados inválidos." };
  }

  const { email, password, username } = parsed.data;

  const taken = await prisma.profile.findUnique({ where: { username } });
  if (taken) {
    return { error: "Este nome de usuário já está em uso." };
  }

  const siteUrl = await getSiteUrl();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=/profile`,
      data: { username },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "Este e-mail já está cadastrado." };
    }
    return { error: error.message };
  }

  const user = data.user;
  if (!user) {
    return { error: "Não foi possível criar a conta. Tente novamente." };
  }

  try {
    await prisma.profile.create({
      data: {
        id: user.id,
        username,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Este nome de usuário já está em uso." };
    }
    return { error: "Conta criada, mas falhou ao salvar o perfil. Entre em contato com o suporte." };
  }

  revalidatePath("/", "layout");

  if (!data.session) {
    return {
      notice:
        "Conta criada. Verifique seu e-mail para confirmar o cadastro antes de entrar.",
    };
  }

  redirect("/profile");
}

export async function signInAction(
  _prev: AuthMessageState | null,
  formData: FormData,
): Promise<AuthMessageState> {
  const ip = await getRequestIp();
  const limited = rateLimit(`signin:${ip}`, 20, 60_000);
  if (!limited.ok) {
    return {
      error: `Muitas tentativas de login. Aguarde ${limited.retryAfterSeconds}s.`,
    };
  }

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors.join(" ") || "Dados inválidos." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "E-mail ou senha inválidos." };
  }

  revalidatePath("/", "layout");
  redirect(safeInternalPath(formData.get("next")));
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function forgotPasswordAction(
  _prev: AuthMessageState | null,
  formData: FormData,
): Promise<AuthMessageState> {
  const ip = await getRequestIp();
  const limited = rateLimit(`forgot:${ip}`, 5, 3_600_000);
  if (!limited.ok) {
    return {
      error: `Muitas solicitações de recuperação. Aguarde ${limited.retryAfterSeconds}s.`,
    };
  }

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors.join(" ") || "E-mail inválido." };
  }

  const siteUrl = await getSiteUrl();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/callback?next=/update-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    notice: "Se o e-mail existir, você receberá um link para redefinir a senha.",
  };
}

export async function updatePasswordAction(
  _prev: AuthMessageState | null,
  formData: FormData,
): Promise<AuthMessageState> {
  const ip = await getRequestIp();
  const limited = rateLimit(`update-password:${ip}`, 10, 60_000);
  if (!limited.ok) {
    return {
      error: `Muitas tentativas. Aguarde ${limited.retryAfterSeconds}s.`,
    };
  }

  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors.join(" ") || "Senha inválida." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/profile");
}
