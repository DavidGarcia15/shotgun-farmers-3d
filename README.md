# Farmers Field — 3D Prototype

A browser-based, first-person farm exploration game built with Three.js. It takes broad inspiration from the playful farm setting and crop-growth loop of arcade farm games, while using original code, procedural geometry, and a nonviolent cooperative design.

## Current features

- First-person camera with mouse look and pointer lock.
- WASD movement, Shift to run, Space to jump.
- Procedural farm environment with barn, silo, crop rows, hay bales, scarecrows, trees, fences, a dirt path, lighting, shadows, and moving clouds.
- Three friendly farmer NPCs wander around the field. Pollen fills their transformation bars; at 100%, a farmer becomes a capybara, rabbit, or chicken helper.
- Animal helpers wander autonomously and plant decorative seedlings.
- Three botanical varieties — corn, sunflower, and pumpkin — each a different "weapon class": corn grows fast with a light yield, sunflower is balanced, and pumpkin is slow but pays off with a bigger harvest and stronger pollen.
- **Shotgun-Farmers-style sow/harvest loop, adapted to be nonviolent:**
  - Hit a farmer directly with a thrown seed and it is spent on the spot as an instant, single-target pollen burst — no plant grows from it.
  - Miss, and the seed takes root where it lands. It grows through visible stages over several seconds, shown by a radial progress ring, and must be harvested with **E** — it gives nothing on its own.
  - The longer a crop is left to grow before harvesting, the more seeds (and the stronger the released pollen cloud) it yields; harvesting early is faster but worth less. There is no manual reload — every seed in your pouch came from a harvest.
- Each variety has its own original, from-scratch weapon silhouette — not modeled on any existing game — reinforcing its "weapon class": corn is a short, wide husk-wrapped blaster; sunflower a long, slender rifle with its flower head as a scope; pumpkin a bulky, ridged launcher drum. Held two-handed in the lower-right of the first-person view, with a rear (trigger) hand and a front (support) hand gripping the barrel, plus a per-variety recoil kick on throw.
- Explore the farm and press **E** near a glowing plant pickup to harvest it. Each harvested pickup adds four seeds of that variety to your pouch.
- Select a seed with **1**, **2**, or **3**. Left-click to sow a seed into the soil.
- An on-screen prompt near the crosshair previews exactly how many seeds **E** will give you before you commit to harvesting.
- A seed pouch HUD displays the selected plant, pollen ability, growing/ready crop counts, and remaining seed inventory.
- Small procedural sound effects (Web Audio, no external files) for planting, direct hits, harvesting, and farmer transformations.

## Controls

| Key / input | Action |
| --- | --- |
| W A S D | Move |
| Mouse | Look around |
| Shift | Run |
| Space | Jump |
| E near a glowing pickup or a grown crop | Harvest (+4 from a pickup; variable from a crop, based on growth) |
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

1. Give each weapon a distinct throw arc/projectile shape to match its silhouette, and a matching world-space pickup/crop model (currently the ground crops keep the simpler, naturalistic growing-plant look on purpose, separate from the in-hand weapon design).
2. Add more cooperative farm objectives for the animal helpers, and let them harvest player-grown crops too.
3. Accessibility settings and performance options.
4. Add more maps and optional online cooperative exploration (would need an authoritative server to sync thrown seeds, growing crops, and NPC state across players).

## Tech

- HTML, CSS, JavaScript
- Three.js 0.160.0 (CDN import)
- GitHub Pages hosting

This is a personal learning prototype, not an official Shotgun Farmers product.
