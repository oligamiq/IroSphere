import * as THREE from 'three';

export function threeviewer(threecanvas: any) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    let renderer: any
    if (threecanvas)
        renderer = new THREE.WebGLRenderer({ canvas: threecanvas });
    else {
        renderer = new THREE.WebGLRenderer();
        console.log("not canvas")
    }

    // renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerWidth * 0.8);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    function animate() {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
}