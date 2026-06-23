# Yggdrasil Descent — Director's Cut Vision

> **„Du komponierst deinen eigenen Todesgesang. Wenn er fertig ist, endet die Welt."**

Du bist **Bragis Lehrling** (Bragi = Gott der Skaldenkunst). Bragi ist tot. Sein letztes, unvollendetes Lied erzählt von Ragnarök — aber Ragnarök ist nie gekommen. Die Götter sitzen in ewigem Zwischenzustand. Yggdrasil verrottet von innen, weil die Geschichte nicht enden darf. Dein Job: das fehlende Lied finden, vollenden, singen. **Damit löst du Ragnarök aus.** Du bist nicht der Held — du bist der Auslöser.

---

## Was bleibt vom alten Spiel

- Phaser 3 + ES Modules
- HUD-Grundgerüst + EXPAND-Scale-Mode
- GitHub Pages Deployment
- Die drei Charakter-Hintergründe (Hákon / Sólveig / Brandr) als **Skalden-Inkarnationen**, nicht als Klassen

## Was wegmuss

1. **Klassen-System** (Krieger/Schatten/Magier) — Identität entsteht durch das Lied
2. **Endless-Open-World** — handgebaute Yggdrasil-Räume statt Wave-Steppe
3. **Auto-Attack** — der Skalde singt aktiv, Trigger-basiert
4. **Canvas-2D-Lego-Sprites** — Painterly 2D mit Skogur-Veredelung

---

## Die 3 Skalden

| Skalde | Inkarnation | Trauma |
|--------|-------------|--------|
| **Hákon Eisensohn** | Berserker | Hat den eigenen Bruder erstochen |
| **Sólveig Ungenannt** | Seiðr-Schatten | Hat ihren Käufer und dessen Familie vergiftet |
| **Brandr von Snæfellsness** | Runen-Magier | Mutter geheilt — Vater starb stattdessen (Wyrd-Tausch) |

## Die 4 Götter (Charaktere, keine Buff-Maschinen)

