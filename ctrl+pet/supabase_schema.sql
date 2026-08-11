-- Script SQL para o Banco de Dados do Supabase
-- Baseado na estrutura e campos do aplicativo de controle de pets (CtrlPet)
-- Configurado para Segurança Multiusuário (Google Play / App Store) com Row Level Security (RLS)

-- ===================================================
-- 1. TABELA 'Pets'
-- ===================================================
CREATE TABLE IF NOT EXISTS public."Pets" (
    id text NOT NULL PRIMARY KEY,         -- ID único do pet (gerado pelo app)
    user_id text NOT NULL,                -- ID do usuário tutor (Auth UUID ou Email)
    "Nome" text NOT NULL,                 -- Nome do pet
    "Espécie" text,                       -- Espécie: dog | cat | other
    "Raça" text DEFAULT 'SRD',            -- Raça do pet
    "Nascimento" date,                    -- Data de nascimento
    "Gênero" text,                        -- Gênero: male | female
    "DataAdocao" date,                    -- Data de adoção
    "Microchip" text,                     -- Número do microchip
    "RGA" text,                           -- Registro Geral Animal
    "Foto" text,                          -- Foto em Base64
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS) para isolamento total de dados
ALTER TABLE public."Pets" ENABLE ROW LEVEL SECURITY;

-- Criar política para que cada usuário acesse apenas os seus próprios Pets
DROP POLICY IF EXISTS "Permitir acesso público de leitura e escrita" ON public."Pets";
DROP POLICY IF EXISTS "Permitir acesso individual do tutor aos seus pets" ON public."Pets";
CREATE POLICY "Permitir acesso individual do tutor aos seus pets" ON public."Pets"
    AS PERMISSIVE FOR ALL 
    TO public 
    USING (auth.uid()::text = user_id OR user_id = auth.jwt() ->> 'email') 
    WITH CHECK (auth.uid()::text = user_id OR user_id = auth.jwt() ->> 'email');


-- ===================================================
-- 2. TABELA 'Vacinas'
-- ===================================================
CREATE TABLE IF NOT EXISTS public."Vacinas" (
    id text NOT NULL PRIMARY KEY, -- ID único (string) gerado pelo app
    pet_id text NOT NULL, -- ID (string) do pet correspondente
    user_id text NOT NULL, -- ID do usuário tutor (ID do Auth do Supabase ou Email)
    "Nome" text NOT NULL, -- Nome da vacina
    "Aplicação" date, -- Data em que a vacina foi aplicada
    "Próxima dose" date, -- Data prevista para a próxima dose
    "Lote" text, -- Lote da vacina
    "Veterinário(a)" text, -- Nome do veterinário responsável
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fk_pet FOREIGN KEY (pet_id) REFERENCES public."Pets"(id) ON DELETE CASCADE
);

-- Habilitar Row Level Security (RLS) para isolamento total de dados
ALTER TABLE public."Vacinas" ENABLE ROW LEVEL SECURITY;

-- Criar política para que cada usuário acesse apenas as suas próprias Vacinas
DROP POLICY IF EXISTS "Permitir acesso público de leitura e escrita para vacinas" ON public."Vacinas";
DROP POLICY IF EXISTS "Permitir acesso individual do tutor as suas vacinas" ON public."Vacinas";
CREATE POLICY "Permitir acesso individual do tutor as suas vacinas" ON public."Vacinas"
    AS PERMISSIVE FOR ALL 
    TO public 
    USING (auth.uid()::text = user_id OR user_id = auth.jwt() ->> 'email') 
    WITH CHECK (auth.uid()::text = user_id OR user_id = auth.jwt() ->> 'email');


-- ===================================================
-- 3. TABELA 'Medidas' (Pesos e medidas do pet)
-- ===================================================
CREATE TABLE IF NOT EXISTS public."Medidas" (
    id text NOT NULL PRIMARY KEY,
    pet_id text NOT NULL,
    user_id text NOT NULL,
    "Data" date NOT NULL,
    "Peso" numeric NOT NULL, -- em kg
    "Altura" numeric NOT NULL, -- em cm
    "Observações" text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fk_pet_medidas FOREIGN KEY (pet_id) REFERENCES public."Pets"(id) ON DELETE CASCADE
);

-- Habilitar Row Level Security (RLS) para isolamento total de dados
ALTER TABLE public."Medidas" ENABLE ROW LEVEL SECURITY;

-- Criar política para que cada usuário acesse apenas as suas próprias Medidas
DROP POLICY IF EXISTS "Permitir acesso individual do tutor as suas medidas" ON public."Medidas";
CREATE POLICY "Permitir acesso individual do tutor as suas medidas" ON public."Medidas"
    AS PERMISSIVE FOR ALL 
    TO public 
    USING (auth.uid()::text = user_id OR user_id = auth.jwt() ->> 'email') 
    WITH CHECK (auth.uid()::text = user_id OR user_id = auth.jwt() ->> 'email');


