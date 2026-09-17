# The Sunny

A static One Piece fan-themed profile and companion site. The README links to the 3D voyage on GitHub Pages. Public copy describes the owner’s applied AI engineering direction and general Python, TypeScript, interface, integration and testing work. Private repository names, code, business details and review evidence are not included.

## Develop

Requires Node.js and Python 3.

```sh
npm ci
npm run build
python -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765. Edit `src/game.js` for the Three.js world, then rebuild `game.js`. The committed bundle runs without a CDN. GitHub Pages publishes from `main`, repository root.

The public project story is available in [CASE_STUDY.md](CASE_STUDY.md) and `case-study.html`. Keep claims consistent with shipped functionality and actual checks. The case study credits AI assistance and makes no model-training or traffic claims.

## Verify

```sh
npx playwright install chromium
npm test
```

Alternatively set `CHROME_PATH` to an installed Chromium executable. Tests cover island discoveries, saved progress, mobile layout, unavailable WebGL, timer controls, notes export, and bookmark validation.

Run `npm run format` before committing. GitHub Actions checks formatting, rebuilds the game to detect a stale bundle, and runs the browser journeys on pushes and pull requests. Dependabot opens dependency update PRs monthly; updates are not merged automatically.

## Storage and behavior

- Notes, timezone, added links and game discoveries stay in the visitor’s browser local storage. They are not sent to a server or shared with other visitors. Clearing browser data removes them. Notes can be exported as text.
- The timer uses a wall-clock deadline while the page remains open. Reloading resets it. Leaving the tab does not guarantee a background notification.
- Tools are available without completing the game. Reduced-motion settings disable decorative scene movement. Buttons remain usable when WebGL is unavailable.
- The README has no visitor counter. Image counters cannot identify GitHub viewers or exclude the profile owner, so they cannot meet the requirement to count only other accounts.
- The artwork is One Piece fan art. The 3D scene is built from code. Three.js is distributed under its MIT license, included in `THIRD_PARTY_LICENSES.txt`.
