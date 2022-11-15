// main map component in P1
var leaflet = await import("https://cdn.skypack.dev/leaflet");
import("leaflet").catch((e) => {});

if (L === undefined) L = leaflet;

class MainMap {
  constructor(div, data, verbose) {
    console.log("Init Main Map");
    this.div = div;
    this.data = data;
    this.verbose = verbose === undefined ? false : verbose;

    this.init = {
      view: [40.593, -110.984],
      zoom: 7,
      radius: 2.6,
      maxZoom: 12,
    };
  }

  /**
   * Converts coordinates of avalanches to geojson points
   * @returns
   */
  convert_points() {
    let avalanchePoints = {
      type: "FeatureCollection",
      features: [],
    };
    avalanchePoints.features = this.data.avalanches
      .filter((e) => e.Coordinates.length > 0)
      .map((e) => {
        let coords = e.Coordinates.split(", ")
          .map((c) => parseFloat(c))
          .reverse();
        // console.log(e)
        return {
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

  /**
   * Initializes a leaflet map
   * @param {('osm'|'terrain'})}
   * @returns {L.Map}
   */
  init_map(provider) {
    provider = provider === undefined ? "osm" : provider;
    // chosen from: https://leaflet-extras.github.io/leaflet-providers/preview/
    let layerMap = {
      osm: L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: this.init.maxZoom,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }),
      terrain1: L.tileLayer(
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
      terrain2: L.tileLayer(
        "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        {
          maxZoom: this.init.maxZoom,
          attribution:
            'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        }
      ),
    };
    if (!Object.keys(layerMap).includes(provider))
      throw Error(
        `"${provider}" is not a valid provider [${Object.keys(layerMap)}]`
      );

    let map = L.map("map").setView(this.init.view, this.init.zoom);
    let layer = layerMap[provider];

    layer.addTo(map);

    var layerControl = L.control.layers(layerMap).addTo(map);

    this.map = map;
    return map;
  }

  /**
   * Initializes a d3 overlay over a leaflet map
   * @param {L.Map} map
   * @returns {d3.Selection}
   */
  init_overlay(map) {
    L.svg({ clickable: true }).addTo(map);

    // create an overlay svg for d3 to operate on
    let overlay = d3
      .select(map.getPanes().overlayPane)
      .attr("id", "d3-overlay")
      .classed("overlay", true);

    return overlay.raise();
  }

  render() {
    let map = this.init_map("terrain1");
    let overlay = this.init_overlay(map);

    let svg = overlay.select("svg").attr("pointer-events", "auto");
    let g = svg.append("g");

    // convert from lat/long to a point on the leaflet map
    const projectToMap = function (x, y) {
      const point = map.latLngToLayerPoint(new L.LatLng(y, x));
      return this.stream.point(point.x, point.y);
    };
    
    // define a d3 projection
    const projectToMapD3 = d3.geoTransform({ point: projectToMap });
    const pathCreator = d3.geoPath().projection(projectToMapD3);

    let incidentPoints = this.convert_points().features;
    
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

    const nodeMouseOver = (e) => {
      let c = d3.select(e.target);
      c.transition().duration("150").attr("r", 20);

      // c.raise()
    };

    const nodeMouseOut = (e) => {
      //reverse the action based on when we mouse off the the circle
      let c = d3.select(e.target);
      c.transition().duration("150").attr("r", c.attr("fixed-r"));
    };

    // update circle and area positions on zoom
    const onZoom = () => {
      this.logMapState();
      this.calcCircleAttrs(incidentNodes, map);
      // areaPaths.attr("d", pathCreator);
    };

    const onDrag = () => {
      this.logMapState();
    };

    const incidentNodes = g
      .selectAll("circle")
      .data(incidentPoints)
      .join("circle")
      .attr("stroke", "black")
      .attr("stroke-width", 0.3)
      .attr("fill", "crimson")
      .classed("single-avalanche", true)
      .on("mouseover", nodeMouseOver)
      .on("mouseout", nodeMouseOut);

    map.on("drag", onDrag);
    map.on("zoomend", onZoom);

    onZoom();
  }

  logMapState() {
    if (!this.verbose) return;
    let map = this.map;
    let mapState = {
      zoom: map.getZoom(),
      bounds: map.getBounds(),
      center: map.getCenter(),
    };
    console.log(mapState);
  }

  /**
   * Calculates and sets correct x,y coordinates and radius for selection of circles
   * @param {d3.Selection} c
   * @param {L.map} map
   */
  calcCircleAttrs(c, map) {
    // HACK: totally random numbers
    let rn = Math.pow(map.getZoom(), 2);
    let rd = Math.pow(this.init.zoom, 2) / this.init.radius;
    let r = rn / rd;
    c.attr(
      "cx",
      (d) =>
        map.latLngToLayerPoint([
          d.geometry.coordinates[1],
          d.geometry.coordinates[0],
        ]).x
    )
      .attr(
        "cy",
        (d) =>
          map.latLngToLayerPoint([
            d.geometry.coordinates[1],
            d.geometry.coordinates[0],
          ]).y
      )
      .attr("fixed-r", r)
      .attr("r", r);
  }
}

export { MainMap };
