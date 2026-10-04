# CONK — Curiosity got loud

A character website built around an interactive Three.js studio, scroll-directed camera movement, a city reveal, a layered CONK/BONK spread, and a verified contract copy action.

The brand identity and contract were checked against https://x.com/conkonbonk and https://www.conk.fun/ on October 4, 2026. The original BONK introduction is linked in the site. No token statistics or unverified social destinations are invented.

## Assets

- `dist/assets/mark.png`: resized official CONK profile image from `https://www.conk.fun/pfp.png`.
- `conk-hero.webp`, `conk-rooftop.webp`, `conk-bonk-duo.webp`: imagegen artwork grounded in official CONK and BONK references; original generation files and prompts are retained in the task workspace.
- `conk-wordmark.webp`: original text sculpture rendered in Blender 5.2.1. The editable `.blend` is retained in the task workspace.
- Display: Bowlby One SC. Body: Space Grotesk. Fonts served locally.
- `conk.glb`: Higgsfield/Meshy image-to-3D generation from the original CONK cutout, 30 credits. Unrigged mesh, approximately 18,588 triangles. Texture downsampling reduced the GLB from 9 MB to 975,620 bytes. Blender 5.2.1 was used to inspect and render the imported model; the editable `.blend` is retained in the task workspace.

Three.js 0.180.0 is bundled locally; its MIT license is included. There are no external runtime requests. The first screen displays a lightweight poster immediately and progressively loads the renderer and model. Below-fold images load lazily. The renderer caps pixel ratio at 1.5 and pauses outside the viewport and when the document is hidden. The OS reduced-motion setting is respected; no motion toggle is presented. WebGL failure retains the poster and its button interaction.

HTML, CSS and page logic are authored in `dist`. Renderer source is in `src/scene.js`; run `npm ci` and `npm run build` to rebuild its bundle. Hosting configuration is in `.openai/hosting.json`. Local desktop/mobile checks cover scene initialization, scroll progress, character reaction, navigation, address copying and horizontal overflow. Browser logs had no errors during these checks. Total static payload is approximately 2.05 MB; this is not an LCP or frame-rate benchmark.

The rooftop scene appears immediately on entry, without an opaque slogan interstitial. Its shorter desktop camera move and compact mobile framing preserve artwork visibility and show both characters.

The closing footer uses a compact normal-flow grid with the full character beside its community action. It has no fixed-height empty panel, negative character offsets or clipped head.
