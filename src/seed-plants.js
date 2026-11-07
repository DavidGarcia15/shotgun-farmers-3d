import * as THREE from "three";
import { playPlant, playDirectHit, playHarvest } from "./sound.js";

// A nonviolent Shotgun-Farmers-style loop: seeds you throw are both ammo and crop.
// Hit a farmer directly and the seed is spent at once as a burst of pollen.
// Miss, and it lands, takes root, and grows — the longer you let it grow before
// harvesting with E, the more seeds (and the stronger the pollen) you get back.
// There is no manual reload: every seed in your pouch came from a harvest.

const palette = {
  corn: 0xe9c34f, sunflower: 0xf2cf55, pumpkin: 0xe98239,
  leaf: 0x5d9149, leafLight: 0x8fb85c, stem: 0x48753c,
};
const descriptions = {
  corn: { name: "MILHO", ability: "PÓLEN LEVE", detail: "Cresce rápido (9s). Pólen leve, poucas sementes por colheita.", strength: "18%" },
  sunflower: { name: "GIRASSOL", ability: "PÓLEN VIVO", detail: "Crescimento médio (13s). Equilíbrio entre pólen e sementes.", strength: "32%" },
  pumpkin: { name: "ABÓBORA", ability: "PÓLEN FORTE", detail: "Crescimento lento (18s). Pólen forte, colheita mais farta.", strength: "48%" },
};
// Growth duration to reach full maturity, seed yield range (early vs. full harvest),
// and the mature display scale — each variety plays like a different "weapon class".
const kindConfig = {
  corn: { growTime: 9, minYield: 1, maxYield: 4, matureScale: 0.55, recoilKick: 0.15 },
  sunflower: { growTime: 13, minYield: 1, maxYield: 5, matureScale: 0.58, recoilKick: 0.19 },
  pumpkin: { growTime: 18, minYield: 2, maxYield: 7, matureScale: 0.62, recoilKick: 0.29 },
};
const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.88, ...extra });
const soilMat = mat(0x5a402f);

function addPart(root, geometry, material, position, scale = [1, 1, 1], rotation = [0, 0, 0]) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  root.add(mesh);
  return mesh;
}

function makePlant(kind) {
  const root = new THREE.Group();
  const stem = mat(palette.stem);
  const leaf = mat(palette.leaf);
  const light = mat(palette.leafLight);
  if (kind === "corn") {
    addPart(root, new THREE.CylinderGeometry(0.08, 0.12, 1.5, 7), stem, [0, 0.75, 0]);
    for (const side of [-1, 1]) addPart(root, new THREE.SphereGeometry(0.38, 9, 7), leaf, [side * 0.28, 0.65, 0], [0.8, 0.18, 0.4]);
    addPart(root, new THREE.CapsuleGeometry(0.12, 0.4, 3, 7), mat(palette.corn), [0.18, 1.05, -0.1]);
  } else if (kind === "sunflower") {
    addPart(root, new THREE.CylinderGeometry(0.07, 0.1, 1.5, 7), stem, [0, 0.75, 0]);
    for (const side of [-1, 1]) addPart(root, new THREE.SphereGeometry(0.3, 9, 7), light, [side * 0.27, 0.55, 0], [0.9, 0.18, 0.48]);
    for (let i = 0; i < 10; i++) {
      const a = i * Math.PI * 2 / 10;
      addPart(root, new THREE.SphereGeometry(0.18, 8, 6), mat(palette.sunflower), [Math.cos(a) * 0.34, 1.62 + Math.sin(a) * 0.34, 0], [0.75, 1.1, 0.55]);
    }
    addPart(root, new THREE.SphereGeometry(0.27, 10, 8), mat(0x65452d), [0, 1.62, 0.03]);
  } else {
    addPart(root, new THREE.SphereGeometry(0.56, 12, 9), mat(palette.pumpkin), [0, 0.5, 0], [1.1, 0.9, 1]);
    addPart(root, new THREE.CylinderGeometry(0.04, 0.06, 0.25, 6), stem, [0, 1.05, 0]);
    addPart(root, new THREE.SphereGeometry(0.25, 8, 6), light, [0.3, 0.98, 0], [1, 0.18, 0.5]);
  }
  return root;
}

