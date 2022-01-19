/*
 * Copyright © 2020. TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */

//@ts-check
import * as d3 from "d3";
import { sliderRight } from "d3-simple-slider";
const $ = require("jquery");
import "jquery-ui/ui/widgets/tabs";
import "jquery-ui/ui/widgets/accordion";
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
var selectedWell;
var tooltipDiv;
const ZOOMPANELWIDTH = 32;
const DEPTHLABELPANELWIDTH = 15;
var _verticalZoomHeightMultiplier = 5.0;
var _verticalZoomHeightProperty;
var _isInitialized = false;
var ui_config;
var updateAccordionTools = true;
var _scrollTop = 0;

var _dataView;
var yAxis;

const ISRESET = false; //JLL: to reset to default templates, set it to true and recomplie. Then change curve properties from GUI such as line color to save and set it back to false

//var pPerfilHeightMultiplier;

var y_function;

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
    // console.log("render", [arguments])

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
        let wellLeaves = (await (await _dataView.hierarchy("WELL")).root()).leaves();
        ///console.log({"_dataView":_dataView})
        selectedWell = wellLeaves[0].key;

        let categoryLeaves = (await (await _dataView.hierarchy("Category")).root()).leaves();

        let trackWidth = (windowSize.width - ZOOMPANELWIDTH - DEPTHLABELPANELWIDTH - 20) / categoryLeaves.length;

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

    //creates property drawer with options for each track with nothing inside
    !_isInitialized && uiConfig.createConfigPopup();
    


    //creates each plot per template

    // JLL: DEBUGGING templates
    // AJB: - to use these, use 0 or 4 instead of "test0" or "test4", like:
    // plot_templates[0] or plot_templates[4]
    // - to disable, use plot_templates["test0"] or plot_templates["test4"]
    // - string template indexes are invalid and are therefore ignored by the 
    // rendering code
    //plot_templates[0]=test_templates[0]
    console.log(plot_templates[0]);

    multipleLogPlot(plot_templates, allDataViewRows);

}





/**
 * Aha! This is called when we change something in the templates - and we call multipleLogplots() to re-draw the charts
 * Todo: persist the templates in Spotfire properties ;-)
 * @param {} templateIdx "track number"
 * @param {*} curveIdx
 * @param {*} templates
 * @param {*} allDataViewRows
 * @param {*} selectedData  "json with options for the propName"
 * @param {String} propName "name property to change. For example LineColor"
 */

