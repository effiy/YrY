import { App, Directive } from "vue";
import auth from "./modules/auth";
import copy from "./modules/copy";
import draggable from "./modules/draggable";
import debounce from "./modules/debounce";
import throttle from "./modules/throttle";
import longpress from "./modules/longpress";
import sticky from "./modules/sticky";
import { vWatermark } from "./modules/v-watermark";
import { vLazyLoad } from "./modules/vLazyLoad";

/**
 * 指令注册（2026-10 Phase 2 水印收敛）
 *   删除已废弃的 waterMarker 指令（Legacy Canvas 手写水印，绕开 store/config，
 *   且与 el-watermark + useWatermark(store) 提供的 SVG 水印叠加产生双重水印）。
 *   统一只暴露一个 `vWatermark`（在需要禁用水印的容器上写 `v-watermark="false"`）。
 */
const directivesList: { [key: string]: Directive } = {
  auth,
  copy,
  vWatermark,
  vLazyLoad,
  draggable,
  debounce,
  throttle,
  longpress,
  sticky
};

const directives = {
  install: function (app: App<Element>) {
    Object.keys(directivesList).forEach(key => {
      app.directive(key, directivesList[key]);
    });
  }
};

export default directives;
