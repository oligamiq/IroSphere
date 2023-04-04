import { invoke } from '@tauri-apps/api'
import './style.css'
import typescriptLogo from './assets/typescript.svg'
import viteLogo from './assets/vite.svg'
import javascriptLogo from './assets/javascript.svg'
import tauriLogo from './assets/tauri.svg'
import { setupCounter } from './counter'
import { threeviewer } from './3dviewer'
import { img_load_init } from './img'
import { registerShortcut } from './hotKey'

registerShortcut();

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://tauri.app" target="_blank">
      <img src="${tauriLogo}" class="logo tauri" alt="Tauri logo" />
    </a>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo"/>
    </a>
    <h1>Tauri + Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
    
    <p>Click on the Tauri logo to learn more about the framework</p>

    <div class="row">
      <div>
        <input id="greet-input" placeholder="Enter a name..." />
        <button id="greet-button" type="button">Greet</button>
      </div>
    </div>

    <p id="greet-msg"></p>

    <canvas id="threeCanvas"></canvas>
    <img src="" id="file_img">
  </div>
`

let greetInputEl: any;
let greetMsgEl: any;

async function greet() {
  // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  greetMsgEl.textContent = await invoke("greet", { name: greetInputEl.value });
}

window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  document.querySelector("#greet-button")!.addEventListener("click", () => greet());
});

invoke('greet', { name: 'World' })
  // `invoke` returns a Promise
  .then((response) => console.log(response))

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

img_load_init()

threeviewer(document.getElementById("threeCanvas"))
