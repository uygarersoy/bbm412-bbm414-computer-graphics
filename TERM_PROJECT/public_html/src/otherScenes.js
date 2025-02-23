import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

export function createCreatorsScene() {
    const creatorsScene = new THREE.Scene();

    const textMaterial = new THREE.MeshPhongMaterial({ color: 0x000000, emissive: 0xffffff, shininess: 100  });
    const loader = new FontLoader();

    loader.load('../font/helvetiker_regular.typeface.json', function (font) {
        const textGeometry = new TextGeometry('Created by:\n\nUYGAR ERSOY\nKUTAY EREN TIRYAKI\nMETE UYSAL', {
            font: font,
            size: 10,
            depth: 2,
        });

        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(-50, 50, 0);
        creatorsScene.add(textMesh);
    });

    const planeGeometry = new THREE.PlaneGeometry(500, 300);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    planeMesh.position.z = -50;
    creatorsScene.add(planeMesh);

    return creatorsScene;
}

export function createTextScene() {
    const textScene = new THREE.Scene();

    const textMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0xffffff, shininess: 100  });
    const loader = new FontLoader();
    const helpMenuContent = `Game Logic:\n
    . Press H or h to go to help menu.
    . Press C or c to see the creators menu.
    . Press L or l to turn on/off the lightSource.
    . Press A-a or D-d buttons to change the light source in x-axis.
    . Press W-w or S-s buttons to change the light source in y-axis.
    . Press Q-q or E-e buttons to change the light source in z-axis.
    . Press B-b or N-n buttons to change the intensity of the light source.
    . Click on an object and use the buttons from light movement to move them.
    . Change shader pair from 1 - 2 keys.
    . Try to guess the wave parameters. Keep and eye on the score :)
    `;
    loader.load('../font/helvetiker_regular.typeface.json', function (font) {
        const textGeometry = new TextGeometry(helpMenuContent, {
            font: font,
            size: 6,
            depth: 2,
        });

        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(-100, 50, 0);
        textScene.add(textMesh);
    });

    const planeGeometry = new THREE.PlaneGeometry(500, 300);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    planeMesh.position.z = -50;
    textScene.add(planeMesh);

    return textScene;
}