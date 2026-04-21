-- ============================================================
-- Monitor Polític Municipal — Dades de Demostració
-- Executar DESPRÉS de supabase_migration.sql
-- Conté 12 registres realistes per provar el dashboard
-- ============================================================

INSERT INTO monitoratge (
  url_original, font, tipus, tipus_document, titol,
  resum, classificacio, nivell_confianca,
  data_deteccio, venciment, import_detectat, tema_principal,
  proposta_accio, pregunta_ple_suggerida,
  requereix_revisio_manual, estat_seguiment, observacions, estat
) VALUES

-- ── 1. URGENT amb venciment proper ──────────────────────────
(
  'https://ciutada.platjadaro.com/acords/jgl-2026-04-15.pdf',
  'Acords JGL', 'PDF', 'acord',
  'Acords Junta de Govern Local — 15 d''Abril 2026',
  'Aprovació de 3 contractes de servei per un import total de 142.500 €. Inclou manteniment de jardins, neteja viària i servei de socorrisme per a la temporada d''estiu. Termini d''inici: 1 de juny 2026.',
  'URGENT', 'ALTA',
  NOW() - INTERVAL '1 day', CURRENT_DATE + 8, 142500.00, 'contractació',
  'Demanar expedients de contractació i verificar procediment d''urgència.',
  'Per quin motiu s''han contractat serveis per procediment d''urgència sense licitació prèvia?',
  false, 'pendent', null, 'nou'
),

-- ── 2. URGENT urbanisme ──────────────────────────────────────
(
  'https://tauler.seu-e.cat/edicte/2026/04/18/exp-urb-204-2026',
  'E-tauler', 'notícia', 'edicte',
  'Edicte aprovació inicial Pla Parcial Sector Nord-Est',
  'S''obre període d''informació pública de 30 dies per a la modificació del Pla d''Ordenació Urbanística Municipal al sector Nord-Est. Termini per a al·legacions: 18 de maig 2026.',
  'URGENT', 'ALTA',
  NOW() - INTERVAL '2 days', CURRENT_DATE + 12, null, 'urbanisme',
  'Presentar al·legacions al pla parcial. Convocar reunió amb veïns afectats.',
  'Quins criteris s''han seguit per definir l''edificabilitat del sector Nord-Est?',
  false, 'en curs', 'Reunió prevista 25 d''abril amb grup municipal.', 'revisat'
),

-- ── 3. IMPORTANT contractació gran import ────────────────────
(
  'https://contractaciopublica.cat/licitacio/2026/04/17/lot-3-manteniment-vies',
  'Perfil Contractant', 'document oficial', 'licitació',
  'Licitació manteniment vies i espais públics 2026-2028',
  'Licitació de contracte de serveis per al manteniment i conservació de vies públiques i espais verds del municipi per un import de 380.000 €/any. Durada 2 anys + 1 de pròrroga.',
  'IMPORTANT', 'ALTA',
  NOW() - INTERVAL '3 days', CURRENT_DATE + 22, 760000.00, 'contractació',
  'Analitzar els plecs de condicions tècniques i econòmiques.',
  null,
  false, 'pendent', null, 'nou'
),

-- ── 4. IMPORTANT pressupost participació ────────────────────
(
  'https://tauler.seu-e.cat/edicte/2026/04/14/convocatoria-jornada',
  'E-tauler', 'notícia', 'edicte',
  'Convocatòria Jornada Participació Ciutadana — Pressupostos 2027',
  'El municipi convoca una jornada de participació per als pressupostos 2027. Sessió oberta al públic el proper 5 de maig a les 18h. Proposta de 450.000 € per a inversions en mobilitat sostenible.',
  'IMPORTANT', 'ALTA',
  NOW() - INTERVAL '4 days', null, 450000.00, 'pressupost',
  'Assistir a la jornada i presentar propostes alternatives de l''oposició.',
  'Quines partides del pressupost 2026 han quedat sense executar?',
  false, 'pendent', null, 'nou'
),

-- ── 5. IMPORTANT adjudicació sospitosa ──────────────────────
(
  'https://contractaciopublica.cat/adjudicacio/2026/04/10/neteja-platja',
  'Perfil Contractant', 'document oficial', 'adjudicació',
  'Adjudicació servei neteja i manteniment platges temporada 2026',
  'Adjudicació del contracte de neteja de platges i espais marítims a Litoral Serveis SL per un import de 89.300 €. El segon ofertant va proposar 72.100 €. Diferència: 17.200 €.',
  'IMPORTANT', 'ALTA',
  NOW() - INTERVAL '5 days', null, 89300.00, 'contractació',
  'Sol·licitar informe justificatiu de la no adjudicació a l''oferta econòmicament més avantatjosa.',
  'Per quin motiu s''ha adjudicat el contracte de neteja de platges a una empresa que no va fer l''oferta econòmica més baixa?',
  false, 'en curs', 'Pendent de resposta a pregunta enviada per correu.', 'revisat'
),

-- ── 6. IMPORTANT modificació pressupostària ─────────────────
(
  'https://ciutada.platjadaro.com/acords/jgl-2026-04-08.pdf',
  'Acords JGL', 'PDF', 'acord',
  'Acords JGL 8 d''Abril — Modificació crèdit extraordinari',
  'Aprovació de modificació pressupostària per crèdit extraordinari de 45.000 € destinats a obres d''urgència a l''escola municipal. Menció a informe d''estabilitat pressupostària favorable.',
  'IMPORTANT', 'ALTA',
  NOW() - INTERVAL '8 days', null, 45000.00, 'pressupost',
  null,
  'Quina és la naturalesa exacta de les obres d''urgència a l''escola municipal?',
  false, 'tancat', 'Resolt. Confirmades obres de coberta.', 'arxivat'
),

