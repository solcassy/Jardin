let scene, camera, renderer, clock;
let levitatingObjects = [];

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);
    
    const canvas = document.getElementById('canvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    setupLights();
    createLevitatingObjects();
    
    clock = new THREE.Clock();
    animate();
    window.addEventListener('resize', onWindowResize);
}

function setupLights() {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0x00ff88, 0.5, 30);
    pointLight.position.set(0, 8, 0);
    scene.add(pointLight);
}

function createLevitatingObjects() {
    const torusGeometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
    const torusMaterial = new THREE.MeshStandardMaterial({
        color: 0x9b59b6,
        metalness: 0.1,
        roughness: 0.3,
        transparent: true,
        opacity: 0.8,
        emissive: 0x110022
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(0, 2, 0);
    torus.castShadow = true;
    torus.receiveShadow = true;
    scene.add(torus);
    levitatingObjects.push({
        mesh: torus,
        baseY: 2,
        amplitude: 1.5,
        speed: 1.2,
        rotationSpeed: 0.8
    });
}

function createGround() {
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.1,
        roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);
}

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    levitatingObjects.forEach((obj, index) => {
        const mesh = obj.mesh;
        const baseY = obj.baseY;
        const amplitude = obj.amplitude;
        const speed = obj.speed;
        const rotationSpeed = obj.rotationSpeed;
        
        mesh.position.y = baseY + Math.sin(elapsedTime * speed) * amplitude;
        
        mesh.rotation.x = Math.cos(elapsedTime * rotationSpeed * 0.7) * 0.3;
        mesh.rotation.y = elapsedTime * rotationSpeed;
        mesh.rotation.z = Math.sin(elapsedTime * rotationSpeed * 0.5) * 0.2;
        
        const originalX = mesh.userData.originalX || mesh.position.x;
        mesh.position.x = originalX + Math.cos(elapsedTime * speed * 0.3) * 0.5;
        
        if (!mesh.userData.originalX) {
            mesh.userData.originalX = originalX;
        }
    });
    
    camera.position.x = Math.cos(elapsedTime * 0.1) * 15;
    camera.position.z = Math.sin(elapsedTime * 0.1) * 15;
    camera.lookAt(0, 2, 0);
    
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('load', init);
