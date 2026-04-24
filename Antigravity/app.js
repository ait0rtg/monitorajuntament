/**
 * Monitor Polític Municipal — App.js
 * Arquitectura: DataService (BD) → BusinessLogic (regles) → UIRenderer (vistes)
 * SoC estricta: cada capa és independent.
 */

'use strict';

/* ═══════════════════════════════════════════════════════
   1. CONFIGURACIÓ & CONSTANTS
   ═══════════════════════════════════════════════════════ */
const AppConfig = Object.freeze({
  APP_NAME: 'Monitor Polític Municipal',
  DEFAULT_VIEW: 'dashboard',
  VENCIMENT_WARNING_DAYS: 15,
  LIVE_TABLE_LIMIT: 10,
  FULL_TABLE_LIMIT: 100,
  FONTS: [
    {
      nomCurt: 'Acords JGL',
      nom: 'Acords de Junta de Govern',
      url: 'https://ciutada.platjadaro.com/ajuntament/organitzacio-municipal/junta-de-govern/acords-de-junta-de-govern/',
      descripcio: 'PDFs setmanals amb acords adoptats, imports i terminis',
    },
    {
      nomCurt: 'E-tauler',
      nom: "E-tauler d'Anuncis",
      url: 'https://tauler.seu-e.cat/inici?idEns=1704860009',
      descripcio: 'Edictes, anuncis i procediments normatius. Terminis legals.',
    },
    {
      nomCurt: 'Perfil Contractant',
      nom: 'Perfil del Contractant',
      url: 'https://contractaciopublica.cat/ca/perfils-contractant/detall/3156875?categoria=0',
      descripcio: 'Licitacions, contractes, adjudicacions i modificacions',
    },
  ],
});

/* ═══════════════════════════════════════════════════════
   2. SUPABASE CLIENT WRAPPER
   ═══════════════════════════════════════════════════════ */
const SupabaseClient = (() => {
  let _client = null;

  function _loadCredentials() {
    return {
      url: localStorage.getItem('mp_supabase_url') || '',
      key: localStorage.getItem('mp_supabase_key') || '',
    };
  }

  function initialize(url, key) {
    if (!url || !key) return false;
    try {
      _client = window.supabase.createClient(url, key);
      return true;
    } catch (err) {
      console.error('[SupabaseClient] Error inicialitzant:', err);
      return false;
    }
  }

  function isConnected() {
    return _client !== null;
  }

  function getClient() {
    return _client;
  }

  function autoInit() {
    const { url, key } = _loadCredentials();
    if (url && key) {
      return initialize(url, key);
    }
    return false;
  }

  return { initialize, isConnected, getClient, autoInit };
})();

/* ═══════════════════════════════════════════════════════
   3. DADES DE MOSTRA (quan no hi ha Supabase connectat)
   ═══════════════════════════════════════════════════════ */
const MockData = (() => {
  const today = new Date();
  const dateStr = (daysOffset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString();
  };
  const dateOnly = (daysOffset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  };

  const RECORDS = [
    {
      id: '00000001-0000-0000-0000-000000000001',
      url_original: 'https://ciutada.platjadaro.com/acords/jgl-2026-04-15.pdf',
      font: 'Acords JGL',
      tipus: 'PDF',
      tipus_document: 'acord',
      titol: 'Acords Junta de Govern Local — 15 d\'Abril 2026',
      resum: 'Aprovació de 3 contractes de servei per un import total de 142.500 €. Inclou manteniment de jardins, neteja viària i servei de socorrisme per a la temporada d\'estiu. Termini d\'inici: 1 de juny 2026.',
      classificacio: 'URGENT',
      nivell_confianca: 'ALTA',
      data_deteccio: dateStr(-1),
      venciment: dateOnly(8),
      import_detectat: 142500.00,
      tema_principal: 'contractació',
      proposta_accio: 'Demanar expedients de contractació i verificar procediment d\'urgència.',
      pregunta_ple_suggerida: 'Per quin motiu s\'han contractat serveis per procediment d\'urgència sense licitació prèvia?',
      requereix_revisio_manual: false,
      estat_seguiment: 'pendent',
      estat: 'nou',
      recordatori_30d: dateOnly(30),
      recordatori_90d: dateOnly(90),
      recordatori_180d: dateOnly(180),
      observacions: null,
    },
    {
      id: '00000001-0000-0000-0000-000000000002',
      url_original: 'https://tauler.seu-e.cat/edicte/2026/04/18/exp-urb-204-2026',
      font: 'E-tauler',
      tipus: 'notícia',
      tipus_document: 'edicte',
      titol: 'Edicte aprovació inicial Pla Parcial Sector Nord-Est',
      resum: 'S\'obre període d\'informació pública de 30 dies per a la modificació del Pla d\'Ordenació Urbanística Municipal al sector Nord-Est. Termini per a al·legacions: 18 de maig 2026.',
      classificacio: 'URGENT',
      nivell_confianca: 'ALTA',
      data_deteccio: dateStr(-2),
      venciment: dateOnly(12),
      import_detectat: null,
      tema_principal: 'urbanisme',
      proposta_accio: 'Presentar al·legacions al pla parcial. Convocar reunió amb veïns afectats.',
      pregunta_ple_suggerida: 'Quins criteris s\'han seguit per definir l\'edificabilitat del sector Nord-Est?',
      requereix_revisio_manual: false,
      estat_seguiment: 'en curs',
      estat: 'revisat',
      recordatori_30d: dateOnly(28),
      recordatori_90d: dateOnly(88),
      recordatori_180d: dateOnly(178),
      observacions: 'Reunió prevista 25 d\'abril amb grup municipal.',
    },
    {
      id: '00000001-0000-0000-0000-000000000003',
      url_original: 'https://contractaciopublica.cat/licitacio/2026/04/17/lot-3-manteniment-vies',
      font: 'Perfil Contractant',
      tipus: 'document oficial',
      tipus_document: 'licitació',
      titol: 'Licitació manteniment vies i espais públics 2026-2028',
      resum: 'Licitació de contracte de serveis per al manteniment i conservació de vies públiques i espais verds del municipi per un import de 380.000 €/any. Durada 2 anys + 1 de pròrroga.',
      classificacio: 'IMPORTANT',
      nivell_confianca: 'ALTA',
      data_deteccio: dateStr(-3),
      venciment: dateOnly(22),
      import_detectat: 760000.00,
      tema_principal: 'contractació',
      proposta_accio: 'Analitzar els plecs de condicions tècniques i econòmiques.',
      pregunta_ple_suggerida: null,
      requereix_revisio_manual: false,
      estat_seguiment: 'pendent',
      estat: 'nou',
      recordatori_30d: dateOnly(27),
      recordatori_90d: dateOnly(87),
      recordatori_180d: dateOnly(177),
      observacions: null,
    },
    {
      id: '00000001-0000-0000-0000-000000000004',
      url_original: 'https://tauler.seu-e.cat/edicte/2026/04/14/convocatoria-jornada',
      font: 'E-tauler',
      tipus: 'notícia',
      tipus_document: 'edicte',
      titol: 'Convocatòria Jornada Participació Ciutadana — Pressupostos 2027',
      resum: 'El municipi convoca una jornada de participació per als pressupostos 2027. Sessió oberta al públic el proper 5 de maig a les 18h. Proposta de 450.000 € per a inversions en mobilitat sostenible.',
      classificacio: 'IMPORTANT',
      nivell_confianca: 'ALTA',
      data_deteccio: dateStr(-4),
      venciment: null,
      import_detectat: 450000.00,
      tema_principal: 'pressupost',
      proposta_accio: 'Assistir a la jornada i presentar propostes alternatives de l\'oposició.',
      pregunta_ple_suggerida: 'Quines partides del pressupost 2026 han quedat sense executar?',
      requereix_revisio_manual: false,
      estat_seguiment: 'pendent',
      estat: 'nou',
      recordatori_30d: dateOnly(26),
      recordatori_90d: dateOnly(86),
      recordatori_180d: dateOnly(176),
      observacions: null,
    },
    {
      id: '00000001-0000-0000-0000-000000000005',
      url_original: 'https://contractaciopublica.cat/adjudicacio/2026/04/10/neteja-platja',
      font: 'Perfil Contractant',
      tipus: 'document oficial',
      tipus_document: 'adjudicació',
      titol: 'Adjudicació servei neteja i manteniment platges temporada 2026',
      resum: 'Adjudicació del contracte de neteja de platges i espais marítims a Litoral Serveis SL per un import de 89.300 €. El segon ofertant va proposar 72.100 €. Diferència: 17.200 €.',
      classificacio: 'IMPORTANT',
      nivell_confianca: 'ALTA',
      data_deteccio: dateStr(-5),
      venciment: null,
      import_detectat: 89300.00,
      tema_principal: 'contractació',
      proposta_accio: 'Sol·licitar informe justificatiu de la no adjudicació a l\'oferta econòmicament més avantatjosa.',
      pregunta_ple_suggerida: 'Per quin motiu s\'ha adjudicat el contracte de neteja de platges a una empresa que no va fer l\'oferta econòmica més baixa?',
      requereix_revisio_manual: false,
      estat_seguiment: 'en curs',
      estat: 'revisat',
      recordatori_30d: dateOnly(25),
      recordatori_90d: dateOnly(85),
      recordatori_180d: dateOnly(175),
      observacions: 'Pendent de resposta a pregunta enviada per correu.',
    },
    {
      id: '00000001-0000-0000-0000-000000000006',
      url_original: 'https://ciutada.platjadaro.com/acords/jgl-2026-04-08.pdf',
      font: 'Acords JGL',
      tipus: 'PDF',
      tipus_document: 'acord',
      titol: 'Acords JGL 8 d\'Abril — Modificació crèdit extraordinari',
      resum: 'Aprovació de modificació pressupostària per crèdit extraordinari de 45.000 € destinats a obres d\'urgència a l\'escola municipal. Menció a informe d\'estabilitat pressupostària favorable.',
      classificacio: 'IMPORTANT',
      nivell_confianca: 'ALTA',
      data_deteccio: dateStr(-8),
      venciment: null,
      import_detectat: 45000.00,
      tema_principal: 'pressupost',
      proposta_accio: null,
      pregunta_ple_suggerida: 'Quina és la naturalesa exacta de les obres d\'urgència a l\'escola municipal?',
      requereix_revisio_manual: false,
      estat_seguiment: 'tancat',
      estat: 'arxivat',
      recordatori_30d: dateOnly(22),
      recordatori_90d: dateOnly(82),
      recordatori_180d: dateOnly(172),
      observacions: 'Resolt. Confirmades obres de cubierta.',
    },
    {
      id: '00000001-0000-0000-0000-000000000007',
      url_original: 'https://tauler.seu-e.cat/edicte/2026/04/05/bases-subvencions',
      font: 'E-tauler',
      tipus: 'notícia',
      tipus_document: 'edicte',
      titol: 'Bases reguladores subvencions per a entitats culturals 2026',
      resum: 'Aprovació de les bases reguladores per a la concessió de subvencions a entitats culturals i esportives. Dotació total: 35.000 €. Termini de presentació de sol·licituds: fins al 15 de juny 2026.',
      classificacio: 'INFORMATIU',
      nivell_confianca: 'ALTA',
      data_deteccio: dateStr(-10),
      venciment: dateOnly(56),
      import_detectat: 35000.00,
      tema_principal: 'serveis',
      proposta_accio: null,
      pregunta_ple_suggerida: null,
      requereix_revisio_manual: false,
      estat_seguiment: 'pendent',
      estat: 'nou',
      recordatori_30d: dateOnly(20),
      recordatori_90d: dateOnly(80),
      recordatori_180d: dateOnly(170),
      observacions: null,
    },
    {
      id: '00000001-0000-0000-0000-000000000008',
      url_original: 'https://contractaciopublica.cat/licitacio/2026/03/30/vigilancia-platja',
      font: 'Perfil Contractant',
      tipus: 'document oficial',
      tipus_document: 'licitació',
      titol: 'Licitació servei de vigilància i socorrisme platges 2026',
      resum: 'Document PDF escanejat no llegible correctament. Títol extret de l\'index de la pàgina. Es recomana revisió manual del document original.',
      classificacio: 'IMPORTANT',
      nivell_confianca: 'BAIXA',
      data_deteccio: dateStr(-12),
      venciment: null,
      import_detectat: null,
      tema_principal: 'contractació',
      proposta_accio: null,
      pregunta_ple_suggerida: null,
      requereix_revisio_manual: true,
      estat_seguiment: 'pendent',
      estat: 'nou',
      recordatori_30d: dateOnly(18),
      recordatori_90d: dateOnly(78),
      recordatori_180d: dateOnly(168),
      observacions: null,
    },
    {
      id: '00000001-0000-0000-0000-000000000009',
      url_original: 'https://ciutada.platjadaro.com/acords/jgl-2026-03-25.pdf',
      font: 'Acords JGL',
      tipus: 'PDF',
      tipus_document: 'acord',
      titol: 'Acords JGL 25 de Març — Personal i organització',
      resum: 'Aprovació de nomenament interí per a la plaça de tècnic d\'urbanisme. Augment de jornada a dos auxiliars administratius de temporada. Sense impacte pressupostari addicional al previst.',
      classificacio: 'INFORMATIU',
      nivell_confianca: 'ALTA',
      data_deteccio: dateStr(-26),
      venciment: null,
      import_detectat: null,
      tema_principal: 'personal',
      proposta_accio: null,
      pregunta_ple_suggerida: null,
      requereix_revisio_manual: false,
      estat_seguiment: 'tancat',
      estat: 'arxivat',
      recordatori_30d: dateOnly(4),
      recordatori_90d: dateOnly(64),
      recordatori_180d: dateOnly(154),
      observacions: null,
    },
    {
      id: '00000001-0000-0000-0000-000000000010',
      url_original: 'https://tauler.seu-e.cat/edicte/2026/03/20/taxa-recollida',
      font: 'E-tauler',
      tipus: 'notícia',
      tipus_document: 'edicte',
      titol: 'Modificació ordenança fiscal — taxa recollida de residus 2026',
      resum: 'Modificació de l\'ordenança fiscal reguladora de la taxa de recollida de deixalles domiciliàries. Increment del 4,3% per a usos residencials i del 6,1% per a establiments comercials i hotelers.',
      classificacio: 'IMPORTANT',
      nivell_confianca: 'ALTA',
      data_deteccio: dateStr(-30),
      venciment: null,
      import_detectat: null,
      tema_principal: 'pressupost',
      proposta_accio: 'Analitzar l\'impacte sobre famílies i petits comerços. Preparar esmenes al Ple.',
      pregunta_ple_suggerida: 'Quina és la justificació tècnica d\'un increment diferencial superior per als comerciants que per als residents?',
      requereix_revisio_manual: false,
      estat_seguiment: 'tancat',
      estat: 'arxivat',
      recordatori_30d: dateOnly(0),
      recordatori_90d: dateOnly(60),
      recordatori_180d: dateOnly(150),
      observacions: 'Esmenes presentades al Ple de febrer. Rebutjades per majoria.',
    },
    {
      id: '00000001-0000-0000-0000-000000000011',
      url_original: 'https://contractaciopublica.cat/licitacio/2026/03/15/app-turisme',
      font: 'Perfil Contractant',
      tipus: 'document oficial',
      tipus_document: 'contracte',
      titol: 'Contracte menor — Desenvolupament aplicació turisme digital',
      resum: 'Contracte menor per al disseny i desenvolupament d\'una aplicació web de promoció turística del municipi. Import: 18.000 €. Empresa adjudicatària: Digi-Platja SL.',
      classificacio: 'INFORMATIU',
      nivell_confianca: 'ALTA',
      data_deteccio: dateStr(-35),
      venciment: null,
      import_detectat: 18000.00,
      tema_principal: 'serveis',
      proposta_accio: null,
      pregunta_ple_suggerida: null,
      requereix_revisio_manual: false,
      estat_seguiment: 'tancat',
      estat: 'arxivat',
      recordatori_30d: dateOnly(-5),
      recordatori_90d: dateOnly(55),
      recordatori_180d: dateOnly(145),
      observacions: null,
    },
    {
      id: '00000001-0000-0000-0000-000000000012',
      url_original: 'https://tauler.seu-e.cat/edicte/2026/04/19/exp-urb-209-2026',
      font: 'E-tauler',
      tipus: 'notícia',
      tipus_document: 'edicte',
      titol: 'Llicència d\'obres majors — Ampliació Hotel Marina Park',
      resum: 'Concessió de llicència d\'obres majors per a l\'ampliació de l\'Hotel Marina Park amb 32 habitacions addicionals i piscina exterior. Condicionada a informe favorable de medi ambient.',
      classificacio: 'IMPORTANT',
      nivell_confianca: 'MITJA',
      data_deteccio: dateStr(0),
      venciment: null,
      import_detectat: null,
      tema_principal: 'urbanisme',
      proposta_accio: 'Verificar si l\'informe ambiental s\'ha emès correctament i si s\'han respectat les distàncies mínimes.',
      pregunta_ple_suggerida: null,
      requereix_revisio_manual: true,
      estat_seguiment: 'pendent',
      estat: 'nou',
      recordatori_30d: dateOnly(30),
      recordatori_90d: dateOnly(90),
      recordatori_180d: dateOnly(180),
      observacions: null,
    },
  ];

  return { getAll: () => RECORDS };
})();

