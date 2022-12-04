// histogram component in P2

import * as utils from "../shared/utils.js";
import { Page,Component } from "../shared/prototype.js";

var leaflet = await import("https://cdn.skypack.dev/leaflet");
import("leaflet").catch((e) => { });

if (L === undefined) L = leaflet;

class Histogram extends Component {
  /**
   * 
   * @param {Page} page
   * @param {Array<utils.AvalancheData>} data 
   * @param {bool} verbose 
   */
  constructor(page, data, verbose=false){
    super(page, data, verbose);
  }
  async render(div) {
    super.render(div)
  }
}
export {Histogram };