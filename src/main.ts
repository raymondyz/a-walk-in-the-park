import './style.css';
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import treeModelUrl from '../3d_models_glb_files/pine_tree.glb?url';

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const loader = new GLTFLoader();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 5);

scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.5));

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: 0x556b2f })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const moveDist = 0.3;

function createTree(x: number, z: number): void {

  loader.load(treeModelUrl, (gltf) => {
    const tree = gltf.scene;
    tree.position.set(x, 0, z);
    scene.add(tree);
  }, undefined, (error) => {
    console.error('Unable to load pine_tree.glb', error);
  });
}

createTree(10, 10);

const controls = new PointerLockControls(camera, renderer.domElement);
renderer.domElement.addEventListener('click', () => controls.lock());

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
});



function takeScreenshot() {
    // Render the scene to make sure it's up to date
    renderer.render(scene, camera);

    const dataURL = renderer.domElement.toDataURL('image/png');

    // Create a download link
    const link = document.createElement('a');
    link.download = 'threejs-screenshot.png';
    link.href = dataURL;
    link.click();
}

function handleInput(event: KeyboardEvent) {
    if (event.key === 'p') {
        takeScreenshot();
    }

    if(event.key === 'w')
      {
        controls.moveForward(moveDist);
      }
    if(event.key === 's')
      {
        controls.moveForward(-moveDist);
      }
    if(event.key === 'a')
      {
        controls.moveRight(-moveDist);
      }
    if(event.key === 'd')
      {
        controls.moveRight(moveDist);
      }
}

window.addEventListener('keydown', handleInput);