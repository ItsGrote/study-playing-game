# SPG — monorepo

Estudo social multiplayer (planejado). Este repositório usa **Turborepo** com workspaces npm.

## Estrutura

| Caminho | Descrição |
|---------|-----------|
| `apps/web` | Next.js (UI, auth e shell do jogo) |
| `packages/game-client` | Engine Phaser offline (mapa, input, futuro multiplayer) |
| `apps/realtime` | Servidor Node mínimo (placeholder até Socket.io) |
| `packages/shared` | Schemas Zod, tipos e constantes compartilhados |
| `packages/database` | Prisma (`profiles`) e cliente de banco |
| `packages/typescript-config` | Presets TS (`base`, `nextjs`, `node`) |
| `packages/eslint-config` | ESLint flat config compartilhada |

## Requisitos

- Node.js 20+
- npm 10+ (o campo `packageManager` na raiz fixa a versão esperada pelo Turborepo 2.9+)

Dependências entre pacotes do monorepo usam a versão `"*"` para o npm resolver automaticamente para o workspace local (evita o protocolo `workspace:`, incompatível com alguns ambientes).

## Comandos na raiz

```bash
npm install
npm run dev    # sobe web + realtime (Turbo)
npm run build
npm run lint
```

- **Web:** [http://localhost:3000](http://localhost:3000)
- **Realtime health:** [http://localhost:4001/health](http://localhost:4001/health)

## Comandos por app

```bash
npx turbo dev --filter=web
npx turbo dev --filter=realtime
```

O task `dev` do Turbo depende de `^build`, então pacotes como `@repo/shared` e `@repo/database` são preparados antes dos apps.

## Milestone M2 — Supabase + Auth + Perfil

1. Crie um projeto no [Supabase](https://supabase.com) e copie **URL** e **anon key** (`Settings → API`).
2. Em `Settings → Database`, copie a **connection string** (modo *direct* ou *session* recomendado para Prisma migrate).
3. Copie `apps/web/.env.example` para `apps/web/.env.local` e preencha as variáveis.
4. Aplique migrações Prisma no banco do Supabase:

   ```bash
   cd packages/database && npx prisma migrate deploy
   ```

   (ou `npx prisma migrate dev` em desenvolvimento, com `DATABASE_URL` apontando para o mesmo Postgres.)

5. No Supabase, em **Authentication → URL Configuration**, adicione em **Redirect URLs**:

   - `http://localhost:3000/auth/callback` (dev)
   - a mesma rota com a URL de produção quando existir.

6. Defina **Site URL** coerente (ex.: `http://localhost:3000` em dev).

Fluxos cobertos: cadastro, login, logout, sessão com cookies (middleware + `@supabase/ssr`), recuperação de senha (link → callback → `/update-password`), tabela `profiles` com `username` único e edição básica em `/profile`.

## Milestone M5 — Phaser offline

- Rota **`/play`**: menu inicial (React) + canvas Phaser.
- Pacote **`@repo/game-client`**: cena, mapa tile-based procedural, personagem placeholder, WASD/setas, clique para caminhar (BFS), colisão por tiles, câmera suave, animações idle/walk, interações em objetos sem mover o personagem.
- Estado de HUD leve com **Zustand** em `apps/web/features/game` (separado da simulação Phaser).

## Next.js

Este projeto usa Next.js com convenções que podem diferir de versões antigas; consulte `node_modules/next/dist/docs/` ao implementar APIs novas (ver `AGENTS.md`).

O build pode avisar que a convenção `middleware` está em transição para `proxy` no Next 16; mantemos `middleware.ts` alinhado ao guia atual do Supabase SSR até migrarmos oficialmente.
