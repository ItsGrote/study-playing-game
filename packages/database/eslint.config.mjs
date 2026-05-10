import node from "@repo/eslint-config/node";

export default [...node, { ignores: ["prisma/**", "dist/**"] }];