- **Odin** — der gelangweilte Sammler („Ich brauche dich nicht lebend, ich brauche dich brauchbar.")
- **Thor** — der Bauer, der Sifs Korn als Heal schenkt
- **Freya** — die Halfwitwe, kassiert **Erinnerungen** als Bezahlung
- **Loki** — der Schmerzensvater, stärkste Buffs, ehrlichste Kosten

## Der Antagonist (Run 25+)

**Mímir**, der Kopf im Brunnen. Hat Odin belogen, hat Ragnarök kuratiert. Der Spieler ist Material für seinen neuen Körper. Run 50 = Wahl: Wirf dich rein und werde sein Leib, oder schlage den Kopf entzwei (alle Götter sterben).

---

## Das Opening (3 Sätze)

> *Du bist gestorben, bevor du wusstest, dass du lebst.*
> *Die Wurzeln haben dich gehalten, weil sie dich noch brauchen — nicht weil du es wert wärst.*
> *Steig hinab. Drei Götter haben dich gewählt. Einer hat dich verkauft.*

---

## Das Skaldenlied (die zentrale Mechanik)

Jeder Run beginnt: Spieler wählt **3 Vers-Slots** (Strophe / Refrain / Strophe). Jeder Vers ist Stabreim aus drei Modulen:

```
TRIGGER  +  VERB  +  OBJEKT
```

Beispiel:
> *„Wenn **W**olf weint / wirft **W**ind / weiße **W**unden."*
> = on-low-HP → projectile-burst → frost-debuff

Im Run findest du **Runen** = neue Wörter. Bei jedem Boss-Sieg wird das Lied einen Vers länger. Synergien entstehen über grammatikalische Logik (gleicher Stabreim-Buchstabe = Boost).

## 5 Build-Identitäten (Beispiele)

1. **Weinende Skalde**: on-take-damage → AoE-Frost — du willst getroffen werden
2. **Trommel-Berserker**: on-rhythm-perfect → Damage-Stack — Guitar-Hero-Timing
3. **Lügen-Skalde**: on-enemy-death → Feinde greifen sich gegenseitig an — Bürgerkrieg
4. **Der Stumme**: 3 Sek Schweigen → Mega-Detonation — Zen-Mode
5. **Der Erinnerer**: gleiche Strophe 3× → +30% pro Wiederholung — Mantra-Loops

## Meta-Progression (3 Layer)

1. **Kodex der Verse** (Hades-Mirror-Äquivalent) — gespielte Verse werden permanent freischaltbar
2. **Yggdrasil-Welken** (Pact of Punishment) — jeder Erfolg macht den Baum kränker, mehr Reward
3. **Bragis Manuskript** — versteckte Lieder durch Vers-Kombos in bestimmten Räumen

---

## Visueller Stil

**Painterly 2D + Skogur-Veredelung** (Hades-Komposition + Wardruna-Album-Cover-Atmosphäre).

### Biome-Paletten

```
Midgard (Spätsommer vor dem Sturm — Heimweh in Echtzeit):
  #3D4A2B  #7A8651  #C9A961  #8B4513  #2E2418  #E8DCC0

Jötunheim (Stein und Atem — du bist hier nicht gemeint):
  #4A5D6C  #8B9DAA  #1F2933  #6B5D4F  #D4C5B0  #3A2F2A

Helheim (Stille färben — die Welt geht weiter, du nicht):
  #2B2D3A  #5C5470  #8A7E96  #C9C4D1  #1A1820  #6B4F5C
```

### Asset-Pipeline (Solo-Dev)

- Higgsfield Concept-Pass → Krita Cleanup → Aseprite Pixel-Pass
- 128×128 für Skalden, 256×256 für Götter-Portraits
- 21 Frames pro Skalde (idle/walk/attack/hit/death)
- ~15h pro Skalde, ~6 Wochen Abendarbeit für alle Assets

---

## Game Feel (Vlambeer-Niveau)

### Top-Juice (Werte sind verbindlich)

| Effekt | Wert |
|--------|------|
| Hit-Pause normaler Hit | 60ms |
| Hit-Pause Crit / Kill | 120ms |
| Screen-Shake normal | 2px / 80ms exp decay |
| Screen-Shake schwer | 5px / 180ms |
| Screen-Shake Boss-Kill | 9px / 400ms + 0.5° Rotation |
| Slow-Mo Last-Kill-of-Wave | 0.35x für 600ms, ease-out 400ms |
| Squash & Stretch on hit | 1.3 / 0.7 für 50ms, bounce 120ms |
| Damage-Number Pop | scale 0.5 → 1.4 → 1.0 over 200ms |
| Crit Camera-Zoom | 1.0 → 1.08 in 40ms, ease-out 200ms |

### XP-Pickup-Pentatonik-Trick

Jeder 10. Pickup spielt einen harmonisch höheren Pentatonik-Ton (C-D-E-G-A). Der Spieler hört unbewusst eine Melodie *entstehen*.

---

## Audio-Stack

- **Howler.js** (CDN) für SFX-Pool + Music-Crossfade
- **Web Audio API direkt** für Pentatonik-Pickup-Sequenz
- **Audio-Sprite-MP3** (eine Datei, alle SFX als Marker)
- **ElevenLabs** für Götter-Stimmen (je 3 Lines à 5 Wörter)
- **Click-to-Start**-Overlay für Browser-Audio-Policy

### Music-Direktion: Wardruna × Mick Gordon Hybrid

| Track | BPM | Layer |
|-------|-----|-------|
| Menu „Yggdrasils Wurzeln" | 60 | Kraviklyra-Drone + Throat-Bass-Chor |
| Midgard-Combat „Der erste Frost" | 105 | Tagelharpa + Frame-Drum, eskaliert per Wave |
| Helheim-Boss „Hels Throne" | 72 | Dissonant, Hel-Vocal durch Granular-Synth |

---

## Sprint-Roadmap

### Sprint 1 — Hook beweisen (4-6 Tage)
- Skaldenlied-Standalone-Loop: EIN Raum, 3 Strophen-Slots, 5 Vers-Module
- Hit-Pause + Screen-Shake (5 Min Code, größter Impact)
- Audio-MVP-5: Hit-SFX, XP-Pentatonik, Menu-Drone, Boss-Death-Sting, Hit-Pause-SFX
- **Gate**: Macht das 5 Minuten Spaß? Nein → Reset.

### Sprint 2 — Vertikaler Slice (1 Woche)
- Bragi-Intro: 60 Sek Final-Quality
- 3 painterly Sprites (Skalde + Gegner + Gott) als Style-Probe
- Menu-Track (60 Sek Wardruna-Style)
- Trailer-tauglich

### Sprint 3 — Story-Bibel-Integration (1 Woche)
- Opening + 4 Götter-Monologe + Run-1-Beat
- 5 vollwertige Verse mit echten Synergien
- Vom-Tod-zur-Reinkarnation-Loop

---

## Tagline (final)

> **„Komponiere dein Todeslied. Wenn es fertig ist, endet die Welt."**
