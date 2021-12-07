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

import { invalidateTooltip } from "./extended-api.js";
import { nodeFormattedPathAsArray } from "./extended-api.js";
import { addHandlersSelection } from "./ui-input.js";

import * as vanillaDrawer from "./vanillaDrawer.js";
import * as colorHelpers from "./color-helpers.js";

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

async function markModel(markMode, rectangle) {
    var markData = {};

    var js_chart = d3.select("#mod-container")._groups[0][0];
    var header = d3.select(".trackHeaderDiv")._groups[0][0];

    let trackPlotDiv = d3.select(".trackPlotDiv");
    console.log(trackPlotDiv, header.style);

    var headerHeight =
        parseFloat(header.style.height.replace(/\D/g, "")) + parseFloat(header.style.marginBottom.replace(/\D/g, ""));
    console.log(headerHeight);

    var y0 = y_function.invert(rectangle.y - headerHeight + js_chart.scrollTop);
    var y1 = y_function.invert(rectangle.y - headerHeight + rectangle.height + js_chart.scrollTop);
    let allRows = await _dataView.allRows();

    console.log("y0", y0, "y1", y1);
    _dataView.mark(
        allRows.filter((d) => d.continuous("DEPTH").value() >= y0 && d.continuous("DEPTH").value() <= y1),
        "Replace"
    );
}



// @todo - remove as many global vars as we can!
var selectedWell;
var tooltipDiv;
var ZoomPanelWidth = 32;
var depthLabelPanelWidth = 15;
var _verticalZoomHeightMultiplier = 5.0;
var _verticalZoomHeightProperty;
var initialized = false;
var vanilla_drawer;
var updateAccordionTools = true;

var _dataView;
var yAxis;

//var pPerfilHeightMultiplier;

var y_function;

var _mod; // The global mod instance

/**
 * Renders the chart.
 * @param {Object} state
 * @param {Spotfire.Mod} mod
 * @param {Spotfire.DataView} dataView - dataView
 * @param {Spotfire.Size} windowSize - windowSize
 * @param {Spotfire.ModProperty<string>} example - an example property
 */
export async function render(state, mod, dataView, windowSize, verticalZoomHeightProperty) {
    // console.log("render", [arguments])

    _dataView = dataView;
    _mod = mod;
    _verticalZoomHeightProperty = verticalZoomHeightProperty;
    ///console.log(verticalZoomHeightProperty);
    _verticalZoomHeightMultiplier = _verticalZoomHeightProperty.value();
    ///console.log("Render called with mod", mod);
    if (state.preventRender) {
        // Early return if the state currently disallows rendering.
        return;
    }

    const onSelection = ({ dragSelectActive }) => {
        state.preventRender = dragSelectActive;
    };

    const styling = mod.getRenderContext().styling;
    const { tooltip, popout } = mod.controls;
    const { radioButton, checkbox } = popout.components;
    const { section } = popout;

    //invalidateTooltip(tooltip);

    /**
     * The DataView can contain errors which will cause rowCount method to throw.
     */
    let errors = await dataView.getErrors();
    if (errors.length > 0) {
        svg.selectAll("*").remove();
        mod.controls.errorOverlay.show(errors, "dataView");
        return;
    }

    mod.controls.errorOverlay.hide("dataView");

    // Return and wait for next call to render when reading data was aborted.
    // Last rendered data view is still valid from a users perspective since
    // a document modification was made during a progress indication.
    // Hard abort if row count exceeds an arbitrary selected limit
    const xLimit = 1250;
    const colorLimit = 100;
    //const colorCount = (await dataView.hierarchy("Color")).leafCount;
    //const xCount = (await dataView.hierarchy("X")).leafCount;
    /*if (colorCount > colorLimit || xCount > xLimit) {
        svg.selectAll("*").remove();
        mod.controls.errorOverlay.show(`Exceeded data size limit (colors: ${colorLimit}, x: ${xLimit})`, "rowCount");
        return;
    } else {
        mod.controls.errorOverlay.hide("rowCount");
    }*/

    const allRows = await dataView.allRows();
    ///console.log(allRows);
    allRows.sort((a, b) => a.continuous("DEPTH").value() - b.continuous("DEPTH").value());

    if (allRows == null) {
        // Return and wait for next call to render when reading data was aborted.
        // Last rendered data view is still valid from a users perspective since
        // a document modification was made during a progress indication.
        return;
    }

    const margin = { top: 20, right: 40, bottom: 40, left: 80 };

    modContainer.style("height", windowSize.height - margin.bottom - margin.top).style("overflow-y", "auto");

    /**
     * Maximum number of Y scale ticks is an approximate number
     * To get the said number we divide total available height by font size with some arbitrary padding
     */
    const yScaleTickNumber = windowSize.height / (styling.scales.font.fontSize * 2 + 6);

    /** We might need the SVG/viewbox to clear marking but the chart wasn't designed for it, so remove it for now */

    // Now render here!

    ///var zoneLogTrackWidth = 120;

    function buildDefaultTemplate(trackNo, curveName, trackWidth, height) {
        ///console.log({"buildDefaultTemplate":[trackNo, curveName, trackWidth, height]})
        ///var pPerfilTrack01CorArea01 = "gray";
        ///var pPerfilTrack01CorCurva01 = "gray";
        ///var pPerfilTrack01EscalaMaxCurva01 = "";
        ///var pPerfilTrack01EscalaMinCurva01 = "";
        ///var pPerfilTrack01EspessuraCurva01 = "2";
        ///var pPerfilTrack01Limite01Curva01 = "";
        ///var pPerfilTrack01Limite02Curva01 = "";
        ///var pPerfilTrack01PreenchimentoArea01 = "right";
        ///var pPerfilTrack01TipoEscalaCurva01 = "linear";
        ///var pPerfilTrack01TracoCurva01 = "2,2";
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

        let trackWidth = (window.innerWidth - ZoomPanelWidth - depthLabelPanelWidth - 40) / categoryLeaves.length;

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

    //add the drawer controls on the left of the screen
    function createVanillaDrawer() {
        d3.select("#mod-container")
            .style("margin", "0")
            .style("padding", "0")
            .style("border", "0")

            .append("div")
            .attr("id", "vanillaDrawerContainer")
            .html(
                `
                <DIV id=drawer_content style="DISPLAY: none"></DIV>
                <DIV id=drawer_wall></DIV>
                <DIV id=drawer_menu>
                <DIV id="drawer_menu_content" style="position:relative;">
                <A id=abtnfechar >✖</I></I></A>
                <h3 class="drawer_menu_header" style="float: left;margin-left: 10px;color:black;width: 89%;">Well Log Tracks Settings</h3>
                <DIV id="accordionConf" style="clear:both;">
                </DIV>
                </DIV>
                </DIV>
                <style>
                #abtnfechar{color:#1b8888;cursor:pointer;float:right;font-size:1.5em;margin:5px}
                #abtnfechar:hover{color:white}
                </style>
                `
            );

        vanilla_drawer = vanillaDrawer.initialize();

        //TODO: make a draggable accordion
        //$("#drawer_menu").draggable()

        $("#drawer_menu").mousedown(function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
        });

        $("#drawer_wall").click(function (evt) {
            document.getElementById("drawer_wall").focus();
            vanilla_drawer.drawer_menu_close();
        });

        $("#abtnfechar").click(function (evt) {
            document.getElementById("drawer_wall").focus();
            vanilla_drawer.drawer_menu_close();
        });
    }

    /**
     *
     * Drawing code!
     *
     *
     *
     *
     *
     *
     *
     */

    //read templates from mod property
    let plot_templates = await buildTemplates(false); //use true to reset

    //get data
    var allDataViewRows = await dataView.allRows();

    //creates property drawer with options for each track with nothing inside
    createVanillaDrawer(plot_templates, allDataViewRows);
    vanilla_drawer.draggable(document.getElementById("drawer_menu"));

    //creates each plot per template
    multipleLogPlot(plot_templates, allDataViewRows);

    //bring up settings dialog where left off in case render was called from setting dialog
    //TODO
}