function PropertyOnChange(templateIdx, curveIdx, templates, allDataViewRows, selectedData, propName) {
    if (templates[templateIdx] && _isInitialized) {
        var template = templates[templateIdx];
        let template_components = template[0]["components"];
        let templateCurves = template_components[0]["curves"];
        let curveNames = templateCurves[0]["curveNames"];

        //change thickness
        if (propName == "Thickness") {
            templateCurves[0]["strokeWidth"][curveIdx] = selectedData.value;
        }

        //change LineStyle
        else if (propName == "LineStyle") {
            templateCurves[0]["curveStrokeDashArray"][curveIdx] = selectedData.value;
        }

        //change LineColor
        else if (propName == "LineColor") {
            templateCurves[0]["curveColors"][curveIdx] = selectedData.value;
        }

        //change AreaFill
        else if (propName == "AreaFill") {
            if (selectedData.value == "none") {
                templateCurves[0]["fill"][curveIdx]["fill"] = "no";
            } else {
                templateCurves[0]["fill"][curveIdx]["fill"] = "yes";
                templateCurves[0]["fill"][curveIdx]["fillDirection"] = selectedData.value;
            }
        }

        //change AreaColor
        else if (propName == "AreaColor") {
            templateCurves[0]["fill"][curveIdx]["fillColors"] = [
                colorHelpers.getFillColor(selectedData.value, "normal"),
                colorHelpers.getFillColor(selectedData.value, "dark"),
                colorHelpers.getFillColor(selectedData.value, "light")
            ];
            templateCurves[0]["fill"][curveIdx]["colorInterpolator"] = [selectedData.value, null, null];
        }

        //change ScaleType
        else if (propName == "ScaleType") {
            templateCurves[0]["scaleTypeLinearLog"][curveIdx] = selectedData.value;
        }

        //change curveName
        else if (propName == "curveName") {
            var curveName = selectedData.value;
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
        else if (propName == "duplicateCurve") {
            //duplicates first curve properties (arrays such as colors, style, curvName, etc)
            let templateCurvesCopy = JSON.parse(JSON.stringify(templateCurves));
            for (curveIdx in templateCurves[0]) {
                if (Array.isArray(templateCurves[0][curveIdx])) templateCurves[0][curveIdx].push(templateCurvesCopy[0][curveIdx][0]);
            }
            //          for (p in templateCurves[0]["fill"]) {if (Array.isArray(templateCurves[0]["fill"][p])) templateCurves[0]["fill"][p].push(templateCurves[0]["fill"][p][0])}

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
            addAccordionTabContents(templateIdx, copiedCurveIndex, curveNames, tabs, templates, allDataViewRows, ["#333333"]);

            //refresh tabs
            $("#" + "tabs_" + templateIdx)
                .tabs()
                .tabs("refresh");
            $("#" + "tabs_" + templateIdx).tabs("option", "active", copiedCurveIndex); //makes the new tab active

            //update tab and accordion name
            let anAccordionHeader = document.querySelector("#accordionConf h3[aria-expanded='true'] span").nextSibling;
            let aTab = document.querySelector(`a[href='#tab_${templateIdx}_${copiedCurveIndex - 1}']`);
            aTab.innerText = curveNames[copiedCurveIndex - 1];
            anAccordionHeader.textContent = `Track ${templateIdx + 1}: ` + curveNames.join();
        }

        //delete last curve
        else if (propName == "removeCurve") {
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
                    "#accordionConf h3[aria-expanded='true'] span"
                ).nextSibling;
                let aTab = document.querySelector(`a[href='#tab_${templateIdx}_${copiedCurveIndex - 1}']`);
                aTab.innerText = curveNames[copiedCurveIndex - 1];
                anAccordionHeader.textContent = `Track ${templateIdx + 1}: ` + curveNames.join();
            }
        }

        // Store the updated template in the appropriate mod property
        _mod.property("template" + templateIdx).set(JSON.stringify(templates[templateIdx]));
        multipleLogPlot(templates, allDataViewRows);
    }
}




