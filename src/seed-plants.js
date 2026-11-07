import * as THREE from "three";
import { 
  playPlant, playDirectHit, playHarvest, 
  playCornShot, playSunflowerShot, playPumpkinShot, playReload 
} from "./sound.js";

// Shotgun-Farmers-style loop: each plant weapon has its own clip.
// Fire to spend ammo; a miss plants a weapon in the soil.
// Harvest with E to reload. The longer it grew, the more ammo you get.
// No manual reload button — every round came from a harvest.

const palette = {
  corn: 0xe9c34f, sunflower: 0xf2cf55, pumpkin: 0xe98239,
  leaf: 0x5d9149, leafLight: 0x8fb85c, stem: 0x48753c,
};

const weaponInfo = {
  corn: {
    name: "ESPINGARDA DE MILHO",
    ability: "PÓLEN LEVE",
    detail: "Cano duplo. Dispara vários projéteis; recarrega rápido.",
    clipSize: 6, growTime: 9, minYield: 2, maxYield: 6,
    matureScale: 0.55, recoilKick: 0.18, shotSound: playCornShot,
  },
  sunflower: {
    name: "SNIPER DE GIRASSOL",
    ability: "PÓLEN VIVO",
    detail: "Preciso e longo. Um tiro forte; recarga média.",
    clipSize: 2, growTime: 13, minYield: 1, maxYield: 3,
    matureScale: 0.58, recoilKick: 0.22, shotSound: playSunflowerShot,
  },
  pumpkin: {
    name: "LANÇADOR DE ABÓBORA",
    ability: "PÓLEN FORTE",
    detail: "Tubo largo. Projétil explosivo; recarga lenta.",
    clipSize: 1, growTime: 18, minYield: 1, maxYield: 2,
    matureScale: 0.62, recoilKick: 0.32, shotSound: playPumpkinShot,
  },
};

const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.88, ...extra });
const woodMat = mat(0x6b4a2e, { roughness: 0.95 });
const darkWoodMat = mat(0x4a3320, { roughness: 0.95 });
const metalMat = mat(0x8a8a8a, { roughness: 0.4, metalness: 0.7 });
const darkMetalMat = mat(0x3a3a3a, { roughness: 0.5, metalness: 0.6 });
const goldMat = mat(0xf3d96a, { roughness: 0.5, emissive: 0x3a2e10 });
const huskMat = mat(0xa8853a, { roughness: 1 });
const shellMat = mat(0xc44a32, { roughness: 0.55, metalness: 0.3 });
const lensMat = new THREE.MeshStandardMaterial({
  color: 0x88ccee, roughness: 0.1, metalness: 0.9, emissive: 0x224466, emissiveIntensity: 0.6,
});
const soilMat = mat(0x5a402f);

function addPart(root, geometry, material, position, scale = [1, 1, 1], rotation = [0, 0, 0]) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
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

