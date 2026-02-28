# Bistrup Byggeprojekt — Webapp

## Projektbeskrivelse

En webapp til at dokumentere og dele byggeprojektet på **Bistrupgårdsvej 1**, forår/sommer 2026.

Kernen i projektet: to nye store badeværelser og en bedre kælder at leve i.

Webappen er den fælles kilde til sandhed for alle involverede — bygherrer, håndværkere, arkitekter, el-folk og andre. Den skal gøre det nemt at se, hvad der er besluttet, hvad der mangler afklaring, og hvad status er for hvert rum.

## Webapp-koncept

### Formål
- Dokumentere byggeprojektet rum-for-rum i høj detalje
- Vise hvad vi **ved**, hvad der er **uafklaret**, og hvor vi **står**
- Gradvist fylde flere detaljer ind efterhånden som beslutninger tages
- Dele med alle der arbejder på projektet (link-baseret, ingen login)

### Kernefunktioner

1. **Rum-oversigt**: Interaktiv oversigt over alle rum, nummererede og navngivne
2. **Rum-detaljesider**: Hvert rum har sin egen side med:
   - Rumnummer og navn (fx "4: Hobbyrum")
   - Etage (1. sal / Kælder)
   - Beskrivelse af rummets formål og vision
   - **Besluttede initiativer** — hvad der skal gøres
   - **Ubesvarede spørgsmål** — hvad der mangler afklaring
   - **Status** — hvor langt vi er (ikke startet / i gang / færdigt)
   - Underkategorier: VVS, El, Gulv, Vægge, Loft, Vinduer/døre, Ventilation
3. **Overordnede initiativer**: Tværgående beslutninger der rammer flere rum (fx asbest, rør, døre)
4. **Plantegninger**: Visning af kælder- og etageplaner med rum markeret
5. **Progressoverblik**: Dashboard der viser samlet status og antal ubesvarede spørgsmål

### Datamodel

Rummene er organiseret efter etage og nummereret konsekvent:

**1. sal:**
| # | Rum | Beskrivelse |
|---|-----|-------------|
| 1 | Soveværelser og Gang | Børneværelse, soveværelse, gang |
| 2 | Badeværelse 1. sal | Sammenlagt badeværelse med ovenlys |
| 3 | Entré | Entré med fliser og gulvvarme |

**Kælder:**
| # | Rum | Beskrivelse |
|---|-----|-------------|
| 4 | Hobbyrum | Lege-, kontor- og tv-rum |
| 5 | Viktualierum | Opbevaring, rør rilles ned |
| 6 | Badeværelse kælder | Nyt badeværelse med karbad og lysskakt |
| 8 | Kældergang | Forbindelsesgang ved trappe |
| 9 | Opbevaringsrum | Stort opbevarings-/værkstedsrum |
| 10 | Vaskerum | Nyt vaskerum i tidligere fyrrum |

**Bemærk**: Rum 7 mangler i den nuværende nummerering — afklar om dette er bevidst eller om der er et rum der skal tilføjes.

### Hvert rums datastruktur

```
Rum {
  id: number           // Rumnummer (1-10)
  name: string         // "Hobbyrum"
  floor: "1.sal" | "kælder"
  description: string  // Overordnet vision for rummet
  initiatives: [{
    category: "VVS" | "El" | "Gulv" | "Vægge" | "Loft" | "Vinduer" | "Ventilation" | "Andet"
    description: string
    status: "ikke_startet" | "i_gang" | "færdig"
  }]
  openQuestions: [{
    question: string
    category: string
    resolvedAt?: date
    resolution?: string
  }]
  notes: string        // Fritekst noter
}
```

## Tech Stack

### Anbefalet stack
- **Next.js** (App Router) — React-baseret, god til SSR og statiske sider
- **TypeScript** — typesikkerhed i datamodellen
- **Tailwind CSS** — hurtig styling
- **JSON/Markdown som datakilde** — rummenes data lever i en struktureret fil, ikke database
  - Gør det nemt at redigere uden admin-UI i starten
  - Kan senere flyttes til Supabase hvis behov for multi-user editing
- **Vercel** — deployment og deling via URL

### Hvorfor ingen database til at starte med?
Projektet har ~10 rum med relativt statisk data. En JSON-fil (eller samling af markdown-filer) er enklere at vedligeholde, nemmere at redigere i Claude, og hurtigere at komme i gang med. Når der opstår behov for at flere kan redigere samtidig, kan vi tilføje Supabase.

## Design

- Rent, overskueligt, printvenligt
- Farver der signalerer status: grøn (besluttet/færdigt), gul (uafklaret), grå (ikke startet)
- Mobil-venligt så håndværkere kan tilgå det på byggepladsen
- Plantegning som visuel navigation (klik på rum → gå til detaljer)

## Datakilde

Al eksisterende viden om projektet er i:
- `RumForRum.md` — nuværende rum-for-rum dokumentation
- `Plantegning_basement.png` — kælderens plantegning

Disse filer er den primære kilde til sandhed og skal bruges som udgangspunkt for at populere webappens data.

## Udviklingsplan

1. **Fase 1**: Statisk site med alle rum og deres data fra RumForRum.md
2. **Fase 2**: Interaktiv plantegning med klikbare rum
3. **Fase 3**: Progresstracking og filtreringsmuligheder
4. **Fase 4**: Redigeringsmuligheder (evt. med Supabase backend)

## Konventioner

- Al UI-tekst på **dansk**
- Rum refereres altid som "# Navn" (fx "4: Hobbyrum")
- Brug konsekvent terminologi fra RumForRum.md
- Kode og kommentarer på engelsk (standard praksis)