/* ═══════════════════════════════════════════════════════
   4. DATA SERVICE — única capa que accedeix a BD o mock
   ═══════════════════════════════════════════════════════ */
const DataService = (() => {
  let _cache = null;
  let _lastFetch = null;
  const CACHE_TTL_MS = 60_000; // 1 minut

  async function _fetchFromSupabase() {
    const client = SupabaseClient.getClient();
    const { data, error } = await client
      .from('monitoratge')
      .select('*')
      .order('data_deteccio', { ascending: false })
      .limit(AppConfig.FULL_TABLE_LIMIT);

    if (error) throw new Error(`Supabase error: ${error.message}`);
    return data || [];
  }

  async function getAllRecords(forceRefresh = false) {
    const now = Date.now();
    const isCacheValid = _cache && _lastFetch && (now - _lastFetch) < CACHE_TTL_MS;

    if (!forceRefresh && isCacheValid) return _cache;

    if (SupabaseClient.isConnected()) {
      try {
        _cache = await _fetchFromSupabase();
        _lastFetch = now;
        return _cache;
      } catch (err) {
        console.warn('[DataService] Supabase fallback a mock:', err.message);
        ToastService.show('Supabase no disponible. Mostrant dades de mostra.', 'warning');
      }
    }

    _cache = MockData.getAll();
    _lastFetch = now;
    return _cache;
  }

  async function updateRecord(id, fields) {
    if (SupabaseClient.isConnected()) {
      const client = SupabaseClient.getClient();
      const { error } = await client.from('monitoratge').update(fields).eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      // Actualitza el mock local
      const records = MockData.getAll();
      const record = records.find(r => r.id === id);
      if (record) Object.assign(record, fields);
    }
    invalidateCache();
  }

  function invalidateCache() {
    _cache = null;
    _lastFetch = null;
  }

  return { getAllRecords, updateRecord, invalidateCache };
})();

/* ═══════════════════════════════════════════════════════
   5. BUSINESS LOGIC — Regles fixes i càlculs
   ═══════════════════════════════════════════════════════ */
const BusinessLogic = (() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function daysUntil(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return Math.ceil((d - today) / 86_400_000);
  }

  function isVencimentProxim(dateStr) {
    const days = daysUntil(dateStr);
    return days !== null && days > 0 && days <= AppConfig.VENCIMENT_WARNING_DAYS;
  }

  function computeKPIs(records) {
    const total = records.length;
    const urgents = records.filter(r => r.classificacio === 'URGENT' && r.estat_seguiment !== 'tancat').length;
    const revisioManual = records.filter(r => r.requereix_revisio_manual).length;
    const vencimentsProxims = records.filter(r => isVencimentProxim(r.venciment)).length;
    const altaConfianca = records.filter(r => r.nivell_confianca === 'ALTA').length;
    const countUrgent = records.filter(r => r.classificacio === 'URGENT').length;
    const countImportant = records.filter(r => r.classificacio === 'IMPORTANT').length;
    const countInformatiu = records.filter(r => r.classificacio === 'INFORMATIU').length;
    const totalImports = records
      .filter(r => r.import_detectat)
      .reduce((acc, r) => acc + parseFloat(r.import_detectat), 0);

    const preguntes = records.filter(r => r.pregunta_ple_suggerida && r.pregunta_ple_suggerida.trim()).length;

    return {
      total, urgents, revisioManual, vencimentsProxims,
      altaConfianca, countUrgent, countImportant, countInformatiu,
      totalImports, preguntes,
      urgentPct: total > 0 ? Math.round((countUrgent / total) * 100) : 0,
      altaConfiancaPct: total > 0 ? Math.round((altaConfianca / total) * 100) : 0,
    };

  }

  function sortByUrgency(records) {
    const order = { URGENT: 0, IMPORTANT: 1, INFORMATIU: 2 };
    return [...records].sort((a, b) => {
      const byUrgency = (order[a.classificacio] ?? 3) - (order[b.classificacio] ?? 3);
      if (byUrgency !== 0) return byUrgency;
      return new Date(b.data_deteccio) - new Date(a.data_deteccio);
    });
  }

  function getRecordsDueForReminder(records, daysWindow) {
    const limit = new Date(today);
    limit.setDate(limit.getDate() + daysWindow + 7);
    const start = new Date(today);
    start.setDate(start.getDate() + daysWindow - 7);

    const fieldMap = { 30: 'recordatori_30d', 90: 'recordatori_90d', 180: 'recordatori_180d' };
    const field = fieldMap[daysWindow];
    if (!field) return [];

    return records.filter(r => {
      const d = r[field];
      if (!d) return false;
      const date = new Date(d);
      return date >= start && date <= limit;
    });
  }

  return { daysUntil, isVencimentProxim, computeKPIs, sortByUrgency, getRecordsDueForReminder };
})();

