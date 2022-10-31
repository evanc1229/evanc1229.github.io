// use for loading data, and initializing each page

// import d3
var d3 = await import("https://cdn.skypack.dev/d3@7"); 
import("d3").catch((e) => {});
console.log(d3.version);


// basic template for importing from other local files
var p1 = await import("./page1/page1.js");
console.log(p1.default);


// TODO: Load dataset


// TODO: Initialize each of pages 1, 2, and 3 with dataset


