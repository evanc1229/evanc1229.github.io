# Other Team:
- Dominic Malouf
- Chris Stevenson
- Karl Buckley

# Feedback Received:
(indented is our responses)

- q: where will map come from? check out the lecture with UFO data?
  - (topojson or openstreetmap)
  - google maps - elevation

- q: how useful will visualizing summer months be?
  - probably not! we just checked, there are only 81/6355 in the summer

- crit: aspect visualization in P1 a little confusing
  - idea: replace triangles with arrows

- suggestion: interactivity in word cloud
  - click/hover: bring up stats/highlighted samples

- q: scope of the map?
  - clarified: we’ll model the entire state, and allow panning/zooming to specific areas, and cases will agglomerate/break up as you zoom in/out


# Notes on Their Project:

## Background/Motivation
- video games dataset, everyone likes video games


## Objectives
- user can pick and choose which aspects of the sales ppl can see, see how sales are distributed throughout the world


## Dataset/Objectives
- kaggle dataset of video game sales of top sellers per year/geographic region

## dataset columns:
- rank, game, plat, release year, genre, pub company, regional sales, total global sales


## Processing
- not a lot of cleaning, clean kaggle dataset, maybe map onto a topojson


## Visualization
- animated bar charts that show numerical value changes over time
- options to select by publisher, game, etc.
- animate change within a timeframe

## Must Have Features
- one big graph / dashboard
- capacity to select on various columns

## Optional Features
- topojson map

# Feedback Given:
## General Questions:
- Target Audience? business application, market research
- Declutter? remove category buttons from view after they’re clicked on
- Handle More Data? Yes but would need to consider resizing the graphs.
- Story? show how the industry changes over time

## Visual Encoding
- Color? Not mainly discussed but but used to help separate regions
- Embellishments? Replace bars with titles / jpegs of box art

## Interaction and Animation
- Interactions? are meaningful but there could be a lot more interactivity. Could be good to add a search bar.
- Multiple Views? At this point no but might be good to add different tabs showing different representations of the data
