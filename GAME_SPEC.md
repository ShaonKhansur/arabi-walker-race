# Project Specification: Arabi's Walker Run (PWA Browser Game)

## 1. Overview & Target Audience

- **Game Type:** Single-player 2D Side-Scrolling Endless Runner (HTML5 Browser Game), deployable on Vercel as an installable offline-capable PWA.
- **Players:** Designed for two brothers to play on mobile or PC browser:
  - **Araf (Age 5):** Needs an Easy/Kids mode (slower pace, forgiving obstacles, fun animations).
  - **Anam (Age 13):** Needs a Challenge mode (progressive speed, high-score tracking, chaser mechanics).
- **Main Character:** **Arabi (Age 1)** riding her blue-and-white baby walker, running across their home while her brothers Anam and Araf chase playfully from behind.

## 2. Visual Assets (Located in `_raw_assets/`)

- `_raw_assets/home-bg.jpg`: Custom cartoon background matching their real home (wooden sofa, glass table, teal curtains, indoor plant, 3 bedroom passages, and open kitchen). Copy to `public/assets/bg/home-bg.jpg`.
- `_raw_assets/characters-sheet.jpg`: Contains the 3 characters in matching art style. Extract each into separate transparent PNG sprites in `public/assets/sprites/`:
  1. `arabi-walker.png` (1yo baby girl Arabi inside her blue-and-white walker)
  2. `anam-run.png` (13yo boy Anam in dark blue car-patterned shirt)
  3. `araf-run.png` (5yo boy Araf in yellow sleeveless shirt & teal shorts)
- Generate `public/pwa-192x192.png` and `public/pwa-512x512.png` icons from `arabi-walker.png`.

## 3. Gameplay Mechanics (Phaser 3)

- **Controls:**
  - Mobile: Tap anywhere on screen to jump/hop the walker (add Landscape orientation prompt if held in portrait).
  - PC: `Space` or `Up Arrow` to jump.
- **Obstacles & Collectibles:**
  - Obstacles: Colorful toy blocks, cushions, rolling balls.
  - Collectibles: Milk bottles / rattle toys (gives "Turbo Walker" speed boost and increases distance from Anam & Araf).
- **Game Modes:**
  - **আরাফ মোড (সহজ - ৫ বছর):** Slower speed; hitting an obstacle makes Arabi giggle and bounce back slightly without Game Over.
  - **আনাম মোড (চ্যালেঞ্জ - ১৩ বছর):** Speed increases over time; hitting obstacles brings Anam & Araf closer until they catch Arabi (Game Over).

## 4. Age-Appropriate Bengali Dialogues & Arabi's Giggle

- Use Google Font `Hind Siliguri` for crisp Bengali rendering.
- Show cartoon speech bubbles above characters during gameplay events:
  - **Anam (13y):** Protective & playful older brother (e.g., `"এই আরাফ, দেখ! আরাবি ওয়াকার নিয়ে দৌড় দিছে!"`, `"সাবধান! সামনে খেলনা পড়ে আছে, দেখে চালাও!"`, `"এই তো ধরে ফেলেছি! ওয়াকার থামাও!"`).
  - **Araf (5y):** Excited & energetic (e.g., `"ধরো ধরো! আরাবি কিচেনের দিকে যাচ্ছে!"`, `"ওরে বাবা! আরাবির ওয়াকার তো রকেট হয়ে গেছে!"`, `"আরাবি দাঁড়াও, চকলেট দিব!"`).
  - **Arabi (1y):** Cute baby babble & giggles (e.g., `"হিহিহি! আ-বা-বা! 😄"`, `"খিলখিলখিল! তা-তা-তা! 🍼✨"`).
- **Audio (`SoundManager.ts`):** Use Web Audio API to synthesize a cheerful, musical baby giggle sound whenever Arabi laughs, plus jump and item-collect sound effects (also support loading `/assets/audio/arabi-giggle.mp3` if present).

## 5. Tech Stack & Deployment

- **Stack:** Vite + React + TypeScript + Tailwind CSS + Phaser 3 + `vite-plugin-pwa`.
- **PWA Manifest:** `"display": "fullscreen"`, `"orientation": "landscape"`, offline service worker caching all assets.
- **Deployment:** Ready for zero-config Vercel deployment (`vercel.json` included).
