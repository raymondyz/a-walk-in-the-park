import './style.css';
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createRoot } from 'react-dom/client';
import { useEffect, useState, useRef } from 'react';
import PhotosPanel from '../components/PhotosPanel';

//model imports
import treeModelUrl from '../3d_models_glb_files/pine_tree.glb?url';
import benchModelUrl from '../3d_models_glb_files/bench.glb?url';
import duckModelUrl from '../3d_models_glb_files/duck.glb?url';

const app = document.getElementById('react-root');
if (!app) throw new Error('Missing app');

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const reactMount = document.getElementById('react-root');
if (!reactMount) throw new Error('Missing #react-root');

const root = createRoot(reactMount);

function App() {
	const [photosShown, setPhotosShown] = useState(false);
    const photosShownRef = useRef(photosShown);

    // Keep photosShownRef in sync with photosShown
    useEffect(() => {
        photosShownRef.current = photosShown;
    }, [photosShown])

	useEffect(() => {
		function handlePanelKey(event: KeyboardEvent) {
			if (event.key.toLowerCase() === 'p') {
				setPhotosShown((shown) => !shown);
			}
		}

		window.addEventListener('keydown', handlePanelKey);
        window.addEventListener('keydown', handleInput);
        window.addEventListener('click', (event) => {!photosShownRef.current && handleCameraShoot(event)});
        window.addEventListener('mousedown', handleCameraZoom);
        window.addEventListener('mouseup', handleCameraUnzoom);
        window.addEventListener('mouseleave', () => {
            camera.fov = defaultFOV;
            camera.updateProjectionMatrix();
        });
        window.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
		return () => window.removeEventListener('keydown', handlePanelKey);
	}, []);

	return <PhotosPanel isOpen={photosShown} photosList={photoGallery}/>;
}

root.render(<App />);

const threeMount = document.getElementById('three-root');
if (!threeMount) throw new Error('Missing #three-root');

threeMount.appendChild(renderer.domElement);

// let [photosShown, setPhotosShown] = useState(false);

const scene = new THREE.Scene();
const loader = new GLTFLoader();
scene.background = new THREE.Color(0x87ceeb);
const movementVelocity = new THREE.Vector3();

//camera controls and values
const photoGallery: any[] = [];
const defaultFOV = 70;
const zoomedFOV = 30;
const cameraHeight = 1.6

const camera = new THREE.PerspectiveCamera(defaultFOV, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, cameraHeight, 5);

scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.5));

/* ===== Terrain ===== */

function terrainHeight(x: number, z: number): number {
    return Math.sin(0.2*x) + Math.cos(0.5*z);
}

const groundGeometry = new THREE.PlaneGeometry(100, 100, 256, 256)
groundGeometry.rotateX(-Math.PI / 2)
const ground = new THREE.Mesh(
	groundGeometry,
	new THREE.MeshStandardMaterial({ color: 0x556b2f })
);
const groundPositions = groundGeometry.attributes.position;
for (let i = 0; i < groundPositions.count; i++) {
    groundPositions.setY(i, terrainHeight(groundPositions.getX(i), groundPositions.getZ(i)));
}
groundGeometry.computeVertexNormals();
scene.add(ground);

//CREATE OBJECTS

function createTree(x: number, z: number): void {

	loader.load(treeModelUrl, (gltf) => {
		const tree = gltf.scene;
		tree.position.set(x, terrainHeight(x,z), z);
		scene.add(tree);
	}, undefined, (error) => {
		console.error('Unable to load pine_tree.glb', error);
	});
}

function createBench(x: number, z: number): void {

	loader.load(benchModelUrl, (gltf) => {
		const bench = gltf.scene;
		bench.position.set(x, terrainHeight(x,z)+.6, z);
        bench.rotateY(Math.PI);
		scene.add(bench);
	}, undefined, (error) => {
		console.error('Unable to load bench.glb', error);
	});
}

function createDuck(x: number, z: number): void {

	loader.load(duckModelUrl, (gltf) => {
		const duck = gltf.scene;
		duck.position.set(x, terrainHeight(x,z)+.1, z);
        duck.scale.set(0.2, 0.2, 0.2);
		scene.add(duck);
	}, undefined, (error) => {
		console.error('Unable to load duck.glb', error);
	});
}

for(let i = 0; i < 5; i++)
{
    for(let j = 0; j < 5; j++)
    {
        createTree(i * 10 + Math.random() * 2 - 1, j * 10 + Math.random() * 2 - 1);
    }
}

createBench(10.5,12);
createDuck(0,0);
createDuck(3,3);
createDuck(8,6);

const controls = new PointerLockControls(camera, renderer.domElement);
renderer.domElement.addEventListener('click', () => controls.lock());

window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ===== Animation Loop ===== */

renderer.setAnimationLoop(() => {
	controls.moveRight(movementVelocity.x);
	controls.moveForward(movementVelocity.z);
    camera.position.y = terrainHeight(camera.position.x, camera.position.z) + cameraHeight
	renderer.render(scene, camera);
});



function takeScreenshot() {
    // Render the scene to make sure it's up to date
    renderer.render(scene, camera);

    const dataURL = renderer.domElement.toDataURL('image/png');

    photoGallery.push(dataURL);

    // Create a download link
    // const link = document.createElement('a');
    // link.download = 'threejs-screenshot.png';
    // link.href = dataURL;
    // link.click();
}

const moveSpeed = 0.03;

function handleInput(event: KeyboardEvent) {
    if (event.key === 'w') {
        movementVelocity.z = moveSpeed;
    }
    if (event.key === 's') {
        movementVelocity.z = -moveSpeed;
    }
    if (event.key === 'a') {
        movementVelocity.x = -moveSpeed;
    }
    if (event.key === 'd') {
        movementVelocity.x = moveSpeed;
    }
}

window.addEventListener('keyup', (event) => {
    if (event.key === 'w' || event.key === 's') {
        movementVelocity.z = 0;
    }
    if (event.key === 'a' || event.key === 'd') {
        movementVelocity.x = 0;
    }
});

function handleCameraShoot(event: MouseEvent) {
    if (event.button === 0) {
        takeScreenshot();
    }
}

function handleCameraZoom(event: MouseEvent) {
    if (event.button === 2) {
        camera.fov = zoomedFOV;
        camera.updateProjectionMatrix();
    }
}

function handleCameraUnzoom(event: MouseEvent) {
    if (event.button === 2) {
        camera.fov = defaultFOV;
        camera.updateProjectionMatrix();
    }
}