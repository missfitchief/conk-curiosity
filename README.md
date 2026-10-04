# CONK — Curiosity got loud

Character website with a rigged Three.js opening, animated rooftop and friendship films, and a rigged 3D footer. All four scenes have actual character motion. The opening retains its scroll-directed leap, spin and landing; the films loop automatically while visible and their buttons replay them.

Brand identity, community links and the contract address were checked against https://x.com/conkonbonk and https://www.conk.fun/ on October 4, 2026. No invented token statistics or social destinations.

## Media and provenance

- Official CONK profile image is served locally as `dist/assets/mark.png`.
- `conk-rigged.glb`: 1,100,328 bytes, 18,588 triangles, 13 bones. The original Higgsfield/Meshy character cost 30 credits. This local rig preserves all original geometry, UVs and texture buffers and adds independent head, paw, tail and punctuation motion. The hero and footer share resources with independent skeletons. Rig source, weights and Blender verification are retained under `work/conk-rig-audit` in the task workspace.
- Rooftop film: 595,158 bytes. CONK hops and swishes its tail; BONK gestures toward the moving dinosaur and skyline. BONK's approved rear-facing head, body and arm direction is preserved.
- Friendship film: 634,366 bytes. CONK hops, turns and reacts while BONK independently moves its head and bat. The approved character designs are grounded in the original CONK/BONK artwork.
- Both films use Wan 3.0, matching start/end image references, six seconds, silent 720p. Quoted generation cost: 10.5 credits each, 21 total. Runtime delivery uses H.264, 1280×720, 24fps and faststart. Prompts, job IDs and final delivery metadata are retained under `work/conk-motion-reference/final-provenance.json`.
- Artwork and start/end images use built-in imagegen. Original sources and exact prompts remain in the task workspace. The first-screen and film posters are local WebP images.
- Locally served Bowlby One SC and Space Grotesk fonts. Three.js 0.180.0 is bundled with its MIT license.

## Runtime and build

The first screen shows its lightweight poster immediately. It progressively loads the Three.js bundle and rig. Videos have no source URL until they approach the viewport, pause offscreen or when hidden, and show a poster until an actual decoded frame is painted. Video and WebGL failures retain posters. The operating system's reduced-motion preference produces static artwork without a motion toggle. There are no external runtime requests.

Hero rendering caps pixel ratio at 1.5; the footer caps it at 1.25. Both render loops pause outside the viewport and when the page is hidden. Scroll layout reads and style writes are batched. Hero keyboard rotation, replay buttons, community links and contract copying are supported.

HTML and CSS are authored in `dist`; JavaScript sources are in `src`. Run `npm ci` and `npm run build` to rebuild the renderer, page runtime and content versions. Hosting configuration is in `.openai/hosting.json`. Desktop and phone browser checks verify model/film initialization, progressing playback, offscreen pausing, replay actions, footer response, address copying and horizontal fit. These checks are not an LCP or frame-rate benchmark.