async function logPlot(template_for_plotting, allDataViewRows, headerHeight) {
    let template_overall = template_for_plotting[0]["trackBox"];
    let template_components = template_for_plotting[0]["components"];
    let templateCurves = template_components[0]["curves"][0];
    let dataType = templateCurves["dataType"];

    let div_id = template_overall["div_id"];
    console.log(div_id);
    let k = div_id.slice(-1);

    let height = template_overall["height"] * _verticalZoomHeightMultiplier - 110;
    ///console.log(height);
    let height_components = template_overall["height"];
    let width = template_overall["width"];
    let margin = template_overall["margin"];
    let gridlines_color = "#D3D3D3";
    let gridlines_strokeWidth = 0.2;
    let curveNames = templateCurves["curveNames"];
    let curveColors = templateCurves["curveColors"];
    let curveStrokeDashArray = templateCurves["curveStrokeDashArray"];
    let scaleTypeLinearLog = templateCurves["scaleTypeLinearLog"];
    let depthCurveName = templateCurves["depthCurveName"];

    let curveUnits = "";
    if (templateCurves["curveUnits"]) {
        curveUnits = templateCurves["curveUnits"];
    }

    let depthUnit = "";
    if (templateCurves["depthUnit"]) {
        depthUnit = templateCurves["depthUnit"];
    }

    //////////////  Initiate DIVs //////////////
    let svg;
    let trackHeaderDiv;

    trackHeaderDiv = d3
        .select("#headersContainer")
        .append("div")
        .attr("class", "trackHeaderDiv")
        .style("overflow-x", "visible")
        .style("overflow-y", "visible")
        .style("position", "sticky")
        .style("top", 0)
        .style("background-color", await _mod.getRenderContext().styling.general.backgroundColor)
        .style("z-index", 1)
        .style("height", headerHeight)
        .style("display", "inline-flex")
        .style("flex-direction", "row")
        .style("align-items", "flex-end")
        .style("margin-bottom", "10px")

        .on("mouseover", (e) => {
            d3.select("#" + div_id + "_gear")
                .style("display", "block")
                .style("color", "#BDBFC3");
        })
        .on("mouseout", (e) => {
            d3.select("#" + div_id + "_gear").style("display", "none");
        })

        .append("div")
        .attr("class", "trackHeaderDivContent")
        //#BDBFC3 #858991 (hover)
        .html(
            `<svg id="${div_id}_gear" style="height:15px;" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 14 14" enable-background="new 0 0 14 14" xml:space="preserve" ><path fill="currentColor" d="M13.621,5.904l-1.036-0.259c-0.168-0.042-0.303-0.168-0.356-0.332c-0.091-0.284-0.205-0.559-0.339-0.82 c-0.079-0.154-0.072-0.337,0.017-0.486l0.55-0.915c0.118-0.197,0.087-0.449-0.075-0.611l-0.863-0.863 c-0.163-0.162-0.414-0.193-0.611-0.075L9.992,2.092C9.844,2.181,9.66,2.188,9.506,2.109C9.244,1.975,8.97,1.861,8.686,1.77 C8.521,1.717,8.395,1.583,8.353,1.415L8.094,0.379C8.039,0.156,7.839,0,7.609,0H6.39C6.161,0,5.961,0.156,5.905,0.379L5.647,1.415 C5.605,1.582,5.479,1.717,5.314,1.77C5.029,1.861,4.755,1.975,4.493,2.109C4.339,2.188,4.155,2.182,4.007,2.093L3.092,1.544 C2.895,1.426,2.644,1.457,2.481,1.619L1.619,2.481C1.457,2.644,1.426,2.895,1.544,3.092l0.549,0.915 c0.089,0.148,0.095,0.332,0.017,0.486C1.975,4.755,1.861,5.029,1.77,5.314c-0.053,0.165-0.188,0.29-0.355,0.332L0.379,5.905 C0.156,5.961,0.001,6.161,0.001,6.39L0,7.609c0,0.229,0.156,0.43,0.378,0.485l1.036,0.259C1.583,8.396,1.717,8.521,1.77,8.686 c0.091,0.285,0.205,0.559,0.339,0.821c0.079,0.154,0.073,0.337-0.016,0.486l-0.549,0.915c-0.118,0.196-0.087,0.448,0.075,0.61 l0.862,0.863c0.163,0.163,0.415,0.193,0.611,0.075l0.915-0.549c0.148-0.089,0.332-0.095,0.486-0.017 c0.262,0.134,0.537,0.248,0.821,0.339c0.165,0.053,0.291,0.187,0.333,0.355l0.259,1.036C5.961,13.844,6.16,14,6.39,14h1.22 c0.23,0,0.429-0.156,0.485-0.379l0.259-1.036c0.042-0.167,0.168-0.302,0.333-0.355c0.285-0.091,0.559-0.205,0.821-0.339 c0.154-0.079,0.338-0.072,0.486,0.017l0.915,0.549c0.197,0.118,0.448,0.088,0.611-0.075l0.863-0.863 c0.162-0.162,0.193-0.414,0.075-0.611l-0.549-0.915c-0.089-0.148-0.095-0.332-0.017-0.486c0.134-0.262,0.248-0.536,0.339-0.82 c0.053-0.165,0.188-0.291,0.356-0.333l1.036-0.259C13.844,8.039,14,7.839,14,7.609V6.39C14,6.16,13.844,5.96,13.621,5.904z M7,9.5 C5.619,9.5,4.5,8.381,4.5,7c0-1.381,1.119-2.5,2.5-2.5S9.5,5.619,9.5,7C9.5,8.381,8.381,9.5,7,9.5z"></path></svg>`
        );

    d3.select("#" + div_id + "_gear")
        .style("display", "none")
        .attr("class", "trackHeaderDivContentGear")
        .on("click", function (d) {
            //open the accordion (if not already open)
            vanilla_drawer.drawer_menu_open(d); //d should be the accordion index
            var accordionTab = document.querySelectorAll(".ui-accordion-header")[k];
            if (accordionTab.getAttribute("aria-expanded") == "false") accordionTab.click();
        });

    var trackHeaderDivContent = trackHeaderDiv;

    const trackPlotDiv = d3.select("#trackHoldersContainer").append("div")
        .attr("height", height + "px")
        .attr("class", "trackPlotDiv")
        .style("display", "inline-flex")
        .style("flex-direction", "row")
        .style("align-items", "flex-end")
        .style("margin", 0)
        .style("padding", 0)
        .style("border", 0)
        .style("box-sizing", "border-box")
        .style("overflow-y", "visible");

        const logPlot_sub_div = trackPlotDiv.append("div")
        .attr("class", "component_inner")        
        .style("top", 0)
        .style("overflow-y", "visible");
        

    svg = logPlot_sub_div.append("svg");

    let x_functions_for_each_curve = {};

    let mins = [];
    let maxes = [];
    let curvesDescription = "";

    /* For now, let's filter the data and pivot it based on the curve names */
    let categoryLeaves = (await (await _dataView.hierarchy("Category")).root()).leaves();
    let depthKeys = new Map();
    let valueRows = [];
    // The template contains the curve names that this data is intended for, so we need to find out which data is required
    // to populate the template
    let isFirstLeaf = true;
    for (const leaf of categoryLeaves.filter((d) => {
        return curveNames.includes(d.key);
    })) {
        let rowIndex = 0;
        for (const row of leaf.rows()) {
            let depth = row.continuous("DEPTH").value();
            let valueRow = { depth: depth };
            valueRow.isMarked = row.isMarked();
            if (isFirstLeaf) {
                depthKeys.set(depth, rowIndex);
                valueRows.push(valueRow);
            }
            valueRows[depthKeys.get(depth)][leaf.key] = parseFloat(row.categorical("Value").formattedValue());
            rowIndex++;
        }
        isFirstLeaf = false;
    }
    valueRows.sort((a, b) => a["depth"] - b["depth"]);

    let y;

    //////////////////// define Y scale (depth)  ////////////////////
    let depthMin = d3.min(valueRows, (d) => d.depth);
    let depthMax = d3.max(valueRows, (d) => d.depth);
    y = d3
        .scaleLinear()
        .domain([depthMax, depthMin])
        .range([height - margin.bottom - margin.top, margin.top]);

    yAxis = function (g) {
        return g
            .attr("transform", "translate(" + margin.left + ",0)")
            .call(d3.axisLeft(y))
            .call(function (g) {
                return g.select(".domain");
            });
    };

    y_function = y;

    //////////////  Building curves within tracks //////////////
    for (let k = 0; k < curveNames.length; k++) {
        var maxScaleX = null;
        var minScaleX = null;

        if (templateCurves["fill"] && k < templateCurves["fill"].length) {
            minScaleX = templateCurves["fill"][k]["minScaleX"] ? templateCurves["fill"][k]["minScaleX"] : null;
            maxScaleX = templateCurves["fill"][k]["maxScaleX"] ? templateCurves["fill"][k]["maxScaleX"] : null;
        }

        let min_this = d3.min(valueRows, (d) => d[curveNames[k]]);
        let max_this = d3.max(valueRows, (d) => d[curveNames[k]]);

        mins.push(min_this);
        maxes.push(max_this);

        //fixed scale:
        if (minScaleX) {
            min_this = minScaleX;
        }
        if (maxScaleX) {
            max_this = maxScaleX;
        }

        let x_func;
        let x;
        let xAxis_header;
        let xAxis;

        x = d3
            .scaleLinear()
            .domain([min_this, max_this])
            .nice()
            .range([margin.left, width - margin.right]);
        if (scaleTypeLinearLog[k] == "log") {
            x = d3
                .scaleLog()
                .domain([min_this, max_this])
                .range([margin.left, width - margin.right]);
        } else if (dataType == "category") {
            x = d3
                .scaleOrdinal()
                .domain([" ", ""])
                .range([margin.left, width - margin.right]);
        } else if (scaleTypeLinearLog[k] == "linear") {
        }
        if (k == 0) {
            x_func == x;
        }

        x_functions_for_each_curve[curveNames[k]] = x;
    }

    for (let k = 0; k < curveNames.length; k++) {
        let min = mins[k];
        let max = maxes[k];

        let header_text_line = curveNames[k];

        curvesDescription = curvesDescription + "-" + curveNames[k];

        let curveUnit = "";
        if (curveUnits[k]) {
            curveUnit = curveUnits[k];
        }

        if (!isNaN(min) && !isNaN(max)) {
            header_text_line = min.toFixed(1) + " - " + curveNames[k] + curveUnit + " - " + max.toFixed(1);
        } else {
            header_text_line = curveNames[k];
        }

        //////////////  Building Track Components  //////////////
        ///console.log(height);
        svg.attr("class", "components")
            .attr("width", width)
            .attr("height", height)
            .style("margin", "0 auto")
            .style("overflow-y", "visible");

        svg.append("g").call(yAxis);

        var gridlines_obj = d3
            .axisTop()
            .ticks((width - margin.left - margin.right) / 25)
            .tickFormat("")
            .tickSize(-height + margin.top + 10)
            .scale(x_functions_for_each_curve[curveNames[0]]);
        svg.append("g")
            .attr("class", "grid")
            .call(gridlines_obj)
            .style("stroke", gridlines_color)
            .style("stroke-width", gridlines_strokeWidth);

        //////////////  Header Text   //////////////

        const distance_from_top = "1em";

        let svg_header = trackHeaderDivContent.append("div").append("svg");
        svg_header.attr("class", "header");
        svg_header.attr("width", width).attr("height", "40px");
        svg_header.append("g");
        svg_header.style("display", "block");

        svg_header
            .append("text")
            .attr("x", (margin.left + width) / 2)
            .attr("y", 0 + distance_from_top)
            .attr("text-anchor", "middle")
            .style("font-size", "11px")
            .style("cursor", "default")
            .style("fill", curveColors[k])
            .text(header_text_line);

        let translate_string = "translate(0,17)";

        let xAxis_header = function (g) {
            return g.attr("transform", translate_string).call(
                d3
                    .axisBottom(x_functions_for_each_curve[curveNames[k]])
                    .ticks((width - margin.left - margin.right) / 25)
                    .tickSizeOuter(0)
            );
        };

        svg_header.append("g").call(xAxis_header).append("text");

        //////////////   define the lines and areas  //////////////

        svg.append("defs")
            .append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("x", margin.left + 1)
            .attr("y", margin.top)
            .attr("width", width - margin.right - margin.left - 1)
            .attr("height", y(depthMax) - y(depthMin));

        function getOpacity(n, threshold_curve1, threshold_curve2) {
            if (n == 0) return 1;
            else if (threshold_curve1) return 1;
            else if (threshold_curve2) return 1;
            else return 0;
        }

        if (dataType == "curve") {
            for (let i = 0; i < templateCurves["fill"].length; i++) {
                if (templateCurves["fill"][i]["fill"] == "yes") {
                    let number_colors = templateCurves["fill"][i]["fillColors"].length;
                    let curveName1 = templateCurves["fill"][i]["curveName"];

                    for (let j = 0; j < number_colors; j++) {
                        let area1 = d3.area();
                        let threshold = -99999999;
                        let fillColor = "#333333";
                        let colorInterpolation = d3.interpolateSpectral;

                        if (number_colors !== 0) {
                            threshold = templateCurves["fill"][i]["cutoffs"][j];
                            fillColor = templateCurves["fill"][i]["fillColors"][j];
                            colorInterpolation = colorHelpers.getColorInterpolator(
                                templateCurves["fill"][i]["colorInterpolator"][j]
                            );
                        }

                        if (fillColor == "interpolator" && colorInterpolation) {
                            let colorInterpolator_functions_for_each_curve = {};

                            if (scaleTypeLinearLog[k] == "linear") {
                                colorInterpolator_functions_for_each_curve[curveName1 + "_" + j] = d3
                                    .scaleSequential(colorInterpolation)
                                    .domain(x_functions_for_each_curve[curveName1].domain());
                            } else if (scaleTypeLinearLog[k] == "log") {
                                colorInterpolator_functions_for_each_curve[curveName1 + "_" + j] = d3
                                    .scaleSequentialLog(colorInterpolation)
                                    .domain(x_functions_for_each_curve[curveName1].domain());
                            }

                            // Linear gradient fill
                            var grd = svg
                                .append("defs")
                                .append("linearGradient")
                                .attr("id", "linear-gradient-" + curveName1 + "_" + j)
                                .attr("gradientUnits", "userSpaceOnUse")
                                .attr("x1", 0)
                                .attr("x2", 0)
                                .attr("y1", y(depthMin))
                                .attr("y2", y(depthMax))
                                .selectAll("stop")
                                .data(valueRows)
                                .join("stop")
                                .attr("offset", function (d, i) {
                                    return ((y(d.depth) - y(depthMin)) / (y(depthMax) - y(depthMin))) * 100.0 + "%";
                                })
                                .attr("stop-color", function (d, i) {
                                    return !isNaN(d[curveName1])
                                        ? colorInterpolator_functions_for_each_curve[curveName1 + "_" + j](
                                              d[curveName1]
                                          )
                                        : "rgba(0,0,0,0)";
                                });

                            if (colorInterpolator_functions_for_each_curve[curveName1 + "_" + j]) {
                                var svg_legend_color_scale = trackHeaderDivContent.append("div").append("svg");
                                svg_legend_color_scale.attr("height", 15).attr("width", width);

                                svg_legend_color_scale
                                    .append("defs")
                                    .append("linearGradient")
                                    .attr("id", "linear-gradient-legend-" + curveName1 + "_" + j)
                                    .attr("gradientUnits", "userSpaceOnUse")
                                    .attr("x1", margin.left)
                                    .attr("x2", width - margin.right)
                                    .attr("y1", 0)
                                    .attr("y2", 0)
                                    .selectAll("stop")
                                    .data(
                                        d3.range(
                                            x_functions_for_each_curve[curveName1].domain()[0],
                                            x_functions_for_each_curve[curveName1].domain()[1]
                                        )
                                    )
                                    .join("stop")
                                    .attr("offset", function (d) {
                                        return (
                                            ((d - x_functions_for_each_curve[curveName1].domain()[0]) /
                                                (x_functions_for_each_curve[curveName1].domain()[1] -
                                                    x_functions_for_each_curve[curveName1].domain()[0] -
                                                    1)) *
                                                100 +
                                            "%"
                                        );
                                    })
                                    .attr("stop-color", function (d) {
                                        return colorInterpolator_functions_for_each_curve[curveName1 + "_" + j](d);
                                    });

                                svg_legend_color_scale
                                    .append("rect")
                                    .attr("x", margin.left)
                                    .attr("y", 1)
                                    .attr("width", width - margin.left - margin.right)
                                    .attr("height", 18)
                                    .attr("fill", "url(#linear-gradient-legend-" + curveName1 + "_" + j + ")")
                                    .attr("stroke", "black")
                                    .attr("stroke-width", 0.5);

                                //d3.select("#"+div_id+" div div.trackHeaderDivContent").append('br')
                            }

                            fillColor = "url(#linear-gradient-" + curveName1 + "_" + j + ")";
                        }

                        if (templateCurves["fill"][i]["fillDirection"] == "left") {
                            let start_from_left = template_overall["margin"]["left"];
                            area1
                                .x1(function (d, i) {
                                    return x_functions_for_each_curve[curveName1](d[curveNames[k]]);
                                })
                                .x0(function (d, i) {
                                    return start_from_left;
                                })
                                .defined(function (d, i) {
                                    let value = d[curveNames[k]];
                                    return (value || value == 0) && value > threshold;
                                })
                                .y(function (d, i) {
                                    return y(d.depth);
                                });
                            svg.append("path")
                                .attr("class", "area")
                                .attr("clip-path", "url('#clip')")
                                .attr("d", area1(valueRows))
                                .attr("stroke", "none")
                                .attr("fill", fillColor)
                                .attr("fill-opacity", getOpacity(j, threshold, null));
                        }
                        if (templateCurves["fill"][i]["fillDirection"] == "right") {
                            let start_from_right = template_overall["margin"]["right"];
                            let start_from_left = template_overall["margin"]["left"];
                            area1
                                .x1(function (d, i) {
                                    return width - start_from_right;
                                })
                                .defined(function (d, i) {
                                    let value = d[curveNames[k]];
                                    return (value || value == 0) && value > threshold;
                                })
                                .x0(function (d, i) {
                                    return x_functions_for_each_curve[curveNames[k]](d[curveNames[k]]);
                                })
                                .y(function (d, i) {
                                    return y(d.depth);
                                });

                            svg.append("path")
                                .attr("class", "area")
                                .attr("clip-path", "url('#clip')")
                                .attr("d", area1(valueRows))
                                .attr("stroke", "none")
                                .attr("fill", fillColor)
                                .attr("fill-opacity", getOpacity(j, threshold, null));
                        }
                        if (templateCurves["fill"][i]["fillDirection"] == "between") {
                            let between_2_curve = templateCurves["fill"][k]["curve2"];

                            var indexCurve2;
                            for (let c = 0; c < curveNames.length; c++) {
                                if (between_2_curve == curveNames[c]) {
                                    indexCurve2 = c;
                                    break;
                                }
                            }

                            let fillColor2 = templateCurves["fill"][indexCurve2]["fillColors"][j];
                            let curve2Threshold = templateCurves["fill"][indexCurve2]["cutoffs"][j];

                            if (fillColor2 == "interpolator") {
                                fillColor2 = "url(#linear-gradient-" + between_2_curve + "_" + j + ")";
                            }

                            let second_curve_x_func = x_functions_for_each_curve[between_2_curve];
                            let first_curve_x_func = x_functions_for_each_curve[curveName1];

                            area1
                                .x1(function (d, i) {
                                    return first_curve_x_func(d[curveName1]);
                                })
                                .x0(function (d, i) {
                                    return second_curve_x_func(d[between_2_curve]);
                                })
                                .defined(function (d, i) {
                                    return (
                                        (d[curveName1] || d[curveName1] == 0) &&
                                        d[curveName1] > threshold &&
                                        (d[between_2_curve] || d[between_2_curve] == 0) &&
                                        d[between_2_curve] > curve2Threshold &&
                                        first_curve_x_func(d[curveName1]) > second_curve_x_func(d[between_2_curve])
                                    );
                                })
                                .y(function (d, i) {
                                    return y(d.depth);
                                });

                            svg.append("path")
                                .attr("class", "area")
                                .attr("clip-path", "url('#clip')")
                                .attr("d", area1(valueRows))
                                .attr("stroke", "none")
                                .attr("fill", fillColor)
                                .attr("fill-opacity", getOpacity(j, threshold, curve2Threshold));
                        }
                    }
                }
            }
            let line = d3
                .line()
                .x(function (d) {
                    if (isNaN(x_functions_for_each_curve[curveNames[k]](d[curveNames[k]]))) {
                        return null;
                    } else {
                        return x_functions_for_each_curve[curveNames[k]](d[curveNames[k]]);
                    }
                })
                .y(function (d) {
                    return y(d.depth);
                })
                .defined(function (d) {
                    return d[curveNames[k]] && d[curveNames[k]] != 0; //AJB not sure about checking for zero here!
                });

            svg.append("path")
                .attr("fill", "none")
                .attr("clip-path", "url('#clip')")
                .attr("stroke", curveColors[k])
                .attr("stroke-width", templateCurves["strokeWidth"][k])
                .attr("stroke-linecap", templateCurves["strokeLinecap"][k])
                .attr("stroke-dasharray", curveStrokeDashArray[k])
                .attr("d", line(valueRows));
        }
    }

    //return; // AJB return for now to avoid errors during development
    //JLL uncommented line above to continue with development. Errros on lines 1529,1534 so I commented them out
    //also added getCurveData vs depthData[i]

    /* Marking Representation */

    function checkPreviousMarked(d, i) {
        if (i <= 0 || i > valueRows.length) {
            return false;
        } else {
            return valueRows[i - 1].isMarked;
        }
    }

    //need to define "depthData" array to avoid running this function on all the calls that
    //"return y(getCurveData(lineIndex, "DEPTH", sfData));"
    //see line 1004 and 1105
    /*function getCurveData(lineIndex, curveName, sfData) {
        var item;
        if (curveName == "ZONE" || curveName == "FACIES" || curveName == "WELL") {
            item = sfData[lineIndex].categorical(curveName).formattedValue();
        } else {
            item = sfData[lineIndex].continuous(curveName).value();
        }
    
        return item;
    }*/

    var areaMark = d3
        .area()
        .x0(margin.left)
        .x1(width - margin.right)

        .defined(function (d, i) {
            //console.log(d);
            return d.isMarked || checkPreviousMarked(d, i);
        })
        .y(function (d, i) {
            return y(valueRows[i].depth);
        });

    var areaPath = svg
        .append("path")
        .datum(valueRows)
        .attr("class", "area")
        .attr("clip-path", "url('#clip')")
        .attr("d", areaMark)
        .attr("stroke", "none")
        .attr("fill", "rgb(0,0,0)")
        .attr("fill-opacity", 0.2);
    //.style("stroke-dasharray", ("7,3")) // make the stroke dashed
    //.style("stroke", "rgba(0,0,0,0.4)")   // set the line colour
    var areaMarkTagRight = d3
        .area()
        .x0(width - margin.right)
        .x1(width - margin.right + 4)
        .defined(function (d, i) {
            return d.isMarked || checkPreviousMarked(d, i);
        })
        .y(function (d, i) {
            //return y(depthData[i]);
            return y(valueRows[i].depth);
        });

    var areaTagPathRight = svg
        .append("path")
        .datum(valueRows)
        .attr("class", "area")
        //.attr("clip-path", "url('#clip')")
        .attr("d", areaMarkTagRight)
        .attr("stroke", "none")
        .attr("fill", "#222222")
        .attr("fill-opacity", 0.7);

    var areaMarkTagLeft = d3
        .area()
        .x0(margin.left - 4)
        .x1(margin.left)
        .defined(function (d, i) {
            return d.isMarked || checkPreviousMarked(d, i);
        })
        .y(function (d, i) {
            //return y(depthData[i]);
            return y(valueRows[i].depth);
        });

    var areaTagPathLeft = svg
        .append("path")
        .datum(valueRows)
        .attr("class", "area")
        //.attr("clip-path", "url('#clip')")
        .attr("d", areaMarkTagLeft)
        .attr("stroke", "none")
        .attr("fill", "#222222")
        .attr("fill-opacity", 0.7);

    // append the transparent rectangle to capture mouse movement (tooltip)
    svg.append("rect")
        .attr("curveColors", curveColors)
        .attr("width", width - margin.left)
        .attr("x", margin.left)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", tooltipMouseover)
        .on("mouseout", tooltipMouseout)
        .on("mousemove", mousemove);

    function tooltipMouseover(evt) {
        focus.style("display", null);
        tooltipDiv.transition().duration(600).style("opacity", 0.9);
    }

    function tooltipMouseout(evt) {
        focus.style("display", "none");
        tooltipDiv.transition().duration(400).style("opacity", 0);
    }

    //////////////  Rectangles for Categories //////////////
    try {
        if (dataType == "category") {
            var categoryDomain = [];
            var categoryColorFunc;

            /*			
			valueIndex    = getCurveIndex(depthCurveName, sfData);
            categoryIndex = getCurveIndex(curveNames[0], sfData);
			
			const groupArraySF = arr => {
			   return arr.reduce( function(acc, val, ind, array) {
			      // the accumulated data and lastIndex of accumulated data
			      const { data, currentIndex } = acc;
			      // the current object properties
				  const { value, category, MarkIndex } = {  value: val.items[valueIndex], category: val.items[categoryIndex], MarkIndex: val.hints.index };
			      // the previous object properties
			      const v0 = arr[ind-1]?.items[valueIndex];
			      const g0 = arr[ind-1]?.items[categoryIndex];
				  const i0 = arr[ind-1]?.hints.index;
				  // the next object properties
 			     const v1 = arr[ind+1]?.items[valueIndex];
			      const g1 = arr[ind+1]?.items[categoryIndex];
				  const i1 = arr[ind+1]?.hints.index;
			      if( (ind === 0 || category !== g0)) {
					 if (g0 && !categoryDomain.includes(g0)) { categoryDomain.push(g0); }
 			         // recording the index of last object and pushing new subarray
			         const index = data.push([val]) - 1;
					 if (data[index-1]) { data[index-1].push(val); }
					 if (data[index-1]) { 
					     reduxMarkIds = [];
					     for (var i=0; i < data[index-1].length-1; i++)  {
						     reduxMarkIds.push( data[index-1][i].hints.index);
					     }
						 data[index-1] = [{top: data[index-1][0].items[valueIndex] , bottom: val.items[valueIndex], category: data[index-1][0].items[categoryIndex], markIds: reduxMarkIds }]; 
					 }
			         return { data, currentIndex: index };
			      };
			      data[currentIndex].push(val);
				  // if last node:
				  if (currentIndex == data.length -1  && ind == array.length -1) { 
					 reduxMarkIds = [];
					 for (var i=0; i < data[currentIndex].length; i++)  {
					     reduxMarkIds.push( data[currentIndex][i].hints.index);
					 }		  
				      data[currentIndex] = [{top: data[currentIndex][0].items[valueIndex] , bottom: val.items[valueIndex], category: data[currentIndex][0].items[categoryIndex], markIds:reduxMarkIds  }];
				  };
			      return { data, currentIndex };
			   }, {
			      data: [],
			      currentIndex: 0
			   }).data;
			}
			
			
			var rectangles_array = groupArraySF(sfData.data);
*/

            var template_rectangles = [];
            var categoryColumnName = curveNames[0];

            var Depth = null;
            var categoryDepthFirst = null;
            var categoryDepthLast = null;
            var categoryName = null;
            var categoriesRectangles = [];
            var categoriesDomain = [];
            var categoryColorFunc;

            var categoryRows = [];

            for (let index = 0; index < allDataViewRows.length; index++) {
                let dataviewRow = allDataViewRows[index];

                let nextDataViewRow = null;
                if (allDataViewRows[index + 1]) {
                    nextDataViewRow = allDataViewRows[index + 1];
                }

                Depth = dataviewRow.continuous(depthCurveName).value();
                let nextDepth = null;
                if (nextDataViewRow) {
                    nextDepth = nextDataViewRow.continuous(depthCurveName).value();
                } else {
                    nextDepth = Depth;
                }

                if (!isNaN(Depth) && Depth !== null) {
                    if (categoryName == dataviewRow.categorical(categoryColumnName).formattedValue()) {
                        categoryDepthLast = nextDepth;
                    }

                    if (
                        categoryName != dataviewRow.categorical(categoryColumnName).formattedValue() ||
                        index == allDataViewRows.length - 1
                    ) {
                        if (categoryName && categoryName != "(Empty)") {
                            if (!categoriesDomain.includes(categoryName)) {
                                categoriesDomain.push(categoryName);
                            }
                            categoriesRectangles.push({
                                top: categoryDepthFirst,
                                bottom: categoryDepthLast,
                                category: categoryName,
                                categoryRows: categoryRows
                            });
                        }
                        categoryDepthFirst = Depth;
                        categoryDepthLast = nextDepth;
                        categoryRows = [];
                    }
                    categoryName = dataviewRow.categorical(categoryColumnName).formattedValue();
                    categoryRows.push(dataviewRow);
                }
            }

            let range = [
                "#1f77b4",
                "#aec7e8",
                "#ff7f0e",
                "#ffbb78",
                "#2ca02c",
                "#98df8a",
                "#d62728",
                "#ff9896",
                "#9467bd",
                "#c5b0d5",
                "#8c564b",
                "#c49c94",
                "#e377c2",
                "#f7b6d2",
                "#7f7f7f",
                "#c7c7c7",
                "#bcbd22",
                "#dbdb8d",
                "#17becf",
                "#9edae5"
            ];

            categoriesDomain = categoriesDomain.sort();

            // Needs updating to some kind of Spotfire colour scheme, when we work with categories?
            categoryColorFunc = d3.scaleOrdinal(d3.schemeCategory10).domain(categoryDomain);

            for (let i = 0; i < categoriesRectangles.length; i++) {
                let categoryRectangle = categoriesRectangles[i];
                if (categoryRectangle.category) {
                    function rectClick(event, a, b) {
                        var markMode = "Replace";
                        event.preventDefault();
                        event.stopPropagation();
                        if (event.shiftKey) {
                            markMode = "Add";
                        } else if (event.ctrlKey) {
                            markMode = "Toggle";
                        }
                        _dataView.mark(categoryRectangle.categoryRows, markMode);
                    }

                    function rectMouseOver(evt) {
                        focus.style("display", null);

                        tooltipDiv.transition().duration(500).style("opacity", 0.9);

                        var elem = this;
                        if (elem.nodeName == "text") {
                            elem = elem.previousElementSibling;
                        }

                        if (this.attributes.rectCategoryId) {
                            d3.select("#" + this.attributes.rectCategoryId.value).style("stroke", "black");
                            d3.select("#" + this.attributes.rectCategoryId.value).style("stroke-width", "2");
                        }
                    }

                    function rectMouseOut(d) {
                        focus.style("display", "none");

                        tooltipDiv.transition().duration(500).style("opacity", 0);

                        var elem = this;
                        if (elem.nodeName == "text") {
                            elem = elem.previousElementSibling;
                        }
                        if (this.attributes.rectCategoryId) {
                            d3.select("#" + this.attributes.rectCategoryId.value).style("stroke", "black");
                            d3.select("#" + this.attributes.rectCategoryId.value).style("stroke-width", "0.5");
                        }
                    }

                    svg.append("rect")
                        .datum(categoryRectangle.markIds)
                        .attr("id", "Rect" + (categoryRectangle.top * 100).toFixed() + "_" + i)
                        .attr("class", "rectCategory")
                        .attr("x", margin.left)
                        .attr("y", y(categoryRectangle.top))
                        .attr("width", width - margin.right - margin.left)
                        .attr("height", Math.abs(y(categoryRectangle.top) - y(categoryRectangle.bottom)))
                        //.style("cursor", "pointer")
                        .style("stroke-width", 0.5)
                        .style("stroke", "black")
                        .style("fill", "none")
                        .style("fill", categoryColorFunc(categoryRectangle.category))
                        .style("opacity", 0.7);

                    var fgObj = svg.append("foreignObject")
                        .attr("x", margin.left)
                        .attr("y", y(categoryRectangle.top))
                        .attr("width", width - margin.right - margin.left)
                        .attr("height", Math.abs(y(categoryRectangle.top) - y(categoryRectangle.bottom)))
                        //.style("cursor", "pointer")
                        .on("mousedown", rectClick)
                        .on("mousemove", mousemove);

                    var fgDiv = fgObj.append("xhtml:div")
                        .attr("id", "fgObj" + categoryRectangle.top + "_" + i)
                        .attr("rectCategoryId", "Rect" + (categoryRectangle.top * 100).toFixed() + "_" + i)
                        .style("height", "100%")
                        .style("text-align", "center")
                        .style("overflow", "hidden")
                        .style("word-wrap", "break-word")
                        .style("position", "relative")
                        .style("display", "flex")
                        .style("justify-content", "center")
                        //.style("cursor", "pointer")
                        .style("background-color", "transparent")
                        .style("align-items", "center")
                        .style("padding-left", "2px")
                        .style("padding-right", "2px")
                        .on("mouseout", rectMouseOut)
                        .on("mouseover", rectMouseOver)
                        .on("mousedown", rectClick);

                    fgDiv
                        .append("span")
                        .style("display", "inline-block")
                        .style("overflow", "hidden")
                        .style("font-size", "11px")
                        .style("color", "black")
                        .style("font-family", "sans-serif, Roboto")
                        .style("background-color", "transparent")
                        .style("pointer-events", "none")
                        //.style("cursor", "pointer")
                        //.on('mouseout', rectMouseOut )
                        //.on("mouseover", rectMouseOver )
                        //.on("mousedown", rectClick )
                        .text(function (d) {
                            if (Math.abs(y(categoryRectangle.top) - y(categoryRectangle.bottom)) >= 11) {
                                return categoryRectangle.category;
                            } else {
                                return "";
                            }
                        });
                }
            }
        }
    } catch (err) {
        console.log("Could not draw rectangle in logPlot function. error= ", err);
    }

    ////////////////   Prepare Tooltips   ///////////////////

    function getTooltipPositionX(xFunction, xArgument) {
        if (xFunction && xArgument && xFunction(xArgument) && typeof xArgument != "string") {
            var xVal = xFunction(xArgument);
            if (xVal < margin.left) {
                xVal = margin.left;
            } else if (xVal > width - margin.right) {
                xVal = width - margin.right;
            }
            return xVal;
        } else if (margin.left) {
            return margin.left;
        } else {
            return 1;
        }
    }

    let curve_x_func = x_functions_for_each_curve[curveNames[0]];

    var second_curve = null;
    var second_curve_x_func = null;

    if (templateCurves["fill"][0]["curve2"]) {
        second_curve = templateCurves["fill"][0]["curve2"];
        second_curve_x_func = x_functions_for_each_curve[second_curve];
    }

    var filter = svg
        .append("defs")
        .append("filter")
        .attr("id", "tooltipBackground")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 1)
        .attr("height", 1);

    filter.append("feFlood").attr("flood-color", "rgba(255, 255, 255, 0.85)").attr("result", "bg");

    var feMerge = filter.append("feMerge").attr("flood-color", "black").attr("result", "bg");

    feMerge.append("feMergeNode").attr("in", "bg");

    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    var focus = svg.append("g").style("display", "none");

    //JSViz marking code ////////////////////////////
    /*
    function markModel(markMode, rectangle) {
        // Implementation of logic to call markIndices or markIndices2 goes here
        var indicesToMark = [];
        var markData = {};
    
        var js_chart = d3.select('#js_chart')._groups[0][0];
        var header = d3.select('.trackHeaderDiv')._groups[0][0]; 
        var headerHeight = parseFloat(header.style.height.replace(/\D/g,''))   + parseFloat(header.style.marginBottom.replace(/\D/g,''));
        console.dir( headerHeight  );
        
        
        markData.markMode = markMode;
    
        
        var y0 = y_function.invert(rectangle.y - headerHeight + js_chart.scrollTop);
        var y1 = y_function.invert(rectangle.y - headerHeight + rectangle.height + js_chart.scrollTop);
    
        var depthIndex = getCurveIndex(depthCurveName, sfData);	
        
        var bisectData = d3.bisector( function(d) { return d.items[depthIndex]; } ).left; 
    
        var i = bisectData(sfData.data, y0);
        
        var d1 = sfData.data[i];
        var d0 = sfData.data[i - 1];                              
    
        var d = null;
            
        if (d0 && d1) {
            if (d0[depthIndex] && d1[depthIndex]) {		
                 d = (y0 - d0[depthIndex] > d1[depthIndex] - y0) ? d1 : d0;
            }
        }
        if (d == null) { d = d1; }
        if (d == null) { d = d0; }
    
        var j = d.hints.index;
        
        while (sfData.data[j].items[depthIndex] <= y1) {
            indicesToMark.push(sfData.data[j].hints.index);
            j = j+1;
        }
    
    */

    function mousemove(evt) {
        if (!tooltipDiv) {
            tooltipDiv = d3.select("#mod-container" + "_tooltip");
        }
        if (tooltipDiv) {
            tooltipDiv.transition().duration(400).style("opacity", 0);
        }

        var rectColor = null;
        var target = evt.target || evt.srcElement;

        if (target.attributes.rectcategoryid) {
            target = d3.select("#" + target.attributes.rectcategoryid.value)._groups[0][0];
            rectColor = target.style["fill"];
        }

        var curveColor0 = "black";
        var curveColor1 = "black";
        if (target.attributes.curveColors) {
            var curveColorsArray = target.attributes.curveColors.value.split(",");
            if (curveColorsArray[0]) {
                curveColor0 = curveColorsArray[0];
            }
            if (curveColorsArray[1]) {
                curveColor1 = curveColorsArray[1];
            }
        } else if (rectColor) {
            curveColor0 = rectColor;
        }

        var bisectData = d3.bisector(function (d) {
            return d.continuous(depthCurveName).value();
        }).left;

        var y0;

        y0 = y.invert(d3.pointer(evt)[1]);

        var i = bisectData(allDataViewRows, y0);

        var d1 = allDataViewRows[i];
        var d0 = allDataViewRows[i - 1];

        var d = null;

        if (d0 && d1) {
            if (d0.continuous(depthCurveName).value() && d1.continuous(depthCurveName).value()) {
                d = y0 - d0.continuous(depthCurveName).value() > d1.continuous(depthCurveName).value() - y0 ? d1 : d0;
            }
        }
        if (d == null) {
            d = d1;
        }
        if (d == null) {
            d = d0;
        }
        let value0;
        let value1;

        if (curveNames[0] == "ZONE" || curveNames[0] == "FACIES") {
            value0 = d0.categorical(curveNames[0]).formattedValue();
        } else {
            ///            value0 = d0.continuous(curveNames[0]).value();
        }
        if (curveNames[1] == "ZONE" || curveNames[1] == "FACIES") {
            value1 = d1.categorical(curveNames[1]).formattedValue();
        } else {
            ///            value1 = curveNames[1] ? d1.continuous(curveNames[1]).value() : "";
        }

        if (tooltipDiv) {
            let modContainer = d3.select("#mod-container")._groups[0][0];

            tooltipDiv.html(
                (d.continuous(depthCurveName).value()
                    ? depthCurveName + ": " + d.continuous(depthCurveName).value().toFixed(2) + "<br>"
                    : "") +
                    (curveNames[0] && value0
                        ? "<span style='border:1px solid navy; background-color:" +
                          curveColor0 +
                          "';>&nbsp;&nbsp;</span>&nbsp;" +
                          curveNames[0] +
                          ": " +
                          value0 +
                          "<br>"
                        : "") +
                    (curveNames[1] && value1
                        ? "<span style='border:1px solid navy; background-color:" +
                          curveColor1 +
                          "';>&nbsp;&nbsp;</span>&nbsp;" +
                          curveNames[1] +
                          ": " +
                          value1 +
                          "<br>"
                        : "")
            );

            let tooltipX = target.parentNode.parentNode.offsetLeft + getTooltipPositionX(curve_x_func, value0) + 10;

            let tooltipY = evt.pageY > modContainer.clientHeight - 40 ? evt.pageY - 40 : evt.pageY + 10;

            tooltipDiv.style("left", tooltipX + "px");
            tooltipDiv.style("top", tooltipY + "px");

            tooltipDiv.transition().duration(600).style("opacity", 0.9);
        }

        focus
            .select(".x")
            .attr("transform", "translate(" + getTooltipPositionX(curve_x_func, value0) + "," + 0 + ")")
            .attr("y2", height);

        //// circle and lines
        focus
            .select(".y")
            .attr(
                "transform",
                "translate(" +
                    getTooltipPositionX(curve_x_func, value0) +
                    "," +
                    y(d.continuous(depthCurveName).value()) +
                    ")"
            )
            .text(value0 ? value0 : "")
            .style("cursor", "default");

        focus
            .select(".yl")
            .attr("transform", "translate(" + 0 + "," + y(d.continuous(depthCurveName).value()) + ")")
            .text(value0 ? value0 : "")
            .style("cursor", "default");
    }
    // x line
    focus
        .append("line")
        .attr("class", "x")
        .style("stroke", "red")
        .style("stroke-dasharray", "3,3")
        .style("cursor", "default")
        .style("opacity", 0.6)
        .attr("y1", 0)
        .attr("y2", width);

    // y line
    focus
        .append("line")
        .attr("class", "yl")
        .style("stroke", "blue")
        .style("stroke-dasharray", "3,3")
        .style("cursor", "default")
        .style("opacity", 0.6)
        .attr("x1", 0)
        .attr("x2", height);

    // circle
    focus
        .append("circle")
        .attr("class", "y")
        .style("fill", curveColors[0] ? curveColors[0] : "black")
        .style("cursor", "default")
        .style("stroke", curveColors[0] ? curveColors[0] : "black")
        .attr("r", 3);
}
/*
function multipleLogPlot(div_id, templates, sfData) {
    d3.select("#" + div_id)
        .style("margin", "0")
        .style("padding", "0")
        .style("border", "0");

    let noDIV = d3
        .select("#" + div_id)
        .selectAll("div")
        .remove();
    let noSVG = d3
        .select("#" + div_id)
        .selectAll("svg")
        .remove();
    //if(spinner) { spinner.stop(); }

    //d3.select("#js_chart").attr("class","StyledScrollbar");

    let new_templates = [];
    for (let i = 0; i < templates.length; i++) {
        if (templates[i]) {
            let curvebox_holder = d3.select("#" + div_id).append("div");

            curvebox_holder
                .style("vertical-align", "middle")
                .attr("id", div_id + "curvebox_holder" + i)
                .style("display", "inline-block");
            //.style("height", "600px")
            //.style("overflow-y", "auto");

            templates[i][0]["curve_box"]["div_id"] = div_id + "curvebox_holder" + i;
            new_templates.push(templates[i]);
            let template = templates[i];
            let check = curveBox(template, sfData);
        }
    }
    return new_templates;
}
*/