function makeWeaponModel(kind) {
  const root = new THREE.Group();

  if (kind === "corn") {
    for (const side of [-1, 1]) {
      addPart(root, new THREE.CylinderGeometry(0.075, 0.085, 0.75, 10), mat(palette.corn),
        [side * 0.075, 0.03, -0.37], [1, 1, 1], [-Math.PI / 2, 0, 0]);
      for (let i = 0; i < 4; i++) {
        addPart(root, new THREE.TorusGeometry(0.082, 0.012, 4, 10), huskMat,
          [side * 0.075, 0.03, -0.05 - i * 0.18], [1, 1, 1], [Math.PI / 2, 0, 0]);
      }
      addPart(root, new THREE.CylinderGeometry(0.06, 0.06, 0.08, 10), darkMetalMat,
        [side * 0.075, 0.03, -0.76], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    }
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      addPart(root, new THREE.SphereGeometry(0.018, 6, 5), goldMat,
        [Math.cos(angle) * 0.105, 0.03 + Math.sin(angle) * 0.105, -0.18], [1, 1, 0.8]);
    }
    addPart(root, new THREE.BoxGeometry(0.22, 0.14, 0.3), woodMat, [0, 0, 0.05]);
    addPart(root, new THREE.BoxGeometry(0.14, 0.16, 0.45), woodMat, [0, -0.02, 0.28]);
    addPart(root, new THREE.BoxGeometry(0.1, 0.04, 0.35), darkWoodMat, [0, 0.06, 0.28]);
    addPart(root, new THREE.TorusGeometry(0.04, 0.012, 6, 12), darkMetalMat,
      [0, -0.08, 0.02], [1, 1, 1], [Math.PI / 2, 0, 0]);
    addPart(root, new THREE.BoxGeometry(0.015, 0.05, 0.015), metalMat, [0, -0.05, 0.02]);
    addPart(root, new THREE.CylinderGeometry(0.04, 0.05, 0.2, 8), woodMat,
      [0, -0.12, 0.12], [1, 1, 1], [0.4, 0, 0]);
    for (let i = 0; i < 3; i++) {
      addPart(root, new THREE.CylinderGeometry(0.02, 0.02, 0.06, 6), shellMat,
        [0.12, 0, 0.05 + i * 0.08], [1, 1, 1], [0, 0, Math.PI / 2]);
    }
  } else if (kind === "sunflower") {
    addPart(root, new THREE.CylinderGeometry(0.035, 0.045, 1.0, 10), mat(palette.stem),
      [0, 0.02, -0.55], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    addPart(root, new THREE.CylinderGeometry(0.055, 0.055, 0.08, 10), darkMetalMat,
      [0, 0.02, -1.05], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    addPart(root, new THREE.CylinderGeometry(0.045, 0.045, 0.35, 10), darkMetalMat,
      [0, 0.1, -0.15], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    for (const z of [-0.34, 0.04]) {
      addPart(root, new THREE.CylinderGeometry(0.065, 0.055, 0.05, 12), mat(palette.sunflower),
        [0, 0.1, z], [1, 1, 1], [-Math.PI / 2, 0, 0]);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        addPart(root, new THREE.SphereGeometry(0.025, 6, 5), mat(palette.sunflower),
          [Math.cos(a) * 0.065, 0.1 + Math.sin(a) * 0.065, z], [1, 0.4, 1.6]);
      }
    }
    addPart(root, new THREE.CircleGeometry(0.04, 12), lensMat,
      [0, 0.1, 0.065], [1, 1, 1]);
    for (const z of [-0.2, 0]) {
      addPart(root, new THREE.BoxGeometry(0.08, 0.06, 0.02), metalMat, [0, 0.04, z]);
    }
    addPart(root, new THREE.BoxGeometry(0.13, 0.12, 0.35), woodMat, [0, 0, 0.15]);
    addPart(root, new THREE.BoxGeometry(0.1, 0.14, 0.55), woodMat, [0, -0.02, 0.42]);
    addPart(root, new THREE.BoxGeometry(0.07, 0.035, 0.35), darkWoodMat, [0, 0.06, 0.42]);
    addPart(root, new THREE.TorusGeometry(0.035, 0.01, 6, 10), darkMetalMat,
      [0, -0.07, 0.12], [1, 1, 1], [Math.PI / 2, 0, 0]);
    addPart(root, new THREE.BoxGeometry(0.012, 0.04, 0.012), metalMat, [0, -0.05, 0.12]);
    addPart(root, new THREE.CylinderGeometry(0.035, 0.045, 0.18, 8), woodMat,
      [0, -0.1, 0.2], [1, 1, 1], [0.4, 0, 0]);
    for (const side of [-1, 1]) {
      addPart(root, new THREE.CylinderGeometry(0.008, 0.008, 0.15, 4), metalMat,
        [side * 0.06, -0.05, -0.65], [1, 1, 1], [0.5, 0, side * 0.2]);
    }
  } else {
    addPart(root, new THREE.SphereGeometry(0.22, 14, 10), mat(palette.pumpkin),
      [0, 0, -0.2], [1.05, 0.95, 1.05]);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      addPart(root, new THREE.BoxGeometry(0.018, 0.018, 0.42), mat(0xc96a28),
        [Math.cos(a) * 0.21, Math.sin(a) * 0.19, -0.2], [1, 1, 1], [0, 0, a]);
    }
    addPart(root, new THREE.CylinderGeometry(0.13, 0.15, 0.12, 14), mat(0xa0561c),
      [0, 0, -0.44], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    addPart(root, new THREE.CylinderGeometry(0.1, 0.13, 0.05, 14), darkMetalMat,
      [0, 0, -0.51], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    addPart(root, new THREE.CylinderGeometry(0.025, 0.04, 0.12, 6), mat(palette.stem),
      [0, 0.2, -0.15], [1, 1, 1], [0.2, 0, 0]);
    for (let i = 0; i < 5; i++) {
      addPart(root, new THREE.TorusGeometry(0.2, 0.012, 4, 8, Math.PI / 2), mat(palette.stem),
        [0, 0, -0.2], [1, 1, 1], [0, i * 1.3, 0.5]);
    }
    addPart(root, new THREE.BoxGeometry(0.1, 0.1, 0.15), woodMat, [0, -0.18, 0.02]);
    addPart(root, new THREE.TorusGeometry(0.045, 0.012, 6, 12), darkMetalMat,
      [0, -0.22, 0.02], [1, 1, 1], [Math.PI / 2, 0, 0]);
    addPart(root, new THREE.BoxGeometry(0.015, 0.06, 0.015), metalMat, [0, -0.19, 0.02]);
    addPart(root, new THREE.CylinderGeometry(0.05, 0.06, 0.28, 10), woodMat,
      [0, -0.2, 0.12], [1, 1, 1], [0.35, 0, 0]);
    for (const side of [-1, 1]) {
      addPart(root, new THREE.SphereGeometry(0.04, 6, 4), mat(palette.leafLight),
        [side * 0.15, 0.15, -0.35], [0.3, 0.8, 1.4]);
    }
  }

  return root;
}

const weaponGrip = {
  corn: [0, -0.02, -0.3],
  sunflower: [0, -0.02, -0.5],
  pumpkin: [0, -0.15, -0.1],
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

function cropYield(crop) {
  const info = weaponInfo[crop.kind];
  const eased = crop.growth * crop.growth * (3 - 2 * crop.growth);
  const amount = Math.max(1, Math.round(info.minYield + (info.maxYield - info.minYield) * eased));
  const quality = 0.4 + 0.6 * eased;
  return { amount, quality };
}

export function createSeedPlantSystem(scene, camera, showToast, addPollenCloud, tryDirectHit) {
  const choices = document.querySelector("#seed-choices");
  const nameEl = document.querySelector("#seed-name");
  const abilityEl = document.querySelector("#seed-ability");
  const detailEl = document.querySelector("#seed-detail");
  const ammoLabel = document.querySelector("#ammo-count");
  const plantCountLabel = document.querySelector("#plant-count");
  const stockLabel = document.querySelector("#seed-stock");
  const harvestPrompt = document.querySelector("#harvest-prompt");
  const harvestPromptText = document.querySelector("#harvest-prompt-text");

  const growingCrops = [];
  const projectiles = [];
  const pickups = [];
  const ammo = { corn: 6, sunflower: 2, pumpkin: 1 };

  let selected = "corn";
  let shotCooldown = 0;
  let handMotion = 0;
  let elapsed = 0;

  let reloadActive = false;
  let reloadProgress = 0;

  // === Ajustes de visibilidade da arma ===
  // restY subiu de -0.44 para -0.30 (arma mais alta na tela)
  // restZ desceu de -0.84 para -0.62 (arma mais próxima da câmera)
  // restX mudou de 0.44 para 0.32 (arma menos colada na borda direita)
  const heldRoot = new THREE.Group();
  const sleeveMat = mat(0x557c54);
  const gloveMat = mat(0xc49a72);
  const restX = 0.32;
  const restY = -0.30;
  const restZ = -0.62;

  function makeHand() {
    const hand = new THREE.Group();
    addPart(hand, new THREE.CylinderGeometry(0.13, 0.17, 0.43, 9), sleeveMat,
      [0.02, -0.31, 0.16], [1, 1, 0.9], [0.2, 0, -0.2]);
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
  heldRoot.position.set(restX, restY, restZ);
  heldRoot.rotation.set(0.06, -0.14, -0.08);
  // Importante: as armas precisam renderizar por cima da cena para não
  // serem cortadas por objetos próximos (paredes, etc).
  heldRoot.renderOrder = 999;
  heldPlantSlot.renderOrder = 999;
  camera.add(heldRoot);

  function triggerReloadAnimation() {
    reloadActive = true;
    reloadProgress = 0;
  }

  function updateAmmoDisplay() {
    if (ammoLabel) ammoLabel.textContent = `${ammo[selected]} / ${weaponInfo[selected].clipSize}`;
  }

  function updateStock() {
    if (stockLabel) stockLabel.textContent = `🌽 ${ammo.corn}  🌻 ${ammo.sunflower}  🎃 ${ammo.pumpkin}`;
  }

  function updateHeldPlant() {
    heldPlantSlot.clear();
    const model = makeWeaponModel(selected);
    heldPlantSlot.add(model);
    rearHand.position.set(0, 0, 0);
    rearHand.rotation.set(0, 0, 0);
    const grip = weaponGrip[selected];
    frontHand.position.set(grip[0], grip[1], grip[2]);
  }

  function selectType(kind) {
    if (!weaponInfo[kind]) return;
    selected = kind;
    if (nameEl) nameEl.textContent = weaponInfo[kind].name;
    if (abilityEl) abilityEl.textContent = weaponInfo[kind].ability;
    if (detailEl) detailEl.textContent = weaponInfo[kind].detail;
    if (choices) choices.querySelectorAll("[data-seed]").forEach(item =>
      item.classList.toggle("selected", item.dataset.seed === kind));
    updateHeldPlant();
    updateAmmoDisplay();
    showToast(weaponInfo[kind].name + " selecionada · " + ammo[kind] + " munição");
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
    showToast("Arma plantada — volte com E quando crescer!");
  }

  function spawnMuzzleFlash() {
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const flash = new THREE.PointLight(palette[selected], 3.5, 4.5);
    flash.position.copy(camera.position).addScaledVector(dir, 1.3);
    scene.add(flash);
    window.setTimeout(() => scene.remove(flash), 55);
  }

  function shoot() {
    if (shotCooldown > 0 || reloadActive || projectiles.length > 18) return;
    if (ammo[selected] <= 0) {
      showToast("Sem munição! Colha uma planta para recarregar.");
      return;
    }
    ammo[selected] -= 1;
    updateAmmoDisplay();
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
    projectiles.push({ mesh, velocity, age: 0, kind: selected });

    shotCooldown = weaponInfo[selected].recoilKick * 1.2;
    handMotion = 1;
    weaponInfo[selected].shotSound();
    spawnMuzzleFlash();
  }

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
      showToast("Procure uma planta brilhando ou uma arma crescida para colher.");
      return false;
    }
    if (found.kind === "crop") {
      const crop = found.target;
      const { amount, quality } = cropYield(crop);
      ammo[crop.kind] = Math.min(weaponInfo[crop.kind].clipSize, ammo[crop.kind] + amount);
      updateAmmoDisplay();
      updateStock();
      scene.remove(crop.group);
      growingCrops.splice(growingCrops.indexOf(crop), 1);
      if (plantCountLabel) plantCountLabel.textContent = String(growingCrops.length);
      addPollenCloud(new THREE.Vector3(crop.group.position.x, 0.15, crop.group.position.z), crop.kind, quality);
      playHarvest(quality);
      if (crop.kind === selected) triggerReloadAnimation();
      playReload();
      showToast(`Você recarregou ${weaponInfo[crop.kind].name}: +${amount} munição!`);
      return true;
    }
    const pickup = found.target;
    ammo[pickup.kind] = Math.min(weaponInfo[pickup.kind].clipSize, ammo[pickup.kind] + 4);
    scene.remove(pickup.root);
    pickups.splice(pickups.indexOf(pickup), 1);
    updateAmmoDisplay();
    updateStock();
    playHarvest(1);
    if (pickup.kind === selected) triggerReloadAnimation();
    playReload();
    showToast(`Você colheu ${weaponInfo[pickup.kind].name}: +4 munição!`);
    return true;
  }

  makePickup("corn", -3, -14);
  makePickup("sunflower", 22, -28);
  makePickup("pumpkin", 35, -7);
  makePickup("corn", -19, 13);
  makePickup("sunflower", 44, -43);
  makePickup("pumpkin", -43, -2);

  function update(delta, active = false) {
    elapsed += delta;
    shotCooldown = Math.max(0, shotCooldown - delta);
    heldRoot.visible = active;

    if (reloadActive) {
      reloadProgress += delta * 2.6;
      if (reloadProgress >= 2) {
        reloadProgress = 0;
        reloadActive = false;
      }
    }
    const reloadCurve = reloadActive
      ? (reloadProgress < 1 ? reloadProgress : 2 - reloadProgress)
      : 0;

    const sway = Math.sin(elapsed * 2.3) * 0.018;
    const recoil = weaponInfo[selected]?.recoilKick ?? 0.18;

    heldRoot.position.x = restX + reloadCurve * 0.06;
    heldRoot.position.y = restY + sway - handMotion * 0.045 - reloadCurve * 0.18;
    heldRoot.position.z = restZ + handMotion * 0.07 + reloadCurve * 0.05;
    heldRoot.rotation.x = 0.06 + handMotion * recoil + reloadCurve * 0.55;
    heldRoot.rotation.y = -0.14 - reloadCurve * 0.1;
    heldRoot.rotation.z = -0.08 + reloadCurve * 0.25;

    handMotion = Math.max(0, handMotion - delta * 3.8);

    for (const pickup of pickups) {
      pickup.root.position.y = pickup.baseY + Math.sin(elapsed * 2 + pickup.phase) * 0.12;
      pickup.root.rotation.y += delta * 0.55;
    }

    for (const crop of growingCrops) {
      const info = weaponInfo[crop.kind];
      if (crop.growth < 1) {
        crop.growth = Math.min(1, crop.growth + delta / info.growTime);
        const eased = crop.growth * crop.growth * (3 - 2 * crop.growth);
        crop.plantModel.scale.setScalar(0.06 + eased * (info.matureScale - 0.06));
        if (Math.abs(crop.growth - crop.ringDrawnAt) > 0.025 || crop.growth >= 1) {
          crop.ring.geometry.dispose();
          crop.ring.geometry = new THREE.RingGeometry(0.4, 0.56, 24, 1, -Math.PI / 2, Math.max(0.001, crop.growth * Math.PI * 2));
          crop.ringDrawnAt = crop.growth;
        }
        if (crop.growth >= 1) crop.matured = true;
      } else {
        const pulse = 1 + Math.sin(elapsed * 2.4 + crop.group.position.x) * 0.035;
        crop.plantModel.scale.setScalar(info.matureScale * pulse);
        crop.ring.material.opacity = 0.75 + Math.sin(elapsed * 2.4 + crop.group.position.x) * 0.2;
      }
    }

    const found = active ? nearestHarvestable(camera.position) : null;
    if (harvestPrompt) {
      harvestPrompt.classList.toggle("visible", !!found);
      if (found && harvestPromptText) {
        if (found.kind === "crop") {
          const { amount } = cropYield(found.target);
          const early = found.target.growth < 1 ? " · AINDA CRESCENDO" : "";
          harvestPromptText.textContent = `COLHER ${weaponInfo[found.target.kind].name} · +${amount}${early}`;
        } else {
          harvestPromptText.textContent = `COLHER ${weaponInfo[found.target.kind].name} · +4`;
        }
      }
    }

    for (let i = projectiles.length - 1; i >= 0; i--) {
      const seed = projectiles[i];
      seed.age += delta;
      seed.velocity.y -= 7.2 * delta;
      seed.mesh.position.addScaledVector(seed.velocity, delta);
      seed.mesh.rotation.x += delta * 5;
      seed.mesh.rotation.z += delta * 3;

      if (tryDirectHit && seed.mesh.position.y < 2.5 && tryDirectHit(seed.mesh.position, seed.kind)) {
        scene.remove(seed.mesh);
        projectiles.splice(i, 1);
        playDirectHit();
        continue;
      }

      if (seed.mesh.position.y <= 0.12 || seed.age >= 4.4) {
        const x = THREE.MathUtils.clamp(seed.mesh.position.x, -75, 75);
        const z = THREE.MathUtils.clamp(seed.mesh.position.z, -75, 75);
        scene.remove(seed.mesh);
        plantCrop(x, z, seed.kind);
        projectiles.splice(i, 1);
      }
    }
  }

  selectType("corn");
  updateStock();
  updateAmmoDisplay();
  return { update, shoot, selectType, interact, getPlantCount: () => growingCrops.length };
    }
