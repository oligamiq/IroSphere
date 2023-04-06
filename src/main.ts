import './style.css'
import { threeviewer } from './3dviewer'
import { img_load_init } from './img'
import { registerShortcut } from './tauri_or_web';

registerShortcut();

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="flex">
      <div id="file_img_wrapper"><img src="" id="file_img"></div>
      <canvas id="threeCanvas"></canvas>
  </div>
`

window.addEventListener("DOMContentLoaded", () => {
});

img_load_init()

threeviewer(document.getElementById("threeCanvas"), { initNodeNumS: 7, initNodeNumL: 28, initNodeNumH: 15 })
