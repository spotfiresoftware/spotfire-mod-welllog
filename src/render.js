/*
 * Copyright © 2020. TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */

//@ts-check
import * as d3 from "d3";
import { sliderRight } from "d3-simple-slider";
const $ = require("jquery");
import "ddslick/src/jquery.ddslick";


//JLL: What is these for?
import { invalidateTooltip } from "./extended-api.js";
import { nodeFormattedPathAsArray } from "./extended-api.js";
import { addHandlersSelection } from "./ui-input.js";

import * as uiConfig from "./ui-config.js"; 
import * as renderPlot from "./renderPlot.js"; 
import * as colorHelpers from "./color-helpers.js";
import * as test_templates from "./test-templates.js";

/**
 * @typedef {{
 *          colorIndex: number;
 *          markedColor: string;
 *          unmarkedColor: string;
 *          markedSegments: number[][]
 *          name: string;
 *          sum: number;
 *          }} RenderGroup;
 */

/**
 * Prepare some dom elements that will persist  throughout mod lifecycle
 */
const modContainer = d3.select("#mod-container");

// @todo - remove as many global vars as we can!

var _dataView;

var _isInitialized = false; // this can be used to detect if we need to add divs, etc. On re-rendering after marking. If already initialized, no need to add new divs

var _verticalZoomHeightMultiplier = 5.0;
var _verticalZoomHeightProperty;



const ISRESET = false; //JLL: to reset to default templates, set it to true and recomplie. Then change curve properties from GUI such as line color to save and set it back to false

//var pPerfilHeightMultiplier;


var _mod; // The global mod instance

/**
 * Main function / entry point that Renders the chart.
 * @param {Object} state
 * @param {Spotfire.Mod} mod
 * @param {Spotfire.DataView} dataView - dataView
 * @param {Spotfire.Size} windowSize - windowSize
 * @param {Spotfire.ModProperty<string>} example - an example property
 */
