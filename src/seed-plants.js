import * as THREE from "three";
import { 
  playPlant, playDirectHit, playHarvest, 
  playCornShot, playSunflowerShot, playPumpkinShot,
  playPeavolverShot, playHayK47Shot, playWatermeLMGShot,
  playReload 
} from "./sound.js";

// Shotgun-Farmers-style loop: each plant weapon has its own clip.
// Fire to spend ammo; a miss plants a weapon in the soil.
// Harvest with E to reload. The longer it grew, the more ammo you get.

const palette = {
  corn: 0xe9c34f, sunflower: 0xf2cf55, pumpkin: 0xe98239,
  peavolver: 0x6ab04c, hayk47: 0xd4a843, watermelon: 0x2e7d32,
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
  peavolver: {
    name: "PEAVOLVER",
    ability: "PÓLEN RÁPIDO",
    detail: "Revólver de ervilha. Tiro rápido e leve; bom para curta distância.",
    clipSize: 6, growTime: 8, minYield: 2, maxYield: 5,
    matureScale: 0.5, recoilKick: 0.15, shotSound: playPeavolverShot,
  },
  hayk47: {
    name: "HAYK-47",
    ability: "PÓLEN CONSTANTE",
    detail: "Rifle de feno. Rajada estável e precisa; médio alcance.",
    clipSize: 4, growTime: 14, minYield: 1, maxYield: 4,
    matureScale: 0.6, recoilKick: 0.2, shotSound: playHayK47Shot,
  },
  watermelon: {
    name: "WATERMELMG",
    ability: "PÓLEN PESADO",
    detail: "Metralhadora de melancia. Cadência alta e pente grande; lenta.",
    clipSize: 8, growTime: 20, minYield: 2, maxYield: 5,
    matureScale: 0.65, recoilKick: 0.25, shotSound: playWatermeLMGShot,
  },
};

// --- Rich materials ---
const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.88, ...extra });
const woodMat = mat(0x6b4a2e, { roughness: 0.95 });
const darkWoodMat = mat(0x4a3320, { roughness: 0.95 });
const metalMat = mat(0x8a8a8a, { roughness: 0.4, metalness: 0.7 });
const darkMetalMat = mat(0x2a2a2a, { roughness: 0.5, metalness: 0.6 });
const goldMat = mat(0xf3d96a, { roughness: 0.5, emissive: 0x3a2e10 });
const brightGoldMat = mat(0xffd700, { roughness: 0.4, emissive: 0x553f00, emissiveIntensity: 0.4 });
const huskMat = mat(0xa8853a, { roughness: 1 });
const greenHuskMat = mat(0x8aaf4c, { roughness: 1 });
const shellMat = mat(0xd43a2a, { roughness: 0.55, metalness: 0.3 });
const peaMat = mat(0x6ab04c, { roughness: 0.7 });
const hayMat = mat(0xd4a843, { roughness: 1 });
const ropeMat = mat(0x8b6b3d, { roughness: 1 });
const watermelonRindMat = mat(0x2e7d32, { roughness: 0.6 });
const watermelonStripeMat = mat(0x1b5e20, { roughness: 0.6 });
const watermelonFleshMat = mat(0xe94560, { roughness: 0.7, emissive: 0x3a0a12 });
const seedMat = mat(0x1a1a1a, { roughness: 0.9 });
const pumpkinRibMat = mat(0xb85a1f, { roughness: 0.9 });
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

