import { threeviewer } from '../3dviewer'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <canvas id="threeCanvas"></canvas>
`

window.addEventListener("DOMContentLoaded", () => {
});

/*const reset_img_callback = */threeviewer(document.getElementById("threeCanvas"), { initNodeNumS: 7, initNodeNumL: 28, initNodeNumH: 15 })


