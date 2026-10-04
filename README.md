# CONK — Curiosity got loud

A standalone character website with native browser animation, a scroll-directed rooftop scene, interactive character reactions, optional synthesized sound, and a verified contract copy action.

The brand identity and contract were checked against https://x.com/conkonbonk and https://www.conk.fun/ on October 4, 2026. The original BONK introduction is linked in the site. No token statistics or unverified social destinations are invented.

## Assets

- `dist/assets/mark.png`: resized official CONK profile image from `https://www.conk.fun/pfp.png`.
- `conk-hero.webp`, `conk-rooftop.webp`, `conk-bonk-duo.webp`: imagegen artwork grounded in official CONK and BONK references; original generation files and prompts are retained in the task workspace.
- `conk-wordmark.webp`: original text sculpture rendered in Blender 5.2.1. The editable `.blend` is retained in the task workspace.
- Display: Bowlby One SC. Body: Space Grotesk. Fonts served locally.

There are no framework dependencies or external runtime requests. Below-fold images load lazily. Continuous animations pause outside the viewport and when the document is hidden. The OS reduced-motion setting is respected; no motion toggle is presented.

Static output is authored directly in `dist`. Hosting configuration is in `.openai/hosting.json`.
