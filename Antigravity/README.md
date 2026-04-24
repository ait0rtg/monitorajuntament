# 🏛 Monitor Polític Municipal
### Sistema de Monitorització Política Automatitzada
**Castell-Platja d'Aro · v2.1 · Abril 2026**

> Sistema dissenyat per al Regidor de l'Oposició. Detecta, analitza i resumeix automàticament totes les novetats publicades a les fonts oficials del municipi.

---

## Estructura del projecte

```
Antigravity/
├── index.html              ← Dashboard web (punt d'entrada)
├── login.html              ← Pàgina d'accés (Supabase Auth o mode demo)
├── index.css               ← Sistema de disseny (32 seccions CSS)
├── app.js                  ← Lògica SPA (16 mòduls, SoC estricta)
├── n8n_workflow.json       ← Workflow d'automatització complet (importar a n8n)
├── supabase_migration.sql  ← SQL de creació de taula + índexs + RLS
├── demo_data.sql           ← 12 registres de demostració per a Supabase
└── .agents/
    └── DER.md              ← Document d'Especificació de Requisits v2.1
```

---

## Arquitectura del sistema

```
┌─────────────────────────────────────────────────────────────┐
│                      WORKFLOW n8n (8h + 20h)                │
│                                                             │
│  Acords JGL ──┐                                             │
│  E-tauler ────┼─── Merge ─── Extreu URLs ─── Filtra nous   │
│  Perfil Cont. ┘                    │                        │
│                                    ↓                        │
│                         Supabase (URLs existents)           │
│                                    │                        │
│                         Per cada URL nova:                  │
│                           1. Fetch contingut                │
│                           2. OpenAI GPT-4o-mini             │
│                           3. Regles fixes urgència          │
│                           4. Guarda Supabase + Sheets       │
│                                    │                        │
│                         Construeix missatge agrupat         │
│                           → Telegram (resum + alertes)      │
│                           → Email (HTML formatat)           │
└─────────────────────────────────────────────────────────────┘
                                     │
                                     ↓
                    ┌────────────────────────────────┐
                    │      DASHBOARD WEB             │
                    │  login.html → index.html       │
                    │                                │
                    │  • 7 vistes de dades           │
                    │  • Filtre per urgència         │
                    │  • Cerca de text (Ctrl+K)      │
                    │  • Exportació CSV              │
                    │  • Registre manual             │
                    │  • Gestió d'estat              │
                    └────────────────────────────────┘
```

---

## Instal·lació pas a pas

### Prerequisits