function insertDropdown(divContent, i, k, templates, name, allDataViewRows) {
    var blackImgSrc =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAWCAYAAAALmlj4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QMcFisWTT0lnAAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAQElEQVRo3u3RQREAMAgEsVIn518kWODNJBJ2K0k/zvoSGIzBGIzBGIzBGGwwBmMwBmMwBmOwwRiMwRiMwRjMzgDeaAGOTpcEwwAAAABJRU5ErkJggg==";
    var blueImgSrc =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAWCAYAAAALmlj4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QMcFiwfe6AL/wAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAQklEQVRo3u3RQREAMAjAsDFj0zCx6AMLvLlEQhvvZx3WuhIYjMEYjMEYjMEYbDAGYzAGYzAGY7DBGIzBGIzBGMxMA1xFAnAyqCnPAAAAAElFTkSuQmCC";
    var browImgSrc =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAWCAYAAAALmlj4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QMcFi8OOj14zgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAQklEQVRo3u3RQREAMAjAsDE/MzOFOAULvLlEQhv5Xx3WuhIYjMEYjMEYjMEYbDAGYzAGYzAGY7DBGIzBGIzBGMxMAzpcAkr9SQwZAAAAAElFTkSuQmCC";
    var cyanImgSrc =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAWCAYAAAALmlj4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QMcFi4yDEk1CAAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAQ0lEQVRo3u3RMREAMAgAsVJl9T9VAk7AAjOXSPiPl78Oa10JDMZgDMZgDMZgDDYYgzEYgzEYgzHYYAzGYAzGYAxmpgH43AMbZ0AaDQAAAABJRU5ErkJggg==";
    var darkGreenImgSrc =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAWCAYAAAALmlj4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QMcFjAEF7KfTgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAQElEQVRo3u3RQREAMAgEsaNa8W8BLPTNJBJ2K50JZz0JDMZgDMZgDMZgDDYYgzEYgzEYgzHYYAzGYAzGYAzmzwIHywGPhL+wxQAAAABJRU5ErkJggg==";
    var fuchsiaImgSrc =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAWCAYAAAALmlj4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QMcFi0bZdb+pwAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAQklEQVRo3u3RQREAMAjAsDEN8zaVaAQLvLlEQhv5fh3WuhIYjMEYjMEYjMEYbDAGYzAGYzAGY7DBGIzBGIzBGMxMAxjkAkOZ/77xAAAAAElFTkSuQmCC";
    var greenImgSrc =
        " data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAWCAYAAAALmlj4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QMcFiwFhsLyhQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAQUlEQVRo3u3RMREAMAgAsVJ9HeoUiWCBmUsk/MfLX4e1rgQGYzAGYzAGYzAGG4zBGIzBGIzBGGwwBmMwBmMwBjPTVL4CdviVG3UAAAAASUVORK5CYII=";
    var purpleImgSrc =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAWCAYAAAALmlj4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QMcFjAqy2SSgQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAQklEQVRo3u3RQREAMAjAsDEzMz0ROAQLvLlEQhv/ZR3WuhIYjMEYjMEYjMEYbDAGYzAGYzAGY7DBGIzBGIzBGMxMA8ooAp7n28MtAAAAAElFTkSuQmCC";
    var redImgSrc =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAWCAYAAAALmlj4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QMcFiwzSXhnHAAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAQ0lEQVRo3u3RMREAMAgAsVJRNVD/btjBAjOXSPiP/K8Oa10JDMZgDMZgDMZgDDYYgzEYgzEYgzHYYAzGYAzGYAxmpgHS8wKYEczv4wAAAABJRU5ErkJggg==";
    var yellowImgSrc =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAWCAYAAAALmlj4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QMcFi0vRGIKEgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAQUlEQVRo3u3RQREAMAjAsDFb+FeDCLDAm0sktNGV/TjrS2AwBmMwBmMwBmOwwRiMwRiMwRiMwQZjMAZjMAZjMDsDiRsDUEqMEY8AAAAASUVORK5CYII=";

    var interpolateBluesImgSrc =
        "data:image/png;base64,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";
    var interpolateRedsImgSrc =
        "data:image/png;base64,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";
    var interpolateRdBuImgSrc =
        "data:image/png;base64,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";
    var interpolateViridisImgSrc =
        "data:image/png;base64,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";
    var interpolatePlasmaImgSrc =
        "data:image/png;base64,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";
    var interpolateCoolImgSrc =
        "data:image/png;base64,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";
    var interpolateWarmImgSrc =
        "data:image/png;base64,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";
    var interpolateSpectralImgSrc =
        "data:image/png;base64,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";

    var selectedValue;

    if (templates[i]) {
        var template = templates[i];
        let template_components = template[0]["components"];
        let templateCurves = template_components[0]["curves"];
        ///let curveNames = templateCurves[0]["curveNames"];

        if (name == "Thickness") {
            selectedValue = templateCurves[0]["strokeWidth"][k];
        } else if (name == "LineStyle") {
            selectedValue = templateCurves[0]["curveStrokeDashArray"][k];
        } else if (name == "LineColor") {
            selectedValue = document.querySelector(`#lineColor${i}`).value;
        } else if (name == "AreaFill") {
            selectedValue =
                templateCurves[0]["fill"][k]["fill"] == "no"
                    ? "none"
                    : (selectedValue = templateCurves[0]["fill"][k]["fillDirection"]);
        } else if (name == "AreaFill2Curve") {
            selectedValue =
                templateCurves[0]["fill"][k]["fill"] == "no"
                    ? "none"
                    : (selectedValue = templateCurves[0]["fill"][k]["fillDirection"]);
        } else if (name == "ScaleType") {
            selectedValue = templateCurves[0]["scaleTypeLinearLog"][k];
        } else if (name == "AreaColor") {
            selectedValue = colorHelpers.getFillColorName(templateCurves[0]["fill"][k]["fillColors"][0]);
            if (selectedValue == "")
                selectedValue = colorHelpers.getColorInterpolator(templateCurves[0]["fill"][k]["colorInterpolator"][0]);
        }
    }

    var ddData = {
        Thickness: [
            {
                value: "0.5",
                selected: selectedValue == "0.5",
                imageSrc:
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAWCAYAAAALmlj4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QMcEDYCrAbhTwAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAJ0lEQVRo3u3QMQEAAAjAoNk/tMbwgQgUAAAAAMC7qVYDAAAAAPDrANGGAQGwy0nIAAAAAElFTkSuQmCC"
            },
            {
                value: "1",
                selected: selectedValue == "1",
                imageSrc:
                    " data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAWCAYAAAALmlj4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QMcEgYuQhxvMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAMUlEQVRo3u3RgQ0AIAzDsMLN/X+cgTTZJyQJAAAAwBKn7ciweHASgxe7EgAAAAAA/z152ANfmNe9RQAAAABJRU5ErkJggg=="
            },
            {
                value: "2",
                selected: selectedValue == "2",
                imageSrc:
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAWCAYAAAALmlj4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QMcEDcgYH2R6gAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAALklEQVRo3u3RQREAIAzAsIJ/z0MFn10ioS0AAACAJU41Mux1JTAYgwEAAADgswcP0wEH8eRpiAAAAABJRU5ErkJggg=="
            }
        ],

        LineStyle: [
            {
                value: "5,5" /*"Dashed*/,
                selected: selectedValue == "5,5",
                imageSrc:
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAWCAYAAAALmlj4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QMcFhQuPeG3PgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAP0lEQVRo3u3RsREAMQgDQdEzZdCzvwE79vhnNxSXkQAAAAD8RHX32h1mpna7/q2+kqzT8w+7/q0eAAAAAOC2D9SJMgOI63fYAAAAAElFTkSuQmCC"
            },
            {
                value: "2,2" /*"Dotted"*/,
                selected: selectedValue == "2,2",
                imageSrc:
                    " data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAWCAYAAAALmlj4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QMcFhAd5l0TLAAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAMklEQVRo3u3IwQkAMAwDMQ/t/ZNPdygECe5zCQAAAMAVbaft+Dd/kszLv/kBAAAAAH5bd8iGEY6YaMQAAAAASUVORK5CYII="
            },
            {
                value: "solid",
                selected: selectedValue == "solid",
                imageSrc:
                    " data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAWCAYAAAALmlj4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QMcEggvq5hyKQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAMUlEQVRo3u3RgQ0AIAzDsMLN/X+cgTTZJyQJAAAAwBKn7ciweHASgxe7EgAAAAAA/z152ANfmNe9RQAAAABJRU5ErkJggg=="
            }
        ],

        LineColor: [
            { value: "black", selected: selectedValue == "black", imageSrc: blackImgSrc },
            { value: "green", selected: selectedValue == "green", imageSrc: greenImgSrc },
            { value: "blue", selected: selectedValue == "blue", imageSrc: blueImgSrc },
            { value: "red", selected: selectedValue == "red", imageSrc: redImgSrc },
            { value: "fuchsia", selected: selectedValue == "fuchsia", imageSrc: fuchsiaImgSrc },
            { value: "yellow", selected: selectedValue == "yellow", imageSrc: yellowImgSrc },
            { value: "cyan", selected: selectedValue == "cyan", imageSrc: cyanImgSrc },
            { value: "brown", selected: selectedValue == "brown", imageSrc: browImgSrc },
            { value: "darkgreen", selected: selectedValue == "darkgreen", imageSrc: darkGreenImgSrc },
            { value: "purple", selected: selectedValue == "purple", imageSrc: purpleImgSrc }
        ],
        AreaFill: [
            { text: "None", value: "none", selected: selectedValue == "none" },
            { text: "Left", value: "left", selected: selectedValue == "left" },
            { text: "Right", value: "right", selected: selectedValue == "right" }
        ],
        AreaFill2Curve: [
            { text: "None", value: "none", selected: selectedValue == "none" },
            { text: "Left", value: "left", selected: selectedValue == "left" },
            { text: "Right", value: "right", selected: selectedValue == "right" },
            { text: "Between", value: "between", selected: selectedValue == "between" }
        ],

        ScaleType: [
            { text: "Linear", value: "linear", selected: selectedValue == "linear" },
            { text: "Log", value: "log", selected: selectedValue == "log" }
        ],

        AreaColor: [
            { value: "black", selected: selectedValue == "black", imageSrc: blackImgSrc },
            { value: "green", selected: selectedValue == "green", imageSrc: greenImgSrc },
            { value: "blue", selected: selectedValue == "blue", imageSrc: blueImgSrc },
            { value: "red", selected: selectedValue == "red", imageSrc: redImgSrc },
            { value: "yellow", selected: selectedValue == "yellow", imageSrc: yellowImgSrc },
            //{ value: "cyan", selected: (selectedValue == "cyan"), imageSrc: cyanImgSrc },
            //{ value: "brown", selected: (selectedValue == "brown"), imageSrc: browImgSrc },
            //{ value: "darkgreen", selected: (selectedValue == "darkgreen"), imageSrc: darkGreenImgSrc },
            //{ value: "purple", selected: (selectedValue == "purple"), imageSrc: purpleImgSrc }
            {
                value: "interpolateBlues",
                selected: selectedValue == d3.interpolateBlues,
                imageSrc: interpolateBluesImgSrc
            },
            {
                value: "interpolateReds",
                selected: selectedValue == d3.interpolateReds,
                imageSrc: interpolateRedsImgSrc
            },
            {
                value: "interpolateRdBu",
                selected: selectedValue == d3.interpolateRdBu,
                imageSrc: interpolateRdBuImgSrc
            },
            {
                value: "interpolateSpectral",
                selected: selectedValue == d3.interpolateSpectral,
                imageSrc: interpolateSpectralImgSrc
            },
            {
                value: "interpolateViridis",
                selected: selectedValue == d3.interpolateViridis,
                imageSrc: interpolateViridisImgSrc
            },
            //{ value: "interpolatePlasma", selected: (selectedValue == d3.interpolatePlasma), imageSrc: interpolatePlasmaImgSrc},
            //{ value: "interpolateWarm", selected: (selectedValue == d3.interpolateWarm), imageSrc: interpolateWarmImgSrc },
            { value: "interpolateCool", selected: selectedValue == d3.interpolateCool, imageSrc: interpolateCoolImgSrc }
        ]
    };

    var dropdownButton = divContent.append("select").attr("id", "dropdown" + name + "_" + i + "_" + k);

    let NCurves = templates[i][0]["components"][0]["curves"][0]["curveNames"].length;

    let name2 = name == "AreaFill" && NCurves >= 2 ? "AreaFill2Curve" : name;

    $("#dropdown" + name + "_" + i + "_" + k).ddslick({
        data: ddData[name2],
        //height: "15px",
        width: "100px",
        defaultSelectedIndex: 0,
        selectText: "Select an item",
        onSelected: function (data) {
            var selData = data.selectedData;
            PropertyOnChange(i, k, templates, allDataViewRows, selData, name);
        }
    });
}

