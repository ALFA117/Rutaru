# Rutaru

> pocas rutas, todas buenas.

Marketplace turístico B2B/B2C (rutas, hospedaje, traslados, eventos, paquetes de agencia) con un motor de inteligencia de datos como diferenciador. Ver `PROMPT_MAESTRO_RUTARU.md` para el spec completo del producto.

**Estado:** Etapa 1 (Esqueleto) en construcción, por bloques. El roadmap completo de etapas y el checklist de arquitectura/documentación se completan en el Bloque 8 de esta etapa.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui + Recharts + Framer Motion
- Supabase (Postgres + Auth + RLS + Storage + Edge Functions + Realtime)
- Anthropic API (Etapa 2 — chatbot concierge, motor de insights)
- Pioneer Pay (pasarela sandbox/emulada)

## Desarrollo

```bash
npm install
cp .env.example .env.local   # completar con las keys del proyecto Supabase
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).