//creates a jquery accordion. Each panel contains one or more tabs
//an accordion panel represents a track (template[0])
//a tab contains track curves (template_components[0]["curves"][0];)
async function createAccordionForTemplate(templates, templateIdx, allDataViewRows) {
    let template = templates[templateIdx];
    let template_components = template[0]["components"];
    let templateCurves = template_components[0]["curves"][0];

    if (templateCurves["dataType"] == "curve") {
        let curveNames = templateCurves["curveNames"];
        let curveColors = templateCurves["curveColors"];

        d3.select("#accordionConf")
            .append("h3")
            .text("Track " + (templateIdx + 1) + ": " + curveNames);

        let content = d3.select("#accordionConf").append("div");

        /*
            Track tabs
            <div id="tabs_0">
            <ul>
                <li><a href="#tabs_0_0"> trucks </a></li>
                <li><a href="#tabs_0_1"> cars  </a></li>
                <li><a href="#tabs_0_2"> boats </a></li>
            </ul>
            <div id="tabs_0_0"> trucks are cool </div>
            <div id="tabs_0_1"> cars are fast  </div>
            <div id="tabs_0_2"> boats can sink  </div>
            </div> 
            */

        let tabs = content.append("div").attr("id", "tabs_" + templateIdx);
        let ul = tabs.append("ul");
        for (let k = 0; k < curveNames.length; k++) {
            if (curveNames[k]) {
                ul.append("li")
                    .append("a")
                    .attr("href", "#tab_" + templateIdx + "_" + k)
                    .text(curveNames[k]);
            }
        }

        // Add a "[+]" tab, so you can add another measure to this track
        ul.append("li")
            .append("a")
            .attr("href", "#tab_" + templateIdx + "_addTabButton")
            .attr("title", "Duplicates this track")
            .html("+")
            .on("mousedown", (evt) => {
                PropertyOnChange(templateIdx, curveNames.length, templates, allDataViewRows, null, "duplicateCurve");
                //addAccordionTabContents(i,curveNames.length,curveNames,tabs,templates,sfData,curveColors)

                //TODO duplicate code goes here or on PropertyOnChange
                evt.preventDefault;
            });

        // Add a "[-]" tab, so you can remove the previous measure from this track
        ul.append("li")
            .append("a")
            .attr("href", "#tab_" + templateIdx + "_addTabButton")
            .attr("title", "Removes last track")
            .html("-")
            .on("mousedown", (evt) => {
                PropertyOnChange(templateIdx, curveNames.length, templates, allDataViewRows, null, "removeCurve");
                evt.preventDefault;
            });

        // The contents of the tabs
        for (let k = 0; k < curveNames.length; k++) {
            await addAccordionTabContents(templateIdx, k, curveNames, tabs, templates, allDataViewRows, curveColors);
        }
    }

    $("#" + "tabs_" + templateIdx).tabs();
}


