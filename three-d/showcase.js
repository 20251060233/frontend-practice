// ===== Three.js 校园地标场景 =====
// 场景构成：地面道路 + 校门 + 主教学楼 + 图书馆 + 钟楼 + 旗杆 + 树木 + 路灯 + 云
// 光源：环境光 + 带阴影的方向光 + 路灯点光源
// 动画：旗帜摆动、云朵飘移、钟楼指针旋转；交互：OrbitControls 鼠标拖拽

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);           // 天空蓝
scene.fog = new THREE.Fog(0x87ceeb, 30, 70);            // 雾：远景渐隐

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(11, 6.5, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;                      // 开启阴影
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// 鼠标拖拽环绕观察（含阻尼）
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.5, 0);

// ===== 光源：环境光 + 太阳方向光（投影） =====
scene.add(new THREE.AmbientLight(0xbfd4e2, 0.55));
const sun = new THREE.DirectionalLight(0xfff3e0, 0.95);
sun.position.set(14, 20, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = sun.shadow.camera.bottom = -28;
sun.shadow.camera.right = sun.shadow.camera.top = 28;
sun.shadow.camera.far = 60;
scene.add(sun);

// ===== 通用建模辅助：批量创建带阴影的实体 =====
function addBox(w, h, d, color, x, y, z, material) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    material || new THREE.MeshStandardMaterial({ color })
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}
function addCylinder(rTop, rBottom, h, color, x, y, z, segments) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(rTop, rBottom, h, segments || 24),
    new THREE.MeshStandardMaterial({ color })
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

// ===== 地面：草地 + 纵贯校园的大道 =====
const grass = new THREE.Mesh(
  new THREE.PlaneGeometry(46, 46),
  new THREE.MeshStandardMaterial({ color: 0x7cb342 })
);
grass.rotation.x = -Math.PI / 2;
grass.receiveShadow = true;
scene.add(grass);

const road = new THREE.Mesh(
  new THREE.PlaneGeometry(4.4, 24),
  new THREE.MeshStandardMaterial({ color: 0xbdbdbd })
);
road.rotation.x = -Math.PI / 2;
road.position.set(0, 0.02, -2);
road.receiveShadow = true;
scene.add(road);

// ===== 校门：双柱 + 横梁 + 门匾 =====
addBox(0.7, 3.4, 0.7, 0x8d6e63, -3.4, 1.7, 8);
addBox(0.7, 3.4, 0.7, 0x8d6e63, 3.4, 1.7, 8);
addBox(7.6, 0.55, 0.7, 0x6d4c41, 0, 3.55, 8);
addBox(3.4, 0.7, 0.15, 0xffd54f, 0, 3.55, 8.4);   // 门匾

// ===== 主教学楼：楼体 + 红屋顶 + 大门 + 两排发光窗 =====
addBox(10, 4.6, 3, 0xf5f5f5, 0, 2.3, -13);
addBox(10.8, 0.5, 3.6, 0xb71c1c, 0, 4.85, -13);
addBox(1.4, 2.4, 0.15, 0x6d4c41, 0, 1.2, -11.45);
const windowMat = new THREE.MeshStandardMaterial({
  color: 0xfff8e1, emissive: 0xffd54f, emissiveIntensity: 0.35
});
for (let row = 0; row < 2; row++) {
  for (let col = 0; col < 6; col++) {
    addBox(0.8, 1, 0.08, null, -3.8 + col * 1.52, row === 0 ? 1.6 : 3.3, -11.45, windowMat);
  }
}

