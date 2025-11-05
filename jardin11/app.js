///////// SCAFFOLD.
// Wait for DOM and libraries to load
function waitForLibraries() {
  if (typeof THREE !== 'undefined' && typeof gsap !== 'undefined') {
    init();
  } else {
    setTimeout(waitForLibraries, 50);
  }
}

window.addEventListener('DOMContentLoaded', function() {
  waitForLibraries();
});

function init() {
  // 1. Importar librerías.
  if (typeof THREE === 'undefined') {
    console.error('Three.js no está cargado');
    return;
  }
  if (typeof gsap === 'undefined') {
    console.error('GSAP no está cargado');
    return;
  }
  
  console.log(THREE);
  console.log(gsap);

  // 2. Configurar canvas.
  const canvas = document.getElementById("webgl");
  if (!canvas) {
    console.error('Canvas no encontrado');
    return;
  }
  
  // Get stage container dimensions
  const stage = document.getElementById("stage");
  const stageWidth = stage ? stage.offsetWidth : window.innerWidth;
  const stageHeight = stage ? stage.offsetHeight : window.innerHeight;
  
  canvas.width = stageWidth;
  canvas.height = stageHeight;

// 3. Configurar escena 3D.
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(canvas.width, canvas.height);
renderer.setClearColor(0x000000);
const camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 1000);
// Set initial camera position
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, -7);

// 3.1 Configurar mesh.
// Create array to store all meshes
const meshes = [];

// Loading manager for textures
const manager = new THREE.LoadingManager();

manager.onStart = function (url, itemsLoaded, itemsTotal) {
   console.log(`Iniciando carga de: ${url} (${itemsLoaded + 1}/${itemsTotal})`);
};

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
   console.log(`Cargando: ${url} (${itemsLoaded}/${itemsTotal})`);
};

manager.onLoad = function () {
   console.log('✅ ¡Todas las texturas cargadas!');
   console.log('Metal textures:', metalTextures);
   createMeshes();
};

manager.onError = function (url) {
   console.error(`❌ Error al cargar: ${url}`);
   // Create material even if some textures fail to load
   createMeshes();
};

// Texture loader
const loader = new THREE.TextureLoader(manager);

// Load metal textures with error handling
const metalTextures = {
   color: loader.load('./Metal055A_1K-JPG_Color.jpg', 
      function(texture) { 
         console.log('Color texture loaded');
         texture.flipY = false;
      },
      undefined,
      function(error) { console.error('Error loading color texture:', error); }
   ),
   metalness: loader.load('./Metal055A_1K-JPG_Metalness.jpg',
      function(texture) { 
         console.log('Metalness texture loaded');
         texture.flipY = false;
      },
      undefined,
      function(error) { console.error('Error loading metalness texture:', error); }
   ),
   normal: loader.load('./Metal055A_1K-JPG_NormalGL.jpg',
      function(texture) { 
         console.log('Normal texture loaded');
         texture.flipY = false;
      },
      undefined,
      function(error) { console.error('Error loading normal texture:', error); }
   ),
   roughness: loader.load('./Metal055A_1K-JPG_Roughness.jpg',
      function(texture) { 
         console.log('Roughness texture loaded');
         texture.flipY = false;
      },
      undefined,
      function(error) { console.error('Error loading roughness texture:', error); }
   ),
   displacement: loader.load('./Metal055A_1K-JPG_Displacement.jpg',
      function(texture) { 
         console.log('Displacement texture loaded');
         texture.flipY = false;
      },
      undefined,
      function(error) { console.error('Error loading displacement texture:', error); }
   ),
};

// Create metal material
var metalMaterial;

function createMetalMaterial() {
   metalMaterial = new THREE.MeshStandardMaterial({
       map: metalTextures.color,
       metalnessMap: metalTextures.metalness,
       metalness: 1.0, // Base metalness value
       normalMap: metalTextures.normal,
       roughnessMap: metalTextures.roughness,
       roughness: 0.5, // Base roughness value - aumentado para más roughness
       displacementMap: metalTextures.displacement,
       displacementScale: 0.1,
       side: THREE.DoubleSide,
   });
   console.log('Metal material created with textures');
}