async function addAccordionTabContents(templateIdx, curveIdx, curveNames, tabs, templates, allDataViewRows, curveColors) {
    if (curveNames[curveIdx]) {
        var tab = tabs.append("div").attr("id", "tab_" + templateIdx + "_" + curveIdx);

        //LINE
        var fieldset = tab.append("fieldset");
        fieldset.append("legend").text("Line");
        var controlgroup = fieldset.append("div").attr("class", "controlgroup");

        //Line Measure
        divItem = controlgroup
            .append("div")
            .attr("class", "controlGroupDiv")
            .on("mousedown", function (evt) {
                evt.stopPropagation();
            });
        divItem
            .text("Measure:")
            .append("div")
            .append("select")
            .attr("id", "dropdown_measure_selector_" + curveIdx + "_" + templateIdx);

        //generate dropdown options for track curve
        let measureDdOptions = [];
        let categoryLeaves = (await (await _dataView.hierarchy("Category")).root()).leaves();
        for (let leaf of categoryLeaves) {
            measureDdOptions.push({
                value: leaf.key,
                selected: curveNames[curveIdx] == leaf.key,
                text: leaf.key
            });
        }

        $("#dropdown_measure_selector_" + curveIdx + "_" + templateIdx).ddslick({
            data: measureDdOptions,
            //height: "15px",
            width: "100px",
            defaultSelectedIndex: 0,
            selectText: "Select an item",
            onSelected: function (data) {
                let selData = data.selectedData;
                PropertyOnChange(templateIdx, curveIdx, templates, allDataViewRows, selData, "curveName");

                //update tab and accordion name
                let anAccordionHeader = document.querySelector(
                    "#accordionConf h3[aria-expanded='true'] span"
                ).nextSibling;
                let aTab = document.querySelector(`a[href='#tab_${templateIdx}_${curveIdx}']`);
                aTab.innerText = curveNames[curveIdx];
                anAccordionHeader.textContent = `Track ${templateIdx + 1}: ` + curveNames.join();
            }
        });

        //Line Thickness
        var divItem = controlgroup
            .append("div")
            .attr("class", "controlGroupDiv")
            .on("mousedown", function (evt) {
                evt.stopPropagation();
            });
        divItem.text("Thickness:");
        uiConfig.insertDropdown(divItem, templateIdx, curveIdx, templates, "Thickness", allDataViewRows);

        //Line Color
        divItem = controlgroup
            .append("div")
            .attr("class", "controlGroupDiv")
            .on("mousedown", function (evt) {
                evt.stopPropagation();
            });
        divItem
            .text("Color:")
            .append("div")
            .append("input")
            .attr("style", "width:95px;height: 15px;")
            .attr("id", `lineColor_${templateIdx}_${curveIdx}`)
            .attr("type", "color")
            .attr("value", `${curveColors[curveIdx]}">`)
            .on("change", function () {
                // use "change" or "input" events. "input" might be slower but updates the graph instantly
                //            .html(`<input style="width:95px;height: 15px;" id="lineColor_${i}_${k}" type="color" value="${curveColors[k]}">`)
                PropertyOnChange(
                    templateIdx,
                    curveIdx,
                    templates,
                    allDataViewRows,
                    document.getElementById(`lineColor_${templateIdx}_${curveIdx}`),
                    "LineColor"
                );
            });

        //Line Style
        divItem = controlgroup
            .append("div")
            .attr("class", "controlGroupDiv")
            .on("mousedown", function (evt) {
                evt.stopPropagation();
            });
        divItem.text("Decoration:");
        uiConfig.insertDropdown(divItem, templateIdx, curveIdx, templates, "LineStyle", allDataViewRows);

        //AREA
        fieldset = tab.append("fieldset");
        fieldset.append("legend").text("Area");
        controlgroup = fieldset.append("div").attr("class", "controlgroup");

        //Area Fill
        divItem = controlgroup
            .append("div")
            .attr("class", "controlGroupDiv")
            .on("mousedown", function (evt) {
                evt.stopPropagation();
            });
        divItem.text("Fill:").append("br");
        uiConfig.insertDropdown(divItem, templateIdx, curveIdx, templates, "AreaFill", allDataViewRows);

        //Area Color
        divItem = controlgroup
            .append("div")
            .attr("class", "controlGroupDiv")
            .on("mousedown", function (evt) {
                evt.stopPropagation();
            });
        divItem.text("Color:").append("br");
        uiConfig.insertDropdown(divItem, templateIdx, curveIdx, templates, "AreaColor", allDataViewRows);

        //SCALE
        fieldset = tab.append("fieldset");
        fieldset.append("legend").text("Scale");
        controlgroup = fieldset.append("div").attr("class", "controlgroup");

        //Scale type
        divItem = controlgroup
            .append("div")
            .attr("class", "controlGroupDiv")
            .on("mousedown", function (evt) {
                evt.stopPropagation();
            });
        divItem.text("Type:").append("br");
        uiConfig.insertDropdown(divItem, templateIdx, curveIdx, templates, "ScaleType", allDataViewRows);

        controlgroup = fieldset.append("div").attr("class", "controlgroup");

        //Scale Min
        divItem = controlgroup
            .append("div")
            .attr("class", "controlGroupDiv")
            .on("mousedown", function (evt) {
                evt.stopPropagation();
            });
        divItem.text("Min:").append("br");
        uiConfig.insertTextInput(divItem, templateIdx, curveIdx, templates, "ScaleMin", allDataViewRows);

        divItem = controlgroup
            .append("div")
            .attr("class", "controlGroupDiv")
            .on("mousedown", function (evt) {
                evt.stopPropagation();
            });
        divItem.text("Max:").append("br");
        uiConfig.insertTextInput(divItem, templateIdx, curveIdx, templates, "ScaleMax", allDataViewRows);

        //CUTTOFFS / THRESHOLD
        fieldset = tab.append("fieldset");
        fieldset.append("legend").text("Cutoffs/Threshold");
        controlgroup = fieldset.append("div").attr("class", "controlgroup");

        divItem = controlgroup
            .append("div")
            .attr("class", "controlGroupDiv")
            .on("mousedown", function (evt) {
                evt.stopPropagation();
            });
        divItem.text("Shale/Silt:").append("br");
        uiConfig.insertTextInput(divItem, templateIdx, curveIdx, templates, "CutoffShaleSilt", allDataViewRows);

        divItem = controlgroup
            .append("div")
            .attr("class", "controlGroupDiv")
            .on("mousedown", function (evt) {
                evt.stopPropagation();
            });
        divItem.text("Silt/Sand:").append("br");
        uiConfig.insertTextInput(divItem, templateIdx, curveIdx, templates, "CutoffSiltSand", allDataViewRows);
    }
}