// --- World plant models ---
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
  } else if (kind === "pumpkin") {
    addPart(root, new THREE.SphereGeometry(0.56, 12, 9), mat(palette.pumpkin), [0, 0.5, 0], [1.1, 0.9, 1]);
    addPart(root, new THREE.CylinderGeometry(0.04, 0.06, 0.25, 6), stem, [0, 1.05, 0]);
    addPart(root, new THREE.SphereGeometry(0.25, 8, 6), light, [0.3, 0.98, 0], [1, 0.18, 0.5]);
  } else if (kind === "peavolver") {
    addPart(root, new THREE.CylinderGeometry(0.05, 0.08, 1.2, 6), stem, [0, 0.6, 0]);
    for (const side of [-1, 1]) addPart(root, new THREE.SphereGeometry(0.22, 8, 6), leaf, [side * 0.22, 0.45, 0], [0.9, 0.18, 0.4]);
    for (let i = 0; i < 3; i++) {
      addPart(root, new THREE.CapsuleGeometry(0.06, 0.25, 3, 6), peaMat, [0.15, 0.8 + i * 0.15, 0], [1, 1, 1], [0, 0, 0.2]);
    }
    addPart(root, new THREE.SphereGeometry(0.12, 8, 6), light, [0, 1.15, 0]);
  } else if (kind === "hayk47") {
    for (let i = 0; i < 5; i++) {
      addPart(root, new THREE.CylinderGeometry(0.03, 0.03, 1.4, 4), hayMat, [(i - 2) * 0.1, 0.7, 0]);
    }
    addPart(root, new THREE.CylinderGeometry(0.25, 0.25, 0.1, 8), ropeMat, [0, 0.5, 0]);
    addPart(root, new THREE.CylinderGeometry(0.25, 0.25, 0.1, 8), ropeMat, [0, 1.0, 0]);
    addPart(root, new THREE.SphereGeometry(0.15, 6, 4), hayMat, [0, 1.4, 0]);
  } else {
    addPart(root, new THREE.SphereGeometry(0.6, 12, 9), watermelonRindMat, [0, 0.55, 0], [1.2, 0.9, 1]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      addPart(root, new THREE.BoxGeometry(0.03, 0.8, 0.03), mat(0x1b5e20), [Math.cos(a) * 0.55, 0.55, Math.sin(a) * 0.55], [1, 1, 1], [0, 0, a]);
    }
    addPart(root, new THREE.CylinderGeometry(0.06, 0.08, 0.2, 6), stem, [0, 1.1, 0]);
    addPart(root, new THREE.SphereGeometry(0.2, 8, 6), light, [0.4, 0.8, 0], [0.8, 0.18, 0.5]);
  }
  return root;
}

