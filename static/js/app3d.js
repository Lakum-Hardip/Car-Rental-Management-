/* ==========================================================================
   INTERACTIVE 3D & THREE.JS ENGINE INITIALIZER FOR VELOCITY CAR RENTAL
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    init3DTilt();
    initNavbarScroll();
    initThreeJSHero();
});

/* 1. Interactive 3D Card Gyroscope/Tilt on Mouse Move */
function init3DTilt() {
    const cards = document.querySelectorAll('.tilt-card, .car-card-3d, .card-3d');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -12; // Max 12deg tilt
            const rotateY = ((x - centerX) / centerX) * 12;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.1s ease-out';
        });
    });
}

/* 2. Glass Navbar Scroll Effect */
function initNavbarScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/* 3. Three.js Procedural 3D Supercar Hologram */
function initThreeJSHero() {
    const canvasContainer = document.getElementById('heroCanvas3D');
    if (!canvasContainer || typeof THREE === 'undefined') return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
    camera.position.set(0, 2.5, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    canvasContainer.appendChild(renderer.domElement);

    // Studio Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const cyanPointLight = new THREE.PointLight(0x06b6d4, 4, 25);
    cyanPointLight.position.set(5, 4, 4);
    scene.add(cyanPointLight);

    const violetPointLight = new THREE.PointLight(0x8b5cf6, 3.5, 25);
    violetPointLight.position.set(-5, 3, -3);
    scene.add(violetPointLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2);
    rimLight.position.set(0, 10, 5);
    scene.add(rimLight);

    // Car Root Group
    const carGroup = new THREE.Group();
    scene.add(carGroup);

    // Premium Car Materials
    const paintMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x0c1322,
        metalness: 0.9,
        roughness: 0.15,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        reflectivity: 0.9
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x111827,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.85,
        transparent: true,
        opacity: 0.85
    });

    const carbonMaterial = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.6,
        metalness: 0.8
    });

    const glowNeonMaterial = new THREE.MeshBasicMaterial({
        color: 0x06b6d4
    });

    const tailNeonMaterial = new THREE.MeshBasicMaterial({
        color: 0xef4444
    });

    const wheelRubberMaterial = new THREE.MeshStandardMaterial({
        color: 0x1f242d,
        roughness: 0.8
    });

    const chromeRimMaterial = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.95,
        roughness: 0.1
    });

    // 1. Sleek Supercar Lower Chassis
    const lowerBodyGeo = new THREE.BoxGeometry(4.2, 0.6, 1.9);
    const lowerBody = new THREE.Mesh(lowerBodyGeo, paintMaterial);
    lowerBody.position.y = 0.55;
    carGroup.add(lowerBody);

    // 2. Aerodynamic Cockpit Cabin
    const cabinGeo = new THREE.BoxGeometry(2.3, 0.55, 1.55);
    const cabin = new THREE.Mesh(cabinGeo, glassMaterial);
    cabin.position.set(-0.2, 1.05, 0);
    carGroup.add(cabin);

    // 3. Curved Roof
    const roofGeo = new THREE.BoxGeometry(1.8, 0.1, 1.4);
    const roof = new THREE.Mesh(roofGeo, paintMaterial);
    roof.position.set(-0.25, 1.35, 0);
    carGroup.add(roof);

    // 4. Front Hood Wedge
    const hoodGeo = new THREE.BoxGeometry(1.3, 0.25, 1.8);
    const hood = new THREE.Mesh(hoodGeo, paintMaterial);
    hood.position.set(1.45, 0.72, 0);
    hood.rotation.z = -0.15;
    carGroup.add(hood);

    // 5. Aggressive Front Splitter
    const splitterGeo = new THREE.BoxGeometry(0.8, 0.08, 2.05);
    const splitter = new THREE.Mesh(splitterGeo, carbonMaterial);
    splitter.position.set(2.0, 0.25, 0);
    carGroup.add(splitter);

    // 6. Rear Aerodynamic Diffuser & Spoiler
    const spoilerWingGeo = new THREE.BoxGeometry(0.5, 0.06, 2.0);
    const spoilerWing = new THREE.Mesh(spoilerWingGeo, carbonMaterial);
    spoilerWing.position.set(-2.0, 1.3, 0);
    carGroup.add(spoilerWing);

    const spoilerStand1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.08), carbonMaterial);
    spoilerStand1.position.set(-1.95, 1.05, 0.55);
    carGroup.add(spoilerStand1);

    const spoilerStand2 = spoilerStand1.clone();
    spoilerStand2.position.set(-1.95, 1.05, -0.55);
    carGroup.add(spoilerStand2);

    // 7. Neon Laser Headlights
    const lightBarGeo = new THREE.BoxGeometry(0.12, 0.08, 0.6);
    const leftHeadlight = new THREE.Mesh(lightBarGeo, glowNeonMaterial);
    leftHeadlight.position.set(2.08, 0.65, 0.65);
    carGroup.add(leftHeadlight);

    const rightHeadlight = leftHeadlight.clone();
    rightHeadlight.position.set(2.08, 0.65, -0.65);
    carGroup.add(rightHeadlight);

    // 8. Cyber Taillight Strip
    const tailLightGeo = new THREE.BoxGeometry(0.08, 0.08, 1.7);
    const tailLight = new THREE.Mesh(tailLightGeo, tailNeonMaterial);
    tailLight.position.set(-2.1, 0.65, 0);
    carGroup.add(tailLight);

    // 9. Luxury 4 Wheels with Rims & Brake Discs
    const wheelPositions = [
        [1.3, 0.4, 0.95],
        [1.3, 0.4, -0.95],
        [-1.3, 0.4, 0.95],
        [-1.3, 0.4, -0.95]
    ];

    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.32, 28);
    const rimGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.34, 16);

    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelRubberMaterial);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(pos[0], pos[1], pos[2]);

        const rim = new THREE.Mesh(rimGeo, chromeRimMaterial);
        rim.rotation.x = Math.PI / 2;
        rim.position.set(pos[0], pos[1], pos[2]);

        carGroup.add(wheel);
        carGroup.add(rim);
    });

    // 10. Holographic Ground Grid Circle
    const gridHelper = new THREE.PolarGridHelper(5, 16, 8, 32, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // Floating Cyber Particle Dust
    const particleCount = 70;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
        particlePositions[i] = (Math.random() - 0.5) * 14;
        particlePositions[i + 1] = Math.random() * 5;
        particlePositions[i + 2] = (Math.random() - 0.5) * 14;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
        color: 0x06b6d4,
        size: 0.08,
        transparent: true,
        opacity: 0.6
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Interaction for 3D Camera/Rotation
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationY = -0.6;
    let targetRotationX = 0.1;

    window.addEventListener('mousemove', (e) => {
        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;
        mouseX = (e.clientX - windowHalfX) * 0.0006;
        mouseY = (e.clientY - windowHalfY) * 0.0006;
    });

    // Resize Handler
    window.addEventListener('resize', () => {
        if (!canvasContainer) return;
        camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    });

    // Animation Loop
    let clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Smooth subtle hover & rotation
        carGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.08;
        
        // Follow mouse smoothly
        carGroup.rotation.y += (targetRotationY + mouseX * 2 - carGroup.rotation.y) * 0.05;
        carGroup.rotation.x += (targetRotationX + mouseY * 1.2 - carGroup.rotation.x) * 0.05;

        // Rotate grid slowly
        gridHelper.rotation.y = elapsedTime * 0.1;

        // Float particles
        particles.rotation.y = elapsedTime * 0.03;

        renderer.render(scene, camera);
    }

    animate();
}
