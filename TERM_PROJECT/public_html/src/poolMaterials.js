import * as THREE from 'three';

export function createGround(scene) {
    const groundGeometry = new THREE.PlaneGeometry(5, 5);
    const groundTexture = new THREE.TextureLoader().load('textures/groundTexture2.png');
    const groundMaterial = new THREE.MeshStandardMaterial({
        map: groundTexture,
        roughness: 0.8,
        metalness: 0.2
    });
  
    const ground1 = new THREE.Mesh(groundGeometry, groundMaterial);
    ground1.position.set(5, 0, 0.5);
    scene.add(ground1);
    
    const ground2 = new THREE.Mesh(groundGeometry, groundMaterial);
    ground2.position.set(-5, 0, 0.5);
    scene.add(ground2);
  
    const ground3 = new THREE.Mesh(groundGeometry, groundMaterial);
    ground3.position.set(5, -5, 0.5);
    scene.add(ground3);
  
    const ground4 = new THREE.Mesh(groundGeometry, groundMaterial);
    ground4.position.set(5, 5, 0.5);
    scene.add(ground4);
  
    const ground5 = new THREE.Mesh(groundGeometry, groundMaterial);
    ground5.position.set(-5, 5, 0.5);
    scene.add(ground5);
  
    const ground6 = new THREE.Mesh(groundGeometry, groundMaterial);
    ground6.position.set(-5, -5, 0.5);
    scene.add(ground6);
  
    const ground7 = new THREE.Mesh(groundGeometry, groundMaterial);
    ground7.position.set(0, 5, 0.5);
    scene.add(ground7);
  
    const ground8 = new THREE.Mesh(groundGeometry, groundMaterial);
    ground8.position.set(0, -5, 0.5);
    scene.add(ground8);
}
  
export function createWalls(scene) {
    const wallGeometry = new THREE.BoxGeometry(0.1, 15, 10);
    const wallTexture = new THREE.TextureLoader().load('textures/wallTexture5.png');
    const wall4Texture = new THREE.TextureLoader().load('textures/groundTexture2.png');
    wall4Texture.repeat.set(1,0.5);
    const wallMaterial = new THREE.MeshStandardMaterial({
        map: wallTexture,
        roughness: 0.9,
        metalness: 0.1

    });

    const wall4Material = new THREE.MeshStandardMaterial({
        map: wall4Texture,
        roughness: 0.8,
        metalness: 0.2
    });

    const wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall1.rotation.z = Math.PI / 2;
    wall1.position.set(0, 7.5, 4);
    scene.add(wall1);

    const wall2 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall2.position.set(-7.5, 0, 4);
    scene.add(wall2);

    const wall3 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall3.position.set(7.5, 0, 4);
    scene.add(wall3);

    const wall4 = new THREE.Mesh(new THREE.BoxGeometry(15, 0.005, 1.5), wall4Material);
    wall4.position.set(0, -7.5, -0.25);
    scene.add(wall4);
}

export function createPoolWalls(scene) {
    const poolWallMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.9,
        metalness: 0.1
    });

    const wallFront = new THREE.Mesh(new THREE.BoxGeometry(5, 1, 0), poolWallMaterial);
    wallFront.position.set(0, -2.5, 0);
    wallFront.rotation.x = Math.PI/2;
    scene.add(wallFront);

    const wallBack = new THREE.Mesh(new THREE.BoxGeometry(5, 1, 0), poolWallMaterial);
    wallBack.position.set(0, 2.5, 0);
    wallBack.rotation.x = Math.PI/2;
    scene.add(wallBack);

    const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(0, 1, 5), poolWallMaterial);
    wallLeft.position.set(-2.5, 0, 0);
    wallLeft.rotation.x = Math.PI / 2;
    scene.add(wallLeft);

    const wallRight = new THREE.Mesh(new THREE.BoxGeometry(0, 1, 5), poolWallMaterial);
    wallRight.position.set(2.5, 0, 0);
    wallRight.rotation.x = Math.PI / 2;
    scene.add(wallRight);

    const belowGeometry = new THREE.PlaneGeometry(15, 15);
    const belowMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.9,
        metalness: 0.1
    });

    const belowPlane = new THREE.Mesh(belowGeometry, belowMaterial);
    belowPlane.rotation.y = Math.PI
    belowPlane.position.z = -1;
    scene.add(belowPlane);
}