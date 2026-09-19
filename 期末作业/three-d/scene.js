// ===== Three.js 食堂一层餐厅三维场景（期末作业：三维展示区域） =====
// 场景构成：餐厅地板 + 后墙档口（柜台/招牌/菜盆）+ 圆桌座椅 + 打餐排队的师生 + 吊灯
// 光源：环境光 + 带阴影的方向光 + 吊灯点光源；动画：排队人流起伏、招牌灯闪烁
// 交互：OrbitControls 鼠标左键拖拽旋转 / 滚轮缩放 / 右键平移
// 降级：Three.js 库缺失或 WebGL 不可用时，在容器内显示提示条，不阻塞页面其余功能

(function () {
  'use strict';

  // ----- 降级提示：在容器内显示一条错误信息 -----
  function showFallback(msg) {
    var box = document.getElementById('webglFallback');
    if (box) {
      box.textContent = msg;
      box.style.display = 'flex';
    }
  }

  // ----- WebGL 支持性检测 -----
  function webglAvailable() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  function init() {
    var container = document.getElementById('scene3d');
    if (!container) return;

    // 库缺失 / WebGL 不可用：显示降级提示并停止初始化
    if (typeof THREE === 'undefined') {
      showFallback('三维库 Three.js 加载失败，请确认 libs 文件完整后刷新页面。');
      return;
    }
    if (!webglAvailable()) {
      showFallback('当前浏览器不支持 WebGL，无法展示三维场景，请更换现代浏览器查看。');
      return;
    }

    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfdf3e3);          // 暖米色餐厅背景
    scene.fog = new THREE.Fog(0xfdf3e3, 34, 70);

    // 相机与渲染器：尺寸跟随容器（嵌入页面内，而非全屏）
    var camera = new THREE.PerspectiveCamera(48, 2, 0.1, 200);
    camera.position.set(12, 9, 15);

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    function fit() {
      var w = container.clientWidth || 1;
      var h = container.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    fit();
    window.addEventListener('resize', fit);

    // 轨道控制器：拖拽旋转 / 滚轮缩放
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 1, -1);
    controls.minDistance = 6;
    controls.maxDistance = 40;
    controls.maxPolarAngle = Math.PI * 0.49;   // 不允许钻到地板以下

    // ===== 光源：环境光 + 太阳方向光（投影） =====
    scene.add(new THREE.AmbientLight(0xffe9c9, 0.6));
    var sun = new THREE.DirectionalLight(0xfff2df, 0.9);
    sun.position.set(14, 18, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = sun.shadow.camera.bottom = -22;
    sun.shadow.camera.right = sun.shadow.camera.top = 22;
    sun.shadow.camera.far = 60;
    scene.add(sun);

    // ===== 通用建模辅助：批量创建带阴影的实体 =====
    function addBox(w, h, d, color, x, y, z, material) {
      var mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        material || new THREE.MeshStandardMaterial({ color: color })
      );
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      return mesh;
    }
    function addCylinder(rTop, rBottom, h, color, x, y, z, segments) {
      var mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(rTop, rBottom, h, segments || 24),
        new THREE.MeshStandardMaterial({ color: color })
      );
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      return mesh;
    }

    // ===== 餐厅地板 + 后墙 =====
    var floor = new THREE.Mesh(
      new THREE.PlaneGeometry(34, 24),
      new THREE.MeshStandardMaterial({ color: 0xf2e3c8 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    addBox(34, 3, 0.4, 0xe8d5b0, 0, 1.5, -12.2);           // 后墙

    // ===== 后墙档口×3：柜台 + 彩色招牌 + 桌面菜盆 =====
    var stallDefs = [
      { x: -9,  color: 0xe65100, name: '面食档' },
      { x: 0,   color: 0x2e7d32, name: '套餐档' },
      { x: 9,   color: 0x1565c0, name: '风味档' }
    ];
    stallDefs.forEach(function (s) {
      addBox(5, 1.1, 1.6, 0xffffff, s.x, 0.55, -9.5);      // 柜台主体
      addBox(5.2, 0.12, 1.8, 0xd7ccc8, s.x, 1.16, -9.5);   // 台面
      var sign = addBox(5, 0.9, 0.25, s.color, s.x, 2.4, -11.9); // 招牌（后墙上）
      s.sign = sign;
      // 台面上的菜盆：三个小容器
      for (var i = 0; i < 3; i++) {
        addBox(0.9, 0.3, 0.7, i % 2 === 0 ? 0xffb74d : 0xa5d6a7,
          s.x - 1.6 + i * 1.6, 1.37, -9.4);
      }
    });

    // ===== 就餐区：圆桌×6，每桌配 4 张圆凳 =====
    var tables = [];
    [[-6, 0], [-2, 1.5], [2, 0], [6, 1.5], [-4, 4.5], [4, 4.5]].forEach(function (p) {
      var g = new THREE.Group();
      var top = new THREE.Mesh(
        new THREE.CylinderGeometry(1.1, 1.1, 0.12, 28),
        new THREE.MeshStandardMaterial({ color: 0x8d6e63 })
      );
      top.position.y = 0.78;
      top.castShadow = true; top.receiveShadow = true;
      g.add(top);
      var leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.16, 0.78, 16),
        new THREE.MeshStandardMaterial({ color: 0x5d4037 })
      );
      leg.position.y = 0.39;
      leg.castShadow = true;
      g.add(leg);
      for (var k = 0; k < 4; k++) {
        var ang = k * Math.PI / 2 + Math.PI / 4;
        var stool = addCylinder(0.26, 0.26, 0.45, 0xa1887f,
          p[0] + Math.cos(ang) * 1.7, 0.225, p[1] + Math.sin(ang) * 1.7, 16);
        stool.castShadow = true;
      }
      g.position.set(p[0], 0, p[1]);
      scene.add(g);
      tables.push(g);
    });

    // ===== 排队人形：圆柱身体 + 球头，在各档口前排队（动画起伏） =====
    var people = [];
    var skin = [0xffcc80, 0xffab91, 0xbcaaa4];
    stallDefs.forEach(function (s, si) {
      for (var i = 0; i < 3; i++) {
        var g = new THREE.Group();
        var body = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.3, 0.85, 16),
          new THREE.MeshStandardMaterial({ color: [0xe65100, 0x2e7d32, 0x1565c0][(si + i) % 3] })
        );
        body.position.y = 0.62;
        body.castShadow = true;
        g.add(body);
        var head = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 16, 12),
          new THREE.MeshStandardMaterial({ color: skin[(si + i) % 3] })
        );
        head.position.y = 1.28;
        head.castShadow = true;
        g.add(head);
        // 排队位置：沿 x 方向排成一列
        g.position.set(s.x + 1.2 + i * 0.9, 0, -8 + i * 0.8);
        scene.add(g);
        people.push({ g: g, baseY: 0, phase: i * 1.7 + si });
      }
    });

    // ===== 吊灯×3：灯线 + 自发光灯罩 + 点光源（大厅照明） =====
    [-8, 0, 8].forEach(function (x, i) {
      addCylinder(0.03, 0.03, 2.2, 0x9e9e9e, x, 6.1, 2, 8);  // 灯线
      var shade = new THREE.Mesh(
        new THREE.ConeGeometry(0.75, 0.6, 20, 1, true),
        new THREE.MeshStandardMaterial({ color: 0xff8f00, side: THREE.DoubleSide })
      );
      shade.position.set(x, 4.8, 2);
      shade.castShadow = true;
      scene.add(shade);
      var bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 16, 12),
        new THREE.MeshBasicMaterial({ color: 0xfff59d })     // 自发光
      );
      bulb.position.set(x, 4.6, 2);
      scene.add(bulb);
      if (i < 2) {
        var pl = new THREE.PointLight(0xffe082, 0.45, 14);
        pl.position.set(x, 4.5, 2);
        scene.add(pl);
      }
    });

    // ===== 动画循环：人流起伏 + 招牌呼吸发光 =====
    var clock = new THREE.Clock();
    (function animate() {
      requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      people.forEach(function (p, i) {
        p.g.position.y = p.baseY + Math.abs(Math.sin(t * 2 + p.phase)) * 0.08;
      });
      stallDefs.forEach(function (s, i) {
        var glow = 0.25 + Math.abs(Math.sin(t * 1.6 + i)) * 0.45;
        s.sign.material.emissive = new THREE.Color(s.color);
        s.sign.material.emissiveIntensity = glow;
      });

      controls.update();                                     // 阻尼必需
      renderer.render(scene, camera);
    })();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
