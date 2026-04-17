# Halal France

Annuaire des boucheries halal certifiées en France.

## Stack

- **Next.js 14** (App Router)
- **Supabase** (PostgreSQL + Auth + Storage)
- **Tailwind CSS**
- **Leaflet** (carte interactive)
- **Vercel** (hébergement)

## Installation locale

```bash
# 1. Cloner le repo
git clone https://github.com/TON_USERNAME/halal-france.git
cd halal-france

# 2. Installer les dépendances
npm install

# 3. Variables d'environnement
cp .env.local.example .env.local
# → remplir avec tes clés Supabase

# 4. Lancer en dev
npm run dev
```

## Supabase — ordre des migrations

Dans le SQL Editor Supabase, exécuter dans l'ordre :

1. `supabase/migrations/001_schema.sql`
2. `supabase/migrations/002_seed.sql`
3. `supabase/migrations/003_admin_rls.sql`

## Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=https://halal-france-xxx.vercel.app
```

## Déploiement Vercel

1. Push sur GitHub
2. Importer le repo sur vercel.com
3. Ajouter les 4 variables d'env dans Settings → Environment Variables
4. Deploy
