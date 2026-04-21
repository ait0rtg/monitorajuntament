# Document d'Especificació de Requisits
## Sistema de Monitorització Política Municipal Automatitzada
### Castell d'Aro, Platja d'Aro i S'Agaró

| Camp | Valor |
|---|---|
| **Versió** | 2.1 — Abril 2026 |
| **Estat** | Especificació final per a implementació |
| **Promotor** | Regidor de l'Oposició — Ajuntament de Castell-Platja d'Aro |
| **Plataforma** | n8n + Supabase + OpenAI + Google Sheets + Telegram + Email |
| **Tipologia** | Especificació funcional i tècnica tancada per a construcció |
| **Classificació** | Ús intern / desenvolupament — No distribuir |

---

## 1. Objecte i objectiu del document

Aquest document defineix de forma tancada els requisits funcionals, tècnics i operatius del Sistema de Monitorització Política Municipal Automatitzada per al municipi de Castell d'Aro, Platja d'Aro i S'Agaró.

L'objectiu és detectar, ordenar, resumir i fer seguiment de novetats municipals rellevants, especialment procedents de fonts oficials, per facilitar la tasca de fiscalització, seguiment institucional i memòria política del regidor de l'oposició.

El proveïdor disposa de llibertat tècnica raonable per simplificar o millorar la implementació sempre que: es mantingui l'objectiu funcional, no es redueixi la fiabilitat, no es perdi la capacitat d'ampliació i no es comprometi el resultat mínim exigit.

### 1.1 Objectiu principal

El sistema ha de permetre que l'usuari:

- S'assabenti de tot allò rellevant publicat a les fonts prioritàries
- Rebi la informació de forma fiable i resumida
- Disposi sempre del link original
- Pugui revisar posteriorment la informació detectada
- Tingui una base de memòria política i seguiment
- No perdi cap publicació important, especialment si conté terminis, acords, imports o decisions rellevants

### 1.2 Resultat mínim exigible de la primera versió

Cada execució del sistema ha de ser capaç de:

- Detectar links o PDFs nous
- Analitzar-los amb un nivell de fiabilitat raonable
- Generar un mini resum fiable basat en el contingut llegit
- Indicar importància o urgència amb una paraula o emoticona
- Enviar un resum agrupat per Telegram i email
- Deixar registre estructurat per a seguiment posterior

---

## 2. Principis de disseny

| Principi | Descripció |
|---|---|
| **Fiabilitat per sobre de complexitat** | És preferible una primera versió més simple però robusta, abans que una solució molt ambiciosa però inestable. |
| **Menys fonts, millor qualitat** | La primera fase prioritzarà la qualitat de l'anàlisi sobre el nombre de fonts monitoritzades. |
| **Trazabilitat** | Cada element detectat ha de quedar vinculat, com a mínim, al seu link original, data de detecció i resum generat. |
| **Escalabilitat** | La solució ha d'estar preparada per créixer cap a dashboard, més fonts, més usuaris i explotació política més avançada. |
| **Supervisió humana** | El sistema no ha de publicar res automàticament ni actuar en nom del partit. Ha d'assistir, no substituir, la decisió política. |
| **No invenció** | La IA no ha d'afegir dades no presents al contingut llegit. Si el contingut és insuficient, ho ha d'indicar explícitament. |

---

## 3. Abast funcional per fases

### 3.1 Fase 1 — Obligatòria

- Monitorització automàtica de les 3 fonts oficials prioritàries
- Detecció de novetats i deduplicació
- Lectura de links i PDFs (content fetching)
- Extracció de contingut quan sigui possible
- Anàlisi amb IA amb mini resum fiable
- Classificació d'importància/urgència (regles híbrides: fixes + IA)
- Enviament agrupat per Telegram
- Enviament agrupat per email
- Registre estructurat a Supabase
- Nivell de confiança del resum
- Identificació de venciments legals si n'hi ha
- Recordatoris automàtics de seguiment a 30/90/180 dies
- Possibilitat de marcar revisió manual

### 3.2 Fase 1 — Desitjable però no bloquejant

