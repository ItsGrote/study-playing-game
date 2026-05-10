import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/shared", "@repo/database", "@repo/game-client"],
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
