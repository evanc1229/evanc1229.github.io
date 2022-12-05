import * as utils from "./utils.js";

/**
 * Prototype for individual Pages
 */
export class Page {
  /**
   *
   * @param {Array<utils.AvalancheData>} data
   */
  constructor(data, name = "page") {
    this.name = name;
    this.baseData = data;
    this.data = this.baseData.slice();

    this.aidSelection = utils.range(0, this.data.length);
    this.aidFocus = null;

    this.components = [];
    this.divs = [];
    this.hidden = true;
  }

  /** Undoes any selection or transformation done
   *  Updates this component
   */
  resetSelection() {
    this.aidSelection = new Set(utils.range(0, this.data.length));
    this.data = this.baseData;
    this.components.forEach((c) => {
      c.setData(this.data);
    });
  }

  /**
   * @param {Array<number>} aids
   */
  setSelection(aids) {
    this.aidSelection = new Set(aids);
    this.data = d3.filter(this.baseData, (d) => this.aidSelection.has(d.aid));
    this.components.forEach((c) => {
      c.setData(this.data);
    });
  }

  /**
   * @returns {Array<number>}
   */
  getSelection() {
    return Array.from(this.aidSelection);
  }

  /** Resets current focus back to null
   */
  resetFocus() {
    this.aidFocus = null;
  }

  /**
   * @param {number} aid
   */
  setFocus(aid) {
    this.aidFocus = aid;
  }

  /**
   * @returns {number}
   */
  getFocus() {
    return this.aidFocus;
  }

  show() {
    if (this.hidden) {
      this.hidden = false;
      this.components.forEach((c) => c.show());
    }
  }

  hide() {
    if (!this.hidden) {
      this.hidden = true;
      this.components.forEach((c) => c.hide());
    }
  }

  render() {
    let div = d3
      .select(".content")
      .append("div")
      .attr("id", this.name)
      .style("position", "absolute");

    let y = this.padding;
    let x = this.padding;
    R.forEachObjIndexed((cDims, cName) => {
      this.divs.push(
        div
          .append("div")
          .attr("id", `${cName}-container`)
          .style("width", `${cDims.width}px`)
          .style("height", `${cDims.height}px`)
          .style("left", `${x}px`)
          .style("top", `${y}px`)
          .classed("my-2", true)
      );
      y += cDims.height + this.padding;
    }, this.config);

    R.zip(this.components, this.divs).forEach(([c, d]) => {
      c.render(d);

      if (this.hidden) c.hide();
    });
  }
}

/**
 * Prototype for individual components
 */
export class Component {
  /**
   * @param {Page} page
   * @param {Array<utils.AvalancheData>} data
   * @param {bool} verbose
   */
  constructor(page, data, verbose = false) {
    this.page = page;
    this.verbose = verbose;

    this.baseData = data;
    this.data = this.baseData;
  }

  render(div) {
    this.div = div;
    this.dimensions = utils.getDimensions(div);
  }

  /** Log `msg` to console iff `this.verbose` was set to true
   *
   * @param  {...any} msg
   */
  log(...msg) {
    if (this.verbose) console.log(msg);
  }

  /** Sets current selection of data to the data provided
   *  Calls `update` on component
   *
   * @param {Array<utils.AvalancheData>} newData
   */
  setData(newData) {
    this.data = newData;
    this.update();
  }

  /** Placeholder for function to handle focusing on a specific ID
   * @param {number} aid
   */
  focus(aid) {}

  /**
   * @returns {number}
   */
  getFocus() {
    return this.page.aidFocus;
  }

  /** Placeholder for updating component when data selection has changed
   */
  update() {}

  /** Default way for a component to hide itself
   */
  hide() {
    this.div?.style("display", "none");
  }

  /** Default way for a component to show itself
   */
  show() {
    this.div?.style("display", "block");
  }

  /** Transforms the selection of data by applying `func` to each data point
   *  Calls `update` on component
   * @param {(d:utils.AvalancheData)=>utils.AvalancheData} func
   */
  transformData(func) {
    this.data = this.data.map(func);
    this.update();
  }
}
