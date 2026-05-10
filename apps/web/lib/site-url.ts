import { headers } from "next/headers";

/**
 * URL pública usada em links de e-mail (confirmação / recuperação).
 * Preferimos `NEXT_PUBLIC_SITE_URL`; em dev fazemos fallback pelo header `Host`.
 */
export async function getSiteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (host) {
    return `${proto}://${host}`.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}