//
/**
 * JLL move to another module?? Along with logPlot
 * renders all the vertical line chart tracks.
 * @param  {Array} templates array of templates. Each one represents one track
 * @param  {Array} allDataViewRows dataview rows
 */
async function multipleLogPlot(templates, allDataViewRows) {
    let div_id = "mod-container";

    let depth_label_svg;
    if (!_isInitialized) {
        const tracksDepthLabelOuter = d3
            .select("#" + div_id)
            .append("div")
            .style("vertical-align", "middle")
            .style("display", "inline-block")
            .style("position", "relative")
            .style("width", DEPTHLABELPANELWIDTH + "px");
        const tracksDepthLabelInner = tracksDepthLabelOuter
            .append("div") 
            .attr("id", "tracksDepthLabelInner")
            .style("position", "fixed")
            .style("top", window.innerHeight * 0.5 + "px")
            .style("left", "5px")
            .attr("height", window.innerHeight);

        depth_label_svg = tracksDepthLabelInner.append("svg")
            .attr("id", "tracksDepthLabelSvg")
            .attr("height", 300)
            .attr("width", 20);
    } else {
        depth_label_svg = d3.select("#tracksDepthLabelSvg");
        d3.select("#tracksDepthLabelInner")
            .style("top", window.innerHeight * 0.5 + "px")
            .attr("height", window.innerHeight);
    }

    //depth_label_svg.selectAll("*").remove();

    let depthCurveName = "DEPTH";
    let depthUnit = "m";
    depth_label_svg
        .append("text")
        .style("fill", "black")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-90) translate(0,10)")
        .text(depthCurveName + (depthUnit != "" ? " (" + depthUnit + ")" : ""))
        .style("fill", _mod.getRenderContext().styling.general.font.color);

    // Add a tools div - not currently used - previously had the zoom control in it. Todo - consider adding
    // zoom functionality back in!
    if (!_isInitialized) {
        d3.select("#" + div_id).append("div")
            .attr("id", "TracksToolDiv")
            .style("display", "inline-flex")
            .style("flex-direction", "column")
            .style("justify-content", "center")
            .style("align-items", "center")
            .style("position", "fixed")
            .style("bottom", "0px")
            .style("right", "20px")
            .style("vertical-align", "top")
            .style("width", ZOOMPANELWIDTH + "px");
    }

    //.on("mousedown", function (event) {
    //event.stopPropagation();
    //});