// ===== 图书馆：台基 + 圆形大堂 + 穹顶 =====
addBox(6, 0.4, 6, 0xe0e0e0, -8, 0.2, -8);
addCylinder(2.4, 2.4, 3.4, 0xeceff1, -8, 2.1, -8);
const dome = new THREE.Mesh(
  new THREE.SphereGeometry(2.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
  new THREE.MeshStandardMaterial({ color: 0xcfd8dc })
);
dome.position.set(-8, 3.8, -8);
dome.castShadow = true;
scene.add(dome);

// ===== 钟楼：塔身 + 红锥顶 + 钟面 + 旋转指针（动画） =====
addBox(3, 5.6, 3, 0xf5f5f5, 8, 2.8, -8);
const spire = new THREE.Mesh(
  new THREE.ConeGeometry(2.3, 2.2, 4),
  new THREE.MeshStandardMaterial({ color: 0xb71c1c })
);
spire.position.set(8, 6.7, -8);
spire.rotation.y = Math.PI / 4;
spire.castShadow = true;
scene.add(spire);
const clockFace = addCylinder(1, 1, 0.12, 0xfffde7, 8, 4.4, -6.42);
clockFace.rotation.x = Math.PI / 2;
const hand = new THREE.Mesh(
  new THREE.BoxGeometry(0.08, 0.85, 0.03),
  new THREE.MeshStandardMaterial({ color: 0x37474f })
);
hand.position.set(8, 4.83, -6.32);          // 针体上偏，绕钟心旋转
scene.add(hand);

// ===== 旗杆与旗帜：旗挂杆侧，绕杆摆动（动画） =====
addCylinder(0.05, 0.05, 5.4, 0x9e9e9e, 3.5, 2.7, 1);
const flag = new THREE.Mesh(
  new THREE.PlaneGeometry(1.5, 0.9),
  new THREE.MeshStandardMaterial({ color: 0xe53935, side: THREE.DoubleSide })
);
flag.position.set(4.35, 4.7, 1);
flag.castShadow = true;
scene.add(flag);

// ===== 树木×8：球形冠与锥形冠两种树形 =====
const treeSpots = [
  [-6, 2], [-5.5, -3], [-4, -13], [-4.5, 4.5],
  [5, 4], [4.5, -13], [6.5, -3], [5.5, -6.5]
];
treeSpots.forEach(([x, z], i) => {
  addCylinder(0.14, 0.18, 1.2, 0x795548, x, 0.6, z);
  if (i % 2 === 0) {
    const crown = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 20, 16),
      new THREE.MeshStandardMaterial({ color: 0x43a047 })
    );
    crown.position.set(x, 1.9, z);
    crown.castShadow = true;
    scene.add(crown);
  } else {
    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(0.9, 1.9, 12),
      new THREE.MeshStandardMaterial({ color: 0x2e7d32 })
    );
    crown.position.set(x, 2.15, z);
    crown.castShadow = true;
    scene.add(crown);
  }
});

// ===== 路灯×3：灯杆 + 自发光灯球，其中2盏挂真实点光源 =====
const lampShots = [[-3, 4.5], [3, -1], [-3, -7]];
lampShots.forEach(([x, z], i) => {
  addCylinder(0.08, 0.1, 3, 0x616161, x, 1.5, z);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xfff59d })    // 自发光材质
  );
  bulb.position.set(x, 3.15, z);
  scene.add(bulb);
  if (i < 2) {
    const light = new THREE.PointLight(0xfff59d, 0.5, 10);
    light.position.set(x, 3.3, z);
    scene.add(light);
  }
});

// ===== 云×3：多球组合，横向飘移循环 =====
const clouds = [];
[[-10, 10, -16], [8, 11, -20], [0, 12, -24]].forEach(([x, y, z]) => {
  const cloud = new THREE.Group();
  [[0, 0, 0, 1.2], [1.3, -0.2, 0, 0.9], [-1.2, -0.15, 0, 0.8]].forEach(([cx, cy, cz, r]) => {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(r, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    puff.position.set(cx, cy, cz);
    cloud.add(puff);
  });
  cloud.position.set(x, y, z);
  scene.add(cloud);
  clouds.push(cloud);
});

// ===== 动画循环：旗帜摆动 + 云飘移 + 钟楼指针 =====
const clock = new THREE.Clock();
const animate = () => {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  flag.rotation.y = Math.sin(t * 2.2) * 0.4;              // 旗帜绕杆摆
  hand.rotation.z = -t * (Math.PI * 2 / 30);              // 指针30秒一圈
  clouds.forEach((c, i) => {
    c.position.x += 0.01 + i * 0.004;
    if (c.position.x > 30) c.position.x = -30;            // 飘出边界回到起点
  });

  controls.update();                                       // 阻尼必需
  renderer.render(scene, camera);
};
animate();

// ===== 窗口自适应 =====
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
