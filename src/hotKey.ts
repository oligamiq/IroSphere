import { register } from '@tauri-apps/api/globalShortcut';
import { appWindow } from '@tauri-apps/api/window';

// https://tauri.app/v1/api/js/globalshortcut/#docusaurus_skipToContent_fallback
export function registerShortcut() {
    // https://tauri.app/v1/api/js/window/#setfullscreen
    register('F11', () => appWindow.isFullscreen().then(isFullScreen => appWindow.setFullscreen(!isFullScreen)));
}