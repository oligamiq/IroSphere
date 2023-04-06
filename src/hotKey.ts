// import { register, unregister } from '@tauri-apps/api/globalShortcut';
import { appWindow } from '@tauri-apps/api/window';

// https://tauri.app/v1/api/js/globalshortcut/#docusaurus_skipToContent_fallback
export function registerShortcut() {
    // https://tauri.app/v1/api/js/window/#setfullscreen
    // this is global hotkey
    // unregister('F11').then(() => register('F11', () => appWindow.isFullscreen().then(isFullScreen => appWindow.setFullscreen(!isFullScreen))))
    // unregister('Ctrl+O').then(() => register('Ctrl+O', () => {
    //     invoke('open_file_dialog', {})
    // }))

    document.addEventListener('keyup', e => {
        if (e.key == 'F11')
            appWindow.isFullscreen().then(isFullScreen => appWindow.setFullscreen(!isFullScreen))
        if (e.key == 'Escape')
            appWindow.setFullscreen(false)
    }, false); // 第一引数にkeydownを記述

}
