# Utah Avalanches Project Proposal
## Basic info
|Names | Emails | uids|
-------|--------|-----|
|Evan Colt | evanc1229@gmail.com| u1046766|
|Christopher Freitas | christopherdef@gmail.com| u1076216|
|Tanner Benedict | u0993730@utah.edu| u0993730|

## Project Title: 
Utah Avalanches

## Github Repo: 
https://github.com/evanc1229/utah_avalanches



## Background and Motivation
In the United States, there are on average 27 avalanche related deaths per year and countless more avalanche related injuries. This death count is 
concentrated in about 8 states, Utah being in the top 4 of those states for the highest death count. While this number may seem small, so is the winter 
backcountry recreation community. As this community grows, so does the number of backcountry travel-related deaths. Because this is a growing issue, it is 
increasingly important to analyze our existing avalanche data to give people the ability to make more informed, and thus life-saving decisions, when 
traveling in the backcountry. Our group was interested in this for the above-stated reasons and because member(s) of our group are frequently in 
backcountry avalanche terrain and would like a better tool for visually understanding this dataset that is widely used by the backcountry community.


## Project Objectives
The primary goal for our visualization is to make the complex risk analysis done by avalanche analysts more accessible and readable for everyday backcountry travelers. Tabular avalanche data alone is great, but the ability to assess risk at a glance is critical for ensuring the safety of outdoor enthusiasts everywhere.

Our next goal is to take and improve upon the visualizations already developed by the Utah Avalanche Center. As a non-profit, there’s only so much money they can sink into making their website and interfaces slick and modern (outreach and research already take so much money to maintain). Consequently, the visualizations on the site are lacking in a few key areas we’d like to address: only a small set of features collected are able to be visualized and interactivity is limited.

Finally, we want to enable travelers to better understand the risks in their region over time. It’s expected that a project like this may be used to forecast risk before upcoming trips. But building a longer-term set of expectations in a region is also extremely helpful. Visualizations that aggregate data over time could reveal important regional trends that will help travelers make more informed decisions.

## Data
This dataset is available for download from the Utah Avalanche Center website [https://utahavalanchecenter.org/avalanches] and is composed of crowdsourced and official reports regarding avalanches that have occurred in Utah. These reports are generated in one of three ways: 

1) A SAR mission was required because of an avalanche that killed or seriously injured a person in the backcountry.  
2) An employee or forecaster from Utah Avalanche Center witnessed an avalanche in the backcountry and filed an avalanche report.
3) A good samaritan witnessed or was affected by an avalanche in the Utah backcountry, collected data on the avalanche, and submitted a report to the Utah Avalanche Center. This report is then reviewed and edited by forecasters from UAC to ensure its authenticity and objectivity.

These reports are then compiled into a master data sheet showing every recorded avalanche in Utah on a given day. The data set contains information on the physical features of the avalanche, where and when it was, and why it might have occurred. This data is used by forecasters from the Utah Avalanche Center to create a daily avalanche report and is actively read by enthusiasts looking to collect more information when making their plan to head into the backcountry. 

## Data Processing
### Data Features
The visualizations provided by the Utah Avalanche Center only leverage a small subset of physical descriptors of avalanche events (i.e. Date, Depth, Region), but the data collected is much richer. Asterisks (*) next to names indicate a column is a free-text entry. Many of which we do not intend to use, but here are ones we’ve decided to make visualizations for:

### Data Cleaning
For generating our text based visualizations, we’ll be using the columns “Accident and Rescue Summary”, “Terrain Summary”, and “Comments”. As free text entries, they will need to be cleaned first if we want to extract meaningful information from them. We’ll follow a typical NLP pipeline by case folding, stemming, and removing stopwords and punctuation. After that, we’ll be able to effectively identify patterns in language usage, and write simpler regex patterns for finding certain information.


### Data Processing Pipeline
With the static dataset we’re using, and our team’s experience with Python, we plan to perform most of our data cleaning and transformation in Python before serving it to D3. However, given the amount of interactivity and flexibility we plan to include in our project, a lot of data processing will still need to be done on the fly in D3.


## Visualization Design
The following is a list of our individual visualizations, and thought processes linking them together. To start, we’ll go through individual components we thought up and our reasonings for each. At the end, the Final Layout section will show what our final vision for this project looks like.

\[Included In Google Doc\]

## Must-Have Features
1) Create an interactive map that shows the location of avalanches in various avalanche regions of Utah
2) Create clickable icons for each avalanche that display information about what occurred
3) Use the available data from each avalanche to create a 'profile' of visualizations based on the information available and the avalanche type.


## Optional Features
- Visualization using forecast data from the day of an avalanche to provide context to the cause of the avalanche

- Zoom in on individual case will have a snowflake geometry generated in real-time by a fractal generator


## Project Schedule
- Week 1
  - Create Project Proposal
  - Create Sketch of Visualization
- Week 2
    - Preprocess data
    - Get timeline working
    - Create tabular data view for each individual avalanche
- Week 3
    - Begin to plot data on map and implement dynamic icons
    - First Project Milestone (1 View Working)
- Week 4
    - Combine tabular data view with map and work on smooth transitions
    - Instructor Feedback Session
- Week 5
    - Polish At a Glance and work on historical view
    - Create individual charts for historical view (2-3 per group member)
- Week 6
    - Polish Historical view and begin text insights view
    - Polish text insights view and finish
- Week 7
    - Polish mistakes and test everything working in tandem
    - Create site for the views and add everything
    - Film demo video and finish process book