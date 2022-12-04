// main map component in P1
import * as utils from "../shared/utils.js";
import { Component, Page } from "../shared/prototype.js";
import { ToolTip } from "./tooltip.js";

var leaflet = await import("https://cdn.skypack.dev/leaflet");
import("leaflet").catch((e) => {});
if (L === undefined) L = leaflet;

class MainMap extends Component {
  /**
   * @param {Page} page
   * @param {Array<utils.AvalancheData>} data
   * @param {bool} verbose
   */
  constructor(page, data, verbose = false) {
    super(page, data, verbose);

    this.log("Init Main Map");

    this.dimensions = {};

    this.init = {
      view: [40.593, -110.984],
      zoom: 7,
      radius: 2.6,
      maxZoom: 15,
    };

    this.mapId = "map";

    this.state = {};

    this.tooltips = null;

    // d3.select(".content")
    //   .attr("id", "testbutton")
    //   .append("button")
    //   .text("Filter Map")
    //   .attr("mode", "filter")
    //   .attr("font-size", "16pt")
    //   .on("click", (e) => {
    //     let b = d3.select(e.target);
    //     if (b.attr("mode") == "filter") {
    //       this.page.setSelection(utils.range(800, 1200));
    //       b.attr("mode", "reset").text("Reset Map");
    //     } else {
    //       this.page.resetSelection();
    //       b.attr("mode", "filter").text("Filter Map");
    //     }
    //     this.update();
    //   })
    //   .raise();
  }

  /** Converts coordinates of avalanches to geojson points
   *
   * @returns {d3.GeoPermissibleObjects}
   */
  convertPoints() {
    let avalanchePoints = {
      type: "FeatureCollection",
      features: [],
    };

    avalanchePoints.features = this.data
      .filter((e) => e.Coordinates.length > 0)
      .map((e) => {
        let coords = e.Coordinates.split(", ")
          .map((c) => parseFloat(c))
          .reverse();

        let ids = e.id;
        // this.log(e)
        return {
          id: ids,
          type: "Feature",
          properties: {},
          geometry: {
            coordinates: coords,
            type: "Point",
          },
        };
      });

    return avalanchePoints;
  }

  /** Initializes a leaflet map
   *
   * @param {('osm'|'terrain1'|'terrain2'})}
   * @returns {L.Map}
   */
  initMap(provider) {
    provider = provider === undefined ? "osm" : provider;
    this.initLayers();

    if (!Object.keys(this.layerMap).includes(provider))
      throw Error(
        `"${provider}" is not a valid provider [${Object.keys(this.layerMap)}]`
      );

    let map = L.map(this.mapId).setView(this.init.view, this.init.zoom);
    let layer = this.layerMap[provider];

    layer.addTo(map);

    var layerControl = L.control.layers(this.layerMap).addTo(map);

    this.map = map;
    return map;
  }

  /** Initializes a d3 overlay over a leaflet map
   *
   * @param {L.Map} map
   * @returns {d3.Selection}
   */
  initOverlay(map) {
    L.svg({ clickable: true }).addTo(map);

    // create an overlay svg for d3 to operate on
    let overlay = d3
      .select(map.getPanes().overlayPane)
      .attr("id", "d3-overlay")
      .classed("overlay", true);

    return overlay.raise();
  }

  /** Render current component to screen
   *
   * @param {d3.Selection} div
   */
  async render(div) {
    super.render(div);

    this.log(this.dimensions);
    this.mapDiv = div
      .append("div")
      .attr("id", this.mapId)
      .style("width", `${this.dimensions.width}px`)
      .style("height", `${this.dimensions.height}px`);

    // setup overlay
    let map = this.initMap("google_terrain");
    let overlay = this.initOverlay(map);

    this.mapSvg = overlay
      .select("svg")
      .attr("pointer-events", "auto")
      .attr("id", "map-svg")
      .classed("leaflet-zoom-hide", true);
    this.mapSvg.append("g").attr("id", "map-g");

    this.nodeGroups = d3
      .selectAll("#map-g")
      .append("g")
      .classed("node-groups", true);
    // convert from lat/long to a point on the leaflet map
    // const projectToMap = function (x, y) {
    //   const point = map.latLngToLayerPoint(new L.LatLng(y, x));
    //   return this.stream.point(point.x, point.y);
    // };

    // // define a d3 projection
    // const projectToMapD3 = d3.geoTransform({ point: projectToMap });
    // const pathCreator = d3.geoPath().projection(projectToMapD3);

    // let incidentPoints = this.convertPoints();

    // let areas = d3.filter(
    //   this.data.map.features,
    //   (d) => d.geometry.type != "Point"
    // );

    // const areaPaths = g
    //   .selectAll("path")
    //   .data(areas)
    //   .enter()
    //   .append("path")
    //   .attr("fill-opacity", 0.3)
    //   .attr("stroke", "black")
    //   .attr("stroke-width", 2.5);
    // this.update();

    // update circle and area positions on zoom
    const onZoom = () => {
      this.update();
      // this.logMapState();
      // this.calcCircleAttrs(this.map);
      // areaPaths.attr("d", pathCreator);
    };

    const onDrag = () => {
      // this.logMapState();
    };

    map.on("drag", onDrag);
    map.on("zoomend", onZoom);

    onZoom();
  }

