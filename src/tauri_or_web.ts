// web
import { open_file_dialog_web, read_file_and_load_img } from "./img";
// web end

// tauri
// import { get_img_src_size, img_load } from "./img";
// import { invoke } from "@tauri-apps/api"
// import { convertFileSrc } from '@tauri-apps/api/tauri'
// import { listen } from '@tauri-apps/api/event'
// import { appWindow } from '@tauri-apps/api/window'
// tauri end

/* *************************************** */
export function registerShortcut() {
    // tauri
    // document.addEventListener('keyup', e => {
    //     if (e.key == 'F11')
    //         appWindow.isFullscreen().then(isFullScreen => appWindow.setFullscreen(!isFullScreen))
    //     if (e.key == 'Escape')
    //         appWindow.setFullscreen(false)
    // }, false);
    // tauri end
}

export function open_file_dialog(load_img: any) {
    // tauri
    // if (load_img)
    //     invoke('open_file_dialog', {})
    // tauri end
    open_file_dialog_web(load_img) // web
}

export function onFileDropEvent(load_img: any) {
    // web
    const app = document.querySelector<HTMLDivElement>('#app')
    const isValid = (e: any) => e.dataTransfer.types.indexOf("Files") >= 0;
    app!.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) {
            if (!isValid(e)) {
                e.dataTransfer.dropEffect = "none"; return;
            }
            e.dataTransfer.dropEffect = "copy";
        }
    })
    app!.addEventListener('dragleave', (e) => e.stopPropagation())
    app!.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        let file = e.dataTransfer!.files[0];
        read_file_and_load_img(file, load_img)
    })
    // web end
    // tauri
    // appWindow.onFileDropEvent((ev) => {
    //     if (ev.payload.type === 'hover') {
    //         console.log('User hovering', ev.payload.paths);
    //     } else if (ev.payload.type === 'drop') {
    //         console.log('User dropped', ev.payload.paths);
    //         const [filepath] = ev.payload.paths// as string[]
    //         img_load(convertFileSrc(filepath))
    //         get_img_src_size(convertFileSrc(filepath), load_img)
    //     }
    // })
    // tauri end
}

export async function listen_img_load(load_img: any) {
    if (load_img) { } // web
    // tauri
    // await listen('img_load', event => {
    //     const msg: string = ((ev: any) => ev.payload.message)(event)
    //     if (msg) {
    //         img_load(convertFileSrc(msg))
    //         get_img_src_size(convertFileSrc(msg), load_img)
    //     }
    // })
    // tauri end
}