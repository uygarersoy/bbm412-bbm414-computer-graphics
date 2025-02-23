import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createCreatorsScene, createTextScene } from './otherScenes';
import { createWalls, createGround, createPoolWalls } from './poolMaterials';

let isHelpMenuScene = false;
let isCreatorsScene = false;
let isLightOn = true;
let moveLightOnXBy = 0;
let moveLightOnYBy = 0;
let moveLightOnZBy = 0;
let helpMenu, creatorScene, defaultScene;
let sun, scene;
let material;

const waveParameters = {
  height: 10,
  frequency: 5,
  speed: 2
};

const score = calculateScore(waveParameters);
  
const scoreDiv = document.getElementById('score');
scoreDiv.textContent = `Score: ${score.toFixed(2)}`;

scene = new THREE.Scene();
defaultScene = scene;
helpMenu = createTextScene();
creatorScene = createCreatorsScene();

sun = new THREE.DirectionalLight(0xFFFFFF, 3.0);
sun.position.set(150 + moveLightOnXBy, -200 + moveLightOnYBy, 275 + moveLightOnZBy);
defaultScene.add(sun);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

async function loadShader(url) {
  const response = await fetch(url);
  return await response.text();
}

function updateScore() {
    const guessedValues = {
      height: parseFloat(document.getElementById('waveHeightSlider').value),
      frequency: parseFloat(document.getElementById('waveFrequencySlider').value),
      speed: parseFloat(document.getElementById('waveSpeedSlider').value)
    };
  
    const score = calculateScore(guessedValues);

    const scoreDiv = document.getElementById('score');
    scoreDiv.textContent = `Score: ${score.toFixed(2)}`;
  
    if (
      guessedValues.height === 17 &&
      guessedValues.frequency === 5 &&
      guessedValues.speed === 3
    ) {
      scoreDiv.textContent += " You Won!";
      stopGame();
    }
}

function stopGame() {
    document.getElementById('waveHeightSlider').disabled = true;
    document.getElementById('waveFrequencySlider').disabled = true;
    document.getElementById('waveSpeedSlider').disabled = true;
  }

function calculateScore(guessedValues) {
    const errorHeight = Math.abs(17 - guessedValues.height);//2
    const errorFrequency = Math.abs(6 - guessedValues.frequency);//0
    const errorSpeed = Math.abs(3 - guessedValues.speed);//0

    const scoreHeight = 1000 / (errorHeight * errorHeight + 1);
    const scoreFrequency = 1000 / (errorFrequency * errorFrequency + 1);
    const scoreSpeed = 1000 / (errorSpeed * errorSpeed + 1);

    return scoreHeight + scoreFrequency + scoreSpeed;
}

function setupControls() {
  const heightSlider = document.getElementById('waveHeightSlider');
  const frequencySlider = document.getElementById('waveFrequencySlider');
  const speedSlider = document.getElementById('waveSpeedSlider');
  
  const heightValue = document.getElementById('waveHeightValue');
  const frequencyValue = document.getElementById('waveFrequencyValue');
  const speedValue = document.getElementById('waveSpeedValue');

  heightSlider.addEventListener('input', (e) => {
    waveParameters.height = parseFloat(e.target.value);
    heightValue.textContent = e.target.value;
    updateScore();
  });

  frequencySlider.addEventListener('input', (e) => {
    waveParameters.frequency = parseFloat(e.target.value);
    frequencyValue.textContent = e.target.value;
    updateScore();
  });

  speedSlider.addEventListener('input', (e) => {
    waveParameters.speed = parseFloat(e.target.value);
    speedValue.textContent = e.target.value;
    updateScore();
  });
}

async function createMaterial(vertexShaderPath, fragmentShaderPath) {
  const vertexShader = await loadShader(vertexShaderPath);
  const fragmentShader = await loadShader(fragmentShaderPath);

  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
        uTime: { value: 0 },
        uWaveHeight: { value: waveParameters.height * 0.01 },
        uWaveFrequency: { value: waveParameters.frequency },
        uWaveSpeed: { value: waveParameters.speed },
        uColor: { value: new THREE.Color(0.0, 0.5, 1.0) },
        uLightColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
        uProjectionMatrix: { value: camera.projectionMatrix },
        uModelViewMatrix: { value: camera.matrixWorldInverse },
        uLightIntensity: {value: isLightOn ? 1.0 : 0.0}
    },
    glslVersion: THREE.GLSL3
  });

  return material;
}

const geometry = new THREE.PlaneGeometry(5, 5, 100, 100);

let mesh;
let currentMaterial;