/* ═══════════════════════════════════════════════════════
   6. TOAST SERVICE
   ═══════════════════════════════════════════════════════ */
const ToastService = (() => {
  const ICONS = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  function show(message, type = 'info', durationMs = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `<span>${ICONS[type] || ''}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, durationMs);
  }

  return { show };
})();

/* ═══════════════════════════════════════════════════════
   7. UI RENDERER — Només renderitza. Cap lògica de negoci.
   ═══════════════════════════════════════════════════════ */
const UIRenderer = (() => {

  /* ── Helpers ── */
  function formatDate(isoStr) {
    if (!isoStr) return '—';
    return new Date(isoStr).toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function formatDateTime(isoStr) {
    if (!isoStr) return '—';
    return new Date(isoStr).toLocaleString('ca-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function formatCurrency(amount) {
    if (!amount) return '—';
    return new Intl.NumberFormat('ca-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
  }

  function classifBadge(cls) {
    const MAP = { URGENT: 'urgent', IMPORTANT: 'important', INFORMATIU: 'informatiu' };
    const EMOJI = { URGENT: '🔴', IMPORTANT: '🟡', INFORMATIU: '🟢' };
    const key = MAP[cls] || 'informatiu';
    return `<span class="badge badge--${key}">${EMOJI[cls] || ''} ${cls || '—'}</span>`;
  }

  function confiancaBadge(conf) {
    const MAP = { ALTA: 'alta', MITJA: 'mitja', BAIXA: 'baixa' };
    const key = MAP[conf] || 'mitja';
    return `<span class="badge badge--confianca-${key}">${conf || '—'}</span>`;
  }

  function estatBadge(estat) {
    const MAP = { pendent: 'pendent', 'en curs': 'en-curs', tancat: 'tancat' };
    const key = MAP[estat] || 'pendent';
    return `<span class="badge badge--estat-${key}">${estat || 'pendent'}</span>`;
  }

  function truncate(str, maxLen = 60) {
    if (!str) return '—';
    return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
  }

  /* ── KPI Cards ── */
  function renderKPIs(kpis) {
    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('kpi-total-value', kpis.total);
    el('kpi-total-delta', `+${kpis.total} total`);
    el('kpi-urgent-value', kpis.urgents);
    el('kpi-urgent-delta', `${kpis.urgents} pendents`);
    el('kpi-revisio-value', kpis.revisioManual);
    el('kpi-revisio-delta', 'confiança baixa');
    el('kpi-preguntes-value', kpis.preguntes);
    el('kpi-preguntes-delta', `${kpis.preguntes} suggerides per IA`);
    el('kpi-venciments-value', kpis.vencimentsProxims);
    el('kpi-venciments-delta', '≤15 dies');
    el('badge-urgent', kpis.urgents);
    el('badge-seguiment', kpis.total - (kpis.countInformatiu || 0));
    el('badge-revisio', kpis.revisioManual);
    el('badge-preguntes', kpis.preguntes);
  }


  /* ── Live Table (Dashboard) ── */
  function renderLiveTable(records) {
    const tbody = document.getElementById('live-table-body');
    const badge = document.getElementById('live-count-badge');
    const subtitle = document.getElementById('live-subtitle');
    if (!tbody) return;

    const last10 = records.slice(0, AppConfig.LIVE_TABLE_LIMIT);
    if (badge) badge.textContent = last10.length;
    if (subtitle) subtitle.textContent = `darreres ${last10.length} deteccions`;

    if (last10.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="table-loading">Cap novetat registrada.</td></tr>';
      return;
    }

    tbody.innerHTML = last10.map(r => {
      const days = BusinessLogic.daysUntil(r.venciment);
      const vencimentWarning = BusinessLogic.isVencimentProxim(r.venciment) ?
        `<span style="color:var(--color-accent-red);font-size:0.7rem;">⚠️ ${days}d</span>` : '';
      return `
        <tr>
          <td class="td-title" title="${r.titol || ''}">
            <a href="${r.url_original || '#'}" target="_blank" rel="noopener noreferrer"
               title="Obrir document original">${truncate(r.titol, 55)}</a>
            ${vencimentWarning}
          </td>
          <td><span style="font-size:var(--font-size-xs);color:var(--color-text-secondary);">${r.font || '—'}</span></td>
          <td><span style="font-size:var(--font-size-xs);text-transform:capitalize;">${r.tema_principal || '—'}</span></td>
          <td>${classifBadge(r.classificacio)}</td>
          <td>${estatBadge(r.estat_seguiment)}</td>
          <td>
            <button class="action-btn action-btn--view" 
              data-id="${r.id}" data-action="detail" 
              aria-label="Veure detall de ${truncate(r.titol, 30)}">Veure</button>
          </td>
        </tr>`;
    }).join('');
  }

  /* ── Full Novetats Table (amb paginació i filtre de dates) ── */
  const PAGE_SIZE = 25;
  function renderFullTable(records, filter = 'all', page = 0, dateFrom = null, dateTo = null) {
    const tbody  = document.getElementById('full-table-body');
    const footer = document.getElementById('full-table-footer');
    if (!tbody) return;

    let filtered = filter === 'all' ? records : records.filter(r => r.classificacio === filter);

    // Filtre de dates
    if (dateFrom) {
      const from = new Date(dateFrom);
      filtered = filtered.filter(r => r.data_deteccio && new Date(r.data_deteccio) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter(r => r.data_deteccio && new Date(r.data_deteccio) <= to);
    }

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages - 1);
    const pageRecords = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" class="table-loading">Cap registre amb aquest filtre.</td></tr>';
      if (footer) footer.innerHTML = '';
      return;
    }

    tbody.innerHTML = pageRecords.map(r => {
      const days = BusinessLogic.daysUntil(r.venciment);
      const vencCell = r.venciment
        ? `<span${days !== null && days <= 15 ? ' style="color:var(--color-accent-red);font-weight:600;"' : ''}>${formatDate(r.venciment)}${days !== null && days > 0 ? ` (${days}d)` : ''}</span>`
        : '—';
      const hasPregunta = r.pregunta_ple_suggerida ? '<span title="Té pregunta de ple suggerida" style="color:var(--color-accent-blue);font-size:0.7rem;">&#x1F3A4;</span>' : '';

      return `
        <tr>
          <td style="white-space:nowrap;font-size:var(--font-size-xs);color:var(--color-text-muted);">${formatDate(r.data_deteccio)}</td>
          <td class="td-title" title="${r.titol || ''}">
            <a href="${r.url_original || '#'}" target="_blank" rel="noopener noreferrer">${truncate(r.titol, 50)}</a>
            ${hasPregunta}
          </td>
          <td style="font-size:var(--font-size-xs);">${r.font || '—'}</td>
          <td style="font-size:var(--font-size-xs);text-transform:capitalize;">${r.tema_principal || '—'}</td>
          <td>${classifBadge(r.classificacio)}</td>
          <td>${confiancaBadge(r.nivell_confianca)}</td>
          <td style="font-size:var(--font-size-xs);white-space:nowrap;color:var(--color-accent-green);">${formatCurrency(r.import_detectat)}</td>
          <td style="font-size:var(--font-size-xs);">${vencCell}</td>
          <td>${estatBadge(r.estat_seguiment)}</td>
          <td>
            <button class="action-btn action-btn--view" data-id="${r.id}" data-action="detail" aria-label="Veure detall">Veure</button>
          </td>
        </tr>`;
    }).join('');

    // Paginació
    if (footer) {
      const from = safePage * PAGE_SIZE + 1;
      const to   = Math.min((safePage + 1) * PAGE_SIZE, filtered.length);
      footer.innerHTML = `
        <div class="table-pagination" role="navigation" aria-label="Paginació">
          <span class="table-pagination__info">${from}–${to} de ${filtered.length} registres</span>
          <div class="table-pagination__controls">
            <button class="table-pagination__btn" data-page-delta="-1"
              ${safePage === 0 ? 'disabled' : ''} aria-label="Pàgina anterior">&#8249;</button>
            <span class="table-pagination__pages">${safePage + 1} / ${totalPages}</span>
            <button class="table-pagination__btn" data-page-delta="1"
              ${safePage >= totalPages - 1 ? 'disabled' : ''} aria-label="Pàgina següent">&#8250;</button>
          </div>
        </div>`;
    }
  }

  /* ── Chart ── */
  let _chartInstance = null;
  function renderUrgencyChart(kpis) {
    const ctx = document.getElementById('urgency-chart');
    if (!ctx) return;

    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('stat-urgent-pct', kpis.urgentPct + '%');
    el('stat-total-today', kpis.total);
    el('stat-confianca', kpis.altaConfiancaPct + '%');

    const data = {
      labels: ['Urgent', 'Important', 'Informatiu'],
      datasets: [{
        data: [kpis.countUrgent, kpis.countImportant, kpis.countInformatiu],
        backgroundColor: ['rgba(248,113,113,0.7)', 'rgba(251,191,36,0.7)', 'rgba(74,222,128,0.7)'],
        borderColor: ['#f87171', '#fbbf24', '#4ade80'],
        borderWidth: 1,
        borderRadius: 6,
      }],
    };

    if (_chartInstance) {
      _chartInstance.data = data;
      _chartInstance.update();
      return;
    }

    _chartInstance = new Chart(ctx, {
      type: 'bar',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} registres`,
        }}},
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8891a8', font: { size: 11, family: 'Inter' } } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8891a8', font: { size: 11, family: 'Inter' }, stepSize: 1 }, beginAtZero: true },
        },
      },
    });
  }

  /* ── Calendar ── */
  function renderCalendar(records) {
    const container = document.getElementById('calendar-widget');
    if (!container) return;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Build set of days with events
    const eventDays = new Map(); // day -> 'urgent' | 'normal'
    records.forEach(r => {
      if (!r.venciment) return;
      const d = new Date(r.venciment);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = d.getDate();
        const existing = eventDays.get(key);
        if (r.classificacio === 'URGENT' || existing === 'urgent') {
          eventDays.set(key, 'urgent');
        } else {
          eventDays.set(key, 'normal');
        }
      }
    });

    const MONTHS_CA = ['Gener','Febrer','Març','Abril','Maig','Juny','Juliol','Agost','Setembre','Octubre','Novembre','Desembre'];
    const DAYS_CA = ['Dg','Dl','Dt','Dc','Dj','Dv','Ds'];

    let html = `
      <div class="calendar__header">
        <span class="calendar__month">${MONTHS_CA[month]} ${year}</span>
        <span style="font-size:var(--font-size-xs);color:var(--color-text-muted);">${eventDays.size} venciments</span>
      </div>
      <div class="calendar__grid">
        ${DAYS_CA.map(d => `<div class="calendar__day-name">${d}</div>`).join('')}
    `;

    // Empty cells before first day (Monday-based)
    const startOffset = (firstDay + 6) % 7;
    for (let i = 0; i < startOffset; i++) {
      html += '<div class="calendar__day calendar__day--empty"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate();
      const eventType = eventDays.get(day);
      let cls = 'calendar__day';
      if (isToday) cls += ' calendar__day--today';
      if (eventType === 'urgent') cls += ' calendar__day--has-urgent';
      else if (eventType === 'normal') cls += ' calendar__day--has-event';

      html += `<div class="${cls}" title="${eventType ? 'Venciment' : ''}" role="${eventType ? 'button' : 'presentation'}" aria-label="${day} de ${MONTHS_CA[month]}${eventType ? ' — té venciment' : ''}">${day}</div>`;
    }

    html += '</div>';
    container.innerHTML = html;
  }

  /* ── Task List ── */
  function renderTaskList(records) {
    const list = document.getElementById('task-list');
    const badge = document.getElementById('tasks-count-badge');
    if (!list) return;

    const pendents = records.filter(r =>
      r.estat_seguiment === 'pendent' &&
      (r.classificacio === 'URGENT' || r.classificacio === 'IMPORTANT' || r.requereix_revisio_manual)
    ).slice(0, 8);

    if (badge) badge.textContent = pendents.length;

    if (pendents.length === 0) {
      list.innerHTML = '<li class="task-list__loading">Cap tasca pendent rellevant.</li>';
      return;
    }

    const TEMA_ICON = { urbanisme: '🏗️', contractació: '📋', personal: '👥', serveis: '🛠️', pressupost: '💰', altres: '📄' };

    list.innerHTML = pendents.map(r => {
      const isUrgent = r.classificacio === 'URGENT' || BusinessLogic.isVencimentProxim(r.venciment);
      const icon = TEMA_ICON[r.tema_principal] || '📄';
      const meta = [
        r.font,
        r.import_detectat ? formatCurrency(r.import_detectat) : null,
        r.venciment && BusinessLogic.isVencimentProxim(r.venciment) ? `⚠️ Ven. ${formatDate(r.venciment)}` : null,
      ].filter(Boolean).join(' · ');

      return `
        <li class="task-item">
          <div class="task-item__icon">${icon}</div>
          <div class="task-item__body">
            <div class="task-item__title" title="${r.titol || ''}">${truncate(r.titol, 45)}</div>
            <div class="task-item__meta">${meta}</div>
          </div>
          <button class="task-item__action ${isUrgent ? 'task-item__action--urgent' : ''}"
            data-id="${r.id}" data-action="detail" 
            aria-label="Veure detall de ${truncate(r.titol, 30)}">
            ${r.requereix_revisio_manual ? 'Revisar' : 'Veure'}
          </button>
        </li>`;
    }).join('');
  }

  /* ── Seguiment Cards ── */
  function renderSeguimentCards(records, filterEstat = 'all') {
    const container = document.getElementById('seguiment-cards');
    if (!container) return;

    const filtered = filterEstat === 'all' ? records : records.filter(r => r.estat_seguiment === filterEstat);

    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state__icon">📭</div><div class="empty-state__text">Cap registre amb aquest filtre.</div></div>';
      return;
    }

    container.innerHTML = filtered.map(r => `
      <div class="seguiment-card" data-id="${r.id}" data-action="detail" role="listitem" tabindex="0" 
           aria-label="Registre: ${truncate(r.titol, 40)}">
        <div class="seguiment-card__header">
          <div class="seguiment-card__title">${r.titol || '—'}</div>
          <div>${classifBadge(r.classificacio)}</div>
        </div>
        <div class="seguiment-card__resum">${r.resum || 'Sense resum disponible.'}</div>
        <div class="seguiment-card__footer">
          <div>
            ${estatBadge(r.estat_seguiment)}
            ${confiancaBadge(r.nivell_confianca)}
          </div>
          <div class="seguiment-card__meta">
            ${r.font} · ${formatDate(r.data_deteccio)}
            ${r.import_detectat ? ' · ' + formatCurrency(r.import_detectat) : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  /* ── Recordatoris ── */
  function renderRecordatoris(records) {
    const WINDOWS = [30, 90, 180];
    WINDOWS.forEach(days => {
      const list = document.getElementById(`rec-${days}`);
      if (!list) return;
      const due = BusinessLogic.getRecordsDueForReminder(records, days);
      if (due.length === 0) {
        list.innerHTML = `<li class="task-list__loading">Cap recordatori proper als ${days} dies.</li>`;
        return;
      }
      list.innerHTML = due.map(r => `
        <li class="task-item" style="padding:var(--space-3) var(--space-4);">
          <div class="task-item__icon">📅</div>
          <div class="task-item__body">
            <div class="task-item__title">${truncate(r.titol, 50)}</div>
            <div class="task-item__meta">${r.font} · Detecció: ${formatDate(r.data_deteccio)}</div>
          </div>
          <button class="task-item__action" data-id="${r.id}" data-action="detail" aria-label="Veure detall">Veure</button>
        </li>
      `).join('');
    });
  }

  /* ── Revisions ── */
  function renderRevisions(records) {
    const container = document.getElementById('revisions-list');
    if (!container) return;
    const revisions = records.filter(r => r.requereix_revisio_manual);
    if (revisions.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state__icon">✅</div><div class="empty-state__text">Cap document pendent de revisió manual.</div></div>';
      return;
    }
    container.innerHTML = revisions.map(r => `
      <div class="seguiment-card" data-id="${r.id}" data-action="detail" role="listitem" tabindex="0">
        <div class="seguiment-card__header">
          <div class="seguiment-card__title">${r.titol || '—'}</div>
          <span class="badge badge--confianca-baixa">⚠️ Revisió manual</span>
        </div>
        <div class="seguiment-card__resum">${r.resum || 'Contingut no llegit correctament. Accediu al link original.'}</div>
        <div class="seguiment-card__footer">
          <div>${classifBadge(r.classificacio)}</div>
          <div class="seguiment-card__meta">${r.font} · ${formatDate(r.data_deteccio)}</div>
        </div>
      </div>
    `).join('');
  }

  /* ── Imports ── */
  function renderImports(records) {
    const tbody = document.getElementById('imports-table-body');
    const summary = document.getElementById('imports-summary');
    if (!tbody) return;

    const withImports = records.filter(r => r.import_detectat);
    const total = withImports.reduce((a, r) => a + parseFloat(r.import_detectat), 0);
    const maxImport = withImports.reduce((a, r) => Math.max(a, parseFloat(r.import_detectat)), 0);

    if (summary) {
      summary.innerHTML = `
        <div class="imports-summary-card">
          <div class="imports-summary-card__label">Import Total Detectat</div>
          <div class="imports-summary-card__value">${formatCurrency(total)}</div>
        </div>
        <div class="imports-summary-card">
          <div class="imports-summary-card__label">Documents amb Import</div>
          <div class="imports-summary-card__value">${withImports.length}</div>
        </div>
        <div class="imports-summary-card">
          <div class="imports-summary-card__label">Import Màxim Detectat</div>
          <div class="imports-summary-card__value">${formatCurrency(maxImport)}</div>
        </div>
      `;
    }

    if (withImports.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="table-loading">Cap import detectat.</td></tr>';
      return;
    }

    const sorted = [...withImports].sort((a, b) => parseFloat(b.import_detectat) - parseFloat(a.import_detectat));
    tbody.innerHTML = sorted.map(r => `
      <tr>
        <td style="font-size:var(--font-size-xs);white-space:nowrap;">${formatDate(r.data_deteccio)}</td>
        <td class="td-title" title="${r.titol || ''}">
          <a href="${r.url_original || '#'}" target="_blank" rel="noopener noreferrer">${truncate(r.titol, 45)}</a>
        </td>
        <td style="font-size:var(--font-size-xs);">${r.font || '—'}</td>
        <td style="font-size:var(--font-size-sm);font-weight:600;color:var(--color-accent-green);">${formatCurrency(r.import_detectat)}</td>
        <td style="font-size:var(--font-size-xs);text-transform:capitalize;">${r.tipus_document || '—'}</td>
        <td>${classifBadge(r.classificacio)}</td>
      </tr>
    `).join('');
  }

  /* ── Fonts ── */
  function renderFonts(records) {
    const grid = document.getElementById('fonts-grid');
    if (!grid) return;

    grid.innerHTML = AppConfig.FONTS.map(font => {
      const fontRecords = records.filter(r => r.font === font.nomCurt);
      const urgents = fontRecords.filter(r => r.classificacio === 'URGENT').length;
      const imports = fontRecords.filter(r => r.import_detectat);
      const totalImport = imports.reduce((a, r) => a + parseFloat(r.import_detectat), 0);
      const lastDetected = fontRecords.sort((a, b) => new Date(b.data_deteccio) - new Date(a.data_deteccio))[0];

      return `
        <article class="font-card" role="listitem">
          <div>
            <div class="font-card__name">${font.nom}</div>
            <div class="font-card__url">${font.url}</div>
          </div>
          <div class="font-card__status">Monitoritzada · Fase 1</div>
          <div style="display:flex;flex-direction:column;gap:var(--space-2);">
            <div class="font-card__stat">
              <span class="font-card__stat-label">Registres detectats</span>
              <span class="font-card__stat-value">${fontRecords.length}</span>
            </div>
            <div class="font-card__stat">
              <span class="font-card__stat-label">Urgents</span>
              <span class="font-card__stat-value" style="${urgents > 0 ? 'color:var(--color-accent-red)' : ''}">${urgents}</span>
            </div>
            <div class="font-card__stat">
              <span class="font-card__stat-label">Imports detectats</span>
              <span class="font-card__stat-value">${totalImport > 0 ? formatCurrency(totalImport) : '—'}</span>
            </div>
            <div class="font-card__stat">
              <span class="font-card__stat-label">Última detecció</span>
              <span class="font-card__stat-value">${lastDetected ? formatDate(lastDetected.data_deteccio) : '—'}</span>
            </div>
          </div>
          <p style="font-size:var(--font-size-xs);color:var(--color-text-secondary);">${font.descripcio}</p>
        </article>
      `;
    }).join('');
  }

  /* ── Preguntes de Ple ── */
  function renderPreguntes(records, filter = 'all') {
    const grid    = document.getElementById('preguntes-grid');
    const summary = document.getElementById('preguntes-summary');
    if (!grid) return;

    // Registres que tenen pregunta de ple suggerida
    const ambPregunta = records.filter(r => r.pregunta_ple_suggerida && r.pregunta_ple_suggerida.trim());

    // Aplicar filtre d'estat (pendent/presentada/tancada → mapem sobre estat_seguiment)
    const filtrats = filter === 'all' ? ambPregunta
      : filter === 'presentada' ? ambPregunta.filter(r => r.estat_seguiment === 'en curs')
      : filter === 'tancada'    ? ambPregunta.filter(r => r.estat_seguiment === 'tancat')
      : ambPregunta.filter(r => r.estat_seguiment === 'pendent');

    // Summary KPIs
    const nPendent    = ambPregunta.filter(r => r.estat_seguiment === 'pendent').length;
    const nPresentada = ambPregunta.filter(r => r.estat_seguiment === 'en curs').length;
    const nTancada    = ambPregunta.filter(r => r.estat_seguiment === 'tancat').length;
    if (summary) {
      summary.innerHTML = `
        <div class="imports-summary">
          <div class="import-kpi">
            <span class="import-kpi__value">${ambPregunta.length}</span>
            <span class="import-kpi__label">Total preguntes</span>
          </div>
          <div class="import-kpi">
            <span class="import-kpi__value" style="color:var(--color-accent-amber)">${nPendent}</span>
            <span class="import-kpi__label">Pendents de presentar</span>
          </div>
          <div class="import-kpi">
            <span class="import-kpi__value" style="color:var(--color-accent-blue)">${nPresentada}</span>
            <span class="import-kpi__label">Presentades (en curs)</span>
          </div>
          <div class="import-kpi">
            <span class="import-kpi__value" style="color:var(--color-text-muted)">${nTancada}</span>
            <span class="import-kpi__label">Tancades / Respostes</span>
          </div>
        </div>`;
    }

    if (filtrats.length === 0) {
      grid.innerHTML = `<div class="table-loading" style="padding:2rem;text-align:center;">
        ${ ambPregunta.length === 0
          ? 'Cap registre amb pregunta de ple suggerida per la IA.'
          : 'Cap registre en aquest estat.' }
      </div>`;
      return;
    }

    grid.innerHTML = filtrats.map(r => {
      const estatLabel = { pendent: 'Pendent', 'en curs': 'Presentada', tancat: 'Tancada' }[r.estat_seguiment] || 'Pendent';
      const estatColor = { pendent: 'var(--color-accent-amber)', 'en curs': 'var(--color-accent-blue)', tancat: 'var(--color-text-muted)' }[r.estat_seguiment];
      return `
        <article class="pregunta-card" role="listitem" data-id="${r.id}">
          <div class="pregunta-card__header">
            <div style="display:flex;align-items:center;gap:var(--space-2);flex-wrap:wrap;">
              ${classifBadge(r.classificacio)}
              <span style="font-size:var(--font-size-xs);color:var(--color-text-secondary);">${r.font} · ${formatDate(r.data_deteccio)}</span>
            </div>
            <span style="font-size:var(--font-size-xs);font-weight:600;color:${estatColor};">${estatLabel}</span>
          </div>
          <p class="pregunta-card__source" title="${r.titol || ''}">${truncate(r.titol, 80)}</p>
          <blockquote class="pregunta-card__question">
            ❓ ${r.pregunta_ple_suggerida}
          </blockquote>
          ${ r.proposta_accio ? `<p class="pregunta-card__proposta">💡 ${truncate(r.proposta_accio, 150)}</p>` : '' }
          <div class="pregunta-card__footer">
            <a href="${r.url_original || '#'}" target="_blank" rel="noopener noreferrer"
               class="pregunta-card__link">Veure document →</a>
            <div style="display:flex;gap:var(--space-2);">
              <button class="action-btn" data-action="copy-pregunta"
                 data-pregunta="${r.pregunta_ple_suggerida.replace(/"/g,'&quot;')}"
                 data-titol="${(r.titol||'').replace(/"/g,'&quot;')}"
                 title="Copiar pregunta al portapapers"
                 aria-label="Copiar pregunta al portapapers">
                📋 Copiar
              </button>
              <button class="action-btn action-btn--view" data-id="${r.id}" data-action="detail"
                 aria-label="Veure detall complet">Detall</button>
            </div>
          </div>
        </article>`;

    }).join('');
  }


  function renderDetailModal(record) {
    const body = document.getElementById('modal-body');
    const title = document.getElementById('modal-title');
    const estatSelect = document.getElementById('modal-estat');
    if (!body || !title) return;

    title.textContent = record.titol || 'Detall del Registre';

    const rows = [
      ['Classificació', classifBadge(record.classificacio)],
      ['Confiança', confiancaBadge(record.nivell_confianca)],
      ['Estat seguiment', estatBadge(record.estat_seguiment)],
      ['Font', record.font || '—'],
      ['Tipus document', record.tipus_document || '—'],
      ['Tema principal', record.tema_principal || '—'],
      ['Data detecció', formatDateTime(record.data_deteccio)],
      ['Venciment legal', record.venciment ? `<strong style="color:var(--color-accent-amber)">${formatDate(record.venciment)}</strong>` : '—'],
      ['Import detectat', record.import_detectat ? `<strong style="color:var(--color-accent-green)">${formatCurrency(record.import_detectat)}</strong>` : '—'],
      ['Revisió manual', record.requereix_revisio_manual ? '<span style="color:var(--color-accent-red)">⚠️ Sí — llegir document original</span>' : '✅ No requerida'],
    ];

    const divider = '<hr class="modal__divider" />';

    const sections = [
      rows.map(([label, value]) => `
        <div class="modal__detail-row">
          <div class="modal__detail-label">${label}</div>
          <div class="modal__detail-value">${value}</div>
        </div>`).join(''),
      divider,
      `<div class="modal__detail-row">
        <div class="modal__detail-label">Resum IA</div>
        <div class="modal__detail-value">${record.resum || '<em style="color:var(--color-text-muted)">Sense resum disponible.</em>'}</div>
      </div>`,
      record.proposta_accio ? `
        <div class="modal__detail-row">
          <div class="modal__detail-label">Proposta acció</div>
          <div class="modal__detail-value">
            <div style="background:rgba(251,191,36,0.08);border-left:3px solid var(--color-accent-amber);border-radius:0 var(--radius-sm) var(--radius-sm) 0;padding:var(--space-3) var(--space-4);">
              💡 ${record.proposta_accio}
            </div>
          </div>
        </div>` : '',
      record.pregunta_ple_suggerida ? `
        <div style="grid-column:1/-1;background:rgba(96,165,250,0.06);border:1px solid rgba(96,165,250,0.2);border-radius:var(--radius-lg);padding:var(--space-4);margin-top:var(--space-2);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-3);">
            <span style="font-size:var(--font-size-xs);font-weight:700;color:var(--color-accent-blue);text-transform:uppercase;letter-spacing:0.06em;">🎤 Pregunta de Ple Suggerida</span>
            <button class="action-btn" data-action="copy-pregunta"
              data-pregunta="${record.pregunta_ple_suggerida.replace(/"/g,'&quot;')}"
              data-titol="${(record.titol||'').replace(/"/g,'&quot;')}"
              style="font-size:var(--font-size-xs);"
              title="Copiar pregunta al portapapers">
              📋 Copiar
            </button>
          </div>
          <blockquote style="font-size:var(--font-size-sm);color:var(--color-text-primary);font-style:italic;line-height:1.6;margin:0;">
            “${record.pregunta_ple_suggerida}”
          </blockquote>
        </div>` : '',
      `<div class="modal__detail-row">
        <div class="modal__detail-label">Notes del Regidor</div>
        <div class="modal__detail-value">
          <textarea id="modal-notes" class="modal__textarea" placeholder="Afegeix apunts, idees o enfocaments polítics..." style="width:100%;min-height:80px;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);color:var(--color-text-primary);padding:var(--space-3);resize:vertical;">${record.observacions || ''}</textarea>
        </div>
      </div>`,
      divider,
      `<div class="modal__detail-row">
        <div class="modal__detail-label">URL Original</div>
        <div class="modal__detail-value" style="display:flex;gap:var(--space-2);align-items:center;flex-wrap:wrap;">
          <a href="${record.url_original || '#'}" target="_blank" rel="noopener noreferrer"
             class="btn" style="background:var(--color-accent-blue);color:#fff;text-decoration:none;font-size:13px;padding:6px 12px;">
            🔗 Obrir Document Original
          </a>
          <a href="https://www.google.com/search?q=${encodeURIComponent((record.titol||'') + ' Platja d\\'Aro')}" target="_blank" rel="noopener noreferrer"
             class="btn btn--secondary" style="text-decoration:none;font-size:13px;padding:6px 12px;" title="Cerca l'assumpte a Google si l'enllaç original és 404">
            🔍 Cerca Fix
          </a>
          <span style="font-size:11px;color:var(--color-text-muted);display:block;margin-top:4px;width:100%;">
            *Si l'enllaç original de la Generalitat dona "404 Not Found", prova la Cerca Fix.
          </span>
        </div>
      </div>`,
      `<div class="modal__detail-row">
        <div class="modal__detail-label">Recordatoris</div>
        <div class="modal__detail-value" style="font-size:var(--font-size-xs);color:var(--color-text-muted);">
          30d: ${formatDate(record.recordatori_30d)} &nbsp;|&nbsp;
          90d: ${formatDate(record.recordatori_90d)} &nbsp;|&nbsp;
          180d: ${formatDate(record.recordatori_180d)}
        </div>
      </div>`,
    ];

    body.innerHTML = sections.join('');
    if (estatSelect) estatSelect.value = record.estat_seguiment || 'pendent';
  }

  /* ── Header date ── */
  function renderTopbarDate() {
    const DAYS_CA = ['Diumenge','Dilluns','Dimarts','Dimecres','Dijous','Divendres','Dissabte'];
    const MONTHS_CA = ['de Gener','de Febrer','de Març','d\'Abril','de Maig','de Juny','de Juliol','d\'Agost','de Setembre','d\'Octubre','de Novembre','de Desembre'];
    const now = new Date();
    const heading = document.getElementById('page-title');
    const lastUpdate = document.getElementById('last-update');
    if (heading) heading.textContent = `${DAYS_CA[now.getDay()]}, ${now.getDate()} ${MONTHS_CA[now.getMonth()]}`;
    if (lastUpdate) lastUpdate.textContent = now.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });
  }

  return {
    renderKPIs, renderLiveTable, renderFullTable, renderUrgencyChart,
    renderCalendar, renderTaskList, renderSeguimentCards, renderRecordatoris,
    renderRevisions, renderImports, renderFonts, renderPreguntes, renderDetailModal, renderTopbarDate,
  };
})();

/* ═══════════════════════════════════════════════════════
   8. MODAL CONTROLLER
   ═══════════════════════════════════════════════════════ */
const ModalController = (() => {
  let _currentRecordId = null;
  let _allRecords = [];

  function _openOverlay(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (overlay) { overlay.classList.add('is-open'); overlay.setAttribute('aria-hidden', 'false'); }
  }
  function _closeOverlay(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (overlay) { overlay.classList.remove('is-open'); overlay.setAttribute('aria-hidden', 'true'); }
  }

  function openDetail(id, records) {
    const record = records.find(r => r.id === id);
    if (!record) return;
    _currentRecordId = id;
    _allRecords = records;
    UIRenderer.renderDetailModal(record);
    _openOverlay('modal-overlay');
  }

  async function saveDetail() {
    const estatSelect = document.getElementById('modal-estat');
    const notesInput = document.getElementById('modal-notes');
    if (!_currentRecordId || !estatSelect) return;
    try {
      const updates = { estat_seguiment: estatSelect.value };
      if (notesInput) {
        updates.observacions = notesInput.value;
      }
      await DataService.updateRecord(_currentRecordId, updates);
      ToastService.show('Guardat correctament.', 'success');
      _closeOverlay('modal-overlay');
      Router.refreshCurrentView();
    } catch (err) {
      ToastService.show(`Error al guardar: ${err.message}`, 'error');
    }
  }

  function openConfig() { _openOverlay('config-modal-overlay'); }
  function closeConfig() { _closeOverlay('config-modal-overlay'); }
  function closeDetail() { _closeOverlay('modal-overlay'); }

  async function testConnection() {
    const url = document.getElementById('config-url')?.value?.trim();
    const key = document.getElementById('config-key')?.value?.trim();
    const status = document.getElementById('config-status');

    if (!url || !key) {
      if (status) { status.textContent = 'Introdueix la URL i la clau.'; status.className = 'config-status config-status--error'; }
      return;
    }
    if (status) { status.textContent = '🔄 Provant connexió...'; status.className = 'config-status config-status--loading'; }
    try {
      const testClient = window.supabase.createClient(url, key);
      const { error } = await testClient.from('monitoratge').select('id').limit(1);
      if (error) throw error;
      if (status) { status.textContent = '✅ Connexió correcta! Taula monitoratge detectada.'; status.className = 'config-status config-status--ok'; }
    } catch (err) {
      if (status) { status.textContent = `❌ Error: ${err.message}`; status.className = 'config-status config-status--error'; }
    }
  }

  function saveConfig() {
    const url = document.getElementById('config-url')?.value?.trim();
    const key = document.getElementById('config-key')?.value?.trim();
    if (!url || !key) { ToastService.show('Introdueix la URL i la clau Supabase.', 'error'); return; }
    localStorage.setItem('mp_supabase_url', url);
    localStorage.setItem('mp_supabase_key', key);
    const ok = SupabaseClient.initialize(url, key);
    if (ok) {
      DataService.invalidateCache();
      closeConfig();
      ToastService.show('Supabase connectat correctament. Carregant dades reals...', 'success');
      Router.refreshCurrentView();
    } else {
      ToastService.show('Error al inicialitzar el client Supabase.', 'error');
    }
  }

  return { openDetail, saveDetail, closeDetail, openConfig, closeConfig, testConnection, saveConfig };
})();

/* ═══════════════════════════════════════════════════════
   9. ROUTER — Gestió de vistes SPA
   ═══════════════════════════════════════════════════════ */
const Router = (() => {
  let _currentView = AppConfig.DEFAULT_VIEW;
  let _currentFilter = 'all';
  let _currentSegFilter = 'all';
  let _currentPage = 0;
  let _currentDateFrom = null;
  let _currentDateTo   = null;
  let _allRecords = [];

  const VIEW_IDS = ['dashboard', 'novetats', 'seguiment', 'compromisos', 'contractacio', 'historic', 'calendari', 'fonts'];


  function navigateTo(viewId) {
    if (!VIEW_IDS.includes(viewId)) return;
    _currentView = viewId;

    // Vistes
    VIEW_IDS.forEach(id => {
      const el = document.getElementById(`view-${id}`);
      if (el) el.classList.toggle('view--active', id === viewId);
    });

    // Nav items
    document.querySelectorAll('.sidebar__item').forEach(btn => {
      const isActive = btn.dataset.view === viewId;
      btn.classList.toggle('sidebar__item--active', isActive);
      btn.setAttribute('aria-current', isActive ? 'page' : 'false');
    });

    _renderCurrentView(_allRecords);
  }

  async function refreshCurrentView(force = false) {
    _allRecords = await DataService.getAllRecords(force);
    UIRenderer.renderTopbarDate();
    _renderCurrentView(_allRecords);
  }

  function _renderCurrentView(records) {
    const sorted = BusinessLogic.sortByUrgency(records);
    const kpis = BusinessLogic.computeKPIs(records);

    switch (_currentView) {
      case 'dashboard':
        UIRenderer.renderKPIs(kpis);
        if (window.DashboardController) window.DashboardController.renderCharts(records, kpis);
        // Alertes ràpides al dash
        UIRenderer.renderTaskList(sorted);
        break;
      case 'novetats':
        UIRenderer.renderFullTable(sorted, _currentFilter, _currentPage, _currentDateFrom, _currentDateTo);
        break;
      case 'seguiment':
        UIRenderer.renderSeguimentCards(sorted, _currentSegFilter);
        break;
      case 'calendari':
        if (window.CalendarController) window.CalendarController.renderCalendar(records);
        break;
      case 'compromisos':
      case 'contractacio':
      case 'historic':
        // Reuse table logic for future implementations
        UIRenderer.renderFullTable(sorted, _currentFilter, 0, null, null);
        break;
      case 'fonts':
        UIRenderer.renderFonts(records);
        break;
    }
  }

  let _currentPregFilter = 'all';

  function setFilter(filter) { _currentFilter = filter; _currentPage = 0; _renderCurrentView(_allRecords); }
  function setSegFilter(filter) { _currentSegFilter = filter; _renderCurrentView(_allRecords); }
  function setPregFilter(filter) { _currentPregFilter = filter; _renderCurrentView(_allRecords); }
  function changePage(delta) { _currentPage = Math.max(0, _currentPage + delta); _renderCurrentView(_allRecords); }
  function setDateRange(from, to) { _currentDateFrom = from || null; _currentDateTo = to || null; _currentPage = 0; _renderCurrentView(_allRecords); }
  function clearDateRange() {
    _currentDateFrom = null; _currentDateTo = null; _currentPage = 0;
    const f = document.getElementById('filter-date-from'); if (f) f.value = '';
    const t = document.getElementById('filter-date-to');   if (t) t.value = '';
    _renderCurrentView(_allRecords);
  }
  function getAllRecords() { return _allRecords; }

  return { navigateTo, refreshCurrentView, setFilter, setSegFilter, setPregFilter, changePage, setDateRange, clearDateRange, getAllRecords };

})();

/* ═══════════════════════════════════════════════════════
   10. HELPERS GLOBALS
   ═══════════════════════════════════════════════════════ */
function _currentViewIs(view) {
  return document.getElementById(`view-${view}`)?.classList.contains('view--active');
}

/* ═══════════════════════════════════════════════════════
   11. EVENT LISTENERS — Capa de connexió UI ↔ Lògica
   ═══════════════════════════════════════════════════════ */
function bindEvents() {
  // Navigation
  document.querySelectorAll('.sidebar__item[data-view]').forEach(btn => {
    btn.addEventListener('click', () => Router.navigateTo(btn.dataset.view));
  });

  // Action buttons (detail) — delegació d'events per a la taula dinàmica
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="detail"]');
    if (btn) {
      const id = btn.dataset.id;
      ModalController.openDetail(id, Router.getAllRecords());
    }
  });
  // Keyboard support for cards
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('[data-action="detail"]');
      if (card) { e.preventDefault(); ModalController.openDetail(card.dataset.id, Router.getAllRecords()); }
    }
  });

  // Modal detail
  document.getElementById('modal-close')?.addEventListener('click', () => ModalController.closeDetail());
  document.getElementById('modal-cancel')?.addEventListener('click', () => ModalController.closeDetail());
  document.getElementById('modal-save')?.addEventListener('click', () => ModalController.saveDetail());
  document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') ModalController.closeDetail();
  });

  // Config modal
  document.getElementById('btn-config')?.addEventListener('click', () => ModalController.openConfig());
  document.getElementById('config-modal-close')?.addEventListener('click', () => ModalController.closeConfig());
  document.getElementById('config-modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'config-modal-overlay') ModalController.closeConfig();
  });
  document.getElementById('config-test-btn')?.addEventListener('click', () => ModalController.testConnection());
  document.getElementById('config-save-btn')?.addEventListener('click', () => ModalController.saveConfig());

  // Pre-fill config modal with saved values
  const savedUrl = localStorage.getItem('mp_supabase_url');
  const savedKey = localStorage.getItem('mp_supabase_key');
  if (savedUrl) document.getElementById('config-url')?.setAttribute('value', savedUrl);
  if (savedKey) document.getElementById('config-key')?.setAttribute('value', savedKey);

  // Refresh button
  document.getElementById('btn-refresh')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-refresh');
    btn?.classList.add('spinning');
    await Router.refreshCurrentView(true);
    btn?.classList.remove('spinning');
    ToastService.show('Dades actualitzades.', 'success');
  });

  // Novetats filters
  ['all', 'URGENT', 'IMPORTANT', 'INFORMATIU'].forEach(filter => {
    const id = { all: 'filter-all', URGENT: 'filter-urgent', IMPORTANT: 'filter-important', INFORMATIU: 'filter-informatiu' }[filter];
    document.getElementById(id)?.addEventListener('click', function () {
      document.querySelectorAll('[id^="filter-"]').forEach(b => b.classList.remove('filter-btn--active'));
      this.classList.add('filter-btn--active');
      Router.setFilter(filter);
    });
  });

  // Seguiment filters
  ['all', 'pendent', 'en curs', 'tancat'].forEach(filter => {
    const id = { all: 'seg-filter-all', pendent: 'seg-filter-pendent', 'en curs': 'seg-filter-encurs', tancat: 'seg-filter-tancat' }[filter];
    document.getElementById(id)?.addEventListener('click', function () {
      document.querySelectorAll('[id^="seg-filter-"]').forEach(b => b.classList.remove('filter-btn--active'));
      this.classList.add('filter-btn--active');
      Router.setSegFilter(filter);
    });
  });

  // Preguntes de Ple filters
  ['all', 'pendent', 'presentada', 'tancada'].forEach(filter => {
    const id = { all: 'preg-filter-all', pendent: 'preg-filter-pendent', presentada: 'preg-filter-presentada', tancada: 'preg-filter-tancada' }[filter];
    document.getElementById(id)?.addEventListener('click', function () {
      document.querySelectorAll('[id^="preg-filter-"]').forEach(b => b.classList.remove('filter-btn--active'));
      this.classList.add('filter-btn--active');
      Router.setPregFilter(filter);
    });
  });

  // Keyboard shortcut Ctrl/Cmd+K → focus search
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('search-input')?.focus();
    }
    // Esc → close modals
    if (e.key === 'Escape') {
      ModalController.closeDetail();
      ModalController.closeConfig();
    }
  });

  // Search — global filter across active view
  document.getElementById('search-input')?.addEventListener('input', function () {
    const query = this.value.toLowerCase().trim();
    // Novetats table rows
    if (_currentViewIs('novetats')) {
      document.querySelectorAll('#full-table-body tr').forEach(row => {
        row.style.display = query === '' || row.textContent.toLowerCase().includes(query) ? '' : 'none';
      });
    }
    // Seguiment cards
    if (_currentViewIs('seguiment')) {
      document.querySelectorAll('#seguiment-cards .seguiment-card').forEach(card => {
        card.style.display = query === '' || card.textContent.toLowerCase().includes(query) ? '' : 'none';
      });
    }
    // Preguntes cards
    if (_currentViewIs('preguntes')) {
      document.querySelectorAll('.preguntes-grid .pregunta-card').forEach(card => {
        card.style.display = query === '' || card.textContent.toLowerCase().includes(query) ? '' : 'none';
      });
    }
  });

  // Date range filter — Novetats view
  function _applyDateRange() {
    const from = document.getElementById('filter-date-from')?.value;
    const to   = document.getElementById('filter-date-to')?.value;
    Router.setDateRange(from, to);
  }
  document.getElementById('filter-date-from')?.addEventListener('change', _applyDateRange);
  document.getElementById('filter-date-to')?.addEventListener('change', _applyDateRange);
  document.getElementById('filter-date-clear')?.addEventListener('click', () => Router.clearDateRange());

  // Pagination — event delegation on the footer container
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-page-delta]');
    if (!btn || btn.disabled) return;
    const delta = parseInt(btn.dataset.pageDelta, 10);
    if (!isNaN(delta)) Router.changePage(delta);
  });
}


/* ═══════════════════════════════════════════════════════
   13. NOU REGISTRE CONTROLLER — Formulari de creació manual
   ═══════════════════════════════════════════════════════ */
const NouRegistreController = (() => {

  function _openOverlay() {
    const o = document.getElementById('nou-modal-overlay');
    if (o) { o.classList.add('is-open'); o.setAttribute('aria-hidden', 'false'); }
    _resetForm();
  }
  function _closeOverlay() {
    const o = document.getElementById('nou-modal-overlay');
    if (o) { o.classList.remove('is-open'); o.setAttribute('aria-hidden', 'true'); }
  }

  function _resetForm() {
    ['nou-url','nou-titol','nou-resum','nou-proposta','nou-pregunta','nou-observacions','nou-import','nou-venciment'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const rev = document.getElementById('nou-revisio-manual');
    if (rev) rev.checked = false;
    const cls = document.getElementById('nou-classificacio');
    if (cls) cls.value = 'IMPORTANT';
  }

  function _getFormValues() {
    return {
      url_original:            document.getElementById('nou-url')?.value.trim() || '',
      titol:                   document.getElementById('nou-titol')?.value.trim() || '',
      font:                    document.getElementById('nou-font')?.value || 'Acords JGL',
      classificacio:           document.getElementById('nou-classificacio')?.value || 'IMPORTANT',
      tema_principal:          document.getElementById('nou-tema')?.value || 'altres',
      tipus_document:          document.getElementById('nou-tipus-doc')?.value || 'altres',
      import_detectat:         parseFloat(document.getElementById('nou-import')?.value || '0') || null,
      venciment:               document.getElementById('nou-venciment')?.value || null,
      resum:                   document.getElementById('nou-resum')?.value.trim() || '',
      proposta_accio:          document.getElementById('nou-proposta')?.value.trim() || null,
      pregunta_ple_suggerida:  document.getElementById('nou-pregunta')?.value.trim() || null,
      observacions:            document.getElementById('nou-observacions')?.value.trim() || null,
      requereix_revisio_manual: document.getElementById('nou-revisio-manual')?.checked || false,
      nivell_confianca:        'MITJA',
      tipus:                   'document oficial',
      estat_seguiment:         'pendent',
      estat:                   'nou',
      data_deteccio:           new Date().toISOString(),
    };
  }

  function _validate(values) {
    if (!values.url_original) return 'La URL original és obligatòria.';
    if (!values.titol)         return 'El títol del document és obligatori.';
    if (!values.resum)         return 'El resum és obligatori.';
    try { new URL(values.url_original); } catch { return 'La URL no té un format vàlid.'; }
    return null;
  }

  async function _save() {
    const values = _getFormValues();
    const error = _validate(values);
    if (error) { ToastService.show(error, 'error'); return; }

    const saveBtn = document.getElementById('nou-modal-save');
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Guardant...'; }

    try {
      if (SupabaseClient.isConnected()) {
        const client = SupabaseClient.getClient();
        const { error: dbError } = await client.from('monitoratge').insert([values]);
        if (dbError) throw new Error(dbError.message);
      } else {
        // Afegit al mock local per a demostració
        const records = MockData.getAll();
        records.unshift({ ...values, id: `manual-${Date.now()}` });
      }

      DataService.invalidateCache();
      _closeOverlay();
      ToastService.show(`✅ Registre "${values.titol.slice(0,40)}…" creat correctament.`, 'success');
      await Router.refreshCurrentView(true);
    } catch (err) {
      ToastService.show(`Error en guardar: ${err.message}`, 'error');
    } finally {
      if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = '💾 Guardar registre'; }
    }
  }

  function bindEvents() {
    document.getElementById('btn-new-entry')?.addEventListener('click', () => _openOverlay());
    document.getElementById('nou-modal-close')?.addEventListener('click', () => _closeOverlay());
    document.getElementById('nou-modal-cancel')?.addEventListener('click', () => _closeOverlay());
    document.getElementById('nou-modal-save')?.addEventListener('click', () => _save());
    document.getElementById('nou-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'nou-modal-overlay') _closeOverlay();
    });
  }

  return { bindEvents };
})();

/* ═══════════════════════════════════════════════════════
   14. EXPORT SERVICE — Descàrrega CSV
   ═══════════════════════════════════════════════════════ */
const ExportService = (() => {

  const HEADERS = [
    'id','url_original','font','tipus','tipus_document','titol','resum',
    'classificacio','nivell_confianca','data_deteccio','venciment',
    'import_detectat','tema_principal','proposta_accio','pregunta_ple_suggerida',
    'requereix_revisio_manual','estat_seguiment','recordatori_30d',
    'recordatori_90d','recordatori_180d','observacions','estat',
  ];

  function _escapeCsv(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  async function downloadCsv() {
    try {
      const records = await DataService.getAllRecords();
      if (records.length === 0) { ToastService.show('No hi ha registres per exportar.', 'info'); return; }

      const rows = [
        HEADERS.join(','),
        ...records.map(r => HEADERS.map(h => _escapeCsv(r[h])).join(','))
      ];

      const csvContent = '\uFEFF' + rows.join('\r\n'); // BOM per a Excel
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);

      const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,'');
      const link = document.createElement('a');
      link.href = url;
      link.download = `monitor_politic_${dateStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      ToastService.show(`✅ CSV exportat: ${records.length} registres.`, 'success');
    } catch (err) {
      ToastService.show(`Error en exportar: ${err.message}`, 'error');
    }
  }

  function bindEvents() {
    document.getElementById('btn-export-csv')?.addEventListener('click', () => downloadCsv());
    document.getElementById('user-menu-export')?.addEventListener('click', () => {
      UserMenuController.close();
      downloadCsv();
    });
  }

  return { bindEvents, downloadCsv };
})();

