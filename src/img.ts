import { convertFileSrc } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'
import { PhysicalSize, appWindow } from '@tauri-apps/api/window'
import ColorBarSample from './assets/ColorBar.png'
import FlowerSample from './assets/Flower.jpg'
import KawaiiSample from './assets/Kawaii.png'
import MountainSample from './assets/Mountain.jpg'
import PenguinSample from './assets/Penguin.jpg'
import WindmillSample from './assets/Windmill.jpg'
import { randInt } from 'three/src/math/MathUtils'

// https://zenn.dev/kumassy/books/6e518fe09a86b2/viewer/1dbeeb\
export function img_load_init() {

    let unlisten: any;
    let unlisten_resize: any;
    let img_src_size: [number, number];

    let file_img = document.querySelector<HTMLImageElement>("#file_img");
    if (file_img?.parentElement) {
        file_img.src = Array(ColorBarSample, FlowerSample, KawaiiSample, MountainSample, PenguinSample, WindmillSample)[randInt(0, 5)]
        get_img_src_size(file_img.src, size => {
            img_src_size = size
            const aspect = img_size_aspect(size, [window.innerWidth / 2, window.innerHeight])
            file_img!.width = aspect[0]
            file_img!.height = aspect[1]
        })
    }

    // https://qiita.com/mrin/items/efe899943c3f69d53353
    appWindow.onFileDropEvent((ev) => {
        if (ev.payload.type === 'hover') {
            console.log('User hovering', ev.payload.paths);
        } else if (ev.payload.type === 'drop') {
            console.log('User dropped', ev.payload.paths);
            const [filepath] = ev.payload.paths// as string[]
            img_load(filepath)
        }
    })

    async function f() {
        unlisten = await listen('img_load', event => {
            console.log(`open_file_dialog ${event.payload.message} ${new Date()}`);
            img_load(event.payload.message)
        })
        unlisten_resize = await appWindow.onResized(({ payload: size }) => {
            // console.log('Window resized', size);
            let file_img = document.querySelector<HTMLImageElement>("#file_img");
            if (file_img?.parentElement) {
                const aspect = img_size_aspect(img_src_size, [size.width / 2, size.height])
                file_img!.width = aspect[0]
                file_img!.height = aspect[1]
            }
        });
    }
    f();

    return () => {
        if (unlisten)
            unlisten();
        if (unlisten_resize)
            unlisten_resize();
    }
}

function img_load(path: string) {
    let file_img = document.querySelector<HTMLImageElement>("#file_img");
    file_img!.src = convertFileSrc(path)
}

function get_img_src_size(src: string, callback: (result: [number, number]) => void) {
    var img = new Image();
    img.src = src
    img.onload = () => callback([img.width, img.height])
}


function img_size_aspect(src_size: [number, number], size: [number, number]): [number, number] {
    // https://qiita.com/PG0721/items/599ba2921b8339700fe3
    var canvasAspect = size[0] / size[1], // canvasのアスペクト比
        imgAspect = src_size[0] / src_size[1] // 画像のアスペクト比
    if (imgAspect >= canvasAspect) {// 画像が横長
        return [size[0], size[0] / imgAspect]
    } else {// 画像が縦長
        return [size[1] * imgAspect, size[1]]
    }
}