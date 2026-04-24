-- ===================================================================================
-- 1. TAULA: monitoratge (versió avançada v5)
-- ===================================================================================

CREATE TABLE IF NOT EXISTS monitoratge (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url_original TEXT UNIQUE NOT NULL,
  font TEXT,
  tipus TEXT,
  tipus_document TEXT,
  tipus_tramit TEXT,
  titol TEXT,
  contingut_complet TEXT,
  resum TEXT,
  classificacio TEXT CHECK (classificacio IN ('URGENT','IMPORTANT','INFORMATIU')),
  nivell_confianca TEXT CHECK (nivell_confianca IN ('ALTA','MITJA','BAIXA')),
  data_deteccio TIMESTAMPTZ DEFAULT NOW(),
  venciment DATE,
  import_detectat NUMERIC(12,2),
  tema_principal TEXT,
  proposta_accio TEXT,
  pregunta_ple_suggerida TEXT,
  requereix_revisio_manual BOOLEAN DEFAULT FALSE,
  estat_seguiment TEXT DEFAULT 'pendent',
  recordatori_30d DATE GENERATED ALWAYS AS (data_deteccio::DATE + INTERVAL '30 days') STORED,
  recordatori_90d DATE GENERATED ALWAYS AS (data_deteccio::DATE + INTERVAL '90 days') STORED,
  recordatori_180d DATE GENERATED ALWAYS AS (data_deteccio::DATE + INTERVAL '180 days') STORED,
  observacions TEXT,
  estat TEXT DEFAULT 'nou'
);

-- Índexs de rendiment per dashboards
CREATE INDEX IF NOT EXISTS idx_url ON monitoratge(url_original);
CREATE INDEX IF NOT EXISTS idx_classif ON monitoratge(classificacio);
CREATE INDEX IF NOT EXISTS idx_data ON monitoratge(data_deteccio DESC);
CREATE INDEX IF NOT EXISTS idx_venc ON monitoratge(venciment) WHERE venciment IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tema ON monitoratge(tema_principal);
CREATE INDEX IF NOT EXISTS idx_import ON monitoratge(import_detectat) WHERE import_detectat IS NOT NULL;

-- Polítiques RLS
ALTER TABLE monitoratge ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Acces autenticat" ON monitoratge
  FOR ALL USING (auth.role() = 'authenticated');
