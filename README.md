# Farmers Field — 3D Prototype

A browser-based 3D first-person farm exploration prototype inspired by the playful look and plant-growth ideas of farm arcade games. This is an original, nonviolent project: the environment is generated with procedural geometry and does not use assets or source code from Shotgun Farmers.

## Prototype 001

This first milestone focuses on the playable foundation:

- First-person camera with mouse look and pointer lock.
- WASD movement, Shift to run, and Space to jump.
- A procedural farm environment with a barn, silo, crop rows, hay bales, scarecrows, trees, fence lines, a dirt path, lighting, shadows, and moving clouds.
- A lightweight HUD and start screen.

## Run locally

The project uses Three.js as an ES module from jsDelivr. Because browser module imports are restricted when opening files directly, serve the folder with a local web server.

For example, with Python installed:

\`\`\`bash
python -m http.server 8000
\`\`\`

Then open \`http://localhost:8000\`.

## Controls

| Key / input | Action |
| --- | --- |
| W A S D | Move |
| Mouse | Look around |
| Shift | Run |
| Space | Jump |
| Esc | Release mouse / pause |

## GitHub Pages

To publish the prototype, open the repository's **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/ (root)**, then save. The game will be served from the repository's GitHub Pages URL after deployment completes.

## Roadmap

1. Environment and first-person movement.
2. Seed planting and crop-growth interactions.
3. Garden tools, watering, and harvest feedback.
4. Friendly farm characters and cooperative field challenges.
5. Match flow, scoring, audio, and visual polish.
6. Optional online cooperative play.

## Tech

- HTML, CSS, JavaScript
- Three.js 0.160.0 (CDN import)
- GitHub Pages hosting

This is a personal learning prototype, not an official Shotgun Farmers product.
