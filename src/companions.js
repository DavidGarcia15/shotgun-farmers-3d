import * as THREE from "three";

// Friendly farm companions: nearby farmers can be invited to help.
// After joining, each becomes a small animal helper that wanders and plants
// decorative crops around the field. There is no combat or damage system.

const makeMaterial = (color, roughness = 0.88) =>
  new THREE.MeshStandardMaterial({ color, roughness });

const mats = {
  skin: makeMaterial(0xd9a77c),
  shirt: makeMaterial(0x557c54),
  shirtAlt: makeMaterial(0x9a7049),
  trousers: makeMaterial(0x3e4a43),
  hat: makeMaterial(0x8a653e),
  dark: makeMaterial(0x352f28),
  fur: makeMaterial(0x9a7049),
  furLight: makeMaterial(0xc49a6b),
  rabbit: makeMaterial(0xe2ddd0),
  rabbitPink: makeMaterial(0xc98782),
  chicken: makeMaterial(0xf0e2b6),
  beak: makeMaterial(0xe4a63d),
  leaf: makeMaterial(0x548a45),
  leafLight: makeMaterial(0x83ad53),
  flower: makeMaterial(0xe9c65b),
  flowerAlt: makeMaterial(0xe6a2a0),
  soil: makeMaterial(0x76523b),
  seed: makeMaterial(0x60462e),
};

const sphere = (parent, material, position, scale, geometry = [0.5, 12, 9]) => {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(...geometry), material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
};

const box = (parent, material, position, size) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
};

function makeFarmer(variant = 0) {
  const group = new THREE.Group();
  const shirt = variant % 2 ? mats.shirtAlt : mats.shirt;
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.65, 4, 8), shirt);
  body.position.y = 1.23;
  body.castShadow = true;
  group.add(body);
  sphere(group, mats.skin, [0, 2.05, 0], [0.31, 0.34, 0.3]);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.08, 12), mats.hat);
  brim.position.y = 2.36;
  brim.castShadow = true;
  group.add(brim);
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.31, 10), mats.hat);
  crown.position.y = 2.53;
  crown.castShadow = true;
  group.add(crown);
  for (const side of [-1, 1]) {
    const leg = box(group, mats.trousers, [side * 0.16, 0.42, 0], [0.2, 0.68, 0.23]);
    leg.rotation.z = side * -0.035;
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.105, 0.52, 3, 6), shirt);
    arm.position.set(side * 0.43, 1.33, 0);
    arm.rotation.z = side * -0.22;
    arm.castShadow = true;
    group.add(arm);
  }
  sphere(group, mats.dark, [-0.105, 2.08, -0.27], [0.035, 0.045, 0.025]);
  sphere(group, mats.dark, [0.105, 2.08, -0.27], [0.035, 0.045, 0.025]);
  return group;
}

function makeAnimal(kind) {
  const group = new THREE.Group();
  if (kind === "capybara") {
    sphere(group, mats.fur, [0, 0.58, 0.08], [0.72, 0.53, 0.48]);
    sphere(group, mats.furLight, [0, 0.78, -0.43], [0.39, 0.36, 0.38]);
    sphere(group, mats.dark, [0, 0.69, -0.76], [0.19, 0.14, 0.16]);
    for (const side of [-1, 1]) {
      sphere(group, mats.fur, [side * 0.27, 1.02, -0.48], [0.105, 0.13, 0.09]);
      sphere(group, mats.dark, [side * 0.22, 0.86, -0.72], [0.035, 0.045, 0.025]);
    }
    for (const x of [-0.39, 0.39]) for (const z of [-0.19, 0.31])
      box(group, mats.fur, [x, 0.2, z], [0.15, 0.38, 0.16]);
  } else if (kind === "rabbit") {
    sphere(group, mats.rabbit, [0, 0.48, 0.08], [0.46, 0.43, 0.46]);
    sphere(group, mats.rabbit, [0, 0.84, -0.31], [0.32, 0.31, 0.3]);
    for (const side of [-1, 1]) {
      const ear = sphere(group, mats.rabbit, [side * 0.17, 1.28, -0.31], [0.12, 0.38, 0.1]);
      ear.rotation.z = side * -0.16;
      sphere(group, mats.rabbitPink, [side * 0.17, 1.29, -0.395], [0.055, 0.27, 0.025]);
      sphere(group, mats.dark, [side * 0.15, 0.89, -0.56], [0.035, 0.045, 0.025]);
    }
    sphere(group, mats.rabbit, [0, 0.45, 0.52], [0.16, 0.16, 0.16]);
    for (const x of [-0.25, 0.25]) box(group, mats.rabbit, [x, 0.16, 0.18], [0.16, 0.29, 0.18]);
  } else {
    sphere(group, mats.chicken, [0, 0.54, 0.05], [0.48, 0.54, 0.48]);
    sphere(group, mats.chicken, [0, 0.91, -0.31], [0.31, 0.31, 0.3]);
    sphere(group, mats.beak, [0, 0.83, -0.61], [0.13, 0.09, 0.15]);
    for (const side of [-1, 1]) {
      sphere(group, mats.dark, [side * 0.13, 0.97, -0.55], [0.03, 0.04, 0.025]);
      const wing = sphere(group, mats.chicken, [side * 0.39, 0.57, -0.02], [0.16, 0.29, 0.29]);
      wing.rotation.z = side * 0.25;
    }
    for (const x of [-0.16, 0.16]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.27, 6), mats.beak);
      leg.position.set(x, 0.15, 0.02);
      group.add(leg);
    }
    sphere(group, mats.flowerAlt, [0, 1.2, -0.29], [0.1, 0.14, 0.1]);
  }
  return group;
}