/* ═══════════════════════════════════════════════════════
   15. SIDEBAR CONTROLLER — Toggle mòbil
   ═══════════════════════════════════════════════════════ */
const SidebarController = (() => {

  let _overlay = null;

  function _createOverlay() {
    _overlay = document.createElement('div');
    _overlay.className = 'sidebar-overlay';
    _overlay.id = 'sidebar-overlay';
    _overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(_overlay);
    _overlay.addEventListener('click', close);
  }

  function open() {
    const sidebar = document.getElementById('sidebar');
    const btn = document.getElementById('btn-sidebar-toggle');
    if (!sidebar) return;
    sidebar.classList.add('is-open');
    if (_overlay) { _overlay.classList.add('is-visible'); _overlay.setAttribute('aria-hidden', 'false'); }
    if (btn) btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    const sidebar = document.getElementById('sidebar');
    const btn = document.getElementById('btn-sidebar-toggle');
    if (!sidebar) return;
    sidebar.classList.remove('is-open');
    if (_overlay) { _overlay.classList.remove('is-visible'); _overlay.setAttribute('aria-hidden', 'true'); }
    if (btn) btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggle() {
    const sidebar = document.getElementById('sidebar');
    sidebar?.classList.contains('is-open') ? close() : open();
  }

  function bindEvents() {
    _createOverlay();
    document.getElementById('btn-sidebar-toggle')?.addEventListener('click', toggle);
    // Tancar sidebar en navegar (mòbil)
    document.querySelectorAll('.sidebar__item[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.innerWidth <= 900) close();
      });
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) close();
    });
  }

  return { open, close, toggle, bindEvents };
})();