- Proposta d'acció política concreta
- Suggeriment de pregunta de ple
- Camp de possible petició d'expedient
- Model de seguiment per document i per compromís
- Vista llegible complementària a Google Sheets

### 3.3 Fase 1 — Fora d'abast de bloqueig

- OCR avançat obligatori
- Cobertura perfecta de fonts amb JavaScript complex
- Dashboard web complet
- Publicació automàtica a xarxes socials
- Integració amb sistemes interns de l'Ajuntament
- Transcripció automàtica d'àudio o vídeo

### 3.4 Fase 2 — Ampliació funcional

- Incorporació de mitjans de comunicació (Ràdio Capital, RPA, TV Costa Brava)
- Compromisos interns per document
- Propostes polítiques més elaborades
- OCR si cal
- Millora de regles de classificació

### 3.5 Fase 3 — Producte ampliat

- Dashboard web complet amb autenticació Supabase
- Explotació avançada i cerca potent
- Multiusuari o ús de partit
- Possible app o interfície pròpia

---

## 4. Fonts a monitoritzar

### 4.1 Fonts prioritàries obligatòries — Fase 1

Aquestes tres fonts concentren acords concrets, decisions de govern, terminis legals, contractació pública, adjudicacions i imports. Són la base de la Fase 1:

| Font | URL | Contingut clau |
|---|---|---|
| **Acords de Junta de Govern** | `https://ciutada.platjadaro.com/ajuntament/organitzacio-municipal/junta-de-govern/acords-de-junta-de-govern/` | PDFs setmanals amb acords adoptats, imports i terminis |
| **E-tauler d'anuncis** | `https://tauler.seu-e.cat/inici?idEns=1704860009` | Edictes, anuncis i procediments normatius. Terminis legals. |
| **Perfil del Contractant** | `https://contractaciopublica.cat/ca/perfils-contractant/detall/3156875?categoria=0` | Licitacions, contractes, adjudicacions i modificacions |

### 4.2 Fonts secundàries — Fase 2

| Font | URL | Contingut |
|---|---|---|
| Ràdio Capital | `https://www.radiocapital.cat/` | Notícies comarca — filtrar per municipi |
| Ràdio Platja d'Aro | `https://www.rpa.cat/` | Notícies locals del municipi |
| TV Costa Brava | `https://www.tvcostabrava.com/poblacio/castell-platja-daro-i-sagaro` | Notícies i vídeos del municipi |

### 4.3 Regla de prioritat de processament

Si hi ha límit de processament per execució, sempre s'han de prioritzar en aquest ordre:

1. Fonts oficials
2. Documents nous
3. PDFs
4. Continguts amb possibles terminis legals
5. Continguts amb possible impacte institucional o pressupostari

---

## 5. Definició operativa d'urgència i importància

La classificació utilitza un **sistema híbrid**: regles fixes automàtiques + interpretació assistida per IA. Les regles fixes tenen prioritat sobre la classificació de la IA.

### 5.1 Nivells de classificació

#### 🔴 URGENT
Un element s'ha de classificar com a URGENT quan compleixi almenys una:
- Conté un termini legal pròxim (inferior a 15 dies)
- Pot donar una primícia política rellevant
- Implica una decisió transcendent que requereix reacció ràpida
- Afecta un assumpte especialment sensible del municipi
- Requereix valoració o acció política immediata

#### 🟡 IMPORTANT
Un element s'ha de classificar com a IMPORTANT quan:
- Té impacte significatiu sobre la ciutadania
- Afecta l'organització municipal
- Implica despesa pública rellevant
- Conté contractes, adjudicacions, licitacions o modificacions rellevants
- Justifica seguiment polític, pregunta de ple o petició d'expedient

#### 🟢 INFORMATIU
Un element s'ha de classificar com a INFORMATIU quan:
- Informa d'un acte o acció de baixa transcendència política
- No requereix actuació immediata
- No implica impacte rellevant o seguiment prioritari

### 5.2 Regles fixes automàtiques

