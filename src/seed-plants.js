import * as THREE from "three";

// Seed plants are playful farm helpers. They launch seeds toward wooden
// practice boards; seeds that miss and reach the soil germinate into new plants.

const palette = {
  corn: 0xe9c34f,
  sunflower: 0xf2cf55,
  pumpkin: 0xe98239,
  leaf: 0x5d9149,
  leafLight: 0x8fb85c,
  stem: 0x48753c,
  soil: 0x76533b,
  wood: 0x795638,
  board: 0xe8dcbf,
  red: 0xc65b43,
  dark: 0x62453a,
};

const descriptions = {
  corn: { name: "MILHO", ability: "TRIPLE BURST", detail: "Lança três sementes em sequência." },
  sunflower: { name: "GIRASSOL", ability: "BLOOM PULSE", detail: "Atingir o alvo acelera o crescimento das plantas próximas." },
  pumpkin: { name: "ABÓBORA", ability: "COMPOST LOB", detail: "Semente pesada vale pontos extras e aduba a área." },
};

const mat = (color, roughness = 0.88, extra = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, ...extra });

function addMesh(parent, geometry, material, position, scale = [1, 1, 1], rotation = [0, 0, 0]) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function makePracticeTarget(scene, x, z, index) {
  const root = new THREE.Group();
  root.position.set(x, 0, z);
  const wood = mat(palette.wood);
  const board = mat(palette.board, 0.78, { emissive: 0x000000 });
  const red = mat(palette.red, 0.72);
  const dark = mat(palette.dark, 0.72);
  addMesh(root, new THREE.CylinderGeometry(0.09, 0.12, 1.5, 8), wood, [0, 0.75, 0]);
  addMesh(root, new THREE.BoxGeometry(1.45, 1.55, 0.18), board, [0, 1.82, 0]);
  // Concentric bullseye discs face the player's side of the board (+Z).
  addMesh(root, new THREE.CylinderGeometry(0.57, 0.57, 0.08, 24), red, [0, 1.82, 0.14], [1, 1, 1], [Math.PI / 2, 0, 0]);
  addMesh(root, new THREE.CylinderGeometry(0.36, 0.36, 0.09, 24), board, [0, 1.82, 0.195], [1, 1, 1], [Math.PI / 2, 0, 0]);
  addMesh(root, new THREE.CylinderGeometry(0.17, 0.17, 0.1, 20), red, [0, 1.82, 0.25], [1, 1, 1], [Math.PI / 2, 0, 0]);
  scene.add(root);
  return {
    root,
    point: new THREE.Vector3(x, 1.82, z + 0.38),
    radius: 0.82,
    board: root.children[1].material,
    pulse: 0,
    index,
  };
}

function makePlantModel(kind) {
  const root = new THREE.Group();
  const stem = mat(palette.stem);
  const leaf = mat(palette.leaf);
  const leafLight = mat(palette.leafLight);

  if (kind === "corn") {
    addMesh(root, new THREE.CylinderGeometry(0.09, 0.13, 1.75, 7), stem, [0, 0.88, 0]);
    for (const side of [-1, 1]) {
      addMesh(root, new THREE.SphereGeometry(0.42, 10, 7), leaf, [side * 0.33, 0.7, 0],
        [0.75, 0.18, 0.42], [0, 0, side * -0.4]);
    }
    addMesh(root, new THREE.CapsuleGeometry(0.13, 0.42, 3, 7), mat(palette.corn), [0.2, 1.13, -0.12],
      [1, 1, 1], [0, 0, -0.55]);
    addMesh(root, new THREE.CapsuleGeometry(0.11, 0.34, 3, 7), mat(0xd9aa39), [-0.18, 0.83, 0.1],
      [1, 1, 1], [0, 0, 0.45]);
  } else if (kind === "sunflower") {
    addMesh(root, new THREE.CylinderGeometry(0.07, 0.1, 1.55, 7), stem, [0, 0.78, 0]);
    for (const side of [-1, 1]) {
      addMesh(root, new THREE.SphereGeometry(0.34, 9, 7), leafLight, [side * 0.28, 0.58, 0],
        [0.9, 0.18, 0.48], [0, 0, side * -0.5]);
    }
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      addMesh(root, new THREE.SphereGeometry(0.19, 8, 6), mat(palette.sunflower),
        [Math.cos(angle) * 0.35, 1.72 + Math.sin(angle) * 0.35, 0],
        [0.75, 1.1, 0.55]);
    }
    addMesh(root, new THREE.SphereGeometry(0.29, 12, 9), mat(0x65452d), [0, 1.72, 0.04]);
  } else {
    addMesh(root, new THREE.SphereGeometry(0.58, 12, 9), mat(palette.pumpkin), [0, 0.55, 0],
      [1.15, 0.92, 1]);
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      addMesh(root, new THREE.SphereGeometry(0.12, 7, 6), mat(0xd76e2c),
        [Math.cos(angle) * 0.49, 0.58, Math.sin(angle) * 0.43], [0.7, 1, 0.85]);
    }
    addMesh(root, new THREE.CylinderGeometry(0.035, 0.06, 0.28, 6), stem, [0, 1.12, 0]);
    addMesh(root, new THREE.SphereGeometry(0.26, 8, 6), leafLight, [0.32, 1.05, 0],
      [1, 0.18, 0.5], [0, 0, -0.3]);
    addMesh(root, new THREE.SphereGeometry(0.3, 8, 6), leaf, [-0.32, 1.03, 0],
      [1, 0.18, 0.5], [0, 0, 0.3]);
  }
  return root;
}

