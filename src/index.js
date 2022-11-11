/*
 * Copyright © 2020. TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */

//@ts-check

// Manually import the array polyfills because the API is using functions not supported in IE11.
import "core-js/es/array";
import { render } from "./render.js";

const Spotfire = window.Spotfire;
const DEBUG = !true;

Spotfire.initialize(async (mod) => {
    /**
     * Read metadata and write mod version to DOM
     */
    const modMetaData = mod.metadata;
    DEBUG && console.log("Mod version:", modMetaData.version ? "v" + modMetaData.version : "unknown version");

    /**
     * Initialize render context - should show 'busy' cursor.
     * A necessary step for printing (another step is calling render complete)
     */
    const context = mod.getRenderContext();

    /**
    * Wrap a reader and adds an additional method called `hasChanged`.
    * It allows you to check whether a passed argument is new or unchanged since the last time the subscribe loop was called.
    * @function
    * @template A
    * @param {A} reader
    * @returns {A & {hasValueChanged(value: any):boolean}}
    */
    function readerWithChangeChecker(reader) {
        let previousValues = [];
        let currentValues = [];

        function storeValuesForComparison(cb) {
            return function storeValuesForComparison(...values) {
                previousValues = currentValues;
                currentValues = values;
                return cb(...values);
            };
        }

        return {
            ...reader,
            subscribe(cb) {
                reader.subscribe(storeValuesForComparison(cb));
            },
            hasValueChanged(value) {
                return previousValues.indexOf(value) == -1;
            }
        };
    }


    /**
     * Create reader function which is actually a one time listener for the provided values.
     * @type {Spotfire.Reader}
     */
    // Pass an already created reader as the argument to the wrapper function.
    let reader = readerWithChangeChecker(
        mod.createReader(
            mod.visualization.data(),
            mod.windowSize(),
            mod.property("verticalZoomHeightMultiplier"),
        )
    );


    /**
     * Create a persistent state used by the rendering code
     */
    const state = {};

    /**
     * Initiates the read-render loop
     */
    reader.subscribe(onChange);

    /**
     * The function that is part of the main read-render loop.
     * It checks for valid data and will print errors in case of bad data or bad renders.
     * It calls the listener (reader) created earlier and adds itself as a callback to complete the loop.
     * @param {Spotfire.DataView} dataView
     * @param {Spotfire.Size} windowSize
     * @param {Spotfire.AnalysisProperty<string>} chartType
     * @param {Spotfire.AnalysisProperty<boolean>} roundedCurves
     * @param {Spotfire.AnalysisProperty<boolean>} gapfill
     */
    async function onChange(dataView, windowSize, verticalZoomHeightMultiplier) {

        if(reader.hasValueChanged(verticalZoomHeightMultiplier)) {
            DEBUG && console.log("zoom changed")    
        }

        try {
            await render(state,mod,dataView,windowSize,verticalZoomHeightMultiplier);
            
            context.signalRenderComplete();

            // Everything went well this time. Clear any error.
            mod.controls.errorOverlay.hide("catch");
        } catch (e) {
            mod.controls.errorOverlay.show(
                e.message || e || "☹️ Something went wrong, check developer console",
                "catch"
            );
            if (DEBUG) {
                throw e;
            }
        }
    }
});
