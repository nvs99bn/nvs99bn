import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const byId = (id) => document.getElementById(id);
const canvas = byId('ocean');
const islands = [
  {
    x: -12,
    z: -5,
    name: 'Stillwater',
    topic: 'My backend work',
    tool: 'Focus deck',
    href: '#focus',
    copy: 'I work on Python services, API connections, and data transformations. Regression tests and clear diagnostics help keep those moving parts dependable. Take a focused break here before your next destination.',
  },
  {
    x: 0,
    z: 6,
    name: 'Ink Isle',
    topic: 'My interfaces',
    tool: 'Captain’s notes',
    href: '#notes',
    copy: 'My frontend work includes React and TypeScript applications, dashboards, and multilingual workflows. I pay attention to details such as timezone correctness. Use this island’s notepad to capture an idea of your own.',
  },
  {
    x: 12,
    z: -5,
    name: 'Compass Cay',
    topic: 'My direction & a public build',
    tool: 'the case study',
    href: 'case-study.html',
    copy: 'My direction is applied AI engineering, built on Python services and TypeScript interfaces. This AI-assisted 3D voyage is a public web project you can inspect: read its design decisions, source code, and browser tests in the case study.',
  },
];
let visited = new Set();
try {
  const saved = JSON.parse(localStorage.getItem('sunny.islands') || '[]');
  if (Array.isArray(saved))
    visited = new Set(saved.filter((i) => Number.isInteger(i) && i >= 0 && i < 3));
} catch {}
function progress() {
  byId('discovery-count').textContent =
    visited.size === 3
      ? '✧ Explorer’s Seal earned · 3 / 3'
      : `${visited.size} / 3 islands discovered`;
  document
    .querySelectorAll('[data-island]')
    .forEach((b) => b.classList.toggle('discovered', visited.has(Number(b.dataset.island))));
}
function discover(index) {
  visited.add(index);
  try {
    localStorage.setItem('sunny.islands', JSON.stringify([...visited]));
  } catch {}
  const island = islands[index];
  progress();
  byId('discovery').hidden = false;
  byId('discovery-label').textContent =
    visited.size === 3
      ? 'EXPLORER’S SEAL EARNED · ALL ISLANDS DISCOVERED'
      : 'LANDFALL · ISLAND DISCOVERED';
  byId('discovery-title').textContent = `${island.name} — ${island.topic}`;
  byId('discovery-copy').textContent = island.copy;
  byId('discovery-link').href = island.href;
  byId('discovery-link').textContent = `Open ${island.tool} ↗`;
  byId('game-status').textContent = `Docked at ${island.name}. Your discovery is below the chart.`;
}
function resetProgress() {
  visited.clear();
  try {
    localStorage.removeItem('sunny.islands');
  } catch {}
  byId('discovery').hidden = true;
  progress();
}
progress();
let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'low-power',
  });
} catch {
  canvas.hidden = true;
  byId('game-status').textContent =
    '3D is unavailable in this browser. Choose any island below to explore.';
  document
    .querySelectorAll('[data-island]')
    .forEach((b) => b.addEventListener('click', () => discover(Number(b.dataset.island))));
  byId('restart-voyage').addEventListener('click', resetProgress);
}
if (renderer) startWorld();

