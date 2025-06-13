// Three.js Scene Setup
let scene, camera, renderer, enginePart;
let mouseX = 0,
  mouseY = 0;
let windowHalfX, windowHalfY;

function init() {
  const container = document.getElementById("canvas-container");
  const canvas = document.getElementById("three-canvas");

  windowHalfX = container.offsetWidth / 2;
  windowHalfY = container.offsetHeight / 2;

  // Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a0a0a, 100, 1000);

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    container.offsetWidth / container.offsetHeight,
    1,
    1000
  );
  camera.position.set(0, 0, 50);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0x00d4ff, 1);
  directionalLight.position.set(50, 50, 50);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0x0099cc, 0.8, 100);
  pointLight.position.set(-30, 20, 30);
  scene.add(pointLight);

  // Create Industrial Engine Part
  createEnginePart();

  // Add floating particles
  createParticles();

  // Event listeners
  document.addEventListener("mousemove", onDocumentMouseMove);
  window.addEventListener("resize", onWindowResize);

  animate();
}

function createEnginePart() {
  const group = new THREE.Group();

  // Main cylinder (engine block)
  const cylinderGeometry = new THREE.CylinderGeometry(8, 10, 20, 8);
  const cylinderMaterial = new THREE.MeshPhongMaterial({
    color: 0x2c3e50,
    shininess: 100,
    specular: 0x00d4ff,
  });
  const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  cylinder.castShadow = true;
  cylinder.receiveShadow = true;
  group.add(cylinder);

  // Pistons
  for (let i = 0; i < 4; i++) {
    const pistonGeometry = new THREE.CylinderGeometry(2, 2, 12, 16);
    const pistonMaterial = new THREE.MeshPhongMaterial({
      color: 0x34495e,
      shininess: 150,
    });
    const piston = new THREE.Mesh(pistonGeometry, pistonMaterial);
    piston.position.set(
      Math.cos((i * Math.PI) / 2) * 6,
      5,
      Math.sin((i * Math.PI) / 2) * 6
    );
    piston.castShadow = true;
    group.add(piston);

    // Piston rods
    const rodGeometry = new THREE.CylinderGeometry(0.5, 0.5, 8, 8);
    const rodMaterial = new THREE.MeshPhongMaterial({
      color: 0x95a5a6,
      shininess: 200,
    });
    const rod = new THREE.Mesh(rodGeometry, rodMaterial);
    rod.position.set(
      Math.cos((i * Math.PI) / 2) * 6,
      -2,
      Math.sin((i * Math.PI) / 2) * 6
    );
    rod.castShadow = true;
    group.add(rod);
  }

  // Cooling fins
  for (let i = 0; i < 8; i++) {
    const finGeometry = new THREE.BoxGeometry(12, 1, 0.5);
    const finMaterial = new THREE.MeshPhongMaterial({
      color: 0x7f8c8d,
      shininess: 80,
    });
    const fin = new THREE.Mesh(finGeometry, finMaterial);
    fin.position.y = -8 + i * 2;
    fin.castShadow = true;
    group.add(fin);
  }

  // Exhaust pipes
  for (let i = 0; i < 2; i++) {
    const pipeGeometry = new THREE.CylinderGeometry(1.5, 1.5, 15, 8);
    const pipeMaterial = new THREE.MeshPhongMaterial({
      color: 0xe74c3c,
      shininess: 120,
    });
    const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
    pipe.position.set(i === 0 ? -12 : 12, 0, 0);
    pipe.rotation.z = Math.PI / 2;
    pipe.castShadow = true;
    group.add(pipe);
  }

  // Add glow effect
  const glowGeometry = new THREE.SphereGeometry(15, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x00d4ff,
    transparent: true,
    opacity: 0.1,
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  group.add(glow);

  enginePart = group;
  scene.add(enginePart);
}

function createParticles() {
  const particles = new THREE.Group();

  for (let i = 0; i < 50; i++) {
    const particleGeometry = new THREE.SphereGeometry(0.1, 4, 4);
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.6,
    });
    const particle = new THREE.Mesh(particleGeometry, particleMaterial);

    particle.position.set(
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 100
    );

    particle.userData = {
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      ),
    };

    particles.add(particle);
  }

  scene.add(particles);

  // Animate particles
  function animateParticles() {
    particles.children.forEach((particle) => {
      particle.position.add(particle.userData.velocity);

      // Reset position if too far
      if (particle.position.length() > 50) {
        particle.position.set(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20
        );
      }
    });

    requestAnimationFrame(animateParticles);
  }

  animateParticles();
}

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) * 0.0005;
  mouseY = (event.clientY - windowHalfY) * 0.0005;
}

function onWindowResize() {
  const container = document.getElementById("canvas-container");
  windowHalfX = container.offsetWidth / 2;
  windowHalfY = container.offsetHeight / 2;

  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.offsetWidth, container.offsetHeight);
}

function animate() {
  requestAnimationFrame(animate);

  if (enginePart) {
    // Continuous rotation
    enginePart.rotation.y += 0.01;
    enginePart.rotation.x += 0.005;

    // Mouse interaction
    enginePart.rotation.y += mouseX;
    enginePart.rotation.x += mouseY;

    // Pulsing effect
    const scale = 1 + Math.sin(Date.now() * 0.001) * 0.05;
    enginePart.scale.set(scale, scale, scale);
  }

  // Camera movement
  camera.position.x += (mouseX * 10 - camera.position.x) * 0.05;
  camera.position.y += (-mouseY * 10 - camera.position.y) * 0.05;
  camera.lookAt(scene.position);

  renderer.render(scene, camera);
}

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Counter animation
function animateCounters() {
  const counters = document.querySelectorAll(".stat-number");
  counters.forEach((counter) => {
    const target = parseInt(counter.textContent);
    const increment = target / 100;
    let current = 0;

    const updateCounter = () => {
      if (current < target) {
        current += increment;
        counter.textContent =
          Math.floor(current) +
          (counter.textContent.includes("%")
            ? "%"
            : counter.textContent.includes("+")
            ? "+"
            : "");
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = counter.textContent;
      }
    };

    updateCounter();
  });
}

// Initialize everything when page loads
window.addEventListener("load", () => {
  init();

  // Intersection Observer for animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.target.classList.contains("stats")) {
        animateCounters();
      }
    });
  });

  document.querySelectorAll(".stats").forEach((el) => {
    observer.observe(el);
  });
});

// Mobile menu toggle
document.querySelector(".menu-toggle").addEventListener("click", function () {
  const navLinks = document.querySelector(".nav-links");
  navLinks.style.display = navLinks.style.display === "flex" ? "none" : "flex";
});
