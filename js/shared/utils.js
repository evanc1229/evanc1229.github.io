// Shared utility functions

/**
 *
 * @returns {Array<AvalancheDataRaw>}
 */
export async function loadData() {
  console.log("Loading Data");
  const avalanches = await d3.csv("data/avalanches.csv");
  // const map = await d3.json("data/map.geojson");
  return avalanches;
}

/**
 *
 * @param {d3.Selection} selection
 * @returns {DOMRect}
 */
export function getDimensions(selection) {
  return selection.node().getBoundingClientRect();
}

/**
 *
 * @param {Array<AvalancheDataRaw>} data_raw
 * @returns {Array<AvalancheData>}
 */
export function preprocessData(data_raw) {
  // TODO: preprocess dataset to standard form
  let data = data_raw.map((d) => {
    return {
      date: null,
      region: null,
      place: null,
      trigger: null,
      trigger_info: null,
      layer: null,
      depth: null,
      width: null,
      vertical: null,
      aspect: null,
      elevation: null,
      coordinates: null,
      victim_status: null,
      summary_accident: null,
      summary_terrain: null,
      summary_weather: null,
      comments: null,
    };
  });
  return data;
}

/**
 * Preprocessed Data
 * @typedef {Object} AvalancheData
 * @property {Date} date
 * @property {string} region
 * @property {string} place
 * @property {string} trigger
 * @property {string} trigger_info
 * @property {string} layer
 * @property {number} depth
 * @property {number} width
 * @property {number} vertical
 * @property {[('N'|'E'|'S'|'W'),('N'|'E'|'S'|'W')]} aspect
 * @property {number} elevation
 * @property {[number, number]} coordinates
 * @property {('caught'|'carried'|'injured'|'killed'|'buried_part'|'buried_full')} victim_status
 * @property {string} summary_accident
 * @property {string} summary_terrain
 * @property {string} summary_weather
 * @property {Array<string>} comments
 */

/**
 * Raw Data
 * @typedef {Object} AvalancheDataRaw
 * @property {string} Date
 * @property {string} Region
 * @property {string} Place
 * @property {string} Trigger
 * @property {string} `Trigger: additional info`
 * @property {string} `Weak Layer`
 * @property {string} Depth
 * @property {string} Width
 * @property {string} Vertical
 * @property {string} Aspect
 * @property {string} Elevation
 * @property {string} Coordinates
 * @property {string} Caught
 * @property {string} Carried
 * @property {string} `Buried - Partly`
 * @property {string} `Buried - Fully`
 * @property {string} Injured
 * @property {string} Killed
 * @property {string} `Accident and Rescue Summary`
 * @property {string} `Terrain Summary`
 * @property {string} `Weather Conditions and History`
 * @property {string} `Comments 1`
 * @property {string} `Comments 2`
 * @property {string} `Comments 3`
 * @property {string} `Comments 4`
 */