| Condició detectada | Acció automàtica |
|---|---|
| Venciment legal pròxim (< 15 dies) | Forçar **URGENT** |
| Import pressupostari > 50.000 € | Forçar **IMPORTANT** com a mínim |
| Contractació pública (qualsevol import) | Forçar **IMPORTANT** com a mínim |
| Font oficial + acord o adjudicació | No classificar com a INFORMATIU sense justificació |
| PDF nou de Junta de Govern | **IMPORTANT** com a mínim |

---

## 6. Requisits funcionals

### RF-01 — Execució programada

| Camp | Valor |
|---|---|
| **Descripció** | El sistema s'executa automàticament dues vegades al dia: 08:00h i 20:00h (Europe/Madrid). La freqüència ha de ser fàcilment modificable. |
| **Prioritat** | 🔴 CRÍTICA |
| **Criteri d'acceptació** | Les execucions es produeixen sense intervenció manual. Els logs mostren hora d'inici i resultat. |

### RF-02 — Descàrrega de fonts

| Camp | Valor |
|---|---|
| **Descripció** | El sistema accedeix a les fonts i descarrega HTML, llistats de documents i PDFs. Les peticions s'executen en paral·lel. |
| **Tolerància** | Si una font falla, les altres continuen processant-se. L'error es registra als logs. |
| **Headers HTTP** | Totes les peticions inclouen User-Agent de Chrome. Timeout màxim: 30 segons. |
| **Prioritat** | 🔴 CRÍTICA |

### RF-03 — Detecció de novetats i deduplicació

| Camp | Valor |
|---|---|
| **Descripció** | El sistema detecta noves publicacions comparant les URLs trobades amb les ja registrades a Supabase. |
| **Clau de deduplicació** | URL normalitzada. Preparat per ampliar amb: nom de fitxer, hash de document, eliminació de paràmetres irrellevants. |
| **Garantia** | UNIQUE constraint a Supabase garanteix impossibilitat d'inserir duplicats a nivell de base de dades. |
| **Prioritat** | 🔴 CRÍTICA |

### RF-04 — Lectura i extracció de contingut (Content Fetching)

| Camp | Valor |
|---|---|
| **Descripció** | Per cada element nou, el sistema visita la URL per llegir el contingut complet. Aquesta lectura és la base del resum de la IA. |
| **Pàgina HTML** | S'extreu el text principal de l'article o document. Límit: 6.000 caràcters. |
| **PDF textual** | S'extreu el text del PDF. Si és possible, s'envien els primers 8.000 caràcters a la IA. |
| **PDF escanejat** | Si no s'extreu text fiable (< 100 caràcters), es marca `nivell_confianca = BAIXA` i `requereix_revisio_manual = true`. |
| **Font JS dinàmica** | Si retorna contingut buit, s'enregistra igualment el link i es marca confiança BAIXA. |
| **Prioritat** | 🟡 ALTA |

### RF-05 — Anàlisi amb IA

Per cada element nou, la IA ha de generar com a mínim:

- Títol o nom de document
- Mini resum (3-4 línies) basat **EXCLUSIVAMENT** en el text llegit
- Classificació d'urgència/importància
- Nivell de confiança (ALTA / MITJA / BAIXA)
- Indicació de si hi ha venciment i la data (DD/MM/YYYY)
- Import econòmic detectat (en euros)
- Tema principal del document
- Frase curta de lectura política / fiscalitzadora

Si és possible (Fase 1 desitjable):

- Proposta d'acció política concreta
- Suggeriment de pregunta de ple
- Alerta de possible petició d'expedient
- Identificació de compromisos o acords dins del document

| Camp | Valor |
|---|---|
| **Norma fonamental** | La IA no ha d'afegir dades no presents al contingut llegit. Si el contingut és insuficient, ha d'indicar-ho explícitament. |
| **Model recomanat** | OpenAI GPT-4o-mini. Max tokens: 500 per element. |
| **Idioma** | Totes les respostes en català. |
| **Prioritat** | 🔴 CRÍTICA |

### RF-06 — Enviament per Telegram

