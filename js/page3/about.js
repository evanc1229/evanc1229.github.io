import * as utils from "../shared/utils.js";
import { Page, Component } from "../shared/prototype.js";

var leaflet = await import("https://cdn.skypack.dev/leaflet");
import("leaflet").catch((e) => { });

if (L === undefined) L = leaflet;

class About extends Component {
    constructor(page, data, verbose = false) {
        super(page, data, verbose);
      }
      async render(div) {
        super.render(div)
        this.renderAbout();
      }
    renderAbout() {
        let svg = this.div
                .append("svg")
                .attr("width", this.page.config.about.width)
                .attr("height", this.page.config.about.height);
            
        svg.append("text")
                .attr("x", 50)
                .attr("y", 50)
                .text("About this project")
                .attr("font-size", "30px")
                .attr("font-weight", "bold")
                .attr("fill", "black");
        
        svg.append("text")
                .attr("x", 50)
                .attr("y", 100)
                .text("This project was created by Evan Holt, Christopher de freitas, and Tanner Benedict.")
                .attr("font-size", "20px")
                .attr("fill", "black");
        svg.append("text")
                .attr("x", 50)
                .attr("y", 130)
                .text("The purpose of this project is to make avalanche data more readable for everyday backcountry travelers.")
                .attr("font-size", "20px")
                .attr("fill", "black");
        svg.append("text")
                .attr("x", 50)
                .attr("y", 160)
                .text("The data is from the Utah Avalanche Center and has been modified to show the most important information")
                .attr("font-size", "20px")
                .attr("fill", "black");

        svg.append("text")
                .attr("x", 50)
                .attr("y", 210)
                .text("How to use this project")
                .attr("font-size", "30px")
                .attr("font-weight", "bold")
                .attr("fill", "black");
        
        svg.append("text")
                .attr("x", 50)
                .attr("y", 260)
                .text("Page 1:")
                .attr("font-size", "25px")
                .attr("font-weight", "bold")
                .attr("fill", "black");

        svg.append("text")
                .attr("x", 50)
                .attr("y", 310)
                .text("This page shows the location of each avalanche in a user selected timeframe. ")
                .attr("font-size", "20px")
                .attr("fill", "black");

        svg.append("text")
                .attr("x", 50)
                .attr("y", 340)
                .text("The user can select a timeframe by using the brush at the top of the page.")
                .attr("font-size", "20px")
                .attr("fill", "black");

        svg.append("text")
                .attr("x", 50)
                .attr("y", 370)
                .text("The user can hover over each avalanche to see more information about it.")
                .attr("font-size", "20px")
                .attr("fill", "black");

        svg.append("text")
                .attr("x", 50)
                .attr("y", 420)
                .text("Page 2:")
                .attr("font-size", "25px")
                .attr("font-weight", "bold")
                .attr("fill", "black");

        svg.append("text")
                .attr("x", 50)
                .attr("y", 470)
                .text("This page shows historical data of the avalanches that have occured in Utah since 2010.")
                .attr("font-size", "20px")
                .attr("fill", "black");

        svg.append("text")
                .attr("x", 50)
                .attr("y", 500)
                .text("The first barchart shows the user the average depth of each avalanch on each day of the year.")
                .attr("font-size", "20px")
                .attr("fill", "black");

        svg.append("text")
                .attr("x", 50)
                .attr("y", 530)
                .text("The user can zoom in on the barchart to see more specific date ranges.")
                .attr("font-size", "20px")
                .attr("fill", "black");

        svg.append("text")
                .attr("x", 50)
                .attr("y", 560)
                .text("The second barchart shows the user the average elevation of each avalanch on each day of the year.")
                .attr("font-size", "20px")
                .attr("fill", "black");

        svg.append("text")
                .attr("x", 50)
                .attr("y", 590)
                .text("Again, the user can zoom in on the barchart to see more specific date ranges.")
                .attr("font-size", "20px")
                .attr("fill", "black");

        svg.append("text")
                .attr("x", 50)
                .attr("y", 620)
                .text("The third chart is a roseplot that shows the total avalanches in each direction")
                .attr("font-size", "20px")
                .attr("fill", "black");

        svg.append("text")
                .attr("x", 50)
                .attr("y", 650)
                .text("The user can hover over each point to see the total for that direction.")
                .attr("font-size", "20px")
                .attr("fill", "black");

        svg.append("text")
                .attr("x", 50)
                .attr("y", 700)
                .text("Page 3:")
                .attr("font-size", "25px")
                .attr("font-weight", "bold")
                .attr("fill", "black");

        svg.append("text")
                .attr("x", 50)
                .attr("y", 750)
                .text("This page is the about the project section where the user can find out more.")
                .attr("font-size", "20px")
                .attr("fill", "black");


        }
} 
export { About };