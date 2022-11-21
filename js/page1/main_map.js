// main map component in P1
import * as utils from "../shared/utils.js";

// var leaflet = await import("https://cdn.skypack.dev/leaflet");
// import("leaflet").catch((e) => {});

if (L === undefined) L = leaflet;

class MainMap {
  /**
   *
   * @param {Array<utils.AvalancheData>} data
   * @param {bool} verbose
   */
  constructor(data, verbose = false) {
    this.log("Init Main Map");
    this.dimensions = {};

    this.baseData = data;
    this.data = this.baseData;

    this.verbose = verbose;

    this.init = {
      view: [40.593, -110.984],
      zoom: 7,
      radius: 2.6,
      maxZoom: 15,
    };

    this.mapId = "map";

    // XXX: Delete before merge
    d3.select(".content")
      .attr("id", "testbutton")
      .append("button")
      .text("filter map")
      .attr("font-size", "16pt")
      .on("click", (e) => {
        this.filterData((d) => d.Date == null || d.Date[0] == "1");
        this.updateNodes();
      })
      .raise();
  }

  /** Log `msg` to console iff `this.verbose` was set to true
   *
   * @param  {...any} msg
   */
  log(...msg) {
    if (this.verbose) console.log(msg);
  }

  /** Sets current selection of data based on filtering by `criteria`
   *
   * @param {(d:utils.AvalancheData)=>bool} criteria
   */
  filterData(criteria) {
    this.data = d3.filter(this.baseData, criteria);
  }

  /** Transforms the selection of data by applying `func` to each data point
   *
   * @param {(d:utils.AvalancheData)=>utils.AvalancheData} func
   */
  transformData(func) {
    this.data = this.data.map(func);
  }

  /** Undoes any selection or transformation done
   */
  restoreData() {
    this.data = this.baseData;
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
    this.div = div;
    this.dimensions = utils.getDimensions(div);

    this.log(this.dimensions);
    this.mapDiv = div
      .append("div")
      .attr("id", this.mapId)
      .style("width", `${this.dimensions.width}px`)
      .style("height", `${this.dimensions.height}px`);

    let map = this.initMap("google_terrain");
    let overlay = this.initOverlay(map);

    this.map_svg = overlay
      .select("svg")
      .attr("pointer-events", "auto")
      .classed("leaflet-zoom-hide", true);
    this.map_svg.append("g");

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
    // this.updateNodes();

    // update circle and area positions on zoom
    const onZoom = () => {
      this.updateNodes();
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

  updateNodes() {
    // HACK: totally random numbers
    let rn = Math.pow(this.map.getZoom(), 2);
    let rd = Math.pow(this.init.zoom, 2) / this.init.radius;
    let r = rn / rd;

    let coord_map = this.data.reduce((obj, d) => {
      let p = this.map.latLngToLayerPoint([d.coordinates[1], d.coordinates[0]]);

      obj[d.aid] = {
        x: p.x,
        y: p.y,
      };
      return obj;
    }, {});

    const nodeMouseOver = (e) => {
      this.log(e.id);
      let c = d3.select(e.target);
      c.transition().duration("150").attr("r", 20);

      // c.raise()
    };

    const nodeMouseOut = (e) => {
      //reverse the action based on when we mouse off the the circle
      let c = d3.select(e.target);
      c.transition().duration("150").attr("r", c.attr("fixed-r"));
    };

    this.incidentNodes = this.map_svg
      .select("g")
      .selectAll("circle")
      .data(this.data, (d) => d.aid)
      .join(
        (enter) => {
          return enter
            .append("circle")
            .attr("cx", (d) => coord_map[d.aid].x)
            .attr("cy", (d) => coord_map[d.aid].y)
            .attr("fixed-r", r)
            .attr("r", r)
            .attr("stroke", "black")
            .attr("stroke-width", 0.3)
            .attr("fill", "crimson")
            .classed("single-avalanche", true)
            .on("mouseover", nodeMouseOver)
            .on("mouseout", nodeMouseOut);
        },
        (update) => {
          return update
            .attr("fill", "blue")
            .attr("cx", (d) => coord_map[d.aid].x)
            .attr("cy", (d) => coord_map[d.aid].y)
            .attr("fixed-r", r)
            .attr("r", r);
        },
        (exit) => {
          return exit.transition().duration(500).attr("fill", "grey").remove();
        }
      );
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

  /** Calculates and sets correct x,y coordinates and radius for selection of circles
   *
   * @param {d3.Selection} c
   * @param {L.map} map
   */
  calcCircleAttrs(map) {}

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