| Camp | Valor |
|---|---|
| **Condició d'enviament** | Només s'envia missatge si hi ha almenys 1 novetat. |
| **Format resum agrupat** | Capçalera amb data i torn. Agrupació per urgència (URGENTS primer). Per cada element: font, títol, mini resum, link, icona, confiança i venciment si hi ha. |
| **Parse Mode** | MarkdownV2. Límit 4.000 caràcters. Es talla prioritzant els URGENTS. |
| **Alerta individual** | A més del resum agrupat, s'envia alerta individual immediata quan: hi ha venciment legal pròxim (< 15 dies), acord de gran transcendència, adjudicació rellevant o primícia política clara. |
| **Prioritat** | 🔴 CRÍTICA |

### RF-07 — Enviament per email

| Camp | Valor |
|---|---|
| **Descripció** | El sistema envia també el resum agrupat per email, amb contingut equivalent al de Telegram. |
| **Condició** | Mateixa condició que Telegram: només si hi ha novetats. |
| **Format** | Assumpte: `Monitor Polític [data] — [nombre] novetats [torn]`. Cos: contingut agrupat per urgència en HTML. |
| **Destinatari** | Adreça configurable — placeholder substituïble sense canviar el workflow. |
| **Servei recomanat** | Gmail via OAuth, SMTP configurable o servei d'email transaccional (Resend, Sendgrid). |
| **Prioritat** | 🟡 ALTA |

### RF-08 — Registre estructurat

| Camp | Valor |
|---|---|
| **Descripció** | Cada element processat queda registrat a Supabase com a font de veritat. En paral·lel, s'actualitza Google Sheets com a vista llegible. |
| **Garantia** | Si el sistema s'executa diverses vegades, el registre no genera duplicats gràcies al UNIQUE constraint. |
| **Prioritat** | 🔴 CRÍTICA |

### RF-09 — Seguiment i recordatoris

| Camp | Valor |
|---|---|
| **Recordatoris automàtics** | Cada element registrat genera automàticament dates de recordatori a 30, 90 i 180 dies des de la detecció. |
| **Revisió manual** | Quan la qualitat de l'extracció o anàlisi no és suficient, l'element es marca com a `requereix_revisio_manual = true`. |
| **Estat de seguiment** | Cada element té un camp `estat_seguiment`: `pendent` / `en curs` / `tancat`. Modificable manualment. |
| **Seguiment per compromís** | L'estructura ha de quedar preparada per suportar seguiment per compromís detectat dins d'un document (ampliació Fase 2). |
| **Prioritat** | 🟡 ALTA |

---

## 7. Requisits no funcionals

| ID | Categoria | Requisit |
|---|---|---|
| RNF-01 | Fiabilitat | La fiabilitat és el principal criteri de qualitat. Una primera versió simple i robusta és preferible a una versió ambiciosa inestable. |
| RNF-02 | Tolerància a errors | Si una font falla, les altres continuen. Cada error queda registrat als logs. |
| RNF-03 | Mantenibilitat | L'usuari pot modificar URLs, freqüències, límits, regles i prompts sense dependència del proveïdor. |
| RNF-04 | Escalabilitat | L'arquitectura està preparada per afegir fonts, dashboard, més usuaris i reutilització a nivell de partit. |
| RNF-05 | Cost raonable | Cost operatiu baix i proporcional. Estimat: 2-4 €/mes en IA. No s'ha de comprometre la qualitat per estalviar. |
| RNF-06 | Trazabilitat | Cada element queda vinculat a: link original, data de detecció, resum, classificació, font i confiança. |
| RNF-07 | No invenció | La IA no afegeix dades no presents al contingut. Si insuficient, ho indica. Confiança BAIXA si no s'ha pogut llegir. |
| RNF-08 | Rendiment | Cada execució completa ha de finalitzar en menys de 7 minuts en condicions normals. |
| RNF-09 | Idioma | Totes les respostes de la IA, els missatges de Telegram, email i les etiquetes han d'estar en català. |
| RNF-10 | Supervisió humana | El sistema no publica ni actua en nom del partit. Assisteix la decisió política, no la substitueix. |