// Original, from-scratch weapon silhouettes for the first-person view — not
// modeled on any existing game's designs, just built to read as the "weapon
// class" each variety's growth stats already imply: corn short & wide (fast,
// light), sunflower long & slender (balanced), pumpkin bulky & round (slow,
// heavy). Local space: origin is the grip, -Z is the muzzle direction, +Y is up.
function makeWeaponModel(kind) {
  const root = new THREE.Group();
  const stem = mat(palette.stem);
  const leaf = mat(palette.leaf);
  const light = mat(palette.leafLight);
  const dark = mat(0x3c2c1c);

  if (kind === "corn") {
    addPart(root, new THREE.CylinderGeometry(0.095, 0.11, 0.52, 10), mat(palette.corn),
      [0, 0.02, -0.26], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    for (let ring = 0; ring < 2; ring++) {
      const z = -0.1 - ring * 0.28;
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2 + ring * 0.3;
        addPart(root, new THREE.SphereGeometry(0.026, 6, 5), mat(0xf3d96a),
          [Math.cos(a) * 0.1, 0.02 + Math.sin(a) * 0.1, z]);
      }
    }
    for (const side of [-1, 1]) {
      const fin = addPart(root, new THREE.SphereGeometry(0.2, 8, 6), leaf,
        [side * 0.11, 0.04, 0.1], [0.3, 1, 1.3]);
      fin.rotation.y = side * 0.55;
    }
    addPart(root, new THREE.CylinderGeometry(0.042, 0.055, 0.24, 7), stem,
      [0, -0.13, 0.1], [1, 1, 1], [0.5, 0, 0]);
    addPart(root, new THREE.CylinderGeometry(0.1, 0.1, 0.03, 10), dark,
      [0, 0.02, -0.535], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    addPart(root, new THREE.ConeGeometry(0.045, 0.14, 6), mat(0xe9dcb0),
      [0, 0.06, -0.6], [1, 1, 1], [-Math.PI / 2 + 0.25, 0, 0]);
  } else if (kind === "sunflower") {
    addPart(root, new THREE.CylinderGeometry(0.045, 0.058, 0.88, 9), stem,
      [0, 0.01, -0.44], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    addPart(root, new THREE.SphereGeometry(0.095, 10, 8), mat(0x65452d), [0, 0.13, 0.07]);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      addPart(root, new THREE.SphereGeometry(0.06, 7, 6), mat(palette.sunflower),
        [Math.cos(a) * 0.13, 0.13 + Math.sin(a) * 0.13, 0.07], [0.8, 1, 0.4]);
    }
    for (const side of [-1, 1]) {
      const fin = addPart(root, new THREE.SphereGeometry(0.15, 8, 6), light,
        [side * 0.065, -0.03, 0.15], [0.3, 0.9, 1.1]);
      fin.rotation.z = side * 0.32;
    }
    addPart(root, new THREE.BoxGeometry(0.018, 0.022, 0.46), dark, [0, 0.055, -0.3]);
    addPart(root, new THREE.CylinderGeometry(0.05, 0.05, 0.022, 8), dark,
      [0, 0.01, -0.875], [1, 1, 1], [-Math.PI / 2, 0, 0]);
  } else {
    addPart(root, new THREE.CylinderGeometry(0.19, 0.2, 0.3, 12), mat(palette.pumpkin),
      [0, 0, -0.15], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    addPart(root, new THREE.SphereGeometry(0.2, 12, 9), mat(palette.pumpkin),
      [0, 0, -0.32], [1, 0.9, 0.9]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      addPart(root, new THREE.BoxGeometry(0.022, 0.02, 0.3), mat(0xc96a28),
        [Math.cos(a) * 0.195, Math.sin(a) * 0.195, -0.15], [1, 1, 1], [0, 0, a]);
    }
    addPart(root, new THREE.CylinderGeometry(0.042, 0.058, 0.26, 8), stem,
      [0, -0.15, 0.09], [1, 1, 1], [0.4, 0, 0]);
    addPart(root, new THREE.CylinderGeometry(0.018, 0.032, 0.09, 6), stem, [0, 0.19, -0.28]);
  }
  return root;
}

// Where the front (support) hand grips each weapon — the rear/trigger hand
// always grips the grip cylinder near the local origin, above.
const weaponGrip = {
  corn: [0, 0.04, -0.29],
  sunflower: [0, 0.015, -0.49],
  pumpkin: [0, 0.0, -0.16],
};

function makeGrowthRing(kind) {
  const ringMat = new THREE.MeshBasicMaterial({
    color: palette[kind], transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false,
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.56, 24, 1, -Math.PI / 2, 0.001), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.035;
  return ring;
}

// How many seeds (and how strong the released pollen) a crop yields right now —
// shared by the actual harvest and by the live HUD preview, so they always agree.
function cropYield(crop) {
  const config = kindConfig[crop.kind];
  const eased = crop.growth * crop.growth * (3 - 2 * crop.growth);
  const amount = Math.max(1, Math.round(config.minYield + (config.maxYield - config.minYield) * eased));
  const quality = 0.4 + 0.6 * eased;
  return { amount, quality };
}

export function createSeedPlantSystem(scene, camera, showToast, addPollenCloud, tryDirectHit) {
  const choices = document.querySelector("#seed-choices");
  const name = document.querySelector("#seed-name");
  const ability = document.querySelector("#seed-ability");
  const detail = document.querySelector("#seed-detail");
  const plantCountLabel = document.querySelector("#plant-count");
  const readyCountLabel = document.querySelector("#ready-count");
  const stockLabel = document.querySelector("#seed-stock");
  const harvestPrompt = document.querySelector("#harvest-prompt");
  const harvestPromptText = document.querySelector("#harvest-prompt-text");
  const growingCrops = [];
  const seeds = [];
  const pickups = [];
  const inventory = { corn: 5, sunflower: 3, pumpkin: 2 };
  let selected = "corn";
  let seedCooldown = 0;
  let handMotion = 0;
  let elapsed = 0;

  // First-person two-handed grip, parented to the camera: a rear (trigger)
  // hand near the weapon's grip, and a front (support) hand further along
  // the barrel. Both reuse the same glove/sleeve build; only their position
  // on the weapon changes per variety, in updateHeldPlant() below.
  const heldRoot = new THREE.Group();
  const sleeveMat = mat(0x557c54);
  const gloveMat = mat(0xc49a72);
  const restY = -0.44;
  const restZ = -0.84;

  function makeHand() {
    const hand = new THREE.Group();
    addPart(hand, new THREE.CylinderGeometry(0.13, 0.17, 0.43, 9), sleeveMat,
      [0.02, -0.31, 0.16], [1, 1, 0.9], [0.2, 0, -0.2]);
    // Palm and curled fingers create a readable grip around the weapon.
    addPart(hand, new THREE.SphereGeometry(0.16, 10, 8), gloveMat,
      [0.015, -0.075, -0.015], [1.08, 0.78, 0.82]);
    for (let finger = 0; finger < 3; finger++) {
      addPart(hand, new THREE.CapsuleGeometry(0.043, 0.12, 3, 6), gloveMat,
        [-0.09 + finger * 0.085, -0.13, -0.105], [1, 1, 1],
        [0.28, 0, (finger - 1) * 0.16]);
    }
    addPart(hand, new THREE.CapsuleGeometry(0.05, 0.12, 3, 6), gloveMat,
      [0.13, -0.045, -0.035], [1, 1, 1], [0.15, 0, -0.72]);
    return hand;
  }

  const rearHand = makeHand();
  const frontHand = makeHand();
  frontHand.scale.setScalar(0.88);
  frontHand.rotation.y = 0.15;
  heldRoot.add(rearHand, frontHand);

  const heldPlantSlot = new THREE.Group();
  heldRoot.add(heldPlantSlot);
  heldRoot.position.set(0.44, restY, restZ);
  heldRoot.rotation.set(0.04, -0.12, -0.12);
  camera.add(heldRoot);

  function updateStock() {
    if (stockLabel) stockLabel.textContent = `🌽 ${inventory.corn}  🌻 ${inventory.sunflower}  🎃 ${inventory.pumpkin}`;
  }

  function updateHeldPlant() {
    heldPlantSlot.clear();
    const model = makeWeaponModel(selected);
    heldPlantSlot.add(model);
    // Rear hand always wraps the grip near the origin; the front hand slides
    // out to wherever is natural to support this particular weapon's barrel.
    rearHand.position.set(0, 0, 0);
    rearHand.rotation.set(0, 0, 0);
    const grip = weaponGrip[selected];
    frontHand.position.set(grip[0], grip[1], grip[2]);
  }

  function selectType(kind) {
    if (!descriptions[kind]) return;
    selected = kind;
    if (name) name.textContent = descriptions[kind].name;
    if (ability) ability.textContent = descriptions[kind].ability;
    if (detail) detail.textContent = descriptions[kind].detail;
    if (choices) choices.querySelectorAll("[data-seed]").forEach(item => item.classList.toggle("selected", item.dataset.seed === kind));
    updateHeldPlant();
    showToast(descriptions[kind].name + " selecionado · " + inventory[kind] + " sementes");
  }

  function makePickup(kind, x, z) {
    const root = new THREE.Group();
    const plant = makePlant(kind);
    plant.scale.setScalar(0.55);
    plant.position.y = 0.08;
    root.add(plant);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.72, 0.045, 6, 24),
      new THREE.MeshBasicMaterial({ color: palette[kind], transparent: true, opacity: 0.8 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.08;
    root.add(ring);
    root.position.set(x, 0, z);
    scene.add(root);
    pickups.push({ root, kind, baseY: 0, phase: Math.random() * Math.PI * 2 });
  }

  // A missed seed takes root here: it will not give you anything until you come
  // back and harvest it with E. The longer it grows, the more it is worth.
  function plantCrop(x, z, kind) {
    if (growingCrops.length >= 22) {
      const oldest = growingCrops.shift();
      scene.remove(oldest.group);
    }
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.07, 10), soilMat);
    soil.position.y = 0.015;
    soil.receiveShadow = true;
    group.add(soil);
    const ring = makeGrowthRing(kind);
    group.add(ring);
    const plantModel = makePlant(kind);
    plantModel.position.y = 0.02;
    plantModel.scale.setScalar(0.06);
    group.add(plantModel);
    scene.add(group);
    growingCrops.push({ group, ring, plantModel, kind, growth: 0, ringDrawnAt: -1, matured: false });
    if (plantCountLabel) plantCountLabel.textContent = String(growingCrops.length);
    playPlant();
    showToast("Semente plantada — volte com E quando crescer!");
  }

  function sowSeed() {
    if (seedCooldown > 0 || seeds.length > 18) return;
    if (inventory[selected] <= 0) {
      showToast("Sem sementes desse tipo — colha uma plantação para repor!");
      return;
    }
    inventory[selected] -= 1;
    updateStock();
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    const origin = camera.position.clone().addScaledVector(direction, 0.72);
    const velocity = direction.multiplyScalar(12.5).add(new THREE.Vector3(0, 2.2, 0));
    const color = palette[selected];
    const mesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(selected === "pumpkin" ? 0.19 : 0.13, 0),
      new THREE.MeshStandardMaterial({ color, roughness: 0.65, emissive: color, emissiveIntensity: 0.1 })
    );
    mesh.position.copy(origin);
    scene.add(mesh);
    seeds.push({ mesh, velocity, age: 0, kind: selected });
    seedCooldown = selected === "pumpkin" ? 0.8 : selected === "sunflower" ? 0.55 : 0.32;
    handMotion = 1;
  }

  // Looks across both wild pickups and your own growing crops, and returns the
  // nearest harvestable thing plus what harvesting it right now would be worth.
  function nearestHarvestable(position) {
    let best = null;
    let bestKind = "pickup";
    let bestDistance = 3.25;
    for (const pickup of pickups) {
      const distance = Math.hypot(position.x - pickup.root.position.x, position.z - pickup.root.position.z);
      if (distance < bestDistance) { bestDistance = distance; best = pickup; bestKind = "pickup"; }
    }
    for (const crop of growingCrops) {
      const distance = Math.hypot(position.x - crop.group.position.x, position.z - crop.group.position.z);
      if (distance < bestDistance) { bestDistance = distance; best = crop; bestKind = "crop"; }
    }
    return best ? { target: best, kind: bestKind } : null;
  }

  function interact(playerPosition) {
    const found = nearestHarvestable(playerPosition);
    if (!found) {
      showToast("Procure uma planta brilhando ou uma plantação crescida para colher.");
      return false;
    }
    if (found.kind === "crop") {
      const crop = found.target;
      const { amount, quality } = cropYield(crop);
      inventory[crop.kind] += amount;
      updateStock();
      scene.remove(crop.group);
      growingCrops.splice(growingCrops.indexOf(crop), 1);
      if (plantCountLabel) plantCountLabel.textContent = String(growingCrops.length);
      addPollenCloud(new THREE.Vector3(crop.group.position.x, 0.15, crop.group.position.z), crop.kind, quality);
      playHarvest(quality);
      showToast(`Você colheu ${descriptions[crop.kind].name}: +${amount} sementes!`);
      return true;
    }
    const pickup = found.target;
    inventory[pickup.kind] += 4;
    scene.remove(pickup.root);
    pickups.splice(pickups.indexOf(pickup), 1);
    updateStock();
    playHarvest(1);
    showToast(`Você colheu ${descriptions[pickup.kind].name}: +4 sementes!`);
    return true;
  }

  // Scattered harvest spots make exploration useful and replenish the seed pouch.
  makePickup("corn", -3, -14);
  makePickup("sunflower", 22, -28);
  makePickup("pumpkin", 35, -7);
  makePickup("corn", -19, 13);
  makePickup("sunflower", 44, -43);
  makePickup("pumpkin", -43, -2);

  function update(delta, active = false) {
    elapsed += delta;
    seedCooldown = Math.max(0, seedCooldown - delta);
    heldRoot.visible = active;
    const sway = Math.sin(elapsed * 2.3) * 0.018;
    const recoil = kindConfig[selected]?.recoilKick ?? 0.18;
    heldRoot.position.y = restY + sway - handMotion * 0.045;
    heldRoot.position.z = restZ + handMotion * 0.07;
    heldRoot.rotation.x = 0.08 + handMotion * recoil;
    handMotion = Math.max(0, handMotion - delta * 3.8);

    for (const pickup of pickups) {
      pickup.root.position.y = pickup.baseY + Math.sin(elapsed * 2 + pickup.phase) * 0.12;
      pickup.root.rotation.y += delta * 0.55;
    }

    // Grow each planted crop toward maturity; the progress ring fills as a pie
    // chart of how close it is, and a mature crop idles with a gentle pulse.
    for (const crop of growingCrops) {
      const config = kindConfig[crop.kind];
      if (crop.growth < 1) {
        crop.growth = Math.min(1, crop.growth + delta / config.growTime);
        const eased = crop.growth * crop.growth * (3 - 2 * crop.growth);
        crop.plantModel.scale.setScalar(0.06 + eased * (config.matureScale - 0.06));
        if (Math.abs(crop.growth - crop.ringDrawnAt) > 0.025 || crop.growth >= 1) {
          crop.ring.geometry.dispose();
          crop.ring.geometry = new THREE.RingGeometry(0.4, 0.56, 24, 1, -Math.PI / 2, Math.max(0.001, crop.growth * Math.PI * 2));
          crop.ringDrawnAt = crop.growth;
        }
        if (crop.growth >= 1) crop.matured = true;
      } else {
        const pulse = 1 + Math.sin(elapsed * 2.4 + crop.group.position.x) * 0.035;
        crop.plantModel.scale.setScalar(config.matureScale * pulse);
        crop.ring.material.opacity = 0.75 + Math.sin(elapsed * 2.4 + crop.group.position.x) * 0.2;
      }
    }
    if (readyCountLabel) readyCountLabel.textContent = String(growingCrops.filter(c => c.growth >= 1).length);

    // On-screen harvest prompt: shows what E would give you right now, for
    // both wild pickups and your own crops, so the choice to harvest early is informed.
    const found = active ? nearestHarvestable(camera.position) : null;
    if (harvestPrompt) {
      harvestPrompt.classList.toggle("visible", !!found);
      if (found && harvestPromptText) {
        if (found.kind === "crop") {
          const { amount } = cropYield(found.target);
          const early = found.target.growth < 1 ? " · AINDA CRESCENDO" : "";
          harvestPromptText.textContent = `COLHER ${descriptions[found.target.kind].name} · +${amount}${early}`;
        } else {
          harvestPromptText.textContent = `COLHER ${descriptions[found.target.kind].name} · +4`;
        }
      }
    }

    for (let i = seeds.length - 1; i >= 0; i--) {
      const seed = seeds[i];
      seed.age += delta;
      seed.velocity.y -= 7.2 * delta;
      seed.mesh.position.addScaledVector(seed.velocity, delta);
      seed.mesh.rotation.x += delta * 5;
      seed.mesh.rotation.z += delta * 3;

      // A direct hit on a farmer spends the seed instantly as pollen — no plant
      // grows from it, mirroring "hit the target and there is no leftover seed".
      if (tryDirectHit && seed.mesh.position.y < 2.5 && tryDirectHit(seed.mesh.position, seed.kind)) {
        scene.remove(seed.mesh);
        seeds.splice(i, 1);
        playDirectHit();
        continue;
      }

      if (seed.mesh.position.y <= 0.12 || seed.age >= 4.4) {
        const x = THREE.MathUtils.clamp(seed.mesh.position.x, -75, 75);
        const z = THREE.MathUtils.clamp(seed.mesh.position.z, -75, 75);
        scene.remove(seed.mesh);
        plantCrop(x, z, seed.kind);
        seeds.splice(i, 1);
      }
    }
  }

  selectType("corn");
  updateStock();
  return { update, throwSeed: sowSeed, sowSeed, selectType, interact, getPlantCount: () => growingCrops.length };
}
