import { convertFileSrc } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event'
import { appWindow } from "@tauri-apps/api/window"

// https://zenn.dev/kumassy/books/6e518fe09a86b2/viewer/1dbeeb\
export function img_load_init() {
    let unlisten: any;

    // https://qiita.com/mrin/items/efe899943c3f69d53353
    appWindow.onFileDropEvent((ev) => {
        if (ev.payload.type !== 'drop') {
            return
        }
        const [filepath] = ev.payload.paths// as string[]
        console.log(filepath)
        img_load(filepath)
        //=> /absolute/path/example.txt
    })

    async function f() {
        unlisten = await listen('img_load', event => {
            console.log(`open_file_dialog ${event.payload.message} ${new Date()}`);
            img_load(event.payload.message)
        })
    }
    f();

    return () => {
        if (unlisten) {
            unlisten();
        }
    }
}

function img_load(path: string) {
    let file_img = document.querySelector<HTMLImageElement>("#file_img");
    file_img!.src = convertFileSrc(path)
}