/* ═══════════════════════════════════════════════════════
   16. USER MENU CONTROLLER — Avatar dropdown + auth
   ═══════════════════════════════════════════════════════ */
const UserMenuController = (() => {

  let _isOpen = false;

  function open() {
    const menu = document.getElementById('user-menu');
    if (!menu) return;
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    _isOpen = true;
  }

  function close() {
    const menu = document.getElementById('user-menu');
    if (!menu) return;
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    _isOpen = false;
  }

  function toggle() { _isOpen ? close() : open(); }

  async function _logout() {
    close();
    if (SupabaseClient.isConnected()) {
      try {
        const client = SupabaseClient.getClient();
        await client.auth.signOut();
      } catch (_) { /* best effort */ }
    }
    sessionStorage.removeItem('mp_demo_mode');
    ToastService.show('Sessió tancada. Redirigint...', 'info');
    setTimeout(() => { window.location.href = 'login.html'; }, 1200);
  }

  function _updateUserInfo() {
    const emailEl = document.getElementById('user-menu-email');
    if (!emailEl) return;
    if (SupabaseClient.isConnected()) {
      SupabaseClient.getClient().auth.getUser().then(({ data }) => {
        if (data?.user?.email) emailEl.textContent = data.user.email;
      }).catch(() => {});
    } else {
      emailEl.textContent = 'Mode demostració';
    }
  }

  function bindEvents() {
    const avatar = document.getElementById('topbar-avatar');
    avatar?.addEventListener('click', toggle);
    avatar?.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });

    document.getElementById('user-menu-config')?.addEventListener('click', () => {
      close();
      ModalController.openConfig();
    });
    document.getElementById('user-menu-logout')?.addEventListener('click', () => _logout());

    // Tancar en fer clic fora
    document.addEventListener('click', (e) => {
      if (_isOpen && !e.target.closest('#user-menu') && !e.target.closest('#topbar-avatar')) {
        close();
      }
    });

    // Esc tanca menú
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && _isOpen) close();
    });

    _updateUserInfo();
  }

  return { open, close, toggle, bindEvents };
})();

