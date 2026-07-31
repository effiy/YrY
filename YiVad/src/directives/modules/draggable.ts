/*
  Requirement: Implement a draggable directive for freely dragging elements within the parent area.

  Approach:
    1. Set the draggable element to absolute positioning and its parent to relative.
    2. On mousedown, record the current left and top values of the target element.
    3. On mousemove, calculate the horizontal and vertical distance changes and update the element's left and top values.
    4. On mouseup, complete the drag.

  Usage: Add v-draggable to a DOM element
  <div class="dialog-model" v-draggable></div>
*/
import type { Directive } from "vue";
interface ElType extends HTMLElement {
  parentNode: any;
}
const draggable: Directive = {
  mounted: function (el: ElType) {
    el.style.cursor = "move";
    el.style.position = "absolute";
    el.onmousedown = function (e) {
      let disX = e.pageX - el.offsetLeft;
      let disY = e.pageY - el.offsetTop;
      document.onmousemove = function (e) {
        let x = e.pageX - disX;
        let y = e.pageY - disY;
        let maxX = el.parentNode.offsetWidth - el.offsetWidth;
        let maxY = el.parentNode.offsetHeight - el.offsetHeight;
        if (x < 0) {
          x = 0;
        } else if (x > maxX) {
          x = maxX;
        }

        if (y < 0) {
          y = 0;
        } else if (y > maxY) {
          y = maxY;
        }
        el.style.left = x + "px";
        el.style.top = y + "px";
      };
      document.onmouseup = function () {
        document.onmousemove = document.onmouseup = null;
      };
    };
  }
};
export default draggable;