/**
 * Aha! This is called when we change something in the templates - and we call multipleLogplots() to re-draw the charts
 * Todo: persist the templates in Spotfire properties ;-)
 * @param {} i "track number"
 * @param {*} p
 * @param {*} templates
 * @param {*} allDataViewRows
 * @param {*} selectedData  "json with options for the propName"
 * @param {String} propName "name property to change. For example LineColor"
 */

function PropertyOnChange(i, p, templates, allDataViewRows, selectedData, propName) {
    if (templates[i] && initialized) {
        var template = templates[i];
        let template_components = template[0]["components"];
        let templateCurves = template_components[0]["curves"];
        let curveNames = templateCurves[0]["curveNames"];

        //change thickness
        if (propName == "Thickness") {
            templateCurves[0]["strokeWidth"][p] = selectedData.value;
        }

        //change LineStyle
        else if (propName == "LineStyle") {
            templateCurves[0]["curveStrokeDashArray"][p] = selectedData.value;
        }

        //change LineColor
        else if (propName == "LineColor") {
            templateCurves[0]["curveColors"][p] = selectedData.value;
        }

        //change AreaFill
        else if (propName == "AreaFill") {
            if (selectedData.value == "none") {
                templateCurves[0]["fill"][p]["fill"] = "no";
            } else {
                templateCurves[0]["fill"][p]["fill"] = "yes";
                templateCurves[0]["fill"][p]["fillDirection"] = selectedData.value;
            }
        }

        //change AreaColor
        else if (propName == "AreaColor") {
            templateCurves[0]["fill"][p]["fillColors"] = [
                colorHelpers.getFillColor(selectedData.value, "normal"),
                colorHelpers.getFillColor(selectedData.value, "dark"),
                colorHelpers.getFillColor(selectedData.value, "light")
            ];
            templateCurves[0]["fill"][p]["colorInterpolator"] = [selectedData.value, null, null];
        }

        //change ScaleType
        else if (propName == "ScaleType") {
            templateCurves[0]["scaleTypeLinearLog"][p] = selectedData.value;
        }

        //change curveName
        else if (propName == "curveName") {
            var curveName = selectedData.value;
            curveNames[p] = curveName;

            // var curveNamesCopy=[...curveNames]
            var j = p > 0 ? p - 1 : 0;
            templateCurves[0]["fill"][j].curveName = [...curveNames][j];
            templateCurves[0]["fill"][j].curve2 = [...curveNames][p];
            templateCurves[0]["fill"][p].curveName = [...curveNames][j];
            templateCurves[0]["fill"][p].curve2 = [...curveNames][p];

            //var fillCurveNames = [...curveNames]
            //fillCurveNames.push(fillCurveNames.shift(0)) //[a,b,c,d] --> [b,c,d,a]
        }

        //copy first curve
        else if (propName == "duplicateCurve") {
            //duplicates first curve properties (arrays such as colors, style, curvName, etc)
            var templateCurvesCopy = JSON.parse(JSON.stringify(templateCurves));
            for (p in templateCurves[0]) {
                if (Array.isArray(templateCurves[0][p])) templateCurves[0][p].push(templateCurvesCopy[0][p][0]);
            }
            //          for (p in templateCurves[0]["fill"]) {if (Array.isArray(templateCurves[0]["fill"][p])) templateCurves[0]["fill"][p].push(templateCurves[0]["fill"][p][0])}

            //add a tab
            var k = curveNames.length - 1;
            var tid = `tab_${i}_${k}`;
            var ul = d3.select(`#tabs_${i} ul`);
            ul.insert("li", `:nth-child(${k + 1})`)
                .append("a")
                .attr("href", `#${tid}`)
                .append("span")
                .text(curveNames[0]);

            //add tab panels (placeholder)
            //d3.select(`#tabs_${i}`).append("div").attr("id",tid).append("P").html(tid);

            //populate tab
            var tabs = d3.select("#" + "tabs_" + i);
            addAccordionTabContents(i, k, curveNames, tabs, templates, allDataViewRows, ["#333333"]);

            //refresh tabs
            $("#" + "tabs_" + i)
                .tabs()
                .tabs("refresh");
            $("#" + "tabs_" + i).tabs("option", "active", k); //makes the new tab active

            //update tab and accordion name
            let anAccordionHeader = document.querySelector("#accordionConf h3[aria-expanded='true'] span").nextSibling;
            let aTab = document.querySelector(`a[href='#tab_${i}_${k - 1}']`);
            aTab.innerText = curveNames[k - 1];
            anAccordionHeader.textContent = `Track ${i + 1}: ` + curveNames.join();
        }

        //delete last curve
        else if (propName == "removeCurve") {
            var k = curveNames.length - 1;
            if (k) {
                //don't remove last curve
                //remove curve: item from all templateCuves arrays (colors, style, curvName, etc)
                for (var kk in templateCurves[0]) {
                    if (Array.isArray(templateCurves[0][kk])) templateCurves[0][kk].pop();
                }

                var ttr = `#tab_${i}_${k}`;

                //remove last tab
                // document.querySelector(`a[href='${ttr}']`).parentElement.remove()  //another (non jquery) way to remove tab
                $(`a[href='${ttr}']`).closest("li").remove();

                //remove last tab contents
                $(ttr).remove();

                //refresh tabs
                $("#" + "tabs_" + i)
                    .tabs()
                    .tabs("refresh");

                //update tab and accordion name
                let anAccordionHeader = document.querySelector(
                    "#accordionConf h3[aria-expanded='true'] span"
                ).nextSibling;
                let aTab = document.querySelector(`a[href='#tab_${i}_${k - 1}']`);
                aTab.innerText = curveNames[k - 1];
                anAccordionHeader.textContent = `Track ${i + 1}: ` + curveNames.join();
            }
        }

        // Store the updated template in the appropriate mod property
        _mod.property("template" + i).set(JSON.stringify(templates[i]));
        multipleLogPlot(templates, allDataViewRows);
    }
}

