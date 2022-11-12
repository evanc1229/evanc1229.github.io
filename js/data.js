// use for loading data, and initializing each page

// Load dataset
async function loadData() {
  console.log("Loading Data");
  const avalanches = await d3.csv("data/avalanches.csv");
  // const map = await d3.json("data/map.geojson");

  return {
    avalanches:avalanches,
    // map:map,
  };
}

export {loadData}