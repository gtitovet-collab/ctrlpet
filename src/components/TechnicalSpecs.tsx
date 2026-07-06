import React from 'react';

export default function TechnicalSpecs() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all" id="technical-specs-panel">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold font-display text-lg">
            🧬
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">
              Ctrl+Pet — Proposta da Arquitetura & Banco de Dados
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mapeamento de banco de dados relacional robusto e controle de concorrência distribuída.
            </p>
          </div>
        </div>
      </div>

      {/* Body tabs content */}
      <div className="p-6 space-y-8 font-sans max-h-[70vh] overflow-y-auto">
        
        {/* Tecnologias recomendadas */}
        <section className="space-y-3">
          <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            1. Mapeamento de Tecnologias (Android & iOS Nativo/Multiplataforma)
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Para garantir o lançamento rápido, paridade completa e alto desempenho, a recomendação é 
            <strong> React Native (com Expo)</strong> ou <strong>Flutter</strong>:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block mb-1">📱 Camada Mobile (Multiplataforma)</span>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                <li><strong>React Native (TS) + Astro/Expo:</strong> Reutiliza o ecossistema existente, compartilhando tipagem com o painel do tutor.</li>
                <li><strong>Banco Local:</strong> WatermelonDB ou SQLite + MMKV (chave-valor rápida para cache de estado/mídias).</li>
                <li><strong>Local Notifications:</strong> Expo Notifications de alto rendimento com gatilho local para 7 dias.</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block mb-1">🌐 Backend e Autenticação</span>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                <li><strong>Provedor de Auth:</strong> Firebase Auth ou Supabase Auth (Suporta e-mail/senha + Apple e Google sem CPF para conformidade estrita da LGPD).</li>
                <li><strong>Banco Principal de Produção:</strong> PostgreSQL hospedado em Cloud SQL para alta estabilidade relacional.</li>
                <li><strong>Sincronização:</strong> Mecanismo de sincronização unidirecional baseado em delta de mudanças com número serial (versioning/updates).</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Resiliencia Offline e Conflitos */}
        <section className="space-y-3">
          <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-500"></span>
            2. Resiliência Offline-First & Resolução de Conflitos (Sem Travamentos)
          </h3>
          <div className="p-4 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/50 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <p>
              Como o tutor deve ter autonomia total e o app deve funcionar <strong>offline-first</strong>, a arquitetura obedece às seguintes regras na sincronização:
            </p>
            <ol className="list-decimal pl-4 space-y-1.5 font-sans">
              <li>
                <strong>Identificação Única por UUID v4:</strong> IDs gerados inteiramente no client durante a inserção, eliminando dependência de chaves sequenciais auto-incrementáveis do backend.
              </li>
              <li>
                <strong>Controle de Versão por Timestamp (SDR - Server Date Rule):</strong> Todo registro possui <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-violet-700 dark:text-violet-300">updated_at</code> e <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-violet-700 dark:text-violet-300">last_synced_at</code>. O banco local e remoto adotam a estratégia <em>"Last-Write-Wins" (LWW)</em> baseada na data de atualização modificada no dispositivo.
              </li>
              <li>
                <strong>Soft-Deletes (Tombstone):</strong> Em vez de deletar linhas diretamente dos aparelhos, o app define <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-violet-700 dark:text-violet-300">is_deleted = TRUE</code>. Isso evita que exclusões locais feitas de forma desconectada reapareçam por falta de sincronismo remanescente.
              </li>
            </ol>
          </div>
        </section>

        {/* Script SQL PostgreSQL */}
        <section className="space-y-3">
          <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            3. Modelagem de Dados PostgreSQL Completa
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Copie ou analise as tabelas mapeadas com suas PK/FK relacionais e campos estruturados de acordo com o escopo de vacinas, peso, doses múltiplas e ciclo reprodutivo:
          </p>

          <pre className="p-4 rounded-xl bg-slate-950 text-slate-300 overflow-x-auto text-[10px] leading-relaxed font-mono max-h-[350px] border border-slate-800 select-all">
{`-- SQL DE CRIAÇÃO DO BANCO DE DADOS CTRL+PET
-- Suporte a UUID, LGPD sem CPF obrigatório e controle de conflitos

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA TUTORES (Contas linkadas ao Firebase/Supabase Auth ID)
CREATE TABLE users (
    id VARCHAR(128) PRIMARY KEY, -- ID proveniente do Firebase Auth
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    cpf VARCHAR(14) UNIQUE, -- LGPD: Totalmente opcional
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA PETS (Vários pets por tutor)
CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL, -- 'dog', 'cat', 'other'
    breed VARCHAR(100),
    gender VARCHAR(10) NOT NULL, -- 'male', 'female'
    birth_date DATE NOT NULL,
    adoption_date DATE,
    microchip VARCHAR(50),
    rga VARCHAR(50),
    photo_cached TEXT, -- Base64 ou URL de cache persistente
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Relacionamento para Guarda Compartilhada (Múltiplos tutores por pet)
CREATE TABLE pet_owners (
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    user_id VARCHAR(128) REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'co_owner', -- 'primary_owner', 'co_owner'
    PRIMARY KEY (pet_id, user_id)
);

-- 3. TABELA HISTÓRICO DE MEDIDAS (Peso e Altura linear)
CREATE TABLE measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    weight DECIMAL(5,2) NOT NULL, -- Exemplo: 12.85 kg
    height DECIMAL(5,2) NOT NULL, -- Exemplo: 45.50 cm
    measurement_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABELA VACINAS (Cadastro e Agendamento antecipado com alerta)
CREATE TABLE vaccines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    batch VARCHAR(100), -- Lote da vacina
    applied_date DATE, -- NULL se for apenas um aviso de futura aplicação
    booster_date DATE NOT NULL, -- Data de vencimento / reforço
    veterinarian VARCHAR(150),
    status VARCHAR(20) DEFAULT 'pending', -- 'applied', 'pending'
    notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABELA AGENDAMENTO DE MEDICAMENTOS (Multi-doses)
CREATE TABLE medication_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    frequency_hours INT NOT NULL, -- Ex: 12 (12h em 12h)
    duration_days INT NOT NULL,  -- Ex: 7 dias
    notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Doses individuais geradas automaticamente no ciclo recorrente
CREATE TABLE medication_doses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID REFERENCES medication_schedules(id) ON DELETE CASCADE,
    dose_number INT NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    taken BOOLEAN DEFAULT FALSE,
    taken_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABELA HISTÓRICO CLÍNICO EXPANDIDO (Surgeries, allergies, logs)
CREATE TABLE clinical_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    log_type VARCHAR(50) NOT NULL, -- 'consultation', 'surgery', 'hospitalization', 'allergy', 'behavior'
    log_date DATE NOT NULL,
    title VARCHAR(150) NOT NULL,
    notes TEXT,
    diagnostics TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABELA CICLO REPRODUTIVO (Exclusivo fêmeas)
CREATE TABLE reproductive_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    event_date DATE NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'cio', 'insemination', 'cross'
    notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABELA ATIVIDADES DE ROTINA E HIGIENE
CREATE TABLE routine_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    last_done DATE NOT NULL,
    frequency_days INT NOT NULL, -- Ex: 7 (limpar bandeja de areia de 7 em 7 dias)
    category VARCHAR(50) NOT NULL, -- 'cleaning', 'litter', 'food'
    notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES DE ALTO RENDIMENTO PARA CONSULTA E SINCRONISMO RÁPIDO
CREATE INDEX idx_pets_is_deleted ON pets(is_deleted);
CREATE INDEX idx_vaccines_dates ON vaccines(booster_date, status);
CREATE INDEX idx_doses_scheduled ON medication_doses(scheduled_time, taken);
CREATE INDEX idx_clinical_pet_type ON clinical_logs(pet_id, log_type);`}
          </pre>
        </section>

        {/* Alinhamento LGPD */}
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-100 dark:border-emerald-900/50 text-xs text-slate-700 dark:text-slate-300">
          <strong>🔒 Conformidade com a LGPD e Google Play / App Store:</strong> No banco, o campo <code className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-1 py-0.5 rounded">cpf</code> é totalmente opcional e nulo pelo mesmo princípio de privacidade inicial. O usuário tem um painel direto nas configurações para acionar a exclusão de sua conta, disparando um gatilho <code className="font-mono">ON DELETE CASCADE</code> que varre todo o histórico do servidor sem travas burocráticas.
        </div>

      </div>
    </div>
  );
}