  update() {
    // this.data = this.page.data;
    // HACK: totally random numbers
    let r = (this.init.radius * this.map.getZoom() ** 2) / this.init.zoom ** 2;

    let coordMap = this.data.reduce((obj, d) => {
      let p = this.map.latLngToLayerPoint([d.coordinates[1], d.coordinates[0]]);

      obj[d.aid] = {
        x: p.x,
        y: p.y,
      };
      return obj;
    }, {});

    // const nodeMouseOver = (e) => {
    //   this.log(e.id);
    //   let c = d3.select(e.target);
    //   c.transition().duration("150").attr("r", 20);

    //   // c.raise()
    // };

    // const nodeMouseOut = (e) => {
    //   //reverse the action based on when we mouse off the the circle
    //   let c = d3.select(e.target);
    //   c.transition().duration("150").attr("r", c.attr("fixed-r"));
    // };

    // console.log(this.data)

    // .selectAll("g")
    // .data(this.data, (d) => d.aid)
    // .join('g');

    this.nodes = this.mapSvg
      .select("g.node-groups")
      .selectAll("circle")
      .data(this.data, (d) => d.aid)
      .join(
        (enter) => {
          return (
            enter
              // .append("g")
              // .attr("id", (d) => `gp-node${d.aid}`)
              // .classed("gp-node", true)
              .append("circle")
              .attr("id", (d) => `node${d.aid}`)
              .attr("cx", (d) => coordMap[d.aid].x)
              .attr("cy", (d) => coordMap[d.aid].y)
              .attr("fixed-r", r)
              .attr("r", r)
              .attr("stroke", "black")
              .attr("stroke-width", 0.3)
              .attr("fill", "#dc3545")
              .attr("originalFill", "#dc3545")
              .classed("node", true)
          );
          // .on("mouseover", nodeMouseOver)
          // .on("mouseout", nodeMouseOut);
        },
        (update) => {
          return (
            update
              // .selectAll("circle")
              .attr("fill", "blue")
              .attr("cx", (d) => coordMap[d.aid].x)
              .attr("cy", (d) => coordMap[d.aid].y)
              .attr("fixed-r", r)
              .attr("r", r)
          );
        },
        (exit) => {
          return exit.transition().duration(500).attr("fill", "grey").remove();
        }
      );

    if (this.tooltips == null) {
      this.tooltips = new ToolTip(this);
      // this.tooltips.init_tooltips(this.nodes);
      this.tooltips.render(this.mapSvg.select("#map-g"));
    }

    this.nodes
      .on("click", (e) => {
        this.tooltips?.toggle_pin();
      })
      .on("mouseover", (e) => {
        let d = e.target.__data__;
        this.page.setFocus(d.aid);
        this.tooltips?.setLoc(coordMap[d.aid]);
        this.tooltips?.update();
      })
      .on("mouseout", (e) => {
        this.page.setFocus(null);
        this.tooltips?.update();
      });
  }

  /** Log current state of the map to the console
   */
  logMapState() {
    if (!this.verbose) return;
    let map = this.map;
    let mapState = {
      zoom: map.getZoom(),
      bounds: map.getBounds(),
      center: map.getCenter(),
    };
    this.log(mapState);
  }

  initLayers() {
    // chosen from: https://leaflet-extras.github.io/leaflet-providers/preview/
    this.layerMap = {
      google_terrain: L.tileLayer(
        "http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
        {
          maxZoom: this.init.maxZoom,
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
        }
      ),
      google_streets: L.tileLayer(
        "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        {
          maxZoom: this.init.maxZoom,
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
        }
      ),
      google_satellite: L.tileLayer(
        "http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        {
          maxZoom: 20,
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
        }
      ),
      osm: L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: this.init.maxZoom,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }),
      stamen: L.tileLayer(
        "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}",
        {
          attribution:
            'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          subdomains: "abcd",
          minZoom: 0,
          maxZoom: this.init.maxZoom,
          ext: "png",
        }
      ),
      opentopo: L.tileLayer(
        "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        {
          maxZoom: this.init.maxZoom,
          attribution:
            'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        }
      ),
    };
  }
}

export { MainMap };