-- ── 7. INFORMATIU subvencions culturals ─────────────────────
(
  'https://tauler.seu-e.cat/edicte/2026/04/05/bases-subvencions',
  'E-tauler', 'notícia', 'edicte',
  'Bases reguladores subvencions per a entitats culturals 2026',
  'Aprovació de les bases reguladores per a la concessió de subvencions a entitats culturals i esportives. Dotació total: 35.000 €. Termini de presentació de sol·licituds: fins al 15 de juny 2026.',
  'INFORMATIU', 'ALTA',
  NOW() - INTERVAL '10 days', CURRENT_DATE + 56, 35000.00, 'serveis',
  null, null,
  false, 'pendent', null, 'nou'
),

-- ── 8. IMPORTANT PDF escanejat (revisió manual) ─────────────
(
  'https://contractaciopublica.cat/licitacio/2026/03/30/vigilancia-platja',
  'Perfil Contractant', 'document oficial', 'licitació',
  'Licitació servei de vigilància i socorrisme platges 2026',
  'Document PDF escanejat no llegible correctament. Títol extret de l''index de la pàgina. Es recomana revisió manual del document original.',
  'IMPORTANT', 'BAIXA',
  NOW() - INTERVAL '12 days', null, null, 'contractació',
  null, null,
  true, 'pendent', null, 'nou'
),

-- ── 9. INFORMATIU personal organització ─────────────────────
(
  'https://ciutada.platjadaro.com/acords/jgl-2026-03-25.pdf',
  'Acords JGL', 'PDF', 'acord',
  'Acords JGL 25 de Març — Personal i organització',
  'Aprovació de nomenament interí per a la plaça de tècnic d''urbanisme. Augment de jornada a dos auxiliars administratius de temporada. Sense impacte pressupostari addicional al previst.',
  'INFORMATIU', 'ALTA',
  NOW() - INTERVAL '26 days', null, null, 'personal',
  null, null,
  false, 'tancat', null, 'arxivat'
),

-- ── 10. IMPORTANT taxa residus increment ────────────────────
(
  'https://tauler.seu-e.cat/edicte/2026/03/20/taxa-recollida',
  'E-tauler', 'notícia', 'edicte',
  'Modificació ordenança fiscal — taxa recollida de residus 2026',
  'Modificació de l''ordenança fiscal reguladora de la taxa de recollida de deixalles domiciliàries. Increment del 4,3% per a usos residencials i del 6,1% per a establiments comercials i hotelers.',
  'IMPORTANT', 'ALTA',
  NOW() - INTERVAL '30 days', null, null, 'pressupost',
  'Analitzar l''impacte sobre famílies i petits comerços. Preparar esmenes al Ple.',
  'Quina és la justificació tècnica d''un increment diferencial superior per als comerciants que per als residents?',
  false, 'tancat', 'Esmenes presentades al Ple de febrer. Rebutjades per majoria.', 'arxivat'
),

-- ── 11. INFORMATIU app turisme contracte menor ───────────────
(
  'https://contractaciopublica.cat/licitacio/2026/03/15/app-turisme',
  'Perfil Contractant', 'document oficial', 'contracte',
  'Contracte menor — Desenvolupament aplicació turisme digital',
  'Contracte menor per al disseny i desenvolupament d''una aplicació web de promoció turística del municipi. Import: 18.000 €. Empresa adjudicatària: Digi-Platja SL.',
  'INFORMATIU', 'ALTA',
  NOW() - INTERVAL '35 days', null, 18000.00, 'serveis',
  null, null,
  false, 'tancat', null, 'arxivat'
),

-- ── 12. IMPORTANT llicència obres hotel (revisió manual) ────
(
  'https://tauler.seu-e.cat/edicte/2026/04/19/exp-urb-209-2026',
  'E-tauler', 'notícia', 'edicte',
  'Llicència d''obres majors — Ampliació Hotel Marina Park',
  'Concessió de llicència d''obres majors per a l''ampliació de l''Hotel Marina Park amb 32 habitacions addicionals i piscina exterior. Condicionada a informe favorable de medi ambient.',
  'IMPORTANT', 'MITJA',
  NOW(), null, null, 'urbanisme',
  'Verificar si l''informe ambiental s''ha emès correctament i si s''han respectat les distàncies mínimes.',
  null,
  true, 'pendent', null, 'nou'
);

-- Verificació: mostra resum del que s'ha inserit
SELECT
  classificacio,
  COUNT(*) AS total,
  COUNT(CASE WHEN requereix_revisio_manual THEN 1 END) AS revisio_manual,
  COUNT(CASE WHEN venciment IS NOT NULL THEN 1 END)    AS amb_venciment,
  ROUND(SUM(COALESCE(import_detectat, 0))) AS total_imports_eur
FROM monitoratge
GROUP BY classificacio
ORDER BY
  CASE classificacio
    WHEN 'URGENT'    THEN 1
    WHEN 'IMPORTANT' THEN 2
    ELSE 3
  END;
