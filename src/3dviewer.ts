import { appWindow } from '@tauri-apps/api/window';
import * as THREE from 'three';
import { LineWeight } from './meshLine';


// https://white-sesame.jp/archives/blog/3062

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
        const mesh = new THREE.Line(geometry, material);
        mesh.position.set(pos.x, pos.y, pos.z);
        if (!visible)
            mesh.visible = false;
        group_sphere.push(mesh)
        group.add(mesh)
    }

    for (var k = 0; k < param.initNodeNumL; ++k) {
        const elevation = param.initNodeNumL == 1 ? 0.0 : Math.PI * 2 / param.initNodeNumL * k;
        for (var j = 1; j <= param.initNodeNumS; ++j) {
            const radius = 1 / param.initNodeNumS * j;
            for (var i = 0; i < param.initNodeNumH; ++i) {
                const azimuth = param.initNodeNumH == 1 ? 0.0 : Math.PI / (param.initNodeNumH - 1) * i + Math.PI / 2;
                const rot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), azimuth).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), elevation));
                const pos = new THREE.Vector3(0, 0, radius).applyQuaternion(rot);
                createMesh(0.01, pos, [10, 5], j == param.initNodeNumS)
            }
        }
    }

    // 軸の表示
    const axisGroup = new THREE.Group();
    var axisMeshVertical = new THREE.Group();
    axisMeshVertical.add(create_smooth_line(64))
    axisMeshVertical.add(create_smooth_line_separate(-0.5))
    axisMeshVertical.add(create_smooth_line_separate(0.5))
    axisMeshVertical.add(create_smooth_line_separate(-0.75, 0.05))
    axisMeshVertical.add(create_smooth_line_separate(-0.25, 0.05))
    axisMeshVertical.add(create_smooth_line_separate(0.25, 0.05))
    axisMeshVertical.add(create_smooth_line_separate(0.75, 0.05))
    axisGroup.add(axisMeshVertical)

    var axisMeshHorizontal = new THREE.Group();
    axisMeshHorizontal.add(create_rainbow_circle_frame(0.5, 64))
    axisMeshHorizontal.add(create_rainbow_circle_frame(1, 64))
    for (var i = 0; i < 8; ++i) {
        axisMeshHorizontal.add(create_rainbow_circle_line(2 * Math.PI / 8 * i))
        axisMeshHorizontal.add(create_rainbow_circle_frame_separate(0.75, 2 * Math.PI / 8 * i))
        axisMeshHorizontal.add(create_rainbow_circle_frame_separate(0.25, 2 * Math.PI / 8 * i, 0.05))
    }
    axisGroup.add(axisMeshHorizontal)

    group.add(axisGroup)

    const colorSphereMaterial = new THREE.MeshBasicMaterial({ color: 0x88ffffff });
    const colorSphereGeometry = new THREE.SphereGeometry(0.1); // サイズ, 分割数
    const colorSphereMesh = new THREE.Mesh(colorSphereGeometry, colorSphereMaterial);
    colorSphereMesh.visible = false
    group.add(colorSphereMesh)

    async function f() {
        group.rotation.x += 0.4;
        group.rotation.y += 0.4;

        unlisten_resize = await appWindow.onResized(({ payload: size }) => {
            renderer.setSize(size.width / 2, size.height)
            const aspect_camera = aspectCamera([size.width / 2, size.height]);
            camera.left = -aspect_camera[0]
            camera.right = aspect_camera[0]
            camera.top = aspect_camera[1]
            camera.bottom = -aspect_camera[1]
            camera.updateProjectionMatrix();
        });

        var mouse_press: boolean = false;
        const file_img = document.querySelector<HTMLImageElement>("#file_img");
        file_img?.addEventListener("mousedown", () => mouse_press = true)
        file_img?.addEventListener("mouseup", () => mouse_press = false)

        var image_position: [number, number] = [0, 0];
        var mouse_on_img: boolean = false;
        window.onmousemove = (e) => {
            if (mouse_on_img) {
                var rect = file_img!.getBoundingClientRect();
                image_position[0] = (e.pageX - rect.left) // * (file_img!.naturalWidth / file_img!.width)
                image_position[1] = (e.pageY - rect.top)  // * (file_img!.naturalHeight / file_img!.height)
                const canvas = document.createElement('canvas');
                canvas.width = file_img!.width
                canvas.height = file_img!.height
                const context = canvas.getContext('2d');
                context!.drawImage(file_img!, 0, 0, canvas.width, canvas.height);
                const imgData = context?.getImageData(Math.round(image_position[0]), Math.round(image_position[1]), 1, 1);
                const implData = imgData?.data
                if (implData) {
                    colorSphereMesh.visible = true
                    colorSphereMesh.material.color = new THREE.Color().setRGB(implData[0] / 255, implData[1] / 255, implData[2] / 255)
                }
            }
            else colorSphereMesh.visible = false
        };
        window.addEventListener("mouseover", event => {
            if (event?.target)
                if (file_img == event.target)
                    mouse_on_img = true
                else mouse_on_img = false
            else mouse_on_img = false
        });

        var x_speed: number = 0;
        var y_speed: number = 0;
        let key_down: { w: boolean, a: boolean, s: boolean, d: boolean };
        key_down = { w: false, a: false, s: false, d: false }
        const key_func = function (event: KeyboardEvent, press: boolean) {
            if (event.key == "w")
                key_down.w = press
            if (event.key == "a")
                key_down.a = press
            if (event.key == "s")
                key_down.s = press
            if (event.key == "d")
                key_down.d = press
        }
        document.addEventListener('keydown', e => key_func(e, true), false); // 第一引数にkeydownを記述
        document.addEventListener('keyup', e => key_func(e, false), false); // 第一引数にkeyupを記述

        function animate() {
            if (key_down.w)
                x_speed -= 0.005
            if (key_down.a)
                y_speed -= 0.005
            if (key_down.s)
                x_speed += 0.005
            if (key_down.d)
                y_speed += 0.005
            if (mouse_press) {
            }
            group.rotation.x += x_speed;
            x_speed *= 0.85;
            group.rotation.y += y_speed;
            y_speed *= 0.85;

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

function create_circle_frame_geometry(radius?: number | undefined, segments?: number | undefined): THREE.BufferGeometry {
    if (!radius)
        radius = 2
    if (!segments)
        segments = 32
    const geometry = new THREE.BufferGeometry()
    const verticesImpl = []
    for (var i = 0; i < segments; ++i) {
        verticesImpl.push(Math.cos(2 * Math.PI / segments * i))
        verticesImpl.push(0)
        verticesImpl.push(Math.sin(2 * Math.PI / segments * i))
    }
    const vertices = new Float32Array(verticesImpl)
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))

    return geometry
}

