import * as THREE from "three";

// A nonviolent farm loop: collect botanical supplies, hold a plant, sow a seed,
// and let its brief pollen cloud help nearby farmers become animal companions.

const palette = {
  corn: 0xe9c34f, sunflower: 0xf2cf55, pumpkin: 0xe98239,
  leaf: 0x5d9149, leafLight: 0x8fb85c, stem: 0x48753c,
};
const descriptions = {
  corn: { name: "MILHO", ability: "PÓLEN LEVE", detail: "Nuvem curta; preenche um pouco da barra.", strength: "18%" },
  sunflower: { name: "GIRASSOL", ability: "PÓLEN VIVO", detail: "Nuvem média; preenche mais a barra.", strength: "32%" },
  pumpkin: { name: "ABÓBORA", ability: "PÓLEN FORTE", detail: "Nuvem potente; semeadura mais lenta.", strength: "48%" },
};
const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.88, ...extra });

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

export function createSeedPlantSystem(scene, camera, showToast, addPollenCloud) {
  const choices = document.querySelector("#seed-choices");
  const name = document.querySelector("#seed-name");
  const ability = document.querySelector("#seed-ability");
  const detail = document.querySelector("#seed-detail");
  const plantCountLabel = document.querySelector("#plant-count");
  const stockLabel = document.querySelector("#seed-stock");
  const plants = [];
  const seeds = [];
  const pickups = [];
  const inventory = { corn: 5, sunflower: 3, pumpkin: 2 };
  let selected = "corn";
  let seedCooldown = 0;
  let handMotion = 0;
  let elapsed = 0;

  // First-person hand holding the selected plant, parented to the camera.
  // The glove, fingers and plant stay in view while the player explores.
  const heldRoot = new THREE.Group();
  const sleeveMat = mat(0x557c54);
  const gloveMat = mat(0xc49a72);
  addPart(heldRoot, new THREE.CylinderGeometry(0.13, 0.17, 0.43, 9), sleeveMat,
    [0.02, -0.31, 0.16], [1, 1, 0.9], [0.2, 0, -0.2]);
  // Palm and curled fingers create a readable grip around the plant stem.
  addPart(heldRoot, new THREE.SphereGeometry(0.16, 10, 8), gloveMat,
    [0.015, -0.075, -0.015], [1.08, 0.78, 0.82]);
  for (let finger = 0; finger < 3; finger++) {
    addPart(heldRoot, new THREE.CapsuleGeometry(0.043, 0.12, 3, 6), gloveMat,
      [-0.09 + finger * 0.085, -0.13, -0.105], [1, 1, 1],
      [0.28, 0, (finger - 1) * 0.16]);
  }
  addPart(heldRoot, new THREE.CapsuleGeometry(0.05, 0.12, 3, 6), gloveMat,
    [0.13, -0.045, -0.035], [1, 1, 1], [0.15, 0, -0.72]);

  const heldPlantSlot = new THREE.Group();
  heldPlantSlot.position.set(-0.015, 0.035, -0.015);
  heldRoot.add(heldPlantSlot);
  heldRoot.position.set(0.48, -0.46, -0.88);
  heldRoot.rotation.set(0.04, -0.12, -0.12);
  camera.add(heldRoot);

  function updateStock() {
    if (stockLabel) stockLabel.textContent = `🌽 ${inventory.corn}  🌻 ${inventory.sunflower}  🎃 ${inventory.pumpkin}`;
  }

  function updateHeldPlant() {
    heldPlantSlot.clear();
    const model = makePlant(selected);
    model.scale.setScalar(selected === "pumpkin" ? 0.42 : 0.34);
    model.position.set(-0.02, -0.02, 0);
    model.rotation.set(0.16, 0.1, -0.34);
    heldPlantSlot.add(model);
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

  function growPlant(x, z, kind) {
    if (plants.length >= 30) scene.remove(plants.shift());
    const root = makePlant(kind);
    root.position.set(x, 0.02, z);
    root.scale.setScalar(0.08);
    scene.add(root);
    plants.push(root);
    if (plantCountLabel) plantCountLabel.textContent = String(plants.length);
    addPollenCloud(new THREE.Vector3(x, 0, z), kind);
    showToast("Semente germinou: nuvem de pólen por alguns segundos!");
  }

  function sowSeed() {
    if (seedCooldown > 0 || seeds.length > 18) return;
    if (inventory[selected] <= 0) {
      showToast("Sem sementes desse tipo — procure uma planta para colher!");
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

  function interact(playerPosition) {
    let nearest = null;
    let nearestDistance = 3.25;
    for (const pickup of pickups) {
      const distance = Math.hypot(playerPosition.x - pickup.root.position.x, playerPosition.z - pickup.root.position.z);
      if (distance < nearestDistance) {
        nearest = pickup;
        nearestDistance = distance;
      }
    }
    if (!nearest) {
      showToast("Procure plantas brilhando pela fazenda para colher sementes.");
      return false;
    }
    inventory[nearest.kind] += 4;
    scene.remove(nearest.root);
    pickups.splice(pickups.indexOf(nearest), 1);
    updateStock();
    showToast(`Você colheu ${descriptions[nearest.kind].name}: +4 sementes!`);
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
    heldRoot.position.y = -0.43 + sway - handMotion * 0.045;
    heldRoot.rotation.x = 0.08 + handMotion * 0.18;
    handMotion = Math.max(0, handMotion - delta * 3.8);

    for (const pickup of pickups) {
      pickup.root.position.y = pickup.baseY + Math.sin(elapsed * 2 + pickup.phase) * 0.12;
      pickup.root.rotation.y += delta * 0.55;
    }
    for (const plant of plants) {
      const target = Math.min(1, (plant.scale.x || 0.08) + delta * 0.45);
      plant.scale.setScalar(target);
    }
    for (let i = seeds.length - 1; i >= 0; i--) {
      const seed = seeds[i];
      seed.age += delta;
      seed.velocity.y -= 7.2 * delta;
      seed.mesh.position.addScaledVector(seed.velocity, delta);
      seed.mesh.rotation.x += delta * 5;
      seed.mesh.rotation.z += delta * 3;
      if (seed.mesh.position.y <= 0.12 || seed.age >= 4.4) {
        const x = THREE.MathUtils.clamp(seed.mesh.position.x, -75, 75);
        const z = THREE.MathUtils.clamp(seed.mesh.position.z, -75, 75);
        scene.remove(seed.mesh);
        growPlant(x, z, seed.kind);
        seeds.splice(i, 1);
      }
    }
  }

  selectType("corn");
  updateStock();
  return { update, throwSeed: sowSeed, sowSeed, selectType, interact, getPlantCount: () => plants.length };
}