---

## 8. Arquitectura recomanada

### 8.1 Components principals

| Component | Tecnologia | Rol |
|---|---|---|
| Motor d'automatització | n8n (self-hosted) | Orquesta tot el flux. Programació, HTTP, codi JS, gestió d'errors. |
| Servidor | EasyPanel (VPS) | Servidor propi. Privacitat i control total. |
| Base de dades principal | Supabase (PostgreSQL) | Emmagatzematge, deduplicació (UNIQUE), índexs, RLS, API REST. |
| Autenticació | Supabase Auth | Protegeix el dashboard web. Email + contrasenya + JWT + RLS. |
| Vista llegible | Google Sheets | Vista complementària exportable. S'actualitza en paral·lel a Supabase. |
| Intel·ligència artificial | OpenAI GPT-4o-mini | Analitza el contingut complet. Genera resums fidedignes en català. |
| Alertes mòbil | Telegram Bot API | Resum agrupat + alertes individuals excepcionals. |
| Alertes email | SMTP / Gmail / Resend | Enviament paral·lel al Telegram. Destinatari configurable. |
| Dashboard web | Fase 3 | Interfície web protegida per Supabase Auth. Consultar, filtrar i gestionar novetats. |

### 8.2 Flux de dades — Fase 1

| Pas | Node n8n | Acció |
|---|---|---|
| 1 | Schedule Trigger (×2) | Dispara el workflow a les 8h i a les 20h (Europe/Madrid) |
| 2-4 | HTTP Requests oficials (×3) | Descarreguen en paral·lel: Acords JGL, E-tauler, Perfil Contractant |
| 5 | Merge | Espera que les 3 peticions acabin i les fusiona. **Node crític.** |
| 6 | Code — Extreu links i PDFs | Extreu tots els links i PDFs de cada HTML. Identifica font i tipus. |
| 7 | Supabase — Consulta URLs | `GET /monitoratge?select=url_original` per obtenir les URLs ja processades. |
| 8 | Code — Filtra nous | Descarta les URLs ja registrades. Si no hi ha nous, el workflow para. |
| 9 | HTTP — Content Fetching | Visita cada URL nova per llegir el contingut complet de l'article o PDF. |
| 10 | OpenAI — Anàlisi IA | Analitza el contingut complet. Genera resum, urgència, confiança, venciment i frase política. |
| 11 | Code — Regles fixes urgència | Aplica les regles automàtiques: eleva urgència si venciment pròxim, import alt o contractació. |
| 12 | Supabase — Guardar | INSERT a Supabase via API REST. Font de veritat principal. |
| 13 | Google Sheets — Guardar | Append Row a Google Sheets. Vista llegible complementària. |
| 14 | Code — Construeix missatge | Agrupa novetats per urgència. Construeix missatge Telegram (MarkdownV2) i email (HTML). |
| 15 | IF — Hi ha novetats? | Si no hi ha novetats, el workflow para silenciosament. |
| 16a | Telegram — Resum agrupat | Envia el resum agrupat. Si hi ha URGENTS, envia també alerta individual. |
| 16b | Email — Resum agrupat | Envia el resum per email a l'adreça configurada del regidor. |

---

## 9. Model de dades — Supabase

### 9.1 Taula principal: `monitoratge`