/* ═══════════════════════════════════════════════════════
   16. HELP CONTROLLER — Modal d'ajuda
   ═══════════════════════════════════════════════════════ */
const HelpController = (() => {
  function open() {
    const overlay = document.getElementById('help-modal-overlay');
    if (overlay) { overlay.classList.add('is-open'); overlay.setAttribute('aria-hidden', 'false'); }
  }
  function close() {
    const overlay = document.getElementById('help-modal-overlay');
    if (overlay) { overlay.classList.remove('is-open'); overlay.setAttribute('aria-hidden', 'true'); }
  }
  function bindEvents() {
    document.getElementById('btn-help')?.addEventListener('click', open);
    document.getElementById('help-modal-close')?.addEventListener('click', close);
    document.getElementById('help-modal-close-btn')?.addEventListener('click', close);
    document.getElementById('help-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'help-modal-overlay') close();
    });
  }
  return { open, close, bindEvents };
})();

/* ═══════════════════════════════════════════════════════
   17. CLIPBOARD SERVICE — Còpia de preguntes al portapapers
   ═══════════════════════════════════════════════════════ */
const ClipboardService = (() => {
  async function copyText(text, label = 'Text') {
    try {
      await navigator.clipboard.writeText(text);
      ToastService.show(`📋 ${label} copiat al portapapers.`, 'success', 2500);
    } catch {
      // Fallback per entorns sense Clipboard API (file://)
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      ToastService.show(`📋 ${label} copiat al portapapers.`, 'success', 2500);
    }
  }

  function bindEvents() {
    // Delegació d'events per als botons de còpia generats dinàmicament
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="copy-pregunta"]');
      if (!btn) return;
      const pregunta = btn.dataset.pregunta;
      const titol    = btn.dataset.titol || 'document';
      if (pregunta) copyText(pregunta, `Pregunta per a "${titol.slice(0, 40)}"`);
    });
  }

  return { copyText, bindEvents };
})();

