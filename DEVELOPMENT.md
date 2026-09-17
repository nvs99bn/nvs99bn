# The Sunny

A static One Piece fan-themed profile and companion site. The README links to the 3D voyage on GitHub Pages. No personal biography, skills or project claims are included.

## Develop

Requires Node.js and Python 3.

```sh
npm ci
npm run build
python -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765. Edit `src/game.js` for the Three.js world, then rebuild `game.js`. The committed bundle runs without a CDN. GitHub Pages publishes from `main`, repository root.

## Verify

```sh
npx playwright install chromium
npm test
```

Alternatively set `CHROME_PATH` to an installed Chromium executable. Tests cover island discoveries, saved progress, mobile layout, unavailable WebGL, timer controls, notes export, and bookmark validation.

## Storage and behavior

- Notes, timezone, added links and game discoveries stay in the visitor’s browser local storage. They are not sent to a server or shared with other visitors. Clearing browser data removes them. Notes can be exported as text.
- The timer uses a wall-clock deadline while the page remains open. Reloading resets it. Leaving the tab does not guarantee a background notification.
- Tools are available without completing the game. Reduced-motion settings disable decorative scene movement. Buttons remain usable when WebGL is unavailable.
- The README uses Komarev’s external approximate page-view counter. It does not show unique visitors or people currently online; GitHub caching can delay updates.
- The artwork is One Piece fan art. The 3D scene is built from code. Three.js is distributed under its MIT license, included in `THIRD_PARTY_LICENSES.txt`.