function makeSprout(x, z, variant = 0) {
  const plant = new THREE.Group();
  plant.position.set(x, 0.02, z);
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.09, 8), mats.soil);
  soil.position.y = 0.04;
  plant.add(soil);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.055, 0.85, 6), mats.leaf);
  stem.position.y = 0.46;
  stem.castShadow = true;
  plant.add(stem);
  for (const side of [-1, 1]) {
    const leaf = sphere(plant, mats.leafLight, [side * 0.22, 0.38, 0], [0.25, 0.09, 0.14]);
    leaf.rotation.z = side * 0.38;
  }
  sphere(plant, variant === 1 ? mats.flowerAlt : mats.flower, [0, 0.94, 0], [0.18, 0.18, 0.18]);
  plant.scale.setScalar(0.08);
  plant.userData.growth = 0;
  return plant;
}

export function createCompanionSystem(scene, showToast) {
  const panel = document.querySelector("#interaction-panel");
  const title = document.querySelector("#interaction-title");
  const hint = document.querySelector("#interaction-hint");
  const progress = document.querySelector("#interaction-progress");
  const allyCount = document.querySelector("#ally-count");
  const allyKinds = ["capybara", "rabbit", "chicken"];
  const labels = { capybara: "Capivara", rabbit: "Coelho", chicken: "Galinha" };
  const npcs = [];
  const growingPlants = [];
  let recruitedCount = 0;
  let closest = null;

  const spawnData = [
    { x: -8, z: 4, variant: 0, kind: "capybara" },
    { x: 13, z: -13, variant: 1, kind: "rabbit" },
    { x: -27, z: -8, variant: 2, kind: "chicken" },
  ];

  spawnData.forEach((data, index) => {
    const root = new THREE.Group();
    root.position.set(data.x, 0, data.z);
    const farmer = makeFarmer(data.variant);
    root.add(farmer);
    scene.add(root);
    const barRoot = new THREE.Group();
    barRoot.position.set(0, 3.05, 0);
    const barBack = new THREE.Mesh(
      new THREE.PlaneGeometry(1.15, 0.12),
      new THREE.MeshBasicMaterial({ color: 0x263226, side: THREE.DoubleSide })
    );
    const barFill = new THREE.Mesh(
      new THREE.PlaneGeometry(1.08, 0.07),
      new THREE.MeshBasicMaterial({ color: 0xe6b94f, side: THREE.DoubleSide })
    );
    barFill.position.z = 0.01;
    barFill.position.x = -0.54;
    barFill.geometry.translate(0.54, 0, 0);
    barRoot.add(barBack, barFill);
    root.add(barRoot);
    npcs.push({
      root,
      barRoot,
      barFill,
      farmer,
      animal: null,
      kind: data.kind,
      recruited: false,
      bond: 0,
      patrolCenter: new THREE.Vector3(data.x, 0, data.z),
      target: new THREE.Vector3(data.x, 0, data.z),
      speed: 1.05 + index * 0.15,
      wait: 1 + index,
      plantTimer: 7 + index * 2,
      bob: Math.random() * Math.PI * 2,
    });
  });

  function chooseTarget(npc) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 3 + Math.random() * (npc.recruited ? 10 : 7);
    npc.target.set(
      THREE.MathUtils.clamp(npc.patrolCenter.x + Math.cos(angle) * radius, -48, 48),
      0,
      THREE.MathUtils.clamp(npc.patrolCenter.z + Math.sin(angle) * radius, -48, 42)
    );
    npc.wait = 1.5 + Math.random() * 3;
  }

  function plantSeed(npc) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 1.5 + Math.random() * 2.2;
    const x = THREE.MathUtils.clamp(npc.root.position.x + Math.cos(angle) * radius, -50, 50);
    const z = THREE.MathUtils.clamp(npc.root.position.z + Math.sin(angle) * radius, -50, 45);
    const plant = makeSprout(x, z, growingPlants.length % 2);
    scene.add(plant);
    growingPlants.push(plant);
    if (growingPlants.length > 28) {
      const oldest = growingPlants.shift();
      scene.remove(oldest);
    }
    showToast(labels[npc.kind] + " plantou uma semente!");
  }

  const pollenClouds = [];

  function addPollenCloud(position, kind) {
    const strengths = { corn: 0.18, sunflower: 0.32, pumpkin: 0.48 };
    const colors = { corn: 0xe9c34f, sunflower: 0xf2cf55, pumpkin: 0xe98239 };
    const cloud = new THREE.Group();
    const cloudMaterial = new THREE.MeshBasicMaterial({
      color: colors[kind] || 0xe9c34f, transparent: true, opacity: 0.34,
      depthWrite: false
    });
    for (let i = 0; i < 5; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.72 + Math.random() * 0.28, 9, 7), cloudMaterial);
      puff.position.set((Math.random() - 0.5) * 1.4, 0.8 + Math.random() * 1.2, (Math.random() - 0.5) * 1.4);
      cloud.add(puff);
    }
    cloud.position.copy(position);
    cloud.position.y = 0.15;
    scene.add(cloud);
    pollenClouds.push({ root: cloud, age: 0, duration: 2.8, radius: 5.2, strength: strengths[kind] || 0.18, affected: new Set() });
  }

  function setInteractionVisible(visible) {
    if (panel) panel.classList.toggle("visible", visible);
  }

  function update(delta, playerPosition, keys, active) {
    let nearest = null;
    let nearestDistance = Infinity;
    for (const npc of npcs) {
      if (npc.recruited) continue;
      const distance = Math.hypot(
        playerPosition.x - npc.root.position.x,
        playerPosition.z - npc.root.position.z
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = npc;
      }
    }

    closest = nearestDistance < 4.8 ? nearest : null;
    if (closest && active) {
      setInteractionVisible(true);
      if (title) title.textContent = "PÓLEN: " + labels[closest.kind].toUpperCase();
      if (progress) progress.style.width = (closest.bond * 100).toFixed(0) + "%";
      if (hint) hint.textContent = "APROXIME UMA NUVEM DE PÓLEN";
    } else {
      setInteractionVisible(false);
    }

    for (let i = pollenClouds.length - 1; i >= 0; i--) {
      const cloud = pollenClouds[i];
      cloud.age += delta;
      const fade = Math.max(0, 1 - cloud.age / cloud.duration);
      cloud.root.scale.setScalar(0.65 + (1 - fade) * 0.65);
      cloud.root.children.forEach((puff) => { puff.material.opacity = 0.34 * fade; });
      for (const npc of npcs) {
        if (npc.recruited || cloud.affected.has(npc)) continue;
        const distance = Math.hypot(
          npc.root.position.x - cloud.root.position.x,
          npc.root.position.z - cloud.root.position.z
        );
        if (distance < cloud.radius) {
          npc.bond = THREE.MathUtils.clamp(npc.bond + cloud.strength, 0, 1);
          cloud.affected.add(npc);
          if (npc.bond >= 1) {
            npc.recruited = true;
            npc.root.remove(npc.farmer);
            npc.animal = makeAnimal(npc.kind);
            npc.root.add(npc.animal);
            npc.barRoot.visible = false;
            npc.patrolCenter.copy(npc.root.position);
            npc.plantTimer = 3.5;
            recruitedCount += 1;
            if (allyCount) allyCount.textContent = String(recruitedCount);
            showToast(labels[npc.kind] + " virou um animal aliado!");
          }
        }
      }
      if (cloud.age >= cloud.duration) {
        scene.remove(cloud.root);
        pollenClouds.splice(i, 1);
      }
    }

    for (const npc of npcs) {
      if (!npc.recruited) {
        npc.barRoot.lookAt(playerPosition.x, playerPosition.y + 1.2, playerPosition.z);
        npc.barFill.scale.x = Math.max(0.001, npc.bond);
        npc.barFill.position.x = -0.54 + 0.54 * npc.bond;
      }
    }

    for (const npc of npcs) {
      npc.bob += delta * (npc.recruited ? 5.5 : 3.4);
      if (npc.wait > 0) npc.wait -= delta;
      const dx = npc.target.x - npc.root.position.x;
      const dz = npc.target.z - npc.root.position.z;
      const distance = Math.hypot(dx, dz);
      if (distance > 0.3 && npc.wait <= 0) {
        const step = Math.min(distance, npc.speed * (npc.recruited ? 1.2 : 0.65) * delta);
        npc.root.position.x += (dx / distance) * step;
        npc.root.position.z += (dz / distance) * step;
        npc.root.rotation.y = Math.atan2(dx, dz);
      } else if (distance <= 0.3 && npc.wait <= 0) {
        chooseTarget(npc);
      }
      if (npc.wait <= 0 && distance <= 0.3) chooseTarget(npc);
      npc.root.position.y = Math.sin(npc.bob) * (npc.recruited ? 0.035 : 0.018);
      if (npc.recruited) {
        npc.plantTimer -= delta;
        if (npc.plantTimer <= 0) {
          plantSeed(npc);
          npc.plantTimer = 13 + Math.random() * 6;
          chooseTarget(npc);
        }
      }
    }

    for (const plant of growingPlants) {
      plant.userData.growth = Math.min(1, plant.userData.growth + delta / 3.8);
      const eased = plant.userData.growth * plant.userData.growth * (3 - 2 * plant.userData.growth);
      plant.scale.setScalar(0.08 + eased * 0.92);
    }
  }

  return { update, addPollenCloud };
}
