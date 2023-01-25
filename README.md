# Well Log Mod for TIBCO Spotfire®
The well log visualization is a detailed two-dimensional record of tracks that can be used in petroleum exploration and production applications to show various physical, chemical, electrical, or other properties of the rock/fluid mixtures versus depth penetrated during drilling. Well-log visualization is important in E&P operations in the areas of analyzing electron density, resistivity, photoelectric effect, neutron absorption rate and other related properties, which in turn are useful in the determination of reservoir volume, hydrocarbon in place, reserves estimation and formation lithology

## Background
The original Well Log Mod was developed by [Justin Gosses](https://www.linkedin.com/in/justingosses/) called [Wellio-viz.js](https://github.com/JustinGOSSES/wellioviz) available on his [github repository](https://github.com/JustinGOSSES/wellioviz) 

This is a complex mod that uses `d3` and bundled with `Webpack`.

All source code for the mod example can be found in the `src` folder. Other necessary files reside in the `static` folder. Read below for further explanation.

## Prerequisites
These instructions assume that you have [Node.js](https://nodejs.org/en/) (which includes npm) installed.

## Data Requirements
This Mod works with pivoted data requiring at least 3 columns: Depth, Category and Value for the unpivoted categories.  Here is an example of a small data set:

|DEPTH|Category|Value|
|-|-|-|
|200|GR|113.9|
|200|CAL|176.867|
|200|PHIN|0.447|
|200|PHID|0.218|
|200|RESD|5.927|
|200.25|GR|112.033|
|200.25|CAL|175.83|
|200.25|PHIN|0.482|
|200.25|PHID|0.22|

# How to get started (with development server)
- Open a terminal at the location of this example.
- Run `npm install`. This will install necessary tools. Run this command only the first time you are building the mod and skip this step for any subsequent builds.
- Run `npm start`. This will bundle the JavaScript and place it in the `dist` folder. This task will watch for changes in the code and will continue running until it is stopped. Whenever you save a file, the changes will be reflected in the visualization mod.
- Run `npm run server` in a separate terminal. This will start a development server.
- Start editing, for example `src/index.js`.
- In Spotfire, follow the steps of creating a new mod and connecting to the development server.

## Working without a development server
- Open a terminal at the location of this example.
- Run `npm install`. This will install necessary tools. Run this command only the first time you are building the mod and skip this step for any subsequent builds.
- Run `npm run build`. This will bundle the JavaScript and place it in the `dist` folder. It also copies the contents of `static` into `dist`. This task will not watch for changes in the code.
- In Spotfire, follow the steps of creating a new mod and then browse for, and point to, the _manifest_ in the `dist` folder.
  
