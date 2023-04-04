import { appWindow } from '@tauri-apps/api/window';
import * as THREE from 'three';

export function threeviewer(threecanvas: any, param: { initNodeNumS: number, initNodeNumL: number, initNodeNumH: number }) {
    let unlisten_resize: any;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd0d0d0);

    const aspect_camera = aspectCamera([window.innerWidth / 2, window.innerHeight]);

    const camera = new THREE.OrthographicCamera(-aspect_camera[0], aspect_camera[0], aspect_camera[1], -aspect_camera[1], -1.1, 1.1);
    camera.position.set(0, 0, 0); // カメラの位置
    camera.lookAt(0, 0, 0); // 注視点の座標

    let renderer: any
    if (threecanvas)
        renderer = new THREE.WebGLRenderer({ canvas: threecanvas });
    else {
        renderer = new THREE.WebGLRenderer();
        console.log("not canvas")
    }

    renderer.setSize(window.innerWidth / 2, window.innerHeight);

    const group = new THREE.Group();
    var group_sphere: any = [];
    scene.add(group)

    const createMesh = function (size: number, pos: THREE.Vector3, divide: [number, number], visible: boolean) {
        const hsl: any = positionToHSL(pos)
        const color = new THREE.Color().setHSL(hsl.h, hsl.s, hsl.l);
        const material = new THREE.MeshBasicMaterial({ color: color });
        const geometry = new THREE.SphereGeometry(size, divide[0], divide[1]); // サイズ, 分割数
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(pos.x, pos.y, pos.z);
        if (!visible)
            mesh.visible = false;
        group_sphere.push(mesh)
        group.add(mesh)
    }

    var parentID = 0;

    for (var k = 0; k < param.initNodeNumL; k++) {
        const elevation = param.initNodeNumL == 1 ? 0.0 : Math.PI * 2 / param.initNodeNumL * k;

        for (var j = 1; j <= param.initNodeNumS; j++) {

            const radius = 1 / param.initNodeNumS * j;

            for (var i = 0; i < param.initNodeNumH; i++) {
                const azimuth = param.initNodeNumH == 1 ? 0.0 : Math.PI / (param.initNodeNumH - 1) * i + Math.PI / 2;
                const rot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), azimuth).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), elevation));
                const pos = new THREE.Vector3(0, 0, radius).applyQuaternion(rot);
                parentID = parentID == 0 ? 1 : 0;
                createMesh(0.01, pos, [10, 5], j == param.initNodeNumS)
            }
        }
    }


    async function f() {
        unlisten_resize = await appWindow.onResized(({ payload: size }) => {
            renderer.setSize(size.width / 2, size.height)
            const aspect_camera = aspectCamera([size.width / 2, size.height]);
            camera.left = -aspect_camera[0]
            camera.right = aspect_camera[0]
            camera.top = aspect_camera[1]
            camera.bottom = -aspect_camera[1]
            // camera.aspect = (size.width / 2) / size.height
            camera.updateProjectionMatrix();
        });

        function animate() {
            for (var i = 0; i < 1; i++) {
                // group.rotation.x += 0.01;
                group.rotation.y += 0.01;
            }
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }
        animate();
    }
    f()

    return () => {
        if (unlisten_resize)
            unlisten_resize();
    }
}

function aspectCamera(size: [number, number]): [number, number] {
    if (size[0] <= size[1]) {
        return [1.1, 1.1 * size[1] / size[0]]
    } else {
        return [1.1 * size[0] / size[1], 1.1]
    }
}

function positionToHSL(pos: THREE.Vector3) {
    if (pos.lengthSq() >= 1.0) {
        pos.normalize();
    }

    var hsl = { h: 0, s: 0, l: 0 };
    hsl.l = pos.y * 0.5 + 0.5;
    hsl.h = (Math.atan2(pos.x, pos.z) / Math.PI * 0.5) + 0.5;

    //Nan回避
    if (hsl.l >= 1.0) {
        hsl.s = 0.0;
    } else {
        hsl.s = new THREE.Vector2(pos.x, pos.z).length() / Math.sqrt(1 - pos.y * pos.y);
    }

    return hsl;
}