| Servei | Per a | Notes |
|---|---|---|
| [Supabase](https://supabase.com) | Base de dades + Auth | Pla gratuït suficient |
| [n8n](https://n8n.io) | Automatització | Self-hosted (VPS/EasyPanel) o n8n Cloud |
| [OpenAI](https://platform.openai.com) | IA d'anàlisi | GPT-4o-mini (~2-4€/mes) |
| Telegram Bot | Alertes mòbil | BotFather gratuït |
| Gmail/SMTP | Alertes email | Gmail amb OAuth o Resend |
| Google Sheets | Vista llegible | Compte Google gratuït |

---

### FASE 1 — Configurar Supabase

**1.1 Crear la taula**
1. Ves a [supabase.com](https://supabase.com) → El teu projecte → SQL Editor
2. Copia i executa el contingut de **`supabase_migration.sql`**
3. ✅ Verifica que la taula `monitoratge` s'ha creat

**1.2 (Opcional) Inserir dades de demostració**
```sql
-- Executa demo_data.sql des del SQL Editor
-- Veuràs 12 registres realistes al dashboard
```

**1.3 Crear usuari d'accés**
1. Supabase Dashboard → Authentication → Users → Add User
2. Crea l'usuari amb el teu email i una contrasenya segura

**1.4 Copiar les credencials**
- **Project URL**: Settings → API → Project URL
  - Format: `https://xxxxxxxxxxxx.supabase.co`
- **Anon Key**: Settings → API → anon public
  - Per al dashboard web
- **Service Role Key**: Settings → API → service_role
  - ⚠️ Confidencial — Per al workflow n8n (escriptura sense RLS)

---

### FASE 2 — Configurar el Dashboard Web

**2.1 Obrir el login**
1. Obre `login.html` al navegador (doble clic)
2. Introdueix la **Supabase Project URL** i la **Anon Key**
3. Introdueix les teves credencials (email + contrasenya del pas 1.3)
4. Fes clic a **"Accedir al dashboard"**

**Mode demostració** (sense Supabase): Fes clic a *"Continuar en mode demostració"*

> ⚠️ **Nota sobre RLS**: El pla de seguretat actual requereix autenticació. Si prefereixes accés públic sense login, descomenta la política `"Lectura publica"` a `supabase_migration.sql` i torna a executar-la.

---

### FASE 3 — Configurar el Workflow n8n

**3.1 Importar el workflow**
1. n8n Dashboard → Workflows → Import from File
2. Selecciona **`n8n_workflow.json`**
3. El workflow s'importarà amb tots els nodes i connexions

**3.2 Configurar Variables d'Entorn a n8n**

Ves a n8n → Settings → Environment Variables i afegeix:

| Variable | Valor | Descripció |
|---|---|---|
| `SUPABASE_URL` | `https://xxx.supabase.co` | URL del projecte Supabase |
| `SUPABASE_SERVICE_KEY` | `eyJhbGc...` | Service Role Key (no anon!) |
| `TELEGRAM_CHAT_ID` | `-100xxxxxxxxx` | ID del teu canal/xat Telegram |
| `EMAIL_REGIDOR` | `regidor@exemple.cat` | Email de destí |
| `EMAIL_FROM` | `monitor@exemple.cat` | Email remitent |
| `GOOGLE_SHEET_ID` | `1BxiM...` | ID del full de càlcul Google Sheets |
| `GOOGLE_ACCESS_TOKEN` | (via OAuth) | Token d'accés a Google Sheets |

**3.3 Configurar Credencials a n8n**

Ves a n8n → Credentials i crea:

| Credencial | Tipus | Camps |
|---|---|---|
| `OpenAI API` | OpenAI | API Key de platform.openai.com |
| `Telegram Bot` | Telegram | Bot Token de @BotFather |
| `SMTP / Gmail` | SMTP | Host, Port, User, Password |

**3.4 Configurar el Bot de Telegram**
```
1. Obre Telegram → busca @BotFather
2. Envia: /newbot → Segueix les instruccions
3. Copia el Token al camp de credencials n8n
4. Per obtenir el Chat ID: envia un missatge al bot i accedeix a:
   https://api.telegram.org/bot[TOKEN]/getUpdates
   (cerca "chat":{"id": -100xxxxxxx})
```

**3.5 Configurar Google Sheets**
```
1. Crea un nou full de càlcul a Google Sheets
2. Afegeix la capçalera a A1:
   Data | Títol | Font | Classificació | Resum | Tema | Confiança | Import | Venciment | Proposta | Pregunta | URL
3. Copia l'ID del full (de la URL: /spreadsheets/d/[ID]/edit)
4. Per al token d'accés, usa OAuth 2.0 via n8n (Credentials → Google Sheets OAuth2)
   O usa una Service Account de Google Cloud Console
```

**3.6 Activar el workflow**
1. Al workflow importat, fes clic a **"Activate"** (toggle superior dret)
2. El sistema s'executarà automàticament a les **8:00** i **20:00** (Europe/Madrid)
3. Per provar manualment: fes clic a **"Test workflow"**

---

### FASE 4 — Verificació del sistema

**Provar que tot funciona:**

```
1. Executar el workflow manualment (Test workflow)
2. Verificar a Supabase → Table Editor → monitoratge que hi ha registres nous
3. Comprovar que has rebut el missatge a Telegram
4. Comprovar que has rebut l'email
5. Obrir el dashboard → verificar que les novetats apareixen
```

**Indicadors de salut:**
- ✅ n8n: execució sense errors (History verd)
- ✅ Supabase: registres nous a la taula
- ✅ Telegram: missatge rebut
- ✅ Email: missatge rebut
- ✅ Dashboard: dades visibles

---

## Fonts monitoritzades (Fase 1)

| Font | URL | Contingut |
|---|---|---|
| **Acords JGL** | [Junta de Govern](https://ciutada.platjadaro.com/ajuntament/organitzacio-municipal/junta-de-govern/acords-de-junta-de-govern/) | PDFs setmanals amb acords, imports, terminis |
| **E-tauler** | [Tauler Oficial](https://tauler.seu-e.cat/inici?idEns=1704860009) | Edictes, anuncis, procediments normatius |
| **Perfil Contractant** | [Contractació Pública](https://contractaciopublica.cat/ca/perfils-contractant/detall/3156875?categoria=0) | Licitacions, adjudicacions, modificacions |

---

## Sistema de classificació d'urgència

El sistema usa un **model híbrid** (regles fixes + IA). Les regles fixes tenen **prioritat màxima**:

| 🔴 URGENT | S'activa si... |
|---|---|
| Venciment legal | < 15 dies per a l'acció |
| Primícia política | Decisió de transcendència immediata |
| Assumpte sensible | Requereix reacció en < 24h |

| 🟡 IMPORTANT | S'activa si... |
|---|---|
| Import > 50.000€ | (regla fixa automàtica) |
| Contractació pública | (qualsevol import, regla automàtica) |
| PDF Junta de Govern | (regla automàtica) |
| Impacte sobre ciutadania | (IA) |

| 🟢 INFORMATIU | Per defecte si no compleix les anteriors |

---

## Cost estimat d'operació

| Servei | Cost estimat |
|---|---|
| Supabase (Free Tier) | 0 €/mes |
| n8n Cloud (Starter) | 20 €/mes |
| n8n Self-hosted (VPS) | 5-10 €/mes |
| OpenAI GPT-4o-mini | 2-4 €/mes (~60 execucions × 10 docs × 600 tokens) |
| **Total estimat** | **7-14 €/mes** |

---

## Seguretat

- **Service Role Key**: Usar ÚNICAMENT al workflow n8n. MAI guardar al codi frontend.
- **Anon Key**: Segura per al dashboard (el RLS limita l'accés a usuaris autenticats).
- **RLS actiu**: Taula protegida contra accés no autoritzat.
- **n8n**: Configurar en HTTPS, no exposar al públic sense autenticació.

---

## Preguntes freqüents

**"El workflow no troba novetats"**
→ Verifica que les 3 fonts estan accessibles (HTTP 200). Algunes fonts poden estar en manteniment.

**"El resum de la IA no és prou bo"**
→ Edita el node `OpenAI - Analitza Contingut` i modifica el prompt al node `Code - Prepara Prompt IA`. L'usuari té control total sobre els prompts.

**"El PDF és escanejat i no es pot llegir"**
→ El registre es marca amb `requereix_revisio_manual = true` i `nivell_confianca = BAIXA`. Al dashboard apareixerà a la secció "Revisió Manual".

**"Vull afegir una nova font"**
→ Duplica un dels nodes "HTTP - [Font]" i afegix-lo al node "Merge Fonts" (canviant el número de fonts a 4). Afegeix la nova font a l'array `FONTS` al node "Code - Extreu Links i PDFs".

**"Mida dels missatges Telegram massa gran"**
→ Edita el node `Code - Construeix Missatge`. La variable `slice(0, 10)` controla el màxim d'ítems al missatge de Telegram.

---

## Contacte i suport

Sistema dissenyat per al Regidor de l'Oposició de Castell-Platja d'Aro.
Document de requisits: `DER.md` (v2.1, Abril 2026).

---

*Monitor Polític Municipal · v2.1 · Castell-Platja d'Aro · 2026*
