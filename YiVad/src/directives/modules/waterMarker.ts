/*
  Requirement: Add a background watermark to the entire page.

  Approach:
    1. Use canvas to generate a base64 image, set font size, color, etc.
    2. Set it as a background image to achieve a page or component watermark effect.

  Usage: Set watermark text, color, and font size
  <div v-waterMarker="{text:'Copyright',textColor:'rgba(180, 180, 180, 0.4)'}"></div>
*/

import type { Directive, DirectiveBinding } from "vue";
const addWaterMarker: Directive = (str: string, parentNode: any, font: any, textColor: string) => {
  // Watermark text, parent element, font, text color
  let can: HTMLCanvasElement = document.createElement("canvas");
  parentNode.appendChild(can);
  can.width = 205;
  can.height = 140;
  can.style.display = "none";
  let cans = can.getContext("2d") as CanvasRenderingContext2D;
  cans.rotate((-20 * Math.PI) / 180);
  cans.font = font || "16px Microsoft JhengHei";
  cans.fillStyle = textColor || "rgba(180, 180, 180, 0.3)";
  cans.textAlign = "left";
  cans.textBaseline = "middle";
  cans.fillText(str, can.width / 10, can.height / 2);
  parentNode.style.backgroundImage = "url(" + can.toDataURL("image/png") + ")";
};

const waterMarker = {
  mounted(el: DirectiveBinding, binding: DirectiveBinding) {
    addWaterMarker(binding.value.text, el, binding.value.font, binding.value.textColor);
  }
};

export default waterMarker;