export async function render(state, mod, dataView, windowSize, verticalZoomHeightProperty) {
    //  console.log("render", [arguments])

    //init some (global) vars
    _dataView = dataView;
    _mod = mod;
    _verticalZoomHeightProperty = verticalZoomHeightProperty;
    ///console.log(verticalZoomHeightProperty);
    _verticalZoomHeightMultiplier = _verticalZoomHeightProperty.value();
    modContainer.attr("style", "height:" + (windowSize.height - 30) + "px; overflow-y:hidden");
    ///console.log("Render called with mod", mod);
    if (state.preventRender) {
        // Early return if the state currently disallows rendering.
        return;
    }


    const styling = mod.getRenderContext().styling;

    //The DataView can contain errors which will cause rowCount method to throw.
    let errors = await dataView.getErrors();
    if (errors.length > 0) {
        svg.selectAll("*").remove();
        mod.controls.errorOverlay.show(errors, "dataView");
        return;
    }

    mod.controls.errorOverlay.hide("dataView");


    //get data
    var allDataViewRows = await dataView.allRows();
    allDataViewRows.sort((a, b) => a.continuous("DEPTH").value() - b.continuous("DEPTH").value());
    if (allDataViewRows == null) return;


    const margin = { top: 20, right: 40, bottom: 40, left: 80 };
    modContainer.style("height", windowSize.height - margin.bottom - margin.top); //

    /**
     * Maximum number of Y scale ticks is an approximate number
     * To get the said number we divide total available height by font size with some arbitrary padding
     */
    const yScaleTickNumber = windowSize.height / (styling.scales.font.fontSize * 2 + 6);

    /** We might need the SVG/viewbox to clear marking but the chart wasn't designed for it, so remove it for now */

    // Now render here!

    function buildDefaultTemplate(trackNo, curveName, trackWidth, height) {
        ///console.log({"buildDefaultTemplate":[trackNo, curveName, trackWidth, height]})
        let default_template = [
            {
                components: [
                    {
                        curves: [
                            {
                                curveColors: ["#333333"],
                                curveNames: [curveName],
                                curveStrokeDashArray: ["2.2"],
                                curveUnits: [""],
                                dataType: "curve",
                                depthCurveName: "DEPTH",
                                depthUnit: "m",
                                fill: [
                                    {
                                        curve2: "",
                                        curveName: curveName,
                                        cutoffs: [-99999999, "", ""],
                                        fill: "no",
                                        fillColors: [],
                                        fillDirection: "none",
                                        colorInterpolator: [],
                                        maxScaleX: "",
                                        minScaleX: ""
                                    }
                                ],
                                scaleTypeLinearLog: ["linear"],
                                strokeLinecap: ["butt"],
                                strokeWidth: ["2"],
                                wellNames: ["1"] // AJB todo - find a better way instead of hardcoding this! Trellis implementation should solve it
                            }
                        ]
                    }
                ],
                trackBox: {
                    width: trackWidth,
                    height: height,
                    div_id: "well_holder_track_" + trackNo,
                    margin: { top: 5, right: 10, bottom: 5, left: 60 }
                }
            }
        ];

        return default_template;
    }

    async function buildTemplates(isReset = false) {
        /* let wellLeaves = */(await (await _dataView.hierarchy("WELL")).root()).leaves();
        // selectedWell = wellLeaves[0].key;

        let categoryLeaves = (await (await _dataView.hierarchy("Category")).root()).leaves();

        let trackWidth = (windowSize.width - renderPlot.ZOOMPANELWIDTH - renderPlot.DEPTHLABELPANELWIDTH - 20) / categoryLeaves.length;

        let templates = [];
        let categoryIndex = 0;

        for (const leaf of categoryLeaves) {
            ///console.log(leaf.key);
            let template = (await _mod.property("template" + categoryIndex)).value();

            if (template != "empty" && !isReset) {
                let parsedTemplate = JSON.parse(template);
                // Explicitly set the width and height as it is likely to have changed since the template property was set
                parsedTemplate[0].trackBox.width = trackWidth;
                parsedTemplate[0].trackBox.height = window.innerHeight;
                ///console.log(parsedTemplate);
                templates.push(parsedTemplate);
            } else {
                templates.push(buildDefaultTemplate(categoryIndex, leaf.key, trackWidth, window.innerHeight));
            }
            categoryIndex++;
        }

        return templates;
    }

    /**
     *
     * Drawing code!
     *
     */ 

    //read templates from mod property
    let plot_templates = await buildTemplates(ISRESET); //JLL: use true to reset, change some properties to save changes from gui and put it back to false

    //creates a draggable configuration dialog with options for each track with nothing inside but the placeholders for accordion
    !_isInitialized && uiConfig.configDialog(plot_templates, allDataViewRows, _dataView, _mod, _verticalZoomHeightMultiplier, _verticalZoomHeightProperty);
    
    //creates each plot per template

    // JLL: DEBUGGING templates
    // AJB: - to use these, use 0 or 4 instead of "test0" or "test4", like:
    // plot_templates[0] or plot_templates[4] 
    // - to disable, use plot_templates["test0"] or plot_templates["test4"]
    // - string template indexes are invalid and are therefore ignored by the rendering code

    //plot_templates=test_templates.test_templates        //use this line to reset. test_template[5] is for facies not yet implemented, so just pop it
    // plot_templates.pop()                               //remove last track
    // plot_templates[0]=test_templates.test_templates[2] //override track
    // plot_templates.push(plot_templates[2])             //duplicate

    //renders plot
    await renderPlot.multipleLogPlot(plot_templates, allDataViewRows, _mod, _isInitialized, _verticalZoomHeightMultiplier, _verticalZoomHeightProperty, _dataView);

    // this can be used to detect if we need to add divs, etc.
    // on re-rendering after marking. If already initialized, no need
    // to add new divs
    _isInitialized = true; 

}
 




/**
 * Aha! This is called when we change something in the templates - and we call multipleLogplots() to re-draw the charts
 * Todo: persist the templates in Spotfire properties ;-)
 * @param {} templateIdx "track number"
 * @param {*} curveIdx "curve number"
 * @param {*} templates "template structure holding all tracks. See test-template.js"
 * @param {*} allDataViewRows "Spotfire data rows view"
 * @param {*} optionSettings  "JSON options when changing a propName"
 * @param {String} option "Property to change or action to take. Options are:Thickness,LineStyle,LineColor,AreaFill,AreaColor,ScaleType,curveName,duplicateCurve*, removeCurve*, duplicateTrack*,removeTrack*"
 */