// Create 3 different 3D shapes (update existing meshes with metal material)
function createMeshes() {
   if (!metalMaterial) {
      createMetalMaterial();
   }

   // Update existing meshes with metal material instead of recreating
   meshes.forEach((mesh, index) => {
      mesh.material = metalMaterial;
      mesh.material.needsUpdate = true;
      console.log(`Updated mesh ${index} with metal material`);
   });
   console.log('All meshes updated with metal material');
}

// Click-to-scale animation on the canvas using GSAP
let scaleStep = 0.25;
canvas.addEventListener("click", function () {
    meshes.forEach(mesh => {
        const current = mesh.scale.x;
        const target = current + scaleStep;
        gsap.to(mesh.scale, {
            x: target,
            y: target,
            z: target,
            duration: 0.9,
            ease: "bounce.out",
        });
    });
});

// 3.2 Crear luces blancas
// Múltiples luces blancas desde diferentes ángulos
const frontLight = new THREE.DirectionalLight(0xffffff, 3.5);
frontLight.position.set(50, 50, 50);
scene.add(frontLight);

const topLight = new THREE.DirectionalLight(0xffffff, 2.5);
topLight.position.set(0, 10, 0);
scene.add(topLight);

const rightLight = new THREE.DirectionalLight(0xffffff, 2.5);
rightLight.position.set(10, 0, 0);
scene.add(rightLight);

const leftLight = new THREE.DirectionalLight(0xffffff, 2.5);
leftLight.position.set(-10, 0, 0);
scene.add(leftLight);

const backLight = new THREE.DirectionalLight(0xffffff, 2.0);
backLight.position.set(0, 0, -10);
scene.add(backLight);

// Luces puntuales adicionales
const pointLight1 = new THREE.PointLight(0xffffff, 3.5, 100);
pointLight1.position.set(5, 5, 5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 3.5, 100);
pointLight2.position.set(-5, 5, 5);
scene.add(pointLight2);

const pointLight3 = new THREE.PointLight(0xffffff, 3.5, 100);
pointLight3.position.set(0, -5, 5);
scene.add(pointLight3);

// Luces a los lados (izquierda y derecha)
const sideLightLeft = new THREE.PointLight(0xffffff, 4.0, 100);
sideLightLeft.position.set(-8, 0, -7);
scene.add(sideLightLeft);

const sideLightRight = new THREE.PointLight(0xffffff, 4.0, 100);
sideLightRight.position.set(8, 0, -7);
scene.add(sideLightRight);

const sideLightLeftTop = new THREE.PointLight(0xffffff, 3.5, 100);
sideLightLeftTop.position.set(-8, 3, -7);
scene.add(sideLightLeftTop);

const sideLightRightTop = new THREE.PointLight(0xffffff, 3.5, 100);
sideLightRightTop.position.set(8, 3, -7);
scene.add(sideLightRightTop);

const sideLightLeftBottom = new THREE.PointLight(0xffffff, 3.5, 100);
sideLightLeftBottom.position.set(-8, -3, -7);
scene.add(sideLightLeftBottom);

const sideLightRightBottom = new THREE.PointLight(0xffffff, 3.5, 100);
sideLightRightBottom.position.set(8, -3, -7);
scene.add(sideLightRightBottom);

// Luz ambiental para iluminación general
const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
scene.add(ambientLight);

// Create meshes immediately with a basic material, then update when textures load
function createMeshesWithBasicMaterial() {
   const basicMaterial = new THREE.MeshStandardMaterial({
      metalness: 0.9,
      roughness: 0.1
   });
   console.log('Creating meshes with basic material');

   // 1. Sphere
   const sphereGeo = new THREE.SphereGeometry(1.5, 32, 32);
   const sphere = new THREE.Mesh(sphereGeo, basicMaterial);
   sphere.position.set(-4, 0, -7);
   scene.add(sphere);
   meshes.push(sphere);

   // 2. Box
   const boxGeo = new THREE.BoxGeometry(2, 2, 2);
   const box = new THREE.Mesh(boxGeo, basicMaterial);
   box.position.set(0, 0, -7);
   scene.add(box);
   meshes.push(box);

   // 3. Torus
   const torusGeo = new THREE.TorusGeometry(1.2, 0.5, 16, 100);
   const torus = new THREE.Mesh(torusGeo, basicMaterial);
   torus.position.set(4, 0, -7);
   scene.add(torus);
   meshes.push(torus);
}