function create_rainbow_circle_frame(radius?: number | undefined, segments?: number | undefined, linewidth?: number | undefined): THREE.Group {
    if (!radius)
        radius = 1
    if (!segments)
        segments = 32
    if (!linewidth)
        linewidth = 0.005
    const circle_func = (k: number) => new THREE.Vector3(Math.cos(2 * Math.PI / segments! * k) * radius!, 0, Math.sin(2 * Math.PI / segments! * k) * radius!)
    const rainbow_circle_frame = new THREE.Group()
    for (var i = 0; i < segments; ++i) {
        const color = new THREE.Color().setHSL(0.75 - (i + 0.5) / segments, radius, 0.5);
        const circle_material = new THREE.LineBasicMaterial({ color: color, transparent: true, side: THREE.DoubleSide, fog: false });
        const circle_frame = LineWeight(circle_func(i), circle_func(i + 1), linewidth, circle_material);

        rainbow_circle_frame.add(circle_frame)
    }
    return rainbow_circle_frame
}

function create_rainbow_circle_line(theta?: number | undefined, segments?: number | undefined, linewidth?: number | undefined): THREE.Group {
    if (!theta)
        theta = 0
    if (!segments)
        segments = 16
    if (!linewidth)
        linewidth = 0.005
    const circle_func = (k: number) => new THREE.Vector3(Math.sin(theta! + Math.PI) / segments! * k, 0, Math.cos(theta! + Math.PI) / segments! * k)
    const rainbow_circle_line = new THREE.Group()
    for (var i = 0; i < segments; ++i) {
        const color = new THREE.Color().setHSL(theta / Math.PI / 2, (i + 0.5) / segments, 0.5);
        const circle_material = new THREE.LineBasicMaterial({ color: color, transparent: true, side: THREE.DoubleSide, fog: false });
        const circle_line = LineWeight(circle_func(i), circle_func(i + 1), linewidth, circle_material);
        rainbow_circle_line.add(circle_line)
    }
    return rainbow_circle_line
}


