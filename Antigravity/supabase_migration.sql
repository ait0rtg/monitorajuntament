-- ============================================================
-- Monitor Polític Municipal — SQL de creació de la BD
-- Executar al SQL Editor de Supabase (una sola vegada)
-- Versió: 2.2 — Abril 2026
-- ============================================================
-- ORDRE D'EXECUCIÓ:
--   1. Executa aquest fitxer complet al SQL Editor de Supabase
--   2. Executa demo_data.sql per inserir dades de prova (opcional)
--   3. Crea un usuari a Authentication → Users per al login
-- ============================================================

-- ── 1. TAULA PRINCIPAL ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS monitoratge (
  id                       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url_original             TEXT UNIQUE NOT NULL,
  font                     TEXT,
  tipus                    TEXT,
  tipus_document           TEXT,
  titol                    TEXT,
  contingut_complet        TEXT,
  resum                    TEXT,
  classificacio            TEXT CHECK (classificacio IN ('URGENT','IMPORTANT','INFORMATIU')),
  nivell_confianca         TEXT CHECK (nivell_confianca IN ('ALTA','MITJA','BAIXA')),
  data_deteccio            TIMESTAMPTZ DEFAULT NOW(),
  venciment                DATE,
  import_detectat          NUMERIC(12,2),
  tema_principal           TEXT,
  proposta_accio           TEXT,
  pregunta_ple_suggerida   TEXT,
  requereix_revisio_manual BOOLEAN DEFAULT FALSE,
  estat_seguiment          TEXT DEFAULT 'pendent'
                          CHECK (estat_seguiment IN ('pendent','en curs','tancat')),
  recordatori_30d          DATE GENERATED ALWAYS AS
                          (data_deteccio::DATE + INTERVAL '30 days') STORED,
  recordatori_90d          DATE GENERATED ALWAYS AS
                          (data_deteccio::DATE + INTERVAL '90 days') STORED,
  recordatori_180d         DATE GENERATED ALWAYS AS
                          (data_deteccio::DATE + INTERVAL '180 days') STORED,
  observacions             TEXT,
  estat                    TEXT DEFAULT 'nou'
);

-- ── 2. ÍNDEXS PER RENDIMENT ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_url      ON monitoratge(url_original);
CREATE INDEX IF NOT EXISTS idx_classif  ON monitoratge(classificacio);
CREATE INDEX IF NOT EXISTS idx_data     ON monitoratge(data_deteccio DESC);
CREATE INDEX IF NOT EXISTS idx_venc     ON monitoratge(venciment) WHERE venciment IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_font     ON monitoratge(font);
CREATE INDEX IF NOT EXISTS idx_estat    ON monitoratge(estat_seguiment);
CREATE INDEX IF NOT EXISTS idx_urgent   ON monitoratge(classificacio, estat_seguiment)
                                        WHERE classificacio = 'URGENT';
CREATE INDEX IF NOT EXISTS idx_preguntes ON monitoratge(pregunta_ple_suggerida)
                                         WHERE pregunta_ple_suggerida IS NOT NULL;

-- Índex de text complet per a cerca ràpida
CREATE INDEX IF NOT EXISTS idx_fts ON monitoratge
  USING gin(to_tsvector('catalan', coalesce(titol,'') || ' ' || coalesce(resum,'')));

-- ── 3. ROW LEVEL SECURITY ─────────────────────────────────────
ALTER TABLE monitoratge ENABLE ROW LEVEL SECURITY;

-- Política A: Lectura i escriptura per a usuaris autenticats (dashboard web)
CREATE POLICY "Acces autenticat"
  ON monitoratge
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política B: Escriptura via service_role (n8n workflow)
-- Nota: el service_role ignora RLS per defecte, però afegim la política per claredat.
-- El workflow n8n SEMPRE ha d'usar la Service Role Key, mai la Anon Key.
CREATE POLICY "Escriptura service role"
  ON monitoratge
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Política C (OPCIONAL): Lectura pública sense autenticació
-- Descomenta NOMÉS si el dashboard s'executa sense login (no recomanat en producció)
-- CREATE POLICY "Lectura publica"
--   ON monitoratge FOR SELECT TO anon USING (true);

-- ── 4. FUNCIÓ D'UPSERT PER A n8n ─────────────────────────────
-- Permet inserir o actualitzar basat en url_original (deduplicació automàtica)
CREATE OR REPLACE FUNCTION upsert_monitoratge(p_data JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO monitoratge (
    url_original, font, tipus, tipus_document, titol, resum,
    classificacio, nivell_confianca, data_deteccio, venciment,
    import_detectat, tema_principal, proposta_accio, pregunta_ple_suggerida,
    requereix_revisio_manual, estat_seguiment, observacions, estat
  ) VALUES (
    p_data->>'url_original',
    p_data->>'font',
    p_data->>'tipus',
    p_data->>'tipus_document',
    p_data->>'titol',
    p_data->>'resum',
    p_data->>'classificacio',
    p_data->>'nivell_confianca',
    COALESCE((p_data->>'data_deteccio')::TIMESTAMPTZ, NOW()),
    (p_data->>'venciment')::DATE,
    (p_data->>'import_detectat')::NUMERIC,
    p_data->>'tema_principal',
    p_data->>'proposta_accio',
    p_data->>'pregunta_ple_suggerida',
    COALESCE((p_data->>'requereix_revisio_manual')::BOOLEAN, FALSE),
    COALESCE(p_data->>'estat_seguiment', 'pendent'),
    p_data->>'observacions',
    COALESCE(p_data->>'estat', 'nou')
  )
  ON CONFLICT (url_original)
  DO UPDATE SET
    titol                    = EXCLUDED.titol,
    resum                    = EXCLUDED.resum,
    classificacio            = EXCLUDED.classificacio,
    nivell_confianca         = EXCLUDED.nivell_confianca,
    import_detectat          = EXCLUDED.import_detectat,
    tema_principal           = EXCLUDED.tema_principal,
    proposta_accio           = EXCLUDED.proposta_accio,
    pregunta_ple_suggerida   = EXCLUDED.pregunta_ple_suggerida,
    requereix_revisio_manual = EXCLUDED.requereix_revisio_manual,
    venciment                = EXCLUDED.venciment,
    observacions             = EXCLUDED.observacions
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- ── 5. VISTA DE VERIFICACIÓ ───────────────────────────────────
-- Executa per verificar que tot s'ha creat correctament:
/*
SELECT
  COUNT(*)                                           AS total_registres,
  COUNT(*) FILTER (WHERE classificacio = 'URGENT')   AS urgents,
  COUNT(*) FILTER (WHERE pregunta_ple_suggerida IS NOT NULL) AS amb_pregunta,
  COUNT(*) FILTER (WHERE import_detectat IS NOT NULL) AS amb_import,
  MAX(data_deteccio)                                 AS ultima_deteccio
FROM monitoratge;
*/

-- ── 6. MÒDUL DE CALENDARI (MANUAL) ─────────────────────────────
-- Taula per permetre guardar events purament manuals al calendari que no estan vinculats a notícies automàtiques
CREATE TABLE IF NOT EXISTS esdeveniments_calendari (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titol          TEXT NOT NULL,
  data_inici     TIMESTAMPTZ NOT NULL,
  data_fi        TIMESTAMPTZ,
  es_tot_el_dia  BOOLEAN DEFAULT TRUE,
  descripcio     TEXT,
  color_hex      TEXT DEFAULT '#3788d8',
  creat_el       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE esdeveniments_calendari ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acces autenticat calendari"
  ON esdeveniments_calendari
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