/*    
        var confBtn = TracksToolDiv.append("div")
            .attr("id", "confBtnDiv")
            .style("margin-top", "20px")
            .append("input")
            .attr("id", "confBtn")
            .attr("type", "image")
            .attr(
                "src",
                " data:image/png;base64,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"
            )
            .on("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();                    
                    vanilla_drawer.drawer_menu_open();
                });

        var divPlusBtn = TracksToolDiv.append("div").style("height", "26px");

        let sliderZoom = sliderRight()
            .min(1)
            .max(15)
            .step(0.25)
            .height(window.innerHeight * 0.35)
            .ticks(0)
            .default(_verticalZoomHeightMultiplier)
            .handle(d3.symbol().type(d3.symbolCircle).size(120)())
            //.fill('#2196f3')
            .on("onchange", function (val) {
                //_verticalZoomHeightMultiplier = val;
                //multipleLogPlot("mod-container", plot_templates, sfData);
                _verticalZoomHeightProperty.set(val);
            });

        divPlusBtn
            .append("input")
            .attr("id", "plusBtn")
            .attr("type", "image")
            .attr(
                "src",
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAABmJLR0QAxwDHAMczllhiAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QMZDTQOtKYP9wAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAACO0lEQVRIx8VWy07jQBCsHgfsyH1wOCQ2lkDigjgn35WP4bvIB3CJBAg8yYHMoUexjezew26yCwkQkcDWcdSjmpqufhB2hIjcNE0zVFUAABEhCIIJM492uU+fBVhr1TmHsiyhqqiqCgAQhiGICFEUIUkSpGlKXyKazWb6/PyMuq7BzGBmxHGMMAwBAFVVwXsPEYGI4Pj4GCcnJxgMBrQz0XQ61dlshizLkOc5giAA0fY3qSqapsHj4yOKosBgMMDFxQV9SnR7e6svLy84PT1FkiTvEmwjdM7h6ekJR0dHuLy8pHeJptOpLpdLnJ+fI45jfAXee9zd3aHb7b5SZv5N+nw+R5ZlXyYBgDiOkWUZ5vM5rLW6QbRYLJCmKZIkwb7440IsFgu8IrLWal3XyPP805yMx2OMx+OPa4YIeZ6jruu1KgMAzjkwM4IgwKEQBAGYGc6534pE5KYsSzDzzg7bqRMQgZlRliVE5Ma0bTtU1b0M8JExVBVt2w47bduiqqp1xW/LyS7n19fXGzFhGKKqKrRt+9d1342OMWbN3Ol0NgLevnSlZJuCt1j9lDEGxhgzISJ47w+uwnsPIoIxZmKYeRRFEUQEq1lzCKgqRARRFIGZR2ZVySKCpmkORtQ0DURk3WloNT0fHh6G3W4XZ2dne9eTquL+/h7L5RJXV1e07gzMPOr1erDWrit5HzjnYK1Fr9fDRlNN05T6/T6KotjLGN57FEWBfr//arz/n8H3o6P8R5eTH123Dr1A/gKIkV0mr/zcuQAAAABJRU5ErkJggg=="
            )
            .on("click", function (evt) {
                if (_verticalZoomHeightMultiplier + 0.25 <= 15) {
                    sliderZoom.value(_verticalZoomHeightMultiplier + 0.25);
                }
            });

        TracksToolDiv.append("div").attr("id", "slider-zoom").style("margin", "0px");



        var gZoom = d3
            .select("div#slider-zoom")
            .append("svg")
              .attr("width", "20px")
              .attr("height", ~~(window.innerHeight * 0.35) + 17)
              .append("g")
                .attr("transform", "translate(10,5)");

        gZoom.call(sliderZoom);

        var divMinusBtnRelPos = TracksToolDiv.append("div").style("position", "relative").style("height", "26px");

        divMinusBtnRelPos
            .append("div")
              .style("position", "absolute")
              .style("top", "-10px")
              .style("left", "-13px")
              .style("height", "26px")
              .append("input")
                .attr("id", "minusBtn")
                .attr("type", "image")
                .style("height", "26px")
                .attr(
                  "src",
                  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QMZDTQ366OH/wAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAACJUlEQVRIx8WWzVKjQBSFv24iYHEXxEUCsrDKjQ9gnsuH8bnMA7hJlQuEZGF60V0CFvQsZpLR8S9lonOWFPD16T6371XsKGvtTd/3l957AJRSBEEwF5HZLt+rz16o69obY2iaBu89bdsCEEURSiniOCZNU7IsU18CLZdL//DwQNd1iAgiQpIkRFEEQNu2OOew1mKtJQxDTk5OmE6namfQYrHwy+WSPM8pioIgCFDq7TV57+n7nrIsqaqK6XTK+fm5+hR0e3vrn56eOD09JU3TdwFvAY0x3N/fc3R0xMXFhXoXtFgs/OPjI2dnZyRJwlfknOPu7o7j4+MXzvTzQ1+tVuR5/mUIQJIk5HnOarWirmv/CrRer8myjDRN2Vd/Ush6veYFqK5r33UdRVHsfCYfRlkpiqKg67qtKw1gjEFECIKAQykIAkQEY8xvR9bam6ZpEJGDuHnuSkRomgZr7Y0ehuHSe79XAD4KhveeYRguR8Mw0LbttuL/1dXV1U4/vb6+fvUsiiLatmUYhr+p+26NtNZb8mg02mmlu2qzU1prtNZ6rpTCOXdwF845lFJoredaRGZxHGOtZdNrDiHvPdZa4jhGRGZ6U8nWWvq+Pxio73ustdubRgOIyDwMQ8qyPIgr7z1lWRKG4bYhbkCz8XhMXdfbSt5HxhjqumY8HvPqUs2yTE0mE6qq2isYzjmqqmIymbxo7/+n8f1oK//R4eRHx61DD5C/APInUv+2tAsfAAAAAElFTkSuQmCC"
            )
            .on("click", function (evt) {
                if (_verticalZoomHeightMultiplier - 0.25 >= 1) {
                    sliderZoom.value(_verticalZoomHeightMultiplier - 0.25);
                }
            }); 

*/

    /*get template header height*/

    function getTemplateHeaderHeight(template) {
        let template_components = template[0]["components"];
        let templateCurves = template_components[0]["curves"][0];
        ///let template_rectangles = template_components[0]["rectangles"];
        let curveNames = templateCurves["curveNames"];
        let NumberOfGradientScales = 0;
        for (let j = 0; j < templateCurves.fill.length; j++) {
            let fillColor = templateCurves.fill[j];
            if (fillColor.fill == "yes" && fillColor.fillColors.includes("interpolator")) {
                NumberOfGradientScales += 1;
            }
        }

        // Avoid constant values here - they look like magic numbers that have no
        // defined meaning.
        return curveNames.length * 42 + NumberOfGradientScales * 15;
    }

    // Add a separate div for the headers
    const headersContainerDiv = d3.select("#headersContainer").node()
        ? d3.select("#headersContainer")
        : d3
              .select("#" + div_id)
              .append("div")
              .attr("id", "headersContainer");

    headersContainerDiv.selectAll("*").remove();

    // Add a div for the tracks/plots (if it doesn't exist - todo - switch to using i)
    let trackHoldersContainerDiv;
    if (d3.select("#trackHoldersContainer").node()) {
        trackHoldersContainerDiv = d3.select("#trackHoldersContainer");
        trackHoldersContainerDiv.selectAll("*").remove();
    } else {
        trackHoldersContainerDiv = d3
            .select("#" + div_id)
            .append("div")
            .attr("id", "trackHoldersContainer")
            .style("z-index", 10)
            .attr("id", "trackHoldersContainer")
            // This is the main marking event
            .on("mousedown", function (mouseDownEvent) {
                // console.log(
                //     "trackHoldersContainerDiv mouseDown",
                //     mouseDownEvent.currentTarget.offsetTop,
                //     mouseDownEvent.target
                // );

                let getMarkMode = function (e) {
                    // shift: add rows
                    // control: toggle rows
                    // none: replace rows
                    if (e.shiftKey) {
                        return "Add";
                    } else if (e.ctrlKey) {
                        return "Toggle";
                    }

                    return "Replace";
                };

                let markMode = getMarkMode(mouseDownEvent);
                //
                // Create initial marking rectangle, will be used if the user only clicks.
                //
                let x = mouseDownEvent.pageX,
                    y = mouseDownEvent.pageY,
                    width = 1,
                    height = 1;

                    let $selection = $("<div/>")
                    .css({
                        position: "absolute",
                        border: "1px solid #0a1530",
                        "background-color": "#8daddf",
                        opacity: "0.5"
                    })
                    .hide()
                    .appendTo(this);

                // draw the marking rectangle
                $(this).on("mousemove", function (mouseMoveEvent) {
                    x = Math.min(mouseDownEvent.pageX, mouseMoveEvent.pageX);
                    y = Math.min(mouseDownEvent.pageY, mouseMoveEvent.pageY);
                    width = Math.abs(mouseDownEvent.pageX - mouseMoveEvent.pageX);
                    height = Math.abs(mouseDownEvent.pageY - mouseMoveEvent.pageY);

                    $selection.css({
                        left: x + "px",
                        top: y + "px",
                        width: width + "px",
                        height: height + "px"
                    });

                    $selection.show();
                });
                let currentTarget = mouseDownEvent.currentTarget;

                $(this).on("mouseup", async function () {
                    // console.log("mouseDownEvent.target", mouseDownEvent.target, mouseDownEvent.currentTarget);
                    var rectangle = {
                        x: mouseDownEvent.clientX,
                        // the currentTarget is always the container rect
                        // -- offsetTop is the offset to the top of the page
                        y: mouseDownEvent.clientY - currentTarget.offsetTop + currentTarget.scrollTop,
                        width: width,
                        height: height
                    };
                    // Store the scrollTop so we can re-apply it upon re-rendering from marking
                    _scrollTop = currentTarget.scrollTop;
                    var y0 = y_function.invert(rectangle.y);
                    var y1 = y_function.invert(rectangle.y + rectangle.height);
                    let allRows = await _dataView.allRows();
                
                    // console.log("y0", y0, "y1", y1, "rectangle", rectangle);
                    _dataView.mark(
                        allRows.filter((d) => d.continuous("DEPTH").value() >= y0 && d.continuous("DEPTH").value() <= y1),
                        markMode
                    );

                    $selection.remove();
                    $(this).off("mouseup mousemove");
                });
            });
    }

    // setup trackholders - todo - remove properly - removing this has no effect on the rendering
    // but the divs are referred to when plotting!
    for (let ii = 0; ii < templates.length; ii++) {
        let template = templates[ii];

        if (template) {
            if (!_isInitialized) {
                let TrackHolder = d3.select("#" + div_id).append("div");

                TrackHolder.style("vertical-align", "middle")
                    .attr("id", div_id + "TrackHolder" + ii)
                    .style("display", "inline-block")
                    .style("overflow-y", "hidden");
            }
            template[0]["trackBox"]["div_id"] = div_id + "TrackHolder" + ii;
        }
    }

    // calculate the overall header height
    let headerHeight = Math.max.apply(
        Math,
        templates.map((t) => getTemplateHeaderHeight(t))
    );

    // now plot!
    templates.forEach((template, i) => {

        renderPlot.logPlot(template, allDataViewRows, headerHeight + "px", _verticalZoomHeightMultiplier,  _dataView, yAxis, _mod);
    });

    // Apply the height and scroll settings after everything has been rendered - AJB todo - remove hard coded value!
    trackHoldersContainerDiv.attr(
        "style",
        "height:" +
            (modContainer.node().getBoundingClientRect().height -
                headersContainerDiv.node().getBoundingClientRect().height -
                100) +
            "px;" +
            "overflow-y:scroll"
    );

    // Just calling scrollTop() doesn't work - hence the need to animate
    // -- would be preferable to do this in a d3 native way rather than jQuery, but d3 doesn't seem to work...
    $("#trackHoldersContainer").animate({ scrollTop: _scrollTop }, 10);

    //update accordion panels
    if (updateAccordionTools) {
        for (const i of templates.keys()) await createAccordionForTemplate(templates, i, allDataViewRows);
        updateAccordionTools = false;
    }

    $("#accordionConf").accordion({ collapsible: true });

   

    // this can be used to detect if we need to add divs, etc.
    // on re-rendering after marking. If already initialized, no need
    // to add new divs
    _isInitialized = true;
}