//adds a tab to an accordion panel and populates with properties
//i is track
//k is the curve for that track
function addAccordionTab(i, k) {}

function insertTextInput(divContent, i, k, templates, propName, allDataViewRows) {
    var selectedData = "";

    if (templates[i]) {
        var template = templates[i];
        let template_components = template[0]["components"];
        let templateCurves = template_components[0]["curves"];

        if (propName == "ScaleMin") {
            selectedData = templateCurves[0]["fill"][k]["minScaleX"];
        } else if (propName == "ScaleMax") {
            selectedData = templateCurves[0]["fill"][k]["maxScaleX"];
        } else if (propName == "CutoffShaleSilt") {
            selectedData = templateCurves[0]["fill"][k]["cutoffs"][1];
        } else if (propName == "CutoffSiltSand") {
            selectedData = templateCurves[0]["fill"][k]["cutoffs"][2];
        }
    }

    divContent
        .append("input")
        .attr("type", "number")
        .attr("id", "TextInput" + propName + "_" + i + "_" + k)
        .style("font-size", "13px")
        .style("width", "95px")
        .attr("value", selectedData)
        .on("input", function (d) {
            if (templates[i] && initialized) {
                var template = templates[i];
                let template_components = template[0]["components"];
                let templateCurves = template_components[0]["curves"];

                if (propName == "ScaleMin") {
                    templateCurves[0]["fill"][k]["minScaleX"] = selectedData;
                } else if (propName == "ScaleMax") {
                    templateCurves[0]["fill"][k]["maxScaleX"] = selectedData;
                } else if (propName == "CutoffShaleSilt") {
                    templateCurves[0]["fill"][k]["cutoffs"][1] = selectedData;
                } else if (propName == "CutoffSiltSand") {
                    templateCurves[0]["fill"][k]["cutoffs"][2] = selectedData;
                }

                multipleLogPlot(templates, allDataViewRows);
            }
        });
}

