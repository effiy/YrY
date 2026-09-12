import { App, Directive } from "vue";
import auth from "./modules/auth";
import copy from "./modules/copy";
import waterMarker from "./modules/waterMarker";
import draggable from "./modules/draggable";
import debounce from "./modules/debounce";
import throttle from "./modules/throttle";
import longpress from "./modules/longpress";
import sticky from "./modules/sticky";
import { vWatermark } from "./modules/v-watermark";
import { vLazyLoad } from "./modules/vLazyLoad";

const directivesList: { [key: string]: Directive } = {
  auth,
  copy,
  waterMarker,
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

