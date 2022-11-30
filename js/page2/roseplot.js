// roseplot component in P2

import * as utils from "../shared/utils.js";
import { Page,Component } from "../shared/prototype.js";

var leaflet = await import("https://cdn.skypack.dev/leaflet");
import("leaflet").catch((e) => { });

if (L === undefined) L = leaflet;

class RosePlot extends Component {
  /**
   * 
   * @param {Page} page
   * @param {Array<utils.AvalancheData>} data 
   * @param {bool} verbose 
   */
  constructor(page, data, verbose=false){
    super(page, data, verbose);
    this.page = page
    this.dimensions = {};
    this.data = data;
    this.verbose = verbose
  }
  async render(div) {
    super.render(div)

  }
}
export {RosePlot };