| Camp | Tipus PostgreSQL | Descripció |
|---|---|---|
| `id` | `UUID` (PK) | Clau primària generada automàticament |
| `url_original` | `TEXT UNIQUE` | URL original. UNIQUE garanteix deduplicació a nivell de base de dades. |
| `font` | `TEXT` | Nom de la font: Acords JGL / E-tauler / Perfil Contractant / Ràdio Capital / RPA / TVCB |
| `tipus` | `TEXT` | notícia / document oficial / PDF |
| `tipus_document` | `TEXT` | acord / contracte / licitació / edicte / adjudicació / notícia / altres |
| `titol` | `TEXT` | Títol extret del HTML o nom del fitxer PDF |
| `contingut_complet` | `TEXT` | Text complet llegit per la IA. Camp clau per a veracitat dels resums. |
| `resum` | `TEXT` | Mini resum generat per la IA basat en contingut complet |
| `classificacio` | `TEXT CHECK` | `URGENT` / `IMPORTANT` / `INFORMATIU` (resultat del sistema híbrid regles + IA) |
| `nivell_confianca` | `TEXT CHECK` | `ALTA` (text complet) / `MITJA` (parcial) / `BAIXA` (només títol o error) |
| `data_deteccio` | `TIMESTAMPTZ` | Data i hora de detecció amb zona horària (Europe/Madrid) |
| `venciment` | `DATE` | Data límit legal detectada per la IA. NULL si no detectada. |
| `import_detectat` | `NUMERIC(12,2)` | Import econòmic en euros detectat per la IA. NULL si no n'hi ha. |
| `tema_principal` | `TEXT` | urbanisme / contractació / personal / serveis / pressupost / altres |
| `proposta_accio` | `TEXT` | Proposta d'acció política generada per la IA (si disponible) |
| `pregunta_ple_suggerida` | `TEXT` | Suggeriment de pregunta de ple generat per la IA (si disponible) |
| `requereix_revisio_manual` | `BOOLEAN` | True si el contingut no s'ha pogut llegir correctament |
| `estat_seguiment` | `TEXT` | `pendent` / `en curs` / `tancat`. Valor inicial: pendent. |
| `recordatori_30d` | `DATE generated` | `data_deteccio + 30 dies`. Calculat per PostgreSQL automàticament. |
| `recordatori_90d` | `DATE generated` | `data_deteccio + 90 dies`. Calculat per PostgreSQL automàticament. |
| `recordatori_180d` | `DATE generated` | `data_deteccio + 180 dies`. Calculat per PostgreSQL automàticament. |
| `observacions` | `TEXT` | Notes manuals del regidor. |
| `estat` | `TEXT` | `nou` / `revisat` / `arxivat`. Valor inicial: nou. |

### 9.2 SQL de creació — executar a Supabase SQL Editor

```sql
CREATE TABLE monitoratge (
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
  estat_seguiment          TEXT DEFAULT 'pendent',
  recordatori_30d          DATE GENERATED ALWAYS AS
    (data_deteccio::DATE + INTERVAL '30 days') STORED,
  recordatori_90d          DATE GENERATED ALWAYS AS
    (data_deteccio::DATE + INTERVAL '90 days') STORED,
  recordatori_180d         DATE GENERATED ALWAYS AS
    (data_deteccio::DATE + INTERVAL '180 days') STORED,
  observacions             TEXT,
  estat                    TEXT DEFAULT 'nou'
);

-- Índexs per rendiment
CREATE INDEX idx_url      ON monitoratge(url_original);
CREATE INDEX idx_classif  ON monitoratge(classificacio);
CREATE INDEX idx_data     ON monitoratge(data_deteccio DESC);
CREATE INDEX idx_venc     ON monitoratge(venciment) WHERE venciment IS NOT NULL;

-- Seguretat: Row Level Security
ALTER TABLE monitoratge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acces autenticat" ON monitoratge
  FOR ALL USING (auth.role() = 'authenticated');
```

---

## 10. Prompt de la IA

El prompt s'envia per cada element nou. La IA rep el text complet i ha de respondre **EXCLUSIVAMENT** en base al contingut llegit:

```
[SYSTEM]
Ets l'assistent d'un regidor de l'oposició de Castell-Platja d'Aro (Catalunya).
NORMA FONAMENTAL: Basa't EXCLUSIVAMENT en el text proporcionat.
NO afegeixis informació que no aparegui al text. Si és insuficient, indica-ho.
Respon SEMPRE en català.

[USER]
FONT: {{ $json.font }}
TÍTOL: {{ $json.titol }}
TIPUS: {{ $json.tipus }}
TEXT COMPLET:
{{ $json.contingut_complet }}

Respon EXACTAMENT en aquest format:
URGÈNCIA: [URGENT/IMPORTANT/INFORMATIU]
RESUM: [3-4 línies basades exclusivament en el text]
VENCIMENT: [DD/MM/YYYY o No detectat]
IMPORT: [import en euros o No detectat]
TEMA: [urbanisme/contractació/personal/serveis/pressupost/altres]
CONFIANÇA: [ALTA/MITJA/BAIXA]
PER A L'OPOSICIÓ: [frase basada en fets del text, no suposicions]
PROPOSTA ACCIÓ: [opcional — si hi ha acció política clara]
PREGUNTA PLE: [opcional — si es justifica]
EXPEDIENT: [opcional — si cal demanar-lo]
```