/* ═══════════════════════════════════════════════════════
   11.5. THEME CONTROLLER — Gestió Dia/Nit
   ═══════════════════════════════════════════════════════ */
const ThemeController = (() => {
  const THEME_KEY = 'mp_theme_preference';
  let isLight = false;

  function init() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light') {
      isLight = true;
      document.documentElement.setAttribute('data-theme', 'light');
    }
    updateIcon();
  }

  function toggle() {
    isLight = !isLight;
    if (isLight) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem(THEME_KEY, 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem(THEME_KEY, 'dark');
    }
    updateIcon();
  }

  function updateIcon() {
    const iconArea = document.getElementById('icon-theme');
    if (!iconArea) return;
    if (isLight) {
      iconArea.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
    } else {
      iconArea.innerHTML = `<circle cx="12" cy="12" r="5" fill="none"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="4.22" x2="19.78" y2="5.64"/>`;
    }
  }

  function bindEvents() {
    const btn = document.getElementById('btn-theme-toggle');
    if (btn) btn.addEventListener('click', toggle);
  }

  return { init, toggle, bindEvents };
})();

/* ═══════════════════════════════════════════════════════
   11.6. DASHBOARD CONTROLLER — Gràfics i Alertes
   ═══════════════════════════════════════════════════════ */
