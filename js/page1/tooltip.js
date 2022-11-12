// // snowflake tooltip on mouseover icon in P1

// //var d3 = await import("https://cdn.skypack.dev/d3@7"); 
// //import("d3").catch((e) => {});
const width = 660;
  const height = 600;
  const margin = [50, 60, 50, 100];
  

let svg = d3
    .select("#bubble-chart")
    .append("svg")
    .attr("height", height)
    .attr("width", width);

d3.json("./data/avalanches2.json").then((data) => {
    data.forEach(function(d){d.Width = parseInt(d.Width); d.Vertical = parseInt(d.Vertical);});
    let Place = Array.from(new Set(data.map((d) => d.Place)));
    let xScale = d3
      .scaleBand()
      .domain(Place)
      .range([height - margin[2], margin[0]]);

    let yScale = d3
      .scaleLinear()
      .domain([-50,50])
      .range([margin[3], width - margin[1]]);
      
    
    let color = d3.scaleOrdinal().domain(Place).range(d3.schemeSet2);

    let totalUse = d3.extent(data.map((d) => +d["Vertical"]/20));
    let size = d3.scaleSqrt().domain([3, 40]).range(totalUse);

    svg
      .selectAll(".circ")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "circ")
      .attr("stroke", "black")
      .attr("fill", (d) => color(d.Place))
      .attr("r", (d) => size(d["Vertical"]/20))
      .attr("cx", (d) =>  xScale(d.Place))
      .attr("cy", (d) => yScale(d.Width))
      .on("mouseover", function(e,d){
        tool.transition()
                .duration(200)
                .style("opacity", .9);
        tool.html("Attribute  Value   Plot" + "<br/>" + "Region: " + d.Region + ""+ "<br/>"+  "Place: "+d.Place + ""+ "<br/>"+ "Trigger: "+ d.Trigger + ""+ "<br/>"+ "Width: "+ d.Width + ""+ "<br/>"+ "Vertical: "+ d.Vertical + ""+ "<br/>"+ "Aspect: "+ d.Aspect + ""+ "<br/>"+ "Elevation: "+ d.Elevation + ""+ "<br/>")
            .style("left", d3.select(this).attr("cx") + "px")     
            .style("top", d3.select(this).attr("cy") + "px");
      })
      .on("mouseout", function(d){
        tool.transition()
            .duration(500)
            .style("opacity",0)
      });
      
      
   
    let simulation = d3
      .forceSimulation(data)
      .force(
        "x",
        d3
          .forceY((d) => {
            return xScale(d.Place);
          })
          .strength(1.5)
      )
      .force(
        "y",
        d3
          .forceX(function (d) {
            return yScale(d.Width);
          })
          .strength(0.2)
      )
      .force(
        "collide",
        d3.forceCollide((d) => {
          return size(d["Vertical"]/20);
        })
      )
      .alphaDecay(0)
      .alpha(0.3)
      .on("tick", tick);
      

    function tick() {
      d3.selectAll(".circ")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);
    }

    let init_decay = setTimeout(function () {
      console.log("start alpha decay");
      simulation.alphaDecay(0.1);
    }, 1000);

    let tool = d3.select('#tooltip')
        .attr("height", 600)
        .attr("width", 600)
        .append("polygon")
         .attr("points", "318.5 10, 701.5 10, 1010 318.5, 1010 701.5, 701.5 1010, 318.5 1010, 10 701.5, 10 318.5")
         .style("fill", "lightgrey")
         .style("stroke", "black")
         .style("strokeWidth", "10px")
         .style("opacity", 0)
         .style("position", "absolute");

  
});

// let tool = d3.select('#tooltip')
//     .append("svg")
//     .attr("height", 1200)
//     .attr("width", 1200);

// tool.append("polygon")
//     .attr("points", "318.5 10, 701.5 10, 1010 318.5, 1010 701.5, 701.5 1010, 318.5 1010, 10 701.5, 10 318.5")
//     .style("fill", "lightgrey")
//     .style("stroke", "black")
//     .style("strokeWidth", "10px")
    

// let rectangle = tool.append("polygon")
//     .attr("points", "320 20, 700 20, 700 1000, 320 1000")
//     .style("fill", "green")
//     .style("stroke", "black")
//     .style("strokeWidth", "10px");


d3.csv("./data/avalanches2.csv").then((data)=>{
  
        let columns = ['Region', 'Place', 'Trigger', 'Depth', 'Width', 'Vertical', 'Aspect', 'Elevation'];
        let table = d3.select('#table');
    
        let thead = table.append('thead');
        let tbody = table.append('tbody');
    
        thead.append('tr')
            .selectAll('th')
            .data(["Region", "Place", "Trigger","Depth", "Width", "Vertical", "Aspect", "Elevation"])
            .enter()
            .append('th')
            .style('border', '1px solid black')
            .text(function(column){
                return column;
            });
        let rows =  tbody.selectAll('tr')
            .data(data)
            .enter()
            .append('tr')
            .style('border', '1px solid black')
            ;
        
        let cells = rows.selectAll('td')
            .data(function(row){
                return columns.map(function(column){
                    return{
                        column: column,
                        value: row[column]
                    };
                });
            })
            .enter()
            .append('td')
            .style('border', '1px solid black')
            .text(function(d){
                return d.value;
            });
    });

    let svg2 =d3
      .select("#boxplot")
      .append("svg")
      .attr("height", 600)
      .attr("width", 600);

    let center =100;
    let width2 = 100;
    d3.json("./data/avalanches.json").then((data)=>{
      data.forEach(function(d){d.Width = parseInt(d.Width)});
      let widthData = data.map(function(d){return d.Width});
      

      let sortedWidth = widthData.sort(d3.ascending)
      let q1 = d3.quantile(sortedWidth, .25)/5
      let median = d3.quantile(sortedWidth, .5)/5
      let q3 = d3.quantile(sortedWidth, .75)/5
      console.log(q3)
      let interQuantileRange = q3 - q1
      let min = q1 -1.5 * interQuantileRange
      let max = q1 + 1.5 * interQuantileRange

      let y = d3.scaleLinear()
        .domain([0,100])
        .range([400, 0]);
      

      // Show the main vertical line
      svg2
      .append("line")
      .attr("x1", center)
      .attr("x2", center)
      .attr("y1", y(min) )
      .attr("y2", y(max) )
      .attr("stroke", "black")
      console.log(y(q3))
// Show the box
      svg2
      .append("rect")
      .attr("x", center - width2/2)
      .attr("y", y(q3) )
      .attr("height", (y(q1)-y(q3)) )
      .attr("width", width2 )
      .attr("stroke", "black")
      .style("fill", "#69b3a2")

// show median, min and max horizontal lines
      svg2
      .selectAll("toto")
      .data([min, median, max])
      .enter()
      .append("line")
      .attr("x1", center-width2/2)
      .attr("x2", center+width2/2)
      .attr("y1", function(d){ return(y(d))} )
      .attr("y2", function(d){ return(y(d))} )
      .attr("stroke", "black")
    });