export function createSeedPlantSystem(scene, camera, showToast) {
  const seedChoices = document.querySelector("#seed-choices");
  const seedName = document.querySelector("#seed-name");
  const seedAbility = document.querySelector("#seed-ability");
  const seedDetail = document.querySelector("#seed-detail");
  const scoreLabel = document.querySelector("#target-score");
  const plantCountLabel = document.querySelector("#plant-count");

  const targets = [
    makePracticeTarget(scene, -11, -10, 0),
    makePracticeTarget(scene, 13, -26, 1),
    makePracticeTarget(scene, 34, -17, 2),
  ];
  const plants = [];
  const seeds = [];
  const maxPlants = 22;
  const maxSeeds = 48;
  let selected = "corn";
  let score = 0;
  let seedId = 0;

  function selectType(kind) {
    if (!descriptions[kind]) return;
    selected = kind;
    if (seedName) seedName.textContent = descriptions[kind].name;
    if (seedAbility) seedAbility.textContent = descriptions[kind].ability;
    if (seedDetail) seedDetail.textContent = descriptions[kind].detail;
    if (seedChoices) {
      seedChoices.querySelectorAll("[data-seed]").forEach((item) => {
        item.classList.toggle("selected", item.dataset.seed === kind);
      });
    }
    showToast(descriptions[kind].name + " selecionado");
  }

  function growPlant(x, z, kind, announce = true) {
    if (plants.length >= maxPlants) {
      const oldest = plants.shift();
      scene.remove(oldest.root);
    }
    const root = makePlantModel(kind);
    root.position.set(x, 0.02, z);
    root.scale.setScalar(0.08);
    scene.add(root);
    const plant = {
      id: ++seedId,
      root,
      kind,
      growth: 0,
      cooldown: 4 + Math.random() * 3,
      bob: Math.random() * Math.PI * 2,
      flash: 0,
    };
    plants.push(plant);
    if (plantCountLabel) plantCountLabel.textContent = String(plants.length);
    if (announce) showToast("Uma planta de " + descriptions[kind].name.toLowerCase() + " cresceu!");
    return plant;
  }

  function nearestTarget(position) {
    let result = targets[0];
    let best = Infinity;
    for (const target of targets) {
      const distance = position.distanceToSquared(target.point);
      if (distance < best) {
        best = distance;
        result = target;
      }
    }
    return result;
  }

  function spawnSeed(position, velocity, kind, fromPlant, radius = 0.82) {
    if (seeds.length >= maxSeeds) {
      const oldest = seeds.shift();
      scene.remove(oldest.mesh);
    }
    const color = kind === "corn" ? palette.corn : kind === "sunflower" ? palette.sunflower : palette.pumpkin;
    const mesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(kind === "pumpkin" ? 0.19 : 0.13, 0),
      mat(color, 0.65, { emissive: color, emissiveIntensity: 0.12 })
    );
    mesh.position.copy(position);
    mesh.castShadow = true;
    scene.add(mesh);
    seeds.push({
      mesh,
      velocity: velocity.clone(),
      age: 0,
      kind,
      fromPlant,
      radius,
      id: ++seedId,
    });
  }

  function seedTowardTarget(origin, kind, spread = 0) {
    const target = nearestTarget(origin);
    const targetPoint = target.point.clone();
    targetPoint.x += (Math.random() - 0.5) * spread;
    targetPoint.y += (Math.random() - 0.5) * spread * 0.45;
    const delta = targetPoint.clone().sub(origin);
    const horizontal = Math.hypot(delta.x, delta.z);
    const speed = kind === "corn" ? 17 : kind === "sunflower" ? 12.5 : 9.5;
    const travelTime = Math.max(0.8, horizontal / speed);
    const velocity = new THREE.Vector3(
      delta.x / travelTime,
      (delta.y + 0.5 * 7.2 * travelTime * travelTime) / travelTime,
      delta.z / travelTime
    );
    spawnSeed(origin, velocity, kind, true, kind === "pumpkin" ? 1.18 : 0.82);
  }

  function firePlant(plant) {
    const origin = plant.root.position.clone().add(new THREE.Vector3(0, plant.kind === "pumpkin" ? 1.15 : 1.95, 0));
    const target = nearestTarget(origin);
    const direction = target.point.clone().sub(origin);
    plant.root.rotation.y = Math.atan2(direction.x, direction.z);

    if (plant.kind === "corn") {
      // Quick three-seed volley with a playful spread.
      seedTowardTarget(origin, "corn", 1.35);
      window.setTimeout(() => seedTowardTarget(origin, "corn", 1.35), 170);
      window.setTimeout(() => seedTowardTarget(origin, "corn", 1.35), 340);
      plant.cooldown = 8.5 + Math.random() * 3;
    } else if (plant.kind === "sunflower") {
      // A precise bloom seed; a successful target hit energizes nearby growth.
      seedTowardTarget(origin, "sunflower", 0.55);
      plant.cooldown = 9.5 + Math.random() * 3;
    } else {
      // A slow, arcing compost seed with a generous target ring and bonus points.
      seedTowardTarget(origin, "pumpkin", 1.8);
      plant.cooldown = 12 + Math.random() * 3;
    }
  }

  function pulseNearbyGrowth(position, amount) {
    for (const plant of plants) {
      if (plant.root.position.distanceTo(position) < 13) {
        plant.growth = Math.min(1, plant.growth + amount);
        plant.flash = 0.35;
      }
    }
  }

  function onTargetHit(seed, target) {
    score += seed.kind === "pumpkin" ? 2 : 1;
    if (scoreLabel) scoreLabel.textContent = String(score);
    target.pulse = 0.45;
    if (seed.kind === "sunflower") pulseNearbyGrowth(target.root.position, 0.18);
    if (seed.kind === "pumpkin") pulseNearbyGrowth(target.root.position, 0.1);
    showToast(seed.kind === "pumpkin" ? "Compost bonus! +2" : "Practice target! +1");
    scene.remove(seed.mesh);
  }

  function throwSeed() {
    if (seeds.length >= maxSeeds) return;
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    const origin = camera.position.clone().addScaledVector(direction, 0.72);
    const velocity = direction.multiplyScalar(12.5).add(new THREE.Vector3(0, 2.2, 0));
    spawnSeed(origin, velocity, selected, false, selected === "pumpkin" ? 1.18 : 0.82);
  }

  function growFromMiss(seed) {
    let kind = seed.kind;
    if (seed.fromPlant) {
      const alternatives = ["corn", "sunflower", "pumpkin"].filter((item) => item !== seed.kind);
      kind = alternatives[Math.floor(Math.random() * alternatives.length)];
    }
    growPlant(seed.mesh.position.x, seed.mesh.position.z, kind);
    scene.remove(seed.mesh);
  }

  function update(delta, active) {
    for (const plant of plants) {
      plant.bob += delta * 2.4;
      plant.growth = Math.min(1, plant.growth + delta * (plant.kind === "sunflower" ? 0.15 : 0.12));
      const scale = 0.08 + plant.growth * 0.92;
      plant.root.scale.setScalar(scale);
      plant.root.position.y = 0.02 + Math.sin(plant.bob) * 0.025 * plant.growth;
      plant.cooldown -= delta;
      if (plant.flash > 0) plant.flash -= delta;
      if (plant.growth >= 1 && plant.cooldown <= 0 && plants.length < maxPlants) firePlant(plant);
    }

    for (let i = seeds.length - 1; i >= 0; i--) {
      const seed = seeds[i];
      seed.age += delta;
      seed.velocity.y -= 7.2 * delta;
      seed.mesh.position.addScaledVector(seed.velocity, delta);
      seed.mesh.rotation.x += delta * 5;
      seed.mesh.rotation.z += delta * 3;

      let hitTarget = null;
      for (const target of targets) {
        if (seed.mesh.position.distanceTo(target.point) < seed.radius) {
          hitTarget = target;
          break;
        }
      }
      if (hitTarget) {
        onTargetHit(seed, hitTarget);
        seeds.splice(i, 1);
        continue;
      }

      if (seed.mesh.position.y <= 0.12 || seed.age >= 4.4) {
        seed.mesh.position.y = 0.02;
        growFromMiss(seed);
        seeds.splice(i, 1);
      }
    }

    for (const target of targets) {
      target.pulse = Math.max(0, target.pulse - delta);
      target.board.emissive.setHex(target.pulse > 0 ? 0x6a4c20 : 0x000000);
      target.board.emissiveIntensity = target.pulse > 0 ? target.pulse * 1.5 : 0;
    }

    if (!active && seedChoices) seedChoices.classList.remove("keyboard-focus");
  }

  selectType("corn");
  return {
    update,
    throwSeed,
    selectType,
    getScore: () => score,
    getPlantCount: () => plants.length,
  };
}