function startWorld() {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#18383e');
  scene.fog = new THREE.Fog('#18383e', 65, 120);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  const camera = new THREE.OrthographicCamera(-26, 26, 14, -14, 0.1, 180);
  camera.position.set(12, 33, 37);
  camera.lookAt(0, 0, 0);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = 1.12;
  controls.minAzimuthAngle = -0.75;
  controls.maxAzimuthAngle = 0.75;
  controls.target.set(0, 0, 0);
  controls.update();
  controls.saveState();
  scene.add(new THREE.HemisphereLight('#d7f1ef', '#59665b', 2.6));
  const sun = new THREE.DirectionalLight('#ffe0a5', 3.6);
  sun.position.set(-12, 25, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, {
    left: -26,
    right: 26,
    top: 22,
    bottom: -22,
    near: 0.5,
    far: 80,
  });
  sun.shadow.normalBias = 0.05;
  sun.shadow.bias = -0.0003;
  scene.add(sun);
  const mat = (color, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true, ...extra });
  const palette = {
    sand: mat('#dec28b'),
    earth: mat('#827552'),
    grass: mat('#78a87b'),
    leaves: mat('#3d8061'),
    wood: mat('#845235'),
    gold: mat('#e7b654'),
    sail: mat('#f5e6c2', { side: THREE.DoubleSide }),
    red: mat('#b64c43'),
    stone: mat('#b0b7a1'),
    cream: mat('#f4dfb8'),
  };
  function mesh(geometry, material, parent, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(geometry, material);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  const box = (w, h, d, m, p, x, y, z) => mesh(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const cylinder = (rt, rb, h, m, p, x, y, z, n = 9) =>
    mesh(new THREE.CylinderGeometry(rt, rb, h, n), m, p, x, y, z);
  const sphere = (r, m, p, x, y, z) => mesh(new THREE.IcosahedronGeometry(r, 1), m, p, x, y, z);
  function palm(parent, x, z, scale = 1) {
    const g = new THREE.Group();
    g.position.set(x, 1.05, z);
    g.scale.setScalar(scale);
    parent.add(g);
    const trunk = cylinder(0.12, 0.2, 2.7, palette.wood, g, 0.1, 1.2, 0, 6);
    trunk.rotation.z = -0.12;
    for (let j = 0; j < 6; j++) {
      const leaf = mesh(
        new THREE.ConeGeometry(0.45, 1.75, 4),
        palette.leaves,
        g,
        Math.cos((j * Math.PI) / 3) * 0.6,
        2.55,
        Math.sin((j * Math.PI) / 3) * 0.6,
      );
      leaf.rotation.z = Math.PI / 2 + 0.3;
      leaf.rotation.y = (-j * Math.PI) / 3;
    }
    sphere(0.23, palette.gold, g, 0.1, 2.4, 0);
  }
  const waterGeometry = new THREE.PlaneGeometry(180, 150, 72, 60);
  waterGeometry.rotateX(-Math.PI / 2);
  const water = mesh(
    waterGeometry,
    mat('#ffffff', { roughness: 0.36, metalness: 0.12, vertexColors: true }),
    scene,
  );
  water.castShadow = false;
  const pos = waterGeometry.attributes.position;
  const waterColors = new Float32Array(pos.count * 3),
    deep = new THREE.Color('#174b62'),
    shallow = new THREE.Color('#4eaca5');
  for (let n = 0; n < pos.count; n++) {
    const distance = Math.min(
      ...islands.map((i) => Math.hypot(pos.getX(n) - i.x, pos.getZ(n) - i.z)),
    );
    const color = shallow.clone().lerp(deep, Math.min(1, Math.max(0, (distance - 2) / 12)));
    color.toArray(waterColors, n * 3);
  }
  waterGeometry.setAttribute('color', new THREE.BufferAttribute(waterColors, 3));
  const ripples = [];
  for (let n = 0; n < 70; n++) {
    const ripple = mesh(
      new THREE.PlaneGeometry(0.3 + (n % 4) * 0.25, 0.035),
      new THREE.MeshBasicMaterial({
        color: '#b4e1ce',
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
      }),
      scene,
      ((n * 13.73) % 64) - 32,
      0.12,
      ((n * 9.23) % 42) - 21,
    );
    ripple.rotation.x = -Math.PI / 2;
    ripple.castShadow = false;
    ripples.push(ripple);
  }
  const islandGroups = [];
  const beacons = [];
  islands.forEach((island, index) => {
    const g = new THREE.Group();
    g.position.set(island.x, 0, island.z);
    scene.add(g);
    islandGroups.push(g);
    cylinder(3.15, 2.5, 0.7, palette.earth, g, 0, -0.12, 0, 11);
    cylinder(2.95, 3.15, 0.5, palette.sand, g, 0, 0.42, 0, 11);
    cylinder(2.25, 2.55, 0.24, palette.grass, g, -0.15, 0.76, -0.1, 10);
    const shore = mesh(
      new THREE.RingGeometry(3.3, 3.42, 40),
      new THREE.MeshBasicMaterial({
        color: '#c1eed7',
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      }),
      g,
      0,
      0.12,
      0,
    );
    shore.rotation.x = -Math.PI / 2;
    shore.castShadow = false;
    for (let n = 0; n < 5; n++) box(0.75, 0.12, 0.28, palette.wood, g, 0, 0.52, 2.6 + n * 0.28);
    [-0.34, 0.34].forEach((x) => cylinder(0.07, 0.07, 0.85, palette.wood, g, x, 0.26, 3.55, 5));
    palm(g, -1.5, -0.4, 0.8);
    palm(g, 1.55, 0.3, 0.62);
    [
      [-2, 1.5],
      [1.6, -1.75],
      [-0.9, -2],
    ].forEach(([x, z], k) => {
      const rock = sphere(0.36 + k * 0.08, palette.stone, g, x, 0.8, z);
      rock.scale.y = 0.7;
    });
    if (index === 0) {
      cylinder(0.5, 0.72, 2.7, palette.cream, g, 0.2, 2, -0.35);
      cylinder(0.58, 0.61, 0.35, palette.red, g, 0.2, 2.35, -0.35);
      cylinder(0.72, 0.72, 0.16, palette.gold, g, 0.2, 3.4, -0.35);
      cylinder(
        0.44,
        0.44,
        0.62,
        mat('#f6ce76', { emissive: '#b77b23', emissiveIntensity: 0.55 }),
        g,
        0.2,
        3.7,
        -0.35,
      );
      mesh(new THREE.ConeGeometry(0.82, 0.65, 8), palette.red, g, 0.2, 4.25, -0.35);
    } else if (index === 1) {
      box(1.7, 1.3, 1.3, palette.cream, g, 0, 1.55, -0.3);
      const roof = mesh(new THREE.ConeGeometry(1.65, 1.1, 4), palette.red, g, 0, 2.7, -0.3);
      roof.rotation.y = Math.PI / 4;
      box(0.43, 0.88, 0.04, palette.wood, g, 0, 1.35, 0.37);
      box(0.3, 0.3, 0.05, palette.gold, g, -0.56, 1.8, 0.38);
      for (let n = 0; n < 3; n++)
        box(
          0.62,
          0.18,
          0.4,
          [palette.red, palette.sail, palette.gold][n],
          g,
          1.15,
          1.0 + n * 0.18,
          1.1,
        );
    } else {
      cylinder(0.18, 0.2, 1.7, palette.cream, g, -0.65, 1.6, -0.3);
      cylinder(0.18, 0.2, 1.7, palette.cream, g, 0.65, 1.6, -0.3);
      box(1.9, 0.25, 0.5, palette.cream, g, 0, 2.5, -0.3);
      const ring = mesh(new THREE.TorusGeometry(0.62, 0.1, 5, 24), palette.gold, g, 0, 3.3, -0.3);
      ring.rotation.y = 0.3;
      mesh(new THREE.OctahedronGeometry(0.28), palette.gold, g, 0, 3.3, -0.3);
      box(0.75, 0.4, 0.6, palette.wood, g, 0.8, 1.1, 1.2);
      box(0.8, 0.12, 0.65, palette.gold, g, 0.8, 1.35, 1.2);
    }
    const beacon = mesh(new THREE.OctahedronGeometry(0.26), palette.gold, g, 0, 5, 0);
    beacons.push(beacon);
    const label = document.createElement('span');
    label.className = 'island-label';
    label.textContent = island.name;
    label.setAttribute('aria-hidden', 'true');
    canvas.parentElement.append(label);
    island.label = label;
  });
  // A compact original ship model: curved hull, cream sails and a golden lion bow.
  const ship = new THREE.Group();
  scene.add(ship);
  ship.position.set(-16, 0.45, 8);
  ship.scale.setScalar(1.2);
  const hullShape = new THREE.Shape();
  hullShape.moveTo(-1.4, -0.48);
  hullShape.lineTo(0.85, -0.55);
  hullShape.quadraticCurveTo(1.8, 0, 0.85, 0.55);
  hullShape.lineTo(-1.4, 0.48);
  hullShape.quadraticCurveTo(-1.65, 0, -1.4, -0.48);
  const hullGeo = new THREE.ExtrudeGeometry(hullShape, {
    depth: 0.55,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.13,
    bevelThickness: 0.15,
  });
  hullGeo.rotateX(-Math.PI / 2);
  mesh(hullGeo, palette.wood, ship, 0, 0, 0);
  box(2.3, 0.14, 0.88, palette.gold, ship, -0.1, 0.54, 0);
  box(0.66, 0.55, 0.65, palette.cream, ship, -0.92, 0.82, 0);
  cylinder(0.055, 0.075, 2.7, palette.wood, ship, 0.15, 1.84, 0, 6);
  const yard = cylinder(0.045, 0.045, 1.9, palette.wood, ship, 0.15, 2.7, 0, 6);
  yard.rotation.z = Math.PI / 2;
  const sailGeo = new THREE.PlaneGeometry(1.65, 1.6, 10, 10);
  const sailPos = sailGeo.attributes.position;
  for (let n = 0; n < sailPos.count; n++) {
    const u = sailPos.getX(n);
    sailPos.setZ(n, Math.cos((u / 1.65) * Math.PI) * 0.3);
  }
  sailGeo.computeVertexNormals();
  mesh(sailGeo, palette.sail, ship, 0.15, 1.98, 0);
  mesh(new THREE.CircleGeometry(0.21, 20), palette.gold, ship, 0.15, 2.08, 0.315);
  box(0.52, 0.25, 0.03, palette.red, ship, 0.4, 3.13, 0);
  sphere(0.36, palette.gold, ship, 1.45, 0.65, 0);
  sphere(0.23, palette.cream, ship, 1.69, 0.67, 0);
  [-0.12, 0.12].forEach((z) => sphere(0.045, palette.wood, ship, 1.88, 0.74, z));
  for (let n = 0; n < 8; n++) {
    const angle = (n * Math.PI) / 4;
    const ray = mesh(
      new THREE.ConeGeometry(0.12, 0.32, 4),
      palette.gold,
      ship,
      1.45,
      0.65 + Math.cos(angle) * 0.36,
      Math.sin(angle) * 0.36,
    );
    ray.rotation.x = angle;
  }
  const destination = mesh(
    new THREE.RingGeometry(0.32, 0.4, 24),
    new THREE.MeshBasicMaterial({
      color: '#ffe0a5',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    }),
    scene,
  );
  destination.rotation.x = -Math.PI / 2;
  destination.visible = false;
  const raycaster = new THREE.Raycaster(),
    pointer = new THREE.Vector2(),
    seaPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    hit = new THREE.Vector3();
  let target = null,
    docked = -1,
    last = 0,
    time = 0,
    inView = false,
    contextLost = false,
    route = [];
  const keys = new Set();
  function sailTo(x, z) {
    target = new THREE.Vector3(
      THREE.MathUtils.clamp(x, -21, 21),
      0,
      THREE.MathUtils.clamp(z, -12, 13),
    );
    destination.position.set(target.x, 0.2, target.z);
    destination.visible = true;
    byId('game-status').textContent = 'Under sail. Your next discovery is on the horizon.';
  }
  let pointerStart = null;
  canvas.addEventListener('pointerdown', (e) => {
    pointerStart = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener('pointerup', (e) => {
    if (!pointerStart || Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y) > 7) {
      pointerStart = null;
      return;
    }
    pointerStart = null;
    const r = canvas.getBoundingClientRect();
    pointer.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      (-(e.clientY - r.top) / r.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    if (raycaster.ray.intersectPlane(seaPlane, hit)) {
      route = [];
      sailTo(hit.x, hit.z);
    }
    canvas.focus({ preventScroll: true });
  });
  canvas.addEventListener('pointercancel', () => {
    pointerStart = null;
  });
  const movement = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'];
  canvas.addEventListener('keydown', (e) => {
    if (movement.includes(e.key)) {
      e.preventDefault();
      keys.add(e.key);
      route = [];
      target = null;
      destination.visible = false;
    }
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key));
  canvas.addEventListener('blur', () => keys.clear());
  window.addEventListener('blur', () => keys.clear());
  document.querySelectorAll('[data-island]').forEach((button) =>
    button.addEventListener('click', () => {
      const i = Number(button.dataset.island);
      if (contextLost) {
        discover(i);
        return;
      }
      if (docked === i) discover(i);
      else {
        route = [
          { x: islands[i].x, z: 12 },
          { x: islands[i].x, z: islands[i].z + 3.7 },
        ];
        sailTo(ship.position.x, 12);
      }
    }),
  );
  byId('restart-voyage').addEventListener('click', () => {
    resetProgress();
    ship.position.set(-16, 0.45, 8);
    target = null;
    route = [];
    docked = -1;
    keys.clear();
    destination.visible = false;
    controls.reset();
    byId('game-status').textContent = 'A fresh voyage. Tap the water, or choose an island.';
  });
  byId('reset-camera').addEventListener('click', () => controls.reset());
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    contextLost = true;
    byId('game-status').textContent =
      '3D rendering paused. The island buttons and all tools still work.';
  });
  canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    byId('game-status').textContent = 'Back at sea. Choose your next destination.';
  });
  function resize() {
    const width = canvas.clientWidth,
      height = canvas.clientHeight;
    renderer.setSize(width, height, false);
    const aspect = width / height;
    const halfW = aspect > 1.5 ? 24 : 22;
    camera.left = -halfW;
    camera.right = halfW;
    camera.top = halfW / aspect;
    camera.bottom = -halfW / aspect;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();
  new IntersectionObserver(
    (entries) => {
      inView = entries[0].isIntersecting;
    },
    { rootMargin: '100px' },
  ).observe(canvas);
  const projected = new THREE.Vector3();
  function frame(now) {
    // Preserve elapsed time on slower renderers. A 50 ms cap made voyages
    // run in slow motion below 20 FPS. Limit only long stalls; at 250 ms
    // the maximum movement step is still smaller than an island radius.
    const dt = Math.min((now - last) / 1000 || 0, 0.25);
    last = now;
    if (!inView || document.hidden || contextLost) {
      requestAnimationFrame(frame);
      return;
    }
    time += dt;
    controls.update();
    let dx =
        (keys.has('ArrowRight') || keys.has('d') ? 1 : 0) -
        (keys.has('ArrowLeft') || keys.has('a') ? 1 : 0),
      dz =
        (keys.has('ArrowDown') || keys.has('s') ? 1 : 0) -
        (keys.has('ArrowUp') || keys.has('w') ? 1 : 0);
    if (target) {
      dx = target.x - ship.position.x;
      dz = target.z - ship.position.z;
      if (Math.hypot(dx, dz) < 0.15) {
        target = null;
        destination.visible = false;
        dx = dz = 0;
        if (route.length) {
          const next = route.shift();
          sailTo(next.x, next.z);
        }
      }
    }
    const length = Math.hypot(dx, dz);
    if (length) {
      const step = Math.min(5.5 * dt, target ? length : Infinity);
      let nx = ship.position.x + (dx / length) * step,
        nz = ship.position.z + (dz / length) * step;
      // Keep the hull outside the beaches while allowing it to slide along shore.
      for (const island of islands) {
        const ix = nx - island.x,
          iz = nz - island.z,
          dist = Math.hypot(ix, iz);
        if (dist < 3.6 && dist > 0.001) {
          nx = island.x + (ix / dist) * 3.6;
          nz = island.z + (iz / dist) * 3.6;
        }
      }
      ship.position.x = THREE.MathUtils.clamp(nx, -21, 21);
      ship.position.z = THREE.MathUtils.clamp(nz, -12, 13);
      const angle = -Math.atan2(dz, dx);
      ship.rotation.y +=
        Math.atan2(Math.sin(angle - ship.rotation.y), Math.cos(angle - ship.rotation.y)) *
        Math.min(1, dt * 8);
    }
    const near = islands.findIndex(
      (i) => Math.hypot(ship.position.x - i.x, ship.position.z - i.z) < 4.15,
    );
    if (near !== -1 && near !== docked) {
      docked = near;
      target = null;
      route = [];
      keys.clear();
      destination.visible = false;
      discover(near);
    } else if (near === -1) docked = -1;
    if (!reducedMotion.matches) {
      ship.position.y = 0.45 + Math.sin(time * 2) * 0.065;
      ship.rotation.x = Math.sin(time * 1.5) * 0.035;
      ship.rotation.z = Math.sin(time * 1.8) * 0.035;
      for (let n = 0; n < pos.count; n++) {
        pos.setY(
          n,
          Math.sin(pos.getX(n) * 0.65 + time) * Math.cos(pos.getZ(n) * 0.6 + time * 0.7) * 0.09,
        );
      }
      pos.needsUpdate = true;
      ripples.forEach((r, n) => {
        r.material.opacity = 0.12 + (Math.sin(time + n) + 1) * 0.08;
      });
    }
    beacons.forEach((b, i) => {
      b.visible = !visited.has(i);
      if (!reducedMotion.matches) {
        b.rotation.y = time * 0.7;
        b.position.y = 4.9 + Math.sin(time * 1.6 + i) * 0.15;
      }
    });
    islands.forEach((i) => {
      projected.set(i.x, 0.8, i.z + 4.2).project(camera);
      i.label.style.left = `${(projected.x * 0.5 + 0.5) * 100}%`;
      i.label.style.top = `${(-projected.y * 0.5 + 0.5) * 100}%`;
      i.label.hidden = projected.z > 1;
    });
    renderer.render(scene, camera);
    canvas.dataset.ready = 'true';
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