// ============================================================
// === FIRST-PERSON WEAPON MODELS ===
// Local space: grip at origin, -Z is muzzle direction.
// ============================================================
function makeWeaponModel(kind) {

  const root = new THREE.Group();

  // =========================================================
  // === ESPINGARDA DE MILHO (Double Corncob Shotgun) ===
  // =========================================================
  if (kind === "corn") {
    // Dois "sabugos" de milho paralelos como canos, com grãos em espiral
    for (const side of [-1, 1]) {
      const x = side * 0.085;

      // Corpo do sabugo (cilindro amarelo)
      addPart(root, new THREE.CylinderGeometry(0.075, 0.09, 0.7, 12), mat(palette.corn),
        [x, 0.03, -0.35], [1, 1, 1], [-Math.PI / 2, 0, 0]);

      // Grãos em espiral ao redor do sabugo (bem visíveis!)
      for (let i = 0; i < 8; i++) {
        const z = -0.08 - i * 0.075;
        for (let j = 0; j < 6; j++) {
          const a = (j / 6) * Math.PI * 2 + i * 0.35;
          addPart(root, new THREE.SphereGeometry(0.022, 6, 5), brightGoldMat,
            [x + Math.cos(a) * 0.085, 0.03 + Math.sin(a) * 0.085, z], [1, 1, 1]);
        }
      }

      // Palha verde-amarelada aberta no início do sabugo (decoração)
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2;
        addPart(root, new THREE.ConeGeometry(0.06, 0.22, 5), greenHuskMat,
          [x + Math.cos(a) * 0.1, 0.03 + Math.sin(a) * 0.1, -0.05],
          [1, 1, 1], [Math.PI / 2, a, 0]);
      }

      // Boca metálica na ponta do cano
      addPart(root, new THREE.CylinderGeometry(0.065, 0.07, 0.08, 12), darkMetalMat,
        [x, 0.03, -0.72], [1, 1, 1], [-Math.PI / 2, 0, 0]);

      // Furo interno escuro do cano
      addPart(root, new THREE.CylinderGeometry(0.045, 0.045, 0.02, 12), mat(0x050505),
        [x, 0.03, -0.77], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    }

    // Receptor central (madeira)
    addPart(root, new THREE.BoxGeometry(0.24, 0.16, 0.28), woodMat, [0, 0.02, 0.06]);

    // Detalhe dourado no receptor (milho esculpido)
    addPart(root, new THREE.BoxGeometry(0.26, 0.04, 0.3), brightGoldMat, [0, 0.1, 0.06]);

    // Punho em madeira escura
    addPart(root, new THREE.CylinderGeometry(0.045, 0.055, 0.22, 10), woodMat,
      [0, -0.13, 0.15], [1, 1, 1], [0.4, 0, 0]);
    addPart(root, new THREE.CylinderGeometry(0.05, 0.05, 0.015, 10), brightGoldMat,
      [0, -0.24, 0.18], [1, 1, 1], [0.4, 0, 0]);

    // Coronha longa em madeira
    addPart(root, new THREE.BoxGeometry(0.16, 0.16, 0.5), woodMat, [0, -0.03, 0.32]);
    addPart(root, new THREE.BoxGeometry(0.11, 0.05, 0.4), darkWoodMat, [0, 0.05, 0.32]);

    // Detalhe de grãos esculpidos na coronha
    for (let i = 0; i < 4; i++) {
      addPart(root, new THREE.SphereGeometry(0.02, 6, 4), brightGoldMat,
        [0, 0.02, 0.15 + i * 0.1], [1, 1, 1]);
    }

    // Guarda do gatilho + gatilho
    addPart(root, new THREE.TorusGeometry(0.045, 0.015, 6, 14), darkMetalMat,
      [0, -0.1, 0.02], [1, 1, 1], [Math.PI / 2, 0, 0]);
    addPart(root, new THREE.BoxGeometry(0.018, 0.06, 0.018), metalMat, [0, -0.06, 0.02]);

    // Cartuchos vermelhos visíveis na lateral do receptor
    for (let i = 0; i < 4; i++) {
      addPart(root, new THREE.CylinderGeometry(0.022, 0.022, 0.09, 8), shellMat,
        [0.14, 0.04, -0.02 + i * 0.07], [1, 1, 1], [0, 0, Math.PI / 2]);
      addPart(root, new THREE.CylinderGeometry(0.018, 0.018, 0.02, 8), brightGoldMat,
        [0.14, 0.04, -0.06 + i * 0.07], [1, 1, 1], [0, 0, Math.PI / 2]);
    }

    // Mira (pequena folha dobrada no topo)
    addPart(root, new THREE.ConeGeometry(0.03, 0.08, 4), greenHuskMat, [0, 0.14, -0.15]);
  }

  // =========================================================
  // === SNIPER DE GIRASSOL (Sunflower Sniper) ===
  // =========================================================
  else if (kind === "sunflower") {
    // Cano = caule verde longo
    addPart(root, new THREE.CylinderGeometry(0.032, 0.05, 1.05, 12), mat(palette.stem),
      [0, 0.02, -0.55], [1, 1, 1], [-Math.PI / 2, 0, 0]);

    // Anéis de folhas ao longo do cano
    for (let i = 0; i < 4; i++) {
      const z = -0.15 - i * 0.22;
      addPart(root, new THREE.TorusGeometry(0.045, 0.015, 6, 12), mat(palette.leafLight),
        [0, 0.02, z], [1, 1, 1], [Math.PI / 2, 0, 0]);
    }

    // Boca metálica na ponta
    addPart(root, new THREE.CylinderGeometry(0.055, 0.055, 0.09, 12), darkMetalMat,
      [0, 0.02, -1.08], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    addPart(root, new THREE.CylinderGeometry(0.04, 0.04, 0.02, 12), mat(0x050505),
      [0, 0.02, -1.13], [1, 1, 1], [-Math.PI / 2, 0, 0]);

    // Luneta (cilindro escuro) com flor de girassol em cada ponta
    addPart(root, new THREE.CylinderGeometry(0.045, 0.045, 0.4, 12), darkMetalMat,
      [0, 0.12, -0.18], [1, 1, 1], [-Math.PI / 2, 0, 0]);

    // Flor de girassol TRASEIRA (perto do olho do jogador) — muitas pétalas
    addPart(root, new THREE.SphereGeometry(0.08, 10, 8), mat(0x65452d),
      [0, 0.12, 0.02], [1, 1, 0.8]);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      addPart(root, new THREE.SphereGeometry(0.038, 6, 5), mat(palette.sunflower),
        [Math.cos(a) * 0.1, 0.12 + Math.sin(a) * 0.1, 0.02], [1.3, 0.4, 1]);
    }

    // Flor de girassol FRONTAL — também com pétalas, mas vista de frente
    addPart(root, new THREE.SphereGeometry(0.08, 10, 8), mat(0x65452d),
      [0, 0.12, -0.38], [1, 1, 0.8]);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      addPart(root, new THREE.SphereGeometry(0.038, 6, 5), mat(palette.sunflower),
        [Math.cos(a) * 0.1, 0.12 + Math.sin(a) * 0.1, -0.38], [1.3, 0.4, 1]);
    }

    // Lente reflexiva azul (vidro da luneta) na frente
    addPart(root, new THREE.CircleGeometry(0.04, 14), lensMat, [0, 0.12, 0.04], [1, 1, 1]);

    // Suportes da luneta (2 anéis metálicos)
    for (const z of [-0.28, -0.08]) {
      addPart(root, new THREE.BoxGeometry(0.08, 0.07, 0.025), metalMat, [0, 0.07, z]);
    }

    // Bipé metálico (dobrado sob o cano) — bem visível
    for (const side of [-1, 1]) {
      addPart(root, new THREE.CylinderGeometry(0.012, 0.012, 0.28, 6), metalMat,
        [side * 0.07, -0.06, -0.65], [1, 1, 1], [0.5, 0, side * 0.35]);
      addPart(root, new THREE.CylinderGeometry(0.02, 0.02, 0.02, 6), darkMetalMat,
        [side * 0.14, -0.19, -0.72], [1, 1, 1]);
    }

    // Receptor central
    addPart(root, new THREE.BoxGeometry(0.14, 0.14, 0.38), woodMat, [0, 0, 0.18]);

    // Coronha longa com detalhe de pétala esculpida
    addPart(root, new THREE.BoxGeometry(0.11, 0.16, 0.55), woodMat, [0, -0.03, 0.45]);
    addPart(root, new THREE.BoxGeometry(0.08, 0.04, 0.4), darkWoodMat, [0, 0.06, 0.45]);

    // Pétala esculpida na coronha (dourada)
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      addPart(root, new THREE.SphereGeometry(0.025, 6, 4), brightGoldMat,
        [Math.cos(a) * 0.03, -0.02 + Math.sin(a) * 0.03, 0.35 + (i % 2) * 0.05], [1.5, 0.4, 1]);
    }

    // Punho
    addPart(root, new THREE.CylinderGeometry(0.035, 0.045, 0.2, 8), woodMat,
      [0, -0.11, 0.22], [1, 1, 1], [0.4, 0, 0]);

    // Guarda do gatilho + gatilho
    addPart(root, new THREE.TorusGeometry(0.035, 0.011, 6, 12), darkMetalMat,
      [0, -0.07, 0.12], [1, 1, 1], [Math.PI / 2, 0, 0]);
    addPart(root, new THREE.BoxGeometry(0.012, 0.04, 0.012), metalMat, [0, -0.05, 0.12]);

    // Pente de sementes (pequenas esferas pretas visíveis)
    addPart(root, new THREE.BoxGeometry(0.06, 0.12, 0.14), darkMetalMat, [0, -0.15, 0.05]);
    for (let i = 0; i < 3; i++) {
      addPart(root, new THREE.SphereGeometry(0.018, 6, 4), seedMat,
        [0, -0.18 + i * 0.04, 0.05]);
    }
  }

  // =========================================================
  // === LANÇADOR DE ABÓBORA (Pumpkin Grenade Launcher) ===
  // =========================================================
  else if (kind === "pumpkin") {
    // Corpo principal: 3 "fatias" de abóbora empilhadas formando um tambor
    // Fatia central (maior)
    addPart(root, new THREE.SphereGeometry(0.24, 16, 12), mat(palette.pumpkin),
      [0, 0, -0.22], [1.15, 1, 1.15]);
    // Fatias laterais (dão profundidade de abóbora com gomos)
    addPart(root, new THREE.SphereGeometry(0.22, 16, 12), mat(0xd86f2a),
      [0, 0, -0.22], [1.25, 1.05, 0.9]);
    addPart(root, new THREE.SphereGeometry(0.2, 16, 12), mat(0xc6611f),
      [0, 0, -0.22], [1.35, 1.1, 0.75]);

    // Gomos visíveis (8 fatias verticais escuras ao redor da abóbora)
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      addPart(root, new THREE.BoxGeometry(0.02, 0.48, 0.55), pumpkinRibMat,
        [Math.cos(a) * 0.23, Math.sin(a) * 0.21, -0.22],
        [1, 1, 1], [0, 0, a]);
    }

    // Boca do tubo (bem aberta, visível de frente)
    addPart(root, new THREE.CylinderGeometry(0.15, 0.17, 0.14, 16), mat(0xa0561c),
      [0, 0, -0.48], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    addPart(root, new THREE.CylinderGeometry(0.125, 0.145, 0.04, 16), darkMetalMat,
      [0, 0, -0.56], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    // Interior escuro
    addPart(root, new THREE.CylinderGeometry(0.11, 0.11, 0.02, 16), mat(0x050505),
      [0, 0, -0.57], [1, 1, 1], [-Math.PI / 2, 0, 0]);

    // Caule verde no topo (como se fosse a mira da arma)
    addPart(root, new THREE.CylinderGeometry(0.03, 0.045, 0.14, 8), mat(palette.stem),
      [0, 0.22, -0.18], [1, 1, 1], [0.15, 0, 0]);
    // Folha pequena no topo do caule
    addPart(root, new THREE.SphereGeometry(0.06, 6, 4), mat(palette.leafLight),
      [0.02, 0.3, -0.18], [0.4, 0.15, 1.3], [0, 0, 0.3]);

    // Vinha enrolada em espiral visível ao longo do tubo
    for (let i = 0; i < 6; i++) {
      const t = i / 6 * Math.PI * 3;
      addPart(root, new THREE.TorusGeometry(0.26, 0.015, 6, 12, Math.PI / 2), mat(palette.stem),
        [0, 0, -0.22], [1, 1, 1], [t, Math.PI / 2, 0]);
    }

    // Mecanismo de gatilho (mais detalhado)
    addPart(root, new THREE.BoxGeometry(0.12, 0.1, 0.18), woodMat, [0, -0.2, 0.02]);
    addPart(root, new THREE.BoxGeometry(0.06, 0.05, 0.12), darkWoodMat, [0, -0.27, 0.02]);
    // Guarda do gatilho metálica
    addPart(root, new THREE.TorusGeometry(0.05, 0.014, 6, 14), darkMetalMat,
      [0, -0.25, -0.02], [1, 1, 1], [Math.PI / 2, 0, 0]);
    addPart(root, new THREE.BoxGeometry(0.018, 0.07, 0.018), metalMat, [0, -0.21, -0.02]);

    // Punho de madeira com detalhe de abóbora
    addPart(root, new THREE.CylinderGeometry(0.055, 0.065, 0.3, 10), woodMat,
      [0, -0.24, 0.15], [1, 1, 1], [0.35, 0, 0]);
    addPart(root, new THREE.SphereGeometry(0.03, 8, 6), mat(palette.pumpkin),
      [0, -0.32, 0.22], [1, 1, 1]);

    // Mini-abóboras no "pente" (lateral esquerda) - super visíveis
    for (let i = 0; i < 3; i++) {
      addPart(root, new THREE.SphereGeometry(0.055, 10, 8), mat(palette.pumpkin),
        [-0.2, -0.06, -0.02 + i * 0.07], [1, 0.9, 1]);
      addPart(root, new THREE.CylinderGeometry(0.008, 0.012, 0.03, 5), mat(palette.stem),
        [-0.2, 0.02, -0.02 + i * 0.07]);
    }

    // Folhas de abóbora na parte superior (como se fosse a "mira")
    for (const side of [-1, 1]) {
      addPart(root, new THREE.SphereGeometry(0.06, 8, 6), mat(palette.leafLight),
        [side * 0.18, 0.16, -0.32], [0.4, 0.9, 1.3], [0, side * 0.3, 0]);
    }
  }

  // =========================================================
  // === PEAVOLVER (Pea Revolver) ===
  // =========================================================
  else if (kind === "peavolver") {
    // Corpo: uma grande vagem de ervilha
    addPart(root, new THREE.CapsuleGeometry(0.09, 0.35, 4, 10), peaMat,
      [0, 0.02, -0.15], [1, 1.15, 1], [0, 0, Math.PI / 2]);

    // Cilindro de revólver com 6 "ervilhas" visíveis na parte externa
    addPart(root, new THREE.CylinderGeometry(0.12, 0.12, 0.2, 8), darkMetalMat,
      [0, 0.02, 0.03], [1, 1, 1], [0, 0, Math.PI / 2]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      addPart(root, new THREE.SphereGeometry(0.04, 8, 6), peaMat,
        [Math.cos(a) * 0.1, 0.02 + Math.sin(a) * 0.1, 0.03], [1, 1, 1]);
    }

    // Cano de ervilha
    addPart(root, new THREE.CylinderGeometry(0.04, 0.045, 0.42, 10), peaMat,
      [0, 0.02, -0.46], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    addPart(root, new THREE.CylinderGeometry(0.05, 0.05, 0.05, 10), darkMetalMat,
      [0, 0.02, -0.68], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    addPart(root, new THREE.CylinderGeometry(0.035, 0.035, 0.02, 10), mat(0x050505),
      [0, 0.02, -0.71], [1, 1, 1], [-Math.PI / 2, 0, 0]);

    // Punho (caule curvo)
    addPart(root, new THREE.CylinderGeometry(0.045, 0.055, 0.22, 8), woodMat,
      [0, -0.13, 0.14], [1, 1, 1], [0.4, 0, 0]);

    // Guarda do gatilho + gatilho
    addPart(root, new THREE.TorusGeometry(0.04, 0.012, 6, 12), darkMetalMat,
      [0, -0.08, 0.08], [1, 1, 1], [Math.PI / 2, 0, 0]);
    addPart(root, new THREE.BoxGeometry(0.014, 0.05, 0.014), metalMat, [0, -0.05, 0.08]);

    // Martelo do revólver (bem visível, é a assinatura do Peavolver)
    addPart(root, new THREE.BoxGeometry(0.04, 0.08, 0.03), darkMetalMat, [0, 0.1, 0.13], [1, 1, 1], [-0.4, 0, 0]);
    addPart(root, new THREE.SphereGeometry(0.025, 6, 4), metalMat, [0, 0.14, 0.1]);

    // Ervilhas decorativas ao longo do cano
    for (let i = 0; i < 3; i++) {
      addPart(root, new THREE.SphereGeometry(0.028, 6, 4), peaMat,
        [0.11, 0.05 + i * 0.03, -0.2 - i * 0.08], [1, 1, 1]);
    }

    // Mira frontal (uma ervilha em cima)
    addPart(root, new THREE.SphereGeometry(0.02, 6, 4), brightGoldMat, [0, 0.1, -0.6]);
  }

  // =========================================================
  // === HAYK-47 (Hay Assault Rifle) ===
  // =========================================================
  else if (kind === "hayk47") {
    // Corpo principal: fardo de feno retangular
    addPart(root, new THREE.BoxGeometry(0.18, 0.16, 0.55), hayMat, [0, 0, -0.2]);

    // Cordas de feno visíveis (4 voltas de corda)
    for (let i = 0; i < 4; i++) {
      addPart(root, new THREE.TorusGeometry(0.115, 0.014, 6, 10), ropeMat,
        [0, 0, -0.05 - i * 0.12], [1, 1, 1], [Math.PI / 2, 0, 0]);
    }

    // Cano enrolado em feno
    addPart(root, new THREE.CylinderGeometry(0.042, 0.052, 0.62, 10), hayMat,
      [0, 0.02, -0.6], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    // Anéis de corda no cano
    for (let i = 0; i < 3; i++) {
      addPart(root, new THREE.TorusGeometry(0.055, 0.012, 5, 10), ropeMat,
        [0, 0.02, -0.4 - i * 0.18], [1, 1, 1], [Math.PI / 2, 0, 0]);
    }
    // Boca metálica
    addPart(root, new THREE.CylinderGeometry(0.06, 0.06, 0.06, 10), darkMetalMat,
      [0, 0.02, -0.93], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    addPart(root, new THREE.CylinderGeometry(0.04, 0.04, 0.02, 10), mat(0x050505),
      [0, 0.02, -0.96], [1, 1, 1], [-Math.PI / 2, 0, 0]);

    // Coronha de feno
    addPart(root, new THREE.BoxGeometry(0.13, 0.15, 0.4), hayMat, [0, -0.02, 0.3]);
    addPart(root, new THREE.TorusGeometry(0.09, 0.012, 5, 10), ropeMat,
      [0, -0.02, 0.15], [1, 1, 1], [Math.PI / 2, 0, 0]);
    addPart(root, new THREE.TorusGeometry(0.09, 0.012, 5, 10), ropeMat,
      [0, -0.02, 0.42], [1, 1, 1], [Math.PI / 2, 0, 0]);

    // Pente (pequeno fardo pendurado)
    addPart(root, new THREE.BoxGeometry(0.09, 0.22, 0.12), hayMat, [0, -0.19, -0.1]);
    addPart(root, new THREE.TorusGeometry(0.065, 0.01, 4, 8), ropeMat,
      [0, -0.19, -0.1], [1, 1, 1], [Math.PI / 2, 0, 0]);
    addPart(root, new THREE.TorusGeometry(0.065, 0.01, 4, 8), ropeMat,
      [0, -0.19, -0.1], [1, 1, 1], [0, 0, Math.PI / 2]);

    // Punho
    addPart(root, new THREE.CylinderGeometry(0.04, 0.05, 0.2, 8), ropeMat,
      [0, -0.13, 0.13], [1, 1, 1], [0.4, 0, 0]);

    // Guarda do gatilho + gatilho
    addPart(root, new THREE.TorusGeometry(0.038, 0.011, 6, 12), darkMetalMat,
      [0, -0.08, 0.06], [1, 1, 1], [Math.PI / 2, 0, 0]);
    addPart(root, new THREE.BoxGeometry(0.013, 0.05, 0.013), metalMat, [0, -0.05, 0.06]);

    // Mira de palha no topo
    addPart(root, new THREE.BoxGeometry(0.02, 0.04, 0.02), hayMat, [0, 0.1, -0.75]);
    addPart(root, new THREE.BoxGeometry(0.06, 0.02, 0.02), hayMat, [0, 0.1, -0.1]);

    // Fiapos soltos de feno (bem característicos)
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2;
      addPart(root, new THREE.CylinderGeometry(0.004, 0.004, 0.08, 3), hayMat,
        [Math.cos(a) * 0.15, Math.random() * 0.12 - 0.03, -0.15 - Math.random() * 0.35],
        [1, 1, 1], [Math.random() * 2, Math.random() * 2, Math.random() * 2]);
    }
  }

  // =========================================================
  // === WATERMELMG (Watermelon Machine Gun) ===
  // =========================================================
  else if (kind === "watermelon") {
    // Corpo principal: melancia grande com casca listrada
    addPart(root, new THREE.SphereGeometry(0.3, 16, 12), watermelonRindMat,
      [0, 0, -0.25], [1.15, 1, 1.15]);

    // Listras escuras verticais bem visíveis
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      addPart(root, new THREE.BoxGeometry(0.03, 0.55, 0.03), watermelonStripeMat,
        [Math.cos(a) * 0.3, 0, -0.25 + Math.sin(a) * 0.3], [1, 1, 1], [0, 0, a]);
    }

    // Carne exposta (onde o cano sai) com sementes
    addPart(root, new THREE.SphereGeometry(0.16, 12, 10), watermelonFleshMat,
      [0, 0, -0.52], [1, 0.9, 0.5]);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const r = 0.06 + (i % 3) * 0.03;
      addPart(root, new THREE.SphereGeometry(0.018, 5, 4), seedMat,
        [Math.cos(a) * r, Math.sin(a) * r * 0.8, -0.58], [1, 1, 1]);
    }

    // Cano metálico pesado
    addPart(root, new THREE.CylinderGeometry(0.065, 0.075, 0.55, 12), darkMetalMat,
      [0, 0, -0.78], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    // Enrolamento de arame visível
    for (let i = 0; i < 4; i++) {
      addPart(root, new THREE.TorusGeometry(0.08, 0.014, 6, 12), metalMat,
        [0, 0, -0.6 - i * 0.12], [1, 1, 1], [Math.PI / 2, 0, 0]);
    }
    // Boca do cano
    addPart(root, new THREE.CylinderGeometry(0.09, 0.09, 0.08, 14), darkMetalMat,
      [0, 0, -1.08], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    addPart(root, new THREE.CylinderGeometry(0.06, 0.06, 0.02, 14), mat(0x050505),
      [0, 0, -1.13], [1, 1, 1], [-Math.PI / 2, 0, 0]);

    // Bipé de vinha (bem visível embaixo do cano)
    for (const side of [-1, 1]) {
      addPart(root, new THREE.CylinderGeometry(0.018, 0.025, 0.32, 6), mat(palette.stem),
        [side * 0.17, -0.22, -0.75], [1, 1, 1], [0.35, 0, side * 0.45]);
      addPart(root, new THREE.SphereGeometry(0.025, 6, 4), mat(palette.leafLight),
        [side * 0.26, -0.35, -0.82], [1, 1, 1]);
    }

    // Coronha curva (vinha grossa)
    addPart(root, new THREE.CylinderGeometry(0.06, 0.07, 0.45, 8), woodMat,
      [0, -0.1, 0.22], [1, 1, 1], [0.25, 0, 0]);
    // Detalhe de vinha enrolada na coronha
    addPart(root, new THREE.TorusGeometry(0.07, 0.012, 5, 10), mat(palette.stem),
      [0, -0.04, 0.35], [1, 1, 1], [Math.PI / 2, 0, 0]);

    // Punho
    addPart(root, new THREE.CylinderGeometry(0.05, 0.06, 0.22, 8), woodMat,
      [0, -0.24, 0.05], [1, 1, 1], [0.4, 0, 0]);

    // Guarda do gatilho + gatilho
    addPart(root, new THREE.TorusGeometry(0.045, 0.012, 6, 12), darkMetalMat,
      [0, -0.18, 0.02], [1, 1, 1], [Math.PI / 2, 0, 0]);
    addPart(root, new THREE.BoxGeometry(0.015, 0.06, 0.015), metalMat, [0, -0.15, 0.02]);

    // Pente = cesto de melancias pequenas
    for (let i = 0; i < 3; i++) {
      addPart(root, new THREE.SphereGeometry(0.05, 8, 6), watermelonRindMat,
        [0.16, -0.12 + i * 0.05, -0.1]);
      addPart(root, new THREE.BoxGeometry(0.008, 0.06, 0.06), watermelonStripeMat,
        [0.16, -0.12 + i * 0.05, -0.1]);
    }

    // Folhas na parte superior (mira)
    for (const side of [-1, 1]) {
      addPart(root, new THREE.SphereGeometry(0.07, 8, 6), mat(palette.leafLight),
        [side * 0.22, 0.2, -0.45], [0.4, 0.9, 1.3]);
    }

    // Caule no topo da melancia
    addPart(root, new THREE.CylinderGeometry(0.03, 0.04, 0.12, 6), mat(palette.stem),
      [0, 0.32, -0.25], [1, 1, 1], [0.2, 0, 0]);
  }

  return root;
}

// Front (support) hand grip positions.
const weaponGrip = {
  corn: [0, 0.02, -0.35],
  sunflower: [0, 0.02, -0.5],
  pumpkin: [0, -0.1, -0.15],
  peavolver: [0, 0, -0.25],
  hayk47: [0, 0, -0.4],
  watermelon: [0, -0.08, -0.3],
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
  const ammo = { corn: 6, sunflower: 2, pumpkin: 1, peavolver: 3, hayk47: 4, watermelon: 2 };

  let selected = "corn";
  let shotCooldown = 0;
  let handMotion = 0;
  let elapsed = 0;

  let reloadActive = false;
  let reloadProgress = 0;

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
    if (stockLabel) stockLabel.textContent =
      `🌽 ${ammo.corn}  🌻 ${ammo.sunflower}  🎃 ${ammo.pumpkin}  🫛 ${ammo.peavolver}  🌾 ${ammo.hayk47}  🍉 ${ammo.watermelon}`;
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
  makePickup("peavolver", 10, 5);
  makePickup("hayk47", -12, 30);
  makePickup("watermelon", 5, -50);

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
