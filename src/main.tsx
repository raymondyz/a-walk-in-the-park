import './style.css';
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import treeModelUrl from '../3d_models_glb_files/pine_tree.glb?url';
import { createRoot } from 'react-dom/client';
import { useEffect, useState, useRef } from 'react';
import PhotosPanel from '../components/PhotosPanel';

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

const camera = new THREE.PerspectiveCamera(defaultFOV, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 5);

scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.5));

const ground = new THREE.Mesh(
	new THREE.PlaneGeometry(100, 100),
	new THREE.MeshStandardMaterial({ color: 0x556b2f })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const moveDist = 0.03;

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
	controls.moveRight(movementVelocity.x);
	controls.moveForward(movementVelocity.z);
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

function handleInput(event: KeyboardEvent) {
    if (event.key === 'w') {
        movementVelocity.z = moveDist;
    }
    if (event.key === 's') {
        movementVelocity.z = -moveDist;
    }
    if (event.key === 'a') {
        movementVelocity.x = -moveDist;
    }
    if (event.key === 'd') {
        movementVelocity.x = moveDist;
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