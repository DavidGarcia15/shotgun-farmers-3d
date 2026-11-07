import * as THREE from "three";

// Seeds land on the soil, grow a plant and release a brief pollen cloud.
// The cloud gently fills nearby farmers' transformation bars; it never
// collides with or damages characters.

const palette = {
  corn: 0xe9c34f, sunflower: 0xf2cf55, pumpkin: 0xe98239,
  leaf: 0x5d9149, leafLight: 0x8fb85c, stem: 0x48753c,
};

const descriptions = {
  corn: { name: "MILHO", ability: "PÓLEN LEVE", detail: "Nuvem curta; preenche um pouco da barra." },
  sunflower: { name: "GIRASSOL", ability: "PÓLEN VIVO", detail: "Nuvem média; preenche mais a barra." },
  pumpkin: { name: "ABÓBORA", ability: "PÓLEN FORTE", detail: "Nuvem mais potente, mas demora mais para lançar." },
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
  const plants = [];
  const seeds = [];
  let selected = "corn";
  let seedCooldown = 0;

  function selectType(kind) {
    if (!descriptions[kind]) return;
    selected = kind;
    if (name) name.textContent = descriptions[kind].name;
    if (ability) ability.textContent = descriptions[kind].ability;
    if (detail) detail.textContent = descriptions[kind].detail;
    if (choices) choices.querySelectorAll("[data-seed]").forEach(item => item.classList.toggle("selected", item.dataset.seed === kind));
    showToast(descriptions[kind].name + " selecionado");
  }

  function growPlant(x, z, kind) {
    if (plants.length >= 30) scene.remove(plants.shift());
    const root = makePlant(kind);
    root.position.set(x, 0.02, z);
    root.scale.setScalar(0.08);
    scene.add(root);
    plants.push(root);
    if (plantCountLabel) plantCountLabel.textContent = String(plants.length);
    const cloudOrigin = new THREE.Vector3(x, 0, z);
    addPollenCloud(cloudOrigin, kind);
    showToast("Planta cresceu e liberou uma nuvem de pólen!");
  }

  function throwSeed() {
    if (seedCooldown > 0 || seeds.length > 18) return;
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
  }

  function update(delta) {
    seedCooldown = Math.max(0, seedCooldown - delta);
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
  return { update, throwSeed, selectType, getPlantCount: () => plants.length };
}
