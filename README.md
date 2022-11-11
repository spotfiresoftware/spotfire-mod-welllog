# Area Chart 
This is a complex mod example demonstrating an area chart rendered with `d3` and bundled with `Webpack`.

All source code for the mod example can be found in the `src` folder. Other necessary files reside in the `static` folder. Read below for further explanation.

## Prerequisites
These instructions assume that you have [Node.js](https://nodejs.org/en/) (which includes npm) installed.

## How to get started (with development server)
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
  

  taken from https://github.com/aberridg/well-log-v2/tree/8ea794a0ac7bc4d972d74e5b289c47d6caf4634c
  "Extracted various colouring functions to color-helpers.js"  aberridg committed on May 21, 2021

  #TODO
- Discrete points rather than lines for pressure
- Remove Null values for each curve automatically
- Naming of log curve and selection
- Set Min Max and Color of the curve – Linear or Log scale
- Ability to change which log curves are in which track - on / off (how many curves in each
- Zoom in to depth section and then reverse out again using right mouse