-- ===================================================
-- 4. TABELA 'Medicamentos' (Medicamentos e tratamentos)
-- ===================================================
CREATE TABLE IF NOT EXISTS public."Medicamentos" (
    id text NOT NULL PRIMARY KEY,
    pet_id text NOT NULL,
    user_id text NOT NULL,
    "Nome" text NOT NULL,
    "Dosagem" text NOT NULL,
    "DataInicio" text NOT NULL,
    "FrequenciaHoras" integer NOT NULL,
    "DuracaoDias" integer NOT NULL,
    "Observações" text,
    "Doses" jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fk_pet_medicamentos FOREIGN KEY (pet_id) REFERENCES public."Pets"(id) ON DELETE CASCADE
);

-- Habilitar Row Level Security (RLS) para isolamento total de dados
ALTER TABLE public."Medicamentos" ENABLE ROW LEVEL SECURITY;

-- Criar política para que cada usuário acesse apenas os seus próprios Medicamentos
DROP POLICY IF EXISTS "Permitir acesso individual do tutor aos seus medicamentos" ON public."Medicamentos";
CREATE POLICY "Permitir acesso individual do tutor aos seus medicamentos" ON public."Medicamentos"
    AS PERMISSIVE FOR ALL 
    TO public 
    USING (auth.uid()::text = user_id OR user_id = auth.jwt() ->> 'email') 
    WITH CHECK (auth.uid()::text = user_id OR user_id = auth.jwt() ->> 'email');


-- ===================================================
-- 5. TABELA 'HistoricoClinico' (Histórico clínico expandido)
-- ===================================================
CREATE TABLE IF NOT EXISTS public."HistoricoClinico" (
    id text NOT NULL PRIMARY KEY,
    pet_id text NOT NULL,
    user_id text NOT NULL,
    "Tipo" text NOT NULL,
    "Data" date NOT NULL,
    "Título" text NOT NULL,
    "Notas" text NOT NULL,
    "Diagnóstico" text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fk_pet_historico FOREIGN KEY (pet_id) REFERENCES public."Pets"(id) ON DELETE CASCADE
);

-- Habilitar Row Level Security (RLS) para isolamento total de dados
ALTER TABLE public."HistoricoClinico" ENABLE ROW LEVEL SECURITY;

-- Criar política para que cada usuário acesse apenas os seus próprios registros de Histórico Clínico
DROP POLICY IF EXISTS "Permitir acesso individual do tutor ao seu historico" ON public."HistoricoClinico";
CREATE POLICY "Permitir acesso individual do tutor ao seu historico" ON public."HistoricoClinico"
    AS PERMISSIVE FOR ALL 
    TO public 
    USING (auth.uid()::text = user_id OR user_id = auth.jwt() ->> 'email') 
    WITH CHECK (auth.uid()::text = user_id OR user_id = auth.jwt() ->> 'email');


-- ===================================================
-- 6. TABELA 'CiclosReprodutivos' (Ciclo reprodutivo / cio)
-- ===================================================
CREATE TABLE IF NOT EXISTS public."CiclosReprodutivos" (
    id text NOT NULL PRIMARY KEY,
    pet_id text NOT NULL,
    user_id text NOT NULL,
    "Data" date NOT NULL,
    "Evento" text NOT NULL,
    "Observações" text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fk_pet_ciclos FOREIGN KEY (pet_id) REFERENCES public."Pets"(id) ON DELETE CASCADE
);

-- Habilitar Row Level Security (RLS) para isolamento total de dados
ALTER TABLE public."CiclosReprodutivos" ENABLE ROW LEVEL SECURITY;

-- Criar política para que cada usuário acesse apenas os seus próprios Ciclos Reprodutivos
DROP POLICY IF EXISTS "Permitir acesso individual do tutor aos seus ciclos" ON public."CiclosReprodutivos";
CREATE POLICY "Permitir acesso individual do tutor aos seus ciclos" ON public."CiclosReprodutivos"
    AS PERMISSIVE FOR ALL 
    TO public 
    USING (auth.uid()::text = user_id OR user_id = auth.jwt() ->> 'email') 
    WITH CHECK (auth.uid()::text = user_id OR user_id = auth.jwt() ->> 'email');


-- ===================================================
-- 7. TABELA 'Rotinas' (Rotina & higiene)
-- ===================================================
CREATE TABLE IF NOT EXISTS public."Rotinas" (
    id text NOT NULL PRIMARY KEY,
    pet_id text NOT NULL,
    user_id text NOT NULL,
    "Título" text NOT NULL,
    "UltimaRealizacao" date NOT NULL,
    "FrequenciaDias" integer NOT NULL,
    "Categoria" text NOT NULL,
    "Observações" text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fk_pet_rotinas FOREIGN KEY (pet_id) REFERENCES public."Pets"(id) ON DELETE CASCADE
);

-- Habilitar Row Level Security (RLS) para isolamento total de dados
ALTER TABLE public."Rotinas" ENABLE ROW LEVEL SECURITY;