// Create meshes immediately so they're visible
createMeshesWithBasicMaterial();
console.log('Meshes created:', meshes.length);
console.log('Camera position:', camera.position);
console.log('Scene children:', scene.children.length);

//// B) Rotación al scrollear.
var scroll = {
    y: 0,
    lerpedY: 0,
    speed: 0.01,
    cof: 0.07
};
 
function updateScrollData(eventData) {
   scroll.y += eventData.deltaX * scroll.speed;
}
 
window.addEventListener("wheel", updateScrollData);

function updateMeshRotation() {
   meshes.forEach(mesh => {
      mesh.rotation.y = scroll.lerpedY;
   });
}

function lerpScrollY() {
   scroll.lerpedY += (scroll.y - scroll.lerpedY) * scroll.cof;
}

//// C) Movimiento de cámara con mouse (fricción) aka "Gaze Camera".
var mouse = {
    x: 0,
    y: 0,
    normalOffset: {
        x: 0,
        y: 0
    },
    lerpNormalOffset: {
        x: 0,
        y: 0
    },
    cof: 0.07,
    gazeRange: {
        x: 2,
        y: 2
    }
};

function updateMouseData(eventData) {
   updateMousePosition(eventData);
   calculateNormalOffset();
}

function updateMousePosition(eventData) {
   mouse.x = eventData.clientX;
   mouse.y = eventData.clientY;
}

function calculateNormalOffset() {
   let windowCenter = {
       x: canvas.width / 2,
       y: canvas.height / 2,
   }
   mouse.normalOffset.x = ( (mouse.x - windowCenter.x) / canvas.width ) * 2;
   mouse.normalOffset.y = ( (mouse.y - windowCenter.y) / canvas.height ) * 2;
}

function lerpDistanceToCenter() {
   mouse.lerpNormalOffset.x += (mouse.normalOffset.x - mouse.lerpNormalOffset.x) * mouse.cof;
   mouse.lerpNormalOffset.y += (mouse.normalOffset.y - mouse.lerpNormalOffset.y) * mouse.cof;
}

window.addEventListener("mousemove", updateMouseData);

function updateCameraPosition() {
   // Keep base position and add mouse offset
   camera.position.x = mouse.lerpNormalOffset.x * mouse.gazeRange.x;
   camera.position.y = -mouse.lerpNormalOffset.y * mouse.gazeRange.y;
   camera.position.z = 5; // Keep Z constant
   // Look at center of the scene
   camera.lookAt(0, 0, -7);
}

// D) Interacción con teclado: alternar modo wireframe con la tecla "W".
window.addEventListener("keydown", function (event) {
    if (event.key === "w" || event.key === "W") {
        meshes.forEach(mesh => {
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(function (m) {
                    if (m && typeof m.wireframe === "boolean") {
                        m.wireframe = !m.wireframe;
                    }
                });
            } else if (mesh.material && typeof mesh.material.wireframe === "boolean") {
                mesh.material.wireframe = !mesh.material.wireframe;
            }
        });
    }
});

/////////
// Final. Crear loop de animación para renderizar constantemente la escena.
function animate() {
    requestAnimationFrame(animate);
    lerpScrollY();
    updateMeshRotation();
    lerpDistanceToCenter();
    updateCameraPosition();
    renderer.render(scene, camera);
}

animate();
console.log('Animation started');

function updateCanvasSize() {
    const stage = document.getElementById("stage");
    const stageWidth = stage ? stage.offsetWidth : window.innerWidth;
    const stageHeight = stage ? stage.offsetHeight : window.innerHeight;
    canvas.width = stageWidth;
    canvas.height = stageHeight;
}

function updateRenderer() {
    renderer.setSize(canvas.width, canvas.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function updateCameraAspect() {
    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();
}

window.addEventListener("resize", function() {
    updateCanvasSize();
    updateRenderer();
    updateCameraAspect();
});

} // End of init function