export function propertyOnChange(templateIdx, curveIdx, templates, allDataViewRows, optionSettings, option) {
    if (templates[templateIdx] && _isInitialized) {
        var template = templates[templateIdx];
        let template_components = template[0]["components"];
        let templateCurves = template_components[0]["curves"];
        let curveNames = templateCurves[0]["curveNames"];

        //change thickness
        if (option == "Thickness") {
            templateCurves[0]["strokeWidth"][curveIdx] = optionSettings.value;
        }

        //change LineStyle
        else if (option == "LineStyle") {
            templateCurves[0]["curveStrokeDashArray"][curveIdx] = optionSettings.value;
        }

        //change LineColor
        else if (option == "LineColor") {
            templateCurves[0]["curveColors"][curveIdx] = optionSettings.value;
        }

        //change AreaFill
        else if (option == "AreaFill") {
            if (optionSettings.value == "none") {
                templateCurves[0]["fill"][curveIdx]["fill"] = "no";
            } else {
                templateCurves[0]["fill"][curveIdx]["fill"] = "yes";
                templateCurves[0]["fill"][curveIdx]["fillDirection"] = optionSettings.value;
            }
        }

        //change AreaColor
        else if (option == "AreaColor") {
            templateCurves[0]["fill"][curveIdx]["fillColors"] = [
                colorHelpers.getFillColor(optionSettings.value, "normal"),
                colorHelpers.getFillColor(optionSettings.value, "dark"),
                colorHelpers.getFillColor(optionSettings.value, "light")
            ];
            templateCurves[0]["fill"][curveIdx]["colorInterpolator"] = [optionSettings.value, null, null];
        }

        //change ScaleType
        else if (option == "ScaleType") {
            templateCurves[0]["scaleTypeLinearLog"][curveIdx] = optionSettings.value;
        }

        //change curveName
        else if (option == "curveName") {
            var curveName = optionSettings.value;
            curveNames[curveIdx] = curveName;

            // var curveNamesCopy=[...curveNames]
            var j = curveIdx > 0 ? curveIdx - 1 : 0;
            templateCurves[0]["fill"][j].curveName = [...curveNames][j];
            templateCurves[0]["fill"][j].curve2 = [...curveNames][curveIdx];
            templateCurves[0]["fill"][curveIdx].curveName = [...curveNames][j];
            templateCurves[0]["fill"][curveIdx].curve2 = [...curveNames][curveIdx];

            //var fillCurveNames = [...curveNames]
            //fillCurveNames.push(fillCurveNames.shift(0)) //[a,b,c,d] --> [b,c,d,a]
        }

        //copy first curve
        else if (option == "duplicateCurve") {
            //duplicates first curve properties (arrays such as colors, style, curvName, etc)
            let templateCurvesCopy = JSON.parse(JSON.stringify(templateCurves));
            for (curveIdx in templateCurves[0]) {
                if (Array.isArray(templateCurves[0][curveIdx])) templateCurves[0][curveIdx].push(templateCurvesCopy[0][curveIdx][0]);
            }
            //for (p in templateCurves[0]["fill"]) {if (Array.isArray(templateCurves[0]["fill"][p])) templateCurves[0]["fill"][p].push(templateCurves[0]["fill"][p][0])}

            //add a tab
            let copiedCurveIndex = curveNames.length - 1;
            let tid = `tab_${templateIdx}_${copiedCurveIndex}`;
            let ul = d3.select(`#tabs_${templateIdx} ul`);
            ul.insert("li", `:nth-child(${copiedCurveIndex + 1})`)
                .append("a")
                .attr("href", `#${tid}`)
                .append("span")
                .text(curveNames[0]); 

            //add tab panels (placeholder)
            //d3.select(`#tabs_${i}`).append("div").attr("id",tid).append("P").html(tid);

            //populate tab
            let tabs = d3.select("#" + "tabs_" + templateIdx);
            uiConfig.addAccordionTabContents(templateIdx, copiedCurveIndex, curveNames, tabs, templates, allDataViewRows, ["#333333"], _dataView);

            //refresh tabs
            $("#" + "tabs_" + templateIdx).tabs().tabs("refresh");
            $("#" + "tabs_" + templateIdx).tabs("option", "active", copiedCurveIndex); //makes the new tab active

            //update tab and accordion name
            let anAccordionHeader = document.querySelector("#"+uiConfig.accordionId+" h3[aria-expanded='true'] span").nextSibling;
            let aTab = document.querySelector(`a[href='#tab_${templateIdx}_${copiedCurveIndex - 1}']`);
            $(aTab).text(curveNames[copiedCurveIndex - 1]);
            anAccordionHeader.textContent = `Track ${templateIdx + 1}: ` + curveNames.join();
        }

        //delete last curve
        else if (option == "removeCurve") {
            let copiedCurveIndex = curveNames.length - 1;
            if (copiedCurveIndex) {
                //don't remove last curve
                //remove curve: item from all templateCuves arrays (colors, style, curvName, etc)
                for (let i in templateCurves[0]) {
                    if (Array.isArray(templateCurves[0][i])) templateCurves[0][i].pop();
                }

                let ttr = `#tab_${templateIdx}_${copiedCurveIndex}`;

                //remove last tab
                // document.querySelector(`a[href='${ttr}']`).parentElement.remove()  //another (non jquery) way to remove tab
                $(`a[href='${ttr}']`).closest("li").remove();

                //remove last tab contents
                $(ttr).remove();

                //refresh tabs
                $("#" + "tabs_" + templateIdx)
                    .tabs()
                    .tabs("refresh");

                //update tab and accordion name
                let anAccordionHeader = document.querySelector(
                    "#"+uiConfig.accordionId+" h3[aria-expanded='true'] span"
                ).nextSibling;
                let aTab = document.querySelector(`a[href='#tab_${templateIdx}_${copiedCurveIndex - 1}']`);
                aTab.innerText = curveNames[copiedCurveIndex - 1];
                anAccordionHeader.textContent = `Track ${templateIdx + 1}: ` + curveNames.join();
            }
        }

        //duplicate entire track
        else if(option=="duplicateTrack"){

            if(templates.length>8) return; //prevent from adding too many tracks
            templates.push(JSON.parse(JSON.stringify(templates[templates.length-1]))); //clone last track

            let trackBox = templates[templates.length-1][0]["trackBox"]; //modify last track
            trackBox.div_id = trackBox.div_id.slice(0,-1)+(templateIdx+2)
            
            uiConfig.createAccordionTabs(templates, templateIdx+1, allDataViewRows, _dataView)

            //refresh tabs
            $("#" + "tabs_" + templateIdx).tabs().tabs("refresh");
            $("#config_menu_accordion").accordion("refresh") 

        }

        //remove last track and updates last accordion panel
        else if(option=="removeTrack"){
            if (templateIdx<1) return; //prevent from removing all tracks

            //remove trac
            templateIdx-=1
            templates.pop()
            
            //JLL: for some reason, the gui-button looses its onclicking magic on both add and remove track buttons. 
            //It only works once. 
            //workaround fix: rebind
            d3.select("#removeTrackBtn").on("click", (evt) => {
                propertyOnChange(templateIdx, curveNames.length, templates, allDataViewRows, null, "removeTrack");
                evt.preventDefault;
            }); 
            d3.select("#duplicateTrackBtn").on("click", (evt) => {
                propertyOnChange(templateIdx, curveNames.length, templates, allDataViewRows, null, "duplicateTrack");
                evt.preventDefault;
            }); 

            //remove accordion panel
            $(".ui-accordion-header:last-of-type").remove() 
            $(".ui-accordion-content:last-of-type").remove()
            

        }

        // Store the updated template in the appropriate mod property
        _mod.property("template" + templateIdx).set(JSON.stringify(templates[templateIdx]));
        renderPlot.multipleLogPlot(templates, allDataViewRows, _mod, _isInitialized, _verticalZoomHeightMultiplier, _verticalZoomHeightProperty, _dataView);
    }
}