-- Criar política para que cada usuário acesse apenas as suas próprias Rotinas
DROP POLICY IF EXISTS "Permitir acesso individual do tutor as suas rotinas" ON public."Rotinas";
CREATE POLICY "Permitir acesso individual do tutor as suas rotinas" ON public."Rotinas"
    AS PERMISSIVE FOR ALL 
    TO public 
    USING (auth.uid()::text = user_id OR user_id = auth.jwt() ->> 'email') 
    WITH CHECK (auth.uid()::text = user_id OR user_id = auth.jwt() ->> 'email');

-- ===================================================
-- 8. ÍNDICES DE PERFORMANCE
-- (Aceleram buscas por user_id e pet_id em todas as tabelas)
-- ===================================================
CREATE INDEX IF NOT EXISTS idx_pets_user_id              ON public."Pets"(user_id);
CREATE INDEX IF NOT EXISTS idx_vacinas_user_id           ON public."Vacinas"(user_id);
CREATE INDEX IF NOT EXISTS idx_vacinas_pet_id            ON public."Vacinas"(pet_id);
CREATE INDEX IF NOT EXISTS idx_medidas_user_id           ON public."Medidas"(user_id);
CREATE INDEX IF NOT EXISTS idx_medidas_pet_id            ON public."Medidas"(pet_id);
CREATE INDEX IF NOT EXISTS idx_medicamentos_user_id      ON public."Medicamentos"(user_id);
CREATE INDEX IF NOT EXISTS idx_medicamentos_pet_id       ON public."Medicamentos"(pet_id);
CREATE INDEX IF NOT EXISTS idx_historico_user_id         ON public."HistoricoClinico"(user_id);
CREATE INDEX IF NOT EXISTS idx_historico_pet_id          ON public."HistoricoClinico"(pet_id);
CREATE INDEX IF NOT EXISTS idx_ciclos_user_id            ON public."CiclosReprodutivos"(user_id);
CREATE INDEX IF NOT EXISTS idx_ciclos_pet_id             ON public."CiclosReprodutivos"(pet_id);
CREATE INDEX IF NOT EXISTS idx_rotinas_user_id           ON public."Rotinas"(user_id);
CREATE INDEX IF NOT EXISTS idx_rotinas_pet_id            ON public."Rotinas"(pet_id);

-- ===================================================
-- COMENTÁRIOS E INSTRUÇÕES
-- ===================================================
COMMENT ON TABLE public."Pets" IS 'Tabela que armazena os dados cadastrais dos pets com segurança individual por usuário.';
COMMENT ON TABLE public."Vacinas" IS 'Tabela que armazena o histórico e agendamento de vacinas com segurança individual por usuário.';
COMMENT ON TABLE public."Medidas" IS 'Tabela que armazena os pesos e medidas com segurança individual por usuário.';
COMMENT ON TABLE public."Medicamentos" IS 'Tabela que armazena os medicamentos e tratamentos com segurança individual por usuário.';
COMMENT ON TABLE public."HistoricoClinico" IS 'Tabela que armazena o histórico clínico expandido com segurança individual por usuário.';
COMMENT ON TABLE public."CiclosReprodutivos" IS 'Tabela que armazena o ciclo reprodutivo com segurança individual por usuário.';
COMMENT ON TABLE public."Rotinas" IS 'Tabela que armazena as rotinas e higiene com segurança individual por usuário.';

-- ===================================================
-- 9. TABELA 'GuardaCompartilhada' (Vínculo de guarda/co-propriedade compartilhada)
-- ===================================================
CREATE TABLE IF NOT EXISTS public."GuardaCompartilhada" (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    pet_id text NOT NULL,
    co_owner_email text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fk_pet_guarda FOREIGN KEY (pet_id) REFERENCES public."Pets"(id) ON DELETE CASCADE,
    CONSTRAINT unique_pet_co_owner UNIQUE (pet_id, co_owner_email)
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public."GuardaCompartilhada" ENABLE ROW LEVEL SECURITY;

-- Criar política de isolamento/colaboração (Qualquer envolvido direto ou co-proprietário pode acessar)
DROP POLICY IF EXISTS "Permitir acesso individual por e-mail de co-proprietário" ON public."GuardaCompartilhada";
CREATE POLICY "Permitir acesso individual por e-mail de co-proprietário" ON public."GuardaCompartilhada"
    AS PERMISSIVE FOR ALL
    TO public
    USING (co_owner_email = auth.jwt() ->> 'email' OR EXISTS (
        SELECT 1 FROM public."Pets" WHERE id = pet_id AND user_id = auth.jwt() ->> 'email'
    ))
    WITH CHECK (co_owner_email = auth.jwt() ->> 'email' OR EXISTS (
        SELECT 1 FROM public."Pets" WHERE id = pet_id AND user_id = auth.jwt() ->> 'email'
    ));

CREATE INDEX IF NOT EXISTS idx_guarda_pet_id ON public."GuardaCompartilhada"(pet_id);
CREATE INDEX IF NOT EXISTS idx_guarda_email ON public."GuardaCompartilhada"(co_owner_email);

COMMENT ON TABLE public."GuardaCompartilhada" IS 'Tabela que gerencia os vínculos de co-tutor de pets para sincronização em tempo real.';