//creates a jquery accordion. Each panel contains one or more tabs
//an accordion panel represents a track (template)
//a tab is a curve for each track (template_components[0]["curves"][0];)
async function accordionTemplate(templates, i, allDataViewRows) {
    let template = templates[i];
    let template_components = template[0]["components"];
    let templateCurves = template_components[0]["curves"][0];

    if (templateCurves["dataType"] == "curve") {
        let curveNames = templateCurves["curveNames"];
        let curveColors = templateCurves["curveColors"];

        d3.select("#accordionConf")
            .append("h3")
            .text("Track " + (i + 1) + ": " + curveNames);

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

        var tabs = content.append("div").attr("id", "tabs_" + i);
        var ul = tabs.append("ul");
        for (let k = 0; k < curveNames.length; k++) {
            if (curveNames[k]) {
                ul.append("li")
                    .append("a")
                    .attr("href", "#tab_" + i + "_" + k)
                    .text(curveNames[k]);
            }
        }

        // Add a "[+]" tab, so you can add another measure to this track
        ul.append("li")
            .append("a")
            .attr("href", "#tab_" + i + "_addTabButton")
            .attr("title", "Duplicates this track")
            .html("+")
            .on("mousedown", (evt) => {
                PropertyOnChange(i, curveNames.length, templates, allDataViewRows, null, "duplicateCurve");
                //addAccordionTabContents(i,curveNames.length,curveNames,tabs,templates,sfData,curveColors)

                //TODO duplicate code goes here or on PropertyOnChange
                evt.preventDefault;
            });

        // Add a "[-]" tab, so you can remove the previous measure from this track
        ul.append("li")
            .append("a")
            .attr("href", "#tab_" + i + "_addTabButton")
            .attr("title", "Removes last track")
            .html("-")
            .on("mousedown", (evt) => {
                PropertyOnChange(i, curveNames.length, templates, allDataViewRows, null, "removeCurve");
                evt.preventDefault;
            });

        // The contents of the tabs
        for (let k = 0; k < curveNames.length; k++) {
            await addAccordionTabContents(i, k, curveNames, tabs, templates, allDataViewRows, curveColors);
        }
    }

    $("#" + "tabs_" + i).tabs();
}