function create_rainbow_circle_frame_separate(radius?: number | undefined, theta?: number | undefined, len?: number | undefined, linewidth?: number | undefined): any {
    if (!radius)
        radius = 0.75
    if (!theta)
        theta = 0
    if (!len)
        len = 0.075
    if (!linewidth)
        linewidth = 0.005
    const separate_middle = [Math.sin(theta + Math.PI) * radius, Math.cos(theta + Math.PI) * radius]
    const separate_down = new THREE.Vector3(separate_middle[0] + Math.sin(Math.PI / 2 - theta) * len, 0, separate_middle[1] - Math.cos(Math.PI / 2 - theta) * len)
    const separate_up = new THREE.Vector3(separate_middle[0] - Math.sin(Math.PI / 2 - theta) * len, 0, separate_middle[1] + Math.cos(Math.PI / 2 - theta) * len)
    const color = new THREE.Color().setHSL(theta / Math.PI / 2, radius, 0.5);
    const circle_material = new THREE.LineBasicMaterial({ color: color, transparent: true, side: THREE.DoubleSide, fog: false });
    const circle_line = LineWeight(separate_down, separate_up, linewidth, circle_material);
    return circle_line
}

function create_smooth_line(segments?: number | undefined, linewidth?: number | undefined): THREE.Group {
    if (!segments)
        segments = 16
    if (!linewidth)
        linewidth = 0.005
    const smooth_func = (k: number) => new THREE.Vector3(0, 2 / segments! * k - 1, 0)
    const smooth_line_package = new THREE.Group()
    for (var i = 0; i < segments; ++i) {
        const color = new THREE.Color().setHSL(0, 0, (i + 0.5) / segments);
        const smooth_material = new THREE.LineBasicMaterial({ color: color, transparent: true, side: THREE.DoubleSide, fog: false });
        const smooth_line = LineWeight(smooth_func(i), smooth_func(i + 1), linewidth, smooth_material);
        smooth_line_package.add(smooth_line)
    }
    return smooth_line_package
}

function create_smooth_line_separate(height?: number | undefined, len?: number | undefined, linewidth?: number | undefined): THREE.Group {
    if (!height)
        height = -0.75
    if (!len)
        len = 0.075
    if (!linewidth)
        linewidth = 0.005
    const smooth_line = new THREE.Group()
    const smooth_func = (k: number) => {
        const separate_down = new THREE.Vector3(Math.sin(k) * len!, height!, - Math.cos(k) * len!)
        const separate_up = new THREE.Vector3(-Math.sin(k) * len!, height!, Math.cos(k) * len!)
        const color = new THREE.Color().setHSL(0, 0, (height! + 1) / 2);
        const circle_material = new THREE.LineBasicMaterial({ color: color, transparent: true, side: THREE.DoubleSide, fog: false });
        const circle_line = LineWeight(separate_down, separate_up, linewidth, circle_material);
        smooth_line.add(circle_line)
    }
    smooth_func(0)
    smooth_func(Math.PI / 2)
    return smooth_line
}