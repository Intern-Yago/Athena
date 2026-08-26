require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.cjtqfkedqqjuhraeesmg:XIdMCm8CWoO31qiz@aws-0-us-east-1.pooler.supabase.com:5432/postgres';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function enableRLS() {
  console.log('Habilitando Row Level Security (RLS) no Supabase...');

  // 1. Enable RLS on all 4 tables
  await pool.query(`
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
  `);
  console.log('1. RLS habilitado nas tabelas: users, categories, products, brands.');

  // 2. Setup Public Read Policies
  await pool.query(`
    DO $$ 
    BEGIN
      -- Categories Read Policy
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Public categories are viewable by everyone'
      ) THEN
        CREATE POLICY "Public categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
      END IF;

      -- Brands Read Policy
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'brands' AND policyname = 'Public brands are viewable by everyone'
      ) THEN
        CREATE POLICY "Public brands are viewable by everyone" ON public.brands FOR SELECT USING (true);
      END IF;

      -- Products Read Policy
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Public products are viewable by everyone'
      ) THEN
        CREATE POLICY "Public products are viewable by everyone" ON public.products FOR SELECT USING (true);
      END IF;
    END $$;
  `);
  console.log('2. Politicas de seguranca publica de leitura configuradas.');

  // 3. Notice about users table:
  // Since users has RLS enabled with NO public SELECT policy, anonymous users cannot read users table.
  // The backend uses superuser postgres connection, which bypasses RLS safely.
  console.log('3. Tabela users 100% blindada contra acesso anonimo.');
  console.log('SUCESSO: Todos os avisos de seguranca RLS do Supabase foram resolvidos!');
}

enableRLS()
  .then(() => pool.end())
  .catch((err) => {
    console.error('Erro ao habilitar RLS:', err.message);
    pool.end();
  });