//i: accordion panel index
//k: tab index
//
async function addAccordionTabContents(i, k, curveNames, tabs, templates, allDataViewRows, curveColors) {
    if (curveNames[k]) {
        var tab = tabs.append("div").attr("id", "tab_" + i + "_" + k);

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
            .attr("id", "dropdown_measure_selector_" + k + "_" + i);

        //generate dropdown options for track curve
        let measureDdOptions = [];
        let categoryLeaves = (await (await _dataView.hierarchy("Category")).root()).leaves();
        for (let leaf of categoryLeaves) {
            measureDdOptions.push({
                value: leaf.key,
                selected: curveNames[k] == leaf.key,
                text: leaf.key
            });
        }

        $("#dropdown_measure_selector_" + k + "_" + i).ddslick({
            data: measureDdOptions,
            //height: "15px",
            width: "100px",
            defaultSelectedIndex: 0,
            selectText: "Select an item",
            onSelected: function (data) {
                var selData = data.selectedData;
                PropertyOnChange(i, k, templates, allDataViewRows, selData, "curveName");

                //update tab and accordion name
                let anAccordionHeader = document.querySelector(
                    "#accordionConf h3[aria-expanded='true'] span"
                ).nextSibling;
                let aTab = document.querySelector(`a[href='#tab_${i}_${k}']`);
                aTab.innerText = curveNames[k];
                anAccordionHeader.textContent = `Track ${i + 1}: ` + curveNames.join();
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
        insertDropdown(divItem, i, k, templates, "Thickness", allDataViewRows);

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
            .attr("id", `lineColor_${i}_${k}`)
            .attr("type", "color")
            .attr("value", `${curveColors[k]}">`)
            .on("change", function () {
                // use "change" or "input" events. "input" might be slower but updates the graph instantly
                //            .html(`<input style="width:95px;height: 15px;" id="lineColor_${i}_${k}" type="color" value="${curveColors[k]}">`)
                PropertyOnChange(
                    i,
                    k,
                    templates,
                    allDataViewRows,
                    document.getElementById(`lineColor_${i}_${k}`),
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
        insertDropdown(divItem, i, k, templates, "LineStyle", allDataViewRows);

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
        insertDropdown(divItem, i, k, templates, "AreaFill", allDataViewRows);

        //Area Color
        divItem = controlgroup
            .append("div")
            .attr("class", "controlGroupDiv")
            .on("mousedown", function (evt) {
                evt.stopPropagation();
            });
        divItem.text("Color:").append("br");
        insertDropdown(divItem, i, k, templates, "AreaColor", allDataViewRows);

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
        insertDropdown(divItem, i, k, templates, "ScaleType", allDataViewRows);

        controlgroup = fieldset.append("div").attr("class", "controlgroup");

        //Scale Min
        divItem = controlgroup
            .append("div")
            .attr("class", "controlGroupDiv")
            .on("mousedown", function (evt) {
                evt.stopPropagation();
            });
        divItem.text("Min:").append("br");
        insertTextInput(divItem, i, k, templates, "ScaleMin", allDataViewRows);

        divItem = controlgroup
            .append("div")
            .attr("class", "controlGroupDiv")
            .on("mousedown", function (evt) {
                evt.stopPropagation();
            });
        divItem.text("Max:").append("br");
        insertTextInput(divItem, i, k, templates, "ScaleMax", allDataViewRows);

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
        insertTextInput(divItem, i, k, templates, "CutoffShaleSilt", allDataViewRows);

        divItem = controlgroup
            .append("div")
            .attr("class", "controlGroupDiv")
            .on("mousedown", function (evt) {
                evt.stopPropagation();
            });
        divItem.text("Silt/Sand:").append("br");
        insertTextInput(divItem, i, k, templates, "CutoffSiltSand", allDataViewRows);
    }
}

//
/**
 * renders all the vertical line chart tracks.
 * @param  {Array} templates array of templates. Each one represents one track
 * @param  {Array} allDataViewRows dataview rows
 */
async function multipleLogPlot(templates, allDataViewRows) {
    let div_id = "mod-container";

    // AJB todo - don't remove everything every time (eventually)
    d3.select("#mod-container")
    .selectAll("*")
    .remove();

    //I guess this portion clears the plots
    for (let i = 0; i < templates.length; i++) {
        d3.select("#" + div_id + "TrackHolder" + i)
            .selectAll("div")
            .remove();
        d3.select("#" + div_id + "TrackHolder" + i)
            .selectAll("svg")
            .remove();
        d3.select("#" + div_id + "TrackHolder" + i).remove();
    }

    var TracksDepthLabel = d3.select("#" + div_id).append("div");

    TracksDepthLabel.attr("id", "TracksDepthLabel")
        .style("vertical-align", "middle")
        .style("display", "inline-block")
        .style("position", "relative")
        .style("width", depthLabelPanelWidth + "px")
        .on("mousedown", function (event) {
            event.stopPropagation();
        });

    TracksDepthLabel = TracksDepthLabel.append("div")
        .style("position", "fixed")
        .style("top", window.innerHeight * 0.5 + "px")
        .style("left", "5px")
        .attr("height", window.innerHeight);

    var depth_label_svg = TracksDepthLabel.append("svg").attr("height", 300).attr("width", 20);

    let depthCurveName = "DEPTH";
    let depthUnit = "m";
    depth_label_svg
        .append("text")
        .style("fill", "black")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-90) translate(0,10)")
        .text(depthCurveName + (depthUnit != "" ? " (" + depthUnit + ")" : ""))
        .style("fill", _mod.getRenderContext().styling.general.font.color);

    var TracksToolDiv = d3.select("#" + div_id).append("div");

    TracksToolDiv.style("vertical-align", "top")
        .attr("id", "TracksToolDiv")
        .style("display", "inline-flex")
        .style("flex-direction", "column")
        .style("justify-content", "center")
        .style("align-items", "center")
        .style("position", "fixed")
        .style("bottom", "0px")
        .style("right", "20px")
        .style("width", ZoomPanelWidth + "px")
        .on("mousedown", function (event) {
            event.stopPropagation();
        });

    /*
        var confBtn = TracksToolDiv.append("div")
            .attr("id", "confBtnDiv")
            .style("margin-top", "20px")
            .append("input")
            .attr("id", "confBtn")
            .attr("type", "image")
            .attr(
                "src",
                " data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QMeFywep2yZ1QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAGNUlEQVRIx61WXWxUWxX+9s+cc6at58DMXIb+RTo18UKDTWjDgxgu5cbEGH3QNHrvgz4YSdtrTKSE8ELCC0p6iYS3oUUIGsPVRIlRch+EF4mQEEtMbit1dIQBbDvTH4b5PXPm7L2XL7djy08gxp2ch7Mevm+v9a31rc3wBmdmZiZaKpW+LYRISik9zjkFQVBWShX6+/t/PTo66r8OQ74JUbFYHNm2bdtBznkr5jhOp1Lq87lcbg3A9f+J6OzZs19kjH2fc/77ycnJ3zHG3iIiJBIJtLe3g4hQr9exsrICpVQcAM6cOfNV27ZHGWM/P3r06J+ex2TPB6ampr5j2/aIbdsIwxCVSuVvkUikx3Vdr7e3F7ZtAwDCMMTDhw9Rq9VKWut/t7W1DViWBd/3oZS6efz48aubccXmn9OnT78fjUbftSwLyWQSQRDAsqwdUkrHGINkMvnfUkiJtbU1SCkd27Z3CCGwc+dO1Go1AEgdPnz4Mzdv3vzkhYympqa+JKX8nmVZSKVSsCwLjDEsLS2hvb0d27dvh9YajG0tQqlUQrVaRXd3N4gISilks1k0Gg0YY3524sSJO1s0CoLgW9FoFMlkEpZlAQCICF1dXQAA3/dRKBRQrVZBROjo6EAymYTneXBdF0TUyjSZTCKfz6NUKr0HYCuR4zjX6vX6dxcXF+G6LoQQLbL79+8jl8tBSgnGWAt0bm4Ou3btwsDAQCtDIsLy8jJ834eU8toLGt24cSM3MjLyWc75ziAI4HkeGGO4ffs21tfXwTlHs9lEo9EohmFY01q3SSlRrVZRKBTQ09MDAHj8+DHq9TrK5fLdU6dO/bal0cmTJ61IJPIOEXUppb7guu723t5exGIxZDIZPHnyBFpr+L7/TwA/TafTTQCYmJiwAPzIsqy3LctCd3c3BgYGsL6+vkFWJqK/EtETxtifJWNs1LKsdxljjIigtUYsFoPWGrlcDpxz+L7/93Q6/eHmJviU8MPx8fFjkUhk4NGjR+jv70csFsODBw/gOI5LRO8AQL1e75SMsR1ExDo7O+F5HqLRKJRSWFlZAeccYRiCiC6+auIZY1fCMDwbiUSQz+fR09OD4eFhVKtVVCoVLC4ugoje4kEQ2EopuK4Ly7KgtQYAVCoVMMZgjGleuHCh+CqidDq9rrVucs5Rq9VgjEEYhrBtG57nQSmFZrNpcyKCMeYFACLa6DB6nY8RkdnA2TxnxpjWxwH4xhg8e/YMtVoNSikYY9DW1gZjDKSU9tjYWMerSMbGxjqEEA4Rob29HcYYKKVQq9VQLBahtYYQoikBFMIwRDabbd3iwIEDSCQSWFhYgJSShBA/ADD1MiIhxA8jkQhprVkikQAR4e7duxv6bWSUF+fOncvMz8/LMAwbSqmolNKWUrZuV6lUGOc8sW/fvs8NDQ1lZmdnfQAYHx+P7d+//wPbtt8WQrCuri4kEgkUCgUUi0X4vl82xvxDKTU7MjLymy3GNTk5+YEQYjgWi2H37t1gjOHevXvwfR9EhCAIWjpwziGlBOcc0WgUw8PDMMYgm80in89Da/2X8+fPp19whmPHjh3WWn+FMYbBwUFsiNvd3Q3f9+H7PoQQiEQikFJCCAHGGOLxOPbu3dvqVs/zsLS0BKVU98GDB/07d+78a4vX+b7/Dcuy0NfX19Jqo/v6+/uRSqWwvLyMcrkMIoLrui3H1lq3uhQAUqkUMpkMyuXy1wH8cQuRlPJqGIZHMpkMXNeFbdswxiCXyyEWi8HzPCSTyS07KQxDVKtVrK6uoq+vD4wxNJtNLCwsIAxDOI7zq5du2ImJifeJ6MuccwwODmJ+fr6VmdYahw4dajk3Ywy3bt2CEAJEBM459uzZg7m5OWitYYy5MTMz89FLN+zs7Oz80NCQZ4zZtbq6CqUUlFJZrbXDOY/E4/HWrqrValhcXESz2WwQ0aMwDGOrq6vQWiMIgpuXLl36aDM2f34upqenfxGNRq/6vl8TQvzh4sWLPwFwT2uNp0+fol6vw/f91jBqrWenp6d/HI1GrwdBUHcc55dXrly5+trHycvOkSNHvkZE33w+/mlZr12+fPn6/+VdF4/HP15bWxtsNBptUkpHKWWEECFjrOq67sdvgvEfBu05dDtxgGIAAAAASUVORK5CYII="
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
            }); */

    /*get template header height*/

    function getTemplateHeaderHeight(template) {
        let template_components = template[0]["components"];
        let templateCurves = template_components[0]["curves"][0];
        ///let template_rectangles = template_components[0]["rectangles"];
        let curveNames = templateCurves["curveNames"];
        var NumberOfGradientScales = 0;
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

    let headersContainerDiv = d3.select("#" + div_id).append("div")
        .attr("id", "headersContainer"); 
        
    // Add a div for the tracks/plots

    let trackHoldersContainerDiv = d3.select("#" + div_id).append("div")
        .attr("id", "trackHoldersContainer")
        .on("mousedown", function (mouseDownEvent) {
            var getMarkMode = function (e) {
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
        
            mouseDownEvent.preventDefault();
        
            var markMode = getMarkMode(mouseDownEvent);
            //
            // Create initial marking rectangle, will be used if the user only clicks.
            //
            var x = mouseDownEvent.pageX,
                y = mouseDownEvent.pageY,
                width = 1,
                height = 1;
        
            var $selection = $("<div/>")
                .css({
                    position: "absolute",
                    border: "1px solid #0a1530",
                    "background-color": "#8daddf",
                    opacity: "0.5"
                })
                .hide()
                .appendTo(this);
        
            $(this).on("mousemove", function (mouseMoveEvent) {
                x = mouseDownEvent.clientX;
                y = mouseMoveEvent.clientY;
                width = Math.abs(mouseDownEvent.clientX - mouseMoveEvent.clientX);
                height = Math.abs(mouseDownEvent.clientY - mouseMoveEvent.clientY);
        
                $selection.css({
                    left: x + "px",
                    top: y + "px",
                    width: width + "px",
                    height: height + "px"
                });
        
                $selection.show();
            });
        
            $(this).on("mouseup", function () {
                var rectangle = {
                    x: x,
                    y: y,
                    width: width,
                    height: height
                };
                //
                // markModel is (optionally) implemented in the visualization js code
                //
                if (typeof markModel != "undefined") {
                    markModel(markMode, rectangle);
                }
        
                $selection.remove();
                $(this).off("mouseup mousemove");
            });
        });

    //setup trackholders
    let templatesToPlot = [];
    let headerHeight = 0;

    // Calculate the maximum header height and use this for all tracks
    // Add the track holder divs for each template
    // Collect the templates to be plotted
    for (let ii = 0; ii < templates.length; ii++) {
        let template = templates[ii];
        let templateHeaderHeight = getTemplateHeaderHeight(template);
        headerHeight = templateHeaderHeight > headerHeight ? templateHeaderHeight : headerHeight;
        if (template) {
            let TrackHolder = d3.select("#" + div_id).append("div");

            TrackHolder.style("vertical-align", "middle")
                .attr("id", div_id + "TrackHolder" + ii)
                .style("display", "inline-block")
                .style("overflow-y", "hidden");

            template[0]["trackBox"]["div_id"] = div_id + "TrackHolder" + ii;
            templatesToPlot.push(template);
        }
    }

    //needs to be outside the loop because we are finding the maxHeaderHeight there
    templatesToPlot.forEach((template, i) => {
        logPlot(template, allDataViewRows, headerHeight + "px");
    });

    //update accordion panels
    if (updateAccordionTools) {
        for (const i of templates.keys()) await accordionTemplate(templates, i, allDataViewRows);
        updateAccordionTools = false;
    }

    $("#accordionConf").accordion({ collapsible: true });

    // add the tooltip area to the webpage
    d3.select("#" + "mod-container" + "_tooltip").remove();
    tooltipDiv = d3
        .select("#" + div_id)
        .append("div")
        .attr("class", "tooltip")
        .attr("id", "mod-container" + "_tooltip")
        .style("opacity", 0);

    initialized = true;
}