const DashboardController = (() => {
  let themeChart = null;
  let urgencyChart = null;

  function renderCharts(records, kpis) {
    if (!window.Chart) return;

    if (themeChart) themeChart.destroy();
    if (urgencyChart) urgencyChart.destroy();

    const themes = {};
    records.forEach(r => {
      const t = r.tema_principal || 'Altres';
      themes[t] = (themes[t] || 0) + 1;
    });

    const themeCtx = document.getElementById('theme-chart')?.getContext('2d');
    if (themeCtx) {
      themeChart = new Chart(themeCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(themes),
          datasets: [{
            data: Object.values(themes),
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          color: getComputedStyle(document.body).getPropertyValue('--color-text-primary'),
          plugins: { legend: { position: 'right', labels: { color: getComputedStyle(document.body).getPropertyValue('--color-text-primary') } } }
        }
      });
    }

    const urgencyCtx = document.getElementById('urgency-chart')?.getContext('2d');
    if (urgencyCtx) {
      urgencyChart = new Chart(urgencyCtx, {
        type: 'bar',
        data: {
          labels: ['Urgents', 'Importants', 'Informatius'],
          datasets: [{
            label: 'Quantitat',
            data: [kpis.urgent || 0, records.filter(r => r.classificacio === 'IMPORTANT').length, records.filter(r => r.classificacio === 'INFORMATIU').length],
            backgroundColor: ['#ef4444', '#f59e0b', '#10b981']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          color: getComputedStyle(document.body).getPropertyValue('--color-text-primary'),
          plugins: { legend: { display: false } },
          scales: { 
            y: { beginAtZero: true, ticks: { color: getComputedStyle(document.body).getPropertyValue('--color-text-secondary') } },
            x: { ticks: { color: getComputedStyle(document.body).getPropertyValue('--color-text-secondary') } }
          }
        }
      });
    }

    const alertsList = document.getElementById('dashboard-alerts-list');
    if (alertsList) {
      const latestUrgents = records.filter(r => r.classificacio === 'URGENT' && r.estat_seguiment !== 'tancat').slice(0, 5);
      if (latestUrgents.length === 0) {
        alertsList.innerHTML = '<li style="padding:var(--space-3);color:var(--color-text-muted);">✅ Cap alerta pendent.</li>';
      } else {
        alertsList.innerHTML = latestUrgents.map(r => `
          <li class="task-list__item" onclick="ModalController.openDetail('${r.id}', Router.getAllRecords())" style="cursor:pointer;border-bottom:1px solid var(--color-border);padding:var(--space-2) 0;">
            <span style="color:var(--color-accent-red);margin-right:8px;">🚨</span>
            <span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.titol}</span>
          </li>
        `).join('');
      }
    }
  }
  return { renderCharts };
})();

/* ═══════════════════════════════════════════════════════
   11.7. CALENDAR CONTROLLER — Gestió d'Esdeveniments
   ═══════════════════════════════════════════════════════ */
const CalendarController = (() => {
  let calendar = null;

  function renderCalendar(records) {
    const el = document.getElementById('fullcalendar-container');
    if (!el || !window.FullCalendar) return;

    if (calendar) {
      calendar.destroy();
    }

    const events = [];
    
    records.forEach(r => {
      if (r.venciment && r.estat_seguiment !== 'tancat') {
        events.push({
          title: '🚨 Vencim.: ' + (r.titol || '').substring(0, 30),
          start: r.venciment,
          allDay: true,
          color: '#ef4444',
          extendedProps: { recordId: r.id }
        });
      }
      if (r.recordatori_30d) events.push({ title: '📅 Rev 30d: ' + (r.titol||'').substring(0,25), start: r.recordatori_30d, allDay: true, color: '#f59e0b', extendedProps: { recordId: r.id } });
      if (r.recordatori_90d) events.push({ title: '📅 Rev 90d: ' + (r.titol||'').substring(0,25), start: r.recordatori_90d, allDay: true, color: '#3b82f6', extendedProps: { recordId: r.id } });
    });

    calendar = new FullCalendar.Calendar(el, {
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,listYear'
      },
      locale: 'ca',
      firstDay: 1,
      height: 'auto',
      events: events,
      eventClick: function(info) {
        if (info.event.extendedProps.recordId) {
          ModalController.openDetail(info.event.extendedProps.recordId, Router.getAllRecords());
        }
      }
    });

    calendar.render();
  }
  return { renderCalendar };
})();

/* ═══════════════════════════════════════════════════════
   12. BOOTSTRAP — Punt d'entrada (actualitzat)
   ═══════════════════════════════════════════════════════ */
async function bootstrap() {
  ThemeController.init();
  // Comprovar si l'usuari ve de login.html o mode demo
  const isDemoMode = sessionStorage.getItem('mp_demo_mode') === '1';

  // Intentar connectar a Supabase
  const connected = SupabaseClient.autoInit();

  if (connected) {
    console.info('[Monitor Polític] Supabase connectat.');
    try {
      const client = SupabaseClient.getClient();
      const { data: { session } } = await client.auth.getSession();
      if (!session && !isDemoMode) {
        console.warn('[Monitor Polític] Sense sessió activa. Continuant sense autenticació.');
      }
    } catch (_) { /* continuar igualment */ }
  } else {
    console.info('[Monitor Polític] Mode demostració actiu. Configura Supabase per dades reals.');
    // Mostrar badge DEMO al topbar
    const demoBadge = document.getElementById('demo-mode-badge');
    if (demoBadge) demoBadge.classList.add('is-visible');
  }

  // Inicialitzar interfície
  UIRenderer.renderTopbarDate();

  // Vincular tots els events (ordre important)
  bindEvents();
  NouRegistreController.bindEvents();
  ExportService.bindEvents();
  SidebarController.bindEvents();
  UserMenuController.bindEvents();
  HelpController.bindEvents();
  ClipboardService.bindEvents();
  ThemeController.bindEvents();

  // Tancar modal d'ajuda amb Esc (complementa l'Esc global)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') HelpController.close();
  });

  // Carregar dades inicials
  await Router.refreshCurrentView();

  // Toast de benvinguda si mode demo
  if (!connected && !isDemoMode) {
    setTimeout(() => {
      ToastService.show(
        '🎭 Mode demostració actiu. Fes clic a ❓ Ajuda per a la guia ràpida, o a l\'avatar R per connectar Supabase.',
        'info',
        8000
      );
    }, 800);
  }
}

// Esperar que el DOM estigui llest
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