---

## 11. Comportament davant documents difícils

| Situació | Comportament | Registre i acció |
|---|---|---|
| PDF sense text (escanejat) | No inventar el contingut | Enviar igualment el link. Marcar `confianca = BAIXA` i `revisio_manual = true`. |
| Font amb JavaScript dinàmic | Intentar processar. Si no és fiable, indicar-ho. | No bloquejar la resta del sistema. Marcar `confianca = BAIXA`. |
| Contingut parcial (< 100 caràcters) | Resum prudent basat en el que s'ha llegit | Marcar `confianca = MITJA`. No presentar conclusions com si fossin certes. |
| Error HTTP en font | Continuar amb les altres fonts | Registrar l'error als logs amb codi HTTP i font afectada. |
| URL ja processada (duplicat) | Descartar sense processar | Gestió a nivell de base de dades (UNIQUE constraint Supabase). |

---

## 12. Criteris d'èxit de la primera entrega

La primera entrega es considerarà satisfactòria si:

1. ✅ Detecta correctament novetats a les 3 fonts prioritàries
2. ✅ Envia missatge agrupat a Telegram i email en cada execució amb novetats
3. ✅ Cada element inclou link original, mini resum i indicador d'importància
4. ✅ L'anàlisi és prou fiable per a ús diari (basat en contingut complet, no només títol)
5. ✅ Deixa registre ordenat a Supabase per a consulta posterior
6. ✅ No es perden publicacions rellevants de manera sistemàtica
7. ✅ El sistema pot ampliar-se sense haver de refer-lo (arquitectura escalable)
8. ✅ La deduplicació funciona correctament i no processa el mateix element dues vegades

---

## 13. Explotació política prevista

El sistema s'ha de dissenyar per servir a:

- **Consum personal immediat** — lectura diària del matí i tarda
- **Preparació de preguntes de ple**
- **Decisió sobre petició d'expedients**
- **Preparació de vídeos o continguts polítics**
- **Seguiment de compromisos** adquirits pel govern
- **Elaboració d'informes i argumentaris**
- **Memòria política acumulada**

> El sistema **NO** és només un lector de notícies. Ha de permetre construir una memòria ordenada i revisable del que es publica, per fiscalitzar el govern de forma sistemàtica i documentada.

---

## 14. Historial de versions

| Versió | Data | Autor | Canvis |
|---|---|---|---|
| 1.0 | Abril 2026 | Regidor de l'Oposició | Versió inicial. Arquitectura base amb n8n, OpenAI, Google Sheets i Telegram. |
| 2.0 | Abril 2026 | Regidor de l'Oposició | Afegit Supabase com a BD principal. Supabase Auth. Content fetching. Indicador de confiança. |
| **2.1** | **Abril 2026** | **Regidor de l'Oposició** | **Especificació final tancada.** Afegit enviament per email (RF-07). Alertes individuals excepcionals (RF-06). Recordatoris a 30/90/180 dies. Nous camps: `import_detectat`, `tipus_document`, `tema_principal`, `proposta_accio`, `pregunta_ple_suggerida`. Sistema híbrid de classificació d'urgència (regles fixes + IA). Fonts oficials com a Fase 1 prioritària. Criteris d'èxit explícits. Full de ruta en 3 fases. |

---

*Document d'Especificació de Requisits — v2.1 Final — Abril 2026*  
*Sistema de Monitorització Política Municipal — Castell-Platja d'Aro*
