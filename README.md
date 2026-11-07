# Farmers Field — 3D Prototype

A browser-based, first-person farm exploration game built with Three.js. It takes broad inspiration from the playful farm setting and crop-growth loop of arcade farm games, while using original code, procedural geometry, and a nonviolent cooperative design.

## Current features

- First-person camera with mouse look and pointer lock.
- WASD movement, Shift to run, Space to jump.
- Procedural farm environment with barn, silo, crop rows, hay bales, scarecrows, trees, fences, a dirt path, lighting, shadows, and moving clouds.
- Three friendly farmer NPCs wander around the field. Brief pollen clouds fill their transformation bars; at 100%, a farmer becomes a capybara, rabbit, or chicken helper.
- Animal helpers wander autonomously and plant decorative seedlings.
- Three botanical varieties: corn, sunflower, and pumpkin. Each has a different pollen strength.
- The selected plant is visibly held in the lower-right of the first-person view, with a small hand/sleeve model.
- Explore the farm and press **E** near a glowing plant pickup to harvest it. Each harvested plant adds four seeds of that variety to your pouch.
- Select a seed with **1**, **2**, or **3**. Left-click to sow a seed into the soil; it grows into a plant and releases a short-lived pollen cloud.
- A seed pouch HUD displays the selected plant, pollen ability, plant count, and remaining seed inventory.

## Controls

| Key / input | Action |
| --- | --- |
| W A S D | Move |
| Mouse | Look around |
| Shift | Run |
| Space | Jump |
| E near a glowing plant | Harvest +4 seeds |
| 1 / 2 / 3 | Select corn / sunflower / pumpkin |
| Left mouse button | Sow selected seed |
| Esc | Release mouse / pause |

## Run locally

The project uses Three.js as an ES module from jsDelivr. Serve the folder with a local web server rather than opening the HTML file directly.

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages

To publish the prototype, open the repository's **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/ (root)**, then save. GitHub Pages will publish the site after deployment completes.

## Next ideas

1. Add growth stages and harvest animations to the main crop rows.
2. Add more cooperative farm objectives for the animal helpers.
3. Add simple sound effects, accessibility settings, and performance options.
4. Add more maps and optional online cooperative exploration.

## Tech

- HTML, CSS, JavaScript
- Three.js 0.160.0 (CDN import)
- GitHub Pages hosting

This is a personal learning prototype, not an official Shotgun Farmers product.
