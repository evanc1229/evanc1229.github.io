// use for loading data, and initializing each page

// import d3
var d3 = await import("https://cdn.skypack.dev/d3@7"); 
import("d3").catch((e) => {});


// basic template for importing from other local files
var p1 = await import("./page1/page1.js");

// import timeselect
var timeselect = await import("./shared/timeselect.js");


// Load the data and begin global application state
const globalApplicationState = {
    avalancheData: null,
    timeSelect: null
};

// Load the data
d3.csv("./data/avalanches.csv").then((data) => {
    globalApplicationState.avalancheData = data;
    globalApplicationState.timeSelect = new timeselect.default(globalApplicationState);
});


// TODO: Initialize each of pages 1, 2, and 3 with dataset