async function init() {
    setupControls();

    currentMaterial = await createMaterial('glsl/vertex.glsl', 'glsl/fragment.glsl');
    mesh = new THREE.Mesh(geometry, currentMaterial);
    defaultScene.add(mesh);

    camera.position.z = 5;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;

    function animate(time) {
        time *= 0.001;

        currentMaterial.uniforms.uTime.value = time;
        currentMaterial.uniforms.uWaveHeight.value = waveParameters.height * 0.01;
        currentMaterial.uniforms.uWaveFrequency.value = waveParameters.frequency;
        currentMaterial.uniforms.uWaveSpeed.value = waveParameters.speed;

        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    document.addEventListener('keydown', onKeyDown);
    createWalls(defaultScene);
    createPoolWalls(defaultScene);
    createGround(defaultScene);
    animate(0);
}

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

window.addEventListener('keydown', async (event) => {
  if (event.key === '1') {
    currentMaterial = await createMaterial('glsl/vertex.glsl', 'glsl/fragment.glsl');
  } else if (event.key === '2') {
    currentMaterial = await createMaterial('glsl/vertex2.glsl', 'glsl/fragment2.glsl');
  }

  mesh.material = currentMaterial;
});

init();

function onKeyDown(event) {
    if (event.key === "H" || event.key === "h") {
        toggleHelpMenu();
    } else if (event.key === "C" || event.key === "c") {
        toggleCreatorsScene();
    } else if (event.key == 'l' || event.key == 'L') {
        toggleLight();
    } else {
        handleLightMovement(event.key);
    }
}

function handleLightMovement(key) {
    if (!objectSelected) {
        if (key == 'w' || key == 'W') {
            moveLightOnYBy += 50;
        } 
        if (key == 's' || key == 'S') {
            moveLightOnYBy -= 50;
        } 
        if (key == 'a' || key == 'A') {
            moveLightOnXBy -= 50;
        } 
        if (key == 'd' || key == 'D') {
            moveLightOnXBy += 50;
        } 
        if (key == 'q' || key == 'Q') {
            moveLightOnZBy -= 50;
        } 
        if (key == 'e' || key == 'E') {
            moveLightOnZBy += 50;
        }
        if (key == 'b' || key == 'B') {
            if (sun.intensity < 10) {
                sun.intensity += 1.0;
            }
        }
        if (key == 'n' || key == 'N') {
            if (sun.intensity > 1.0) {
                sun.intensity -= 1.0;
            }
        }
    
        sun.position.set(300 + moveLightOnXBy, 400 + moveLightOnYBy, 175 + moveLightOnZBy);    
    }
}

function toggleLight() {
    if (isLightOn) {
        defaultScene.remove(sun);
        isLightOn = false;
        material.uniforms.uLightIntensity.value = 0.0;
    } else {
        defaultScene.add(sun);
        isLightOn = true;
        material.uniforms.uLightIntensity.value = 1.0;
    }
}

function toggleCreatorsScene() {
    isCreatorsScene = !isCreatorsScene;
    if (isCreatorsScene) {
        scene = creatorScene;
        camera.position.set(0, 0, 200);
    } else {
        scene = defaultScene;
        camera.position.set(0, 0, 5);
    }
}

function toggleHelpMenu() {
    isHelpMenuScene = !isHelpMenuScene;
    if (isHelpMenuScene) {
        scene = helpMenu;
        camera.position.set(0, 0, 200);
    } else {
        scene = defaultScene;
        camera.position.set(0, 0, 5);
    }
}

async function createObject() {
    const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshPhongMaterial({ color: 0x00ff00 }));
    cube.position.set(-4,0,1);
    scene.add(cube);
  
    const sphere = new THREE.Mesh( new THREE.SphereGeometry( 0.5, 24, 24 ), new THREE.MeshPhongMaterial( { color: 0xFFFF00 } ) );
    sphere.position.set(4,0,1);
    scene.add(sphere);
  
    const torus = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.25, 25, 100), new THREE.MeshPhongMaterial({ color: 0xA61DE5 }));
    torus.position.set(0,4,1);
    scene.add(torus);
  
    
     return [cube, sphere, torus];
  }
  
  let objectsList = await createObject();
  let objectSelected = false;
  let selectedObject = null;
  let controlsDisabled = false;
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  
  window.addEventListener('mousedown', onMouseDown, false);
  window.addEventListener('mouseup', onMouseUp, false);
  window.addEventListener('keydown', onKeyDownObjectMove, false);
  
  function onMouseDown(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(objectsList);
  
    if (intersects.length > 0) {
      selectedObject = intersects[0].object;

      controls.enabled = false;
      controlsDisabled = true;
      objectSelected = true;
    }
  }
  function onMouseUp(event) {
    selectedObject = null;
    objectSelected = false;

    if (controlsDisabled) {
      controls.enabled = true;
      controlsDisabled = false;
    }
  }
  

  function onKeyDownObjectMove(event) {
    if (objectSelected) {
        if (selectedObject) {

            const moveDistance = 1;
  
            if (event.key == 'w' || event.key == 'W') {
                selectedObject.position.y += moveDistance;
            } 
            if (event.key == 's' || event.key == 'S') {
                selectedObject.position.y -= moveDistance;
            } 
            if (event.key == 'a' || event.key == 'A') {
                selectedObject.position.x -= moveDistance;
            } 
            if (event.key == 'd' || event.key == 'D') {
                selectedObject.position.x += moveDistance;
            } 
            if (event.key == 'q' || event.key == 'Q') {
                selectedObject.position.z += moveDistance;
            } 
            if (event.key == 'e' || event.key == 'E') {
                selectedObject.position.z -= moveDistance;
            }
        }
    }
  }
  
  