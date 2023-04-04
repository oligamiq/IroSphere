import { invoke } from '@tauri-apps/api'
import './style.css'
import { threeviewer } from './3dviewer'
import { img_load_init } from './img'
import { registerShortcut } from './hotKey'

registerShortcut();

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="flex">
      <div id="file_img_wrapper"><img src="" id="file_img"></div>
      <canvas id="threeCanvas"></canvas>
  </div>
`

window.addEventListener("DOMContentLoaded", () => {
});

invoke('greet', { name: 'World' })
  // `invoke` returns a Promise
  .then((response) => console.log(response))


img_load_init()

threeviewer(document.getElementById("threeCanvas"), { initNodeNumS: 7, initNodeNumL: 28, initNodeNumH: 15 })
