import * as d3 from "d3";
import * as colorHelpers from "./color-helpers.js";

const $ = require("jquery");

var tooltipDiv;
var y_function; 
export const DEPTHLABELPANELWIDTH = 15;
export const ZOOMPANELWIDTH = 32;
import * as uiConfig from "./ui-config.js"; 


export async function logPlot(template_for_plotting, headerHeight,_verticalZoomHeightMultiplier, _dataView, _mod, trackCount, windowSize) {
    
     // add the tooltip area to the webpage
     d3.select("#" + "mod-container" + "_tooltip").remove();
     tooltipDiv = d3
         .select("#mod-container")
         .append("div")
         .style("visibility", "hidden")        
         .style("top", "0")
         .attr("class", "tooltip")
         .attr("id", "mod-container" + "_tooltip")
         .style("opacity", 0);

    let template_overall = template_for_plotting[0]["trackBox"];
    let template_components = template_for_plotting[0]["components"];
    let templateCurves = template_components[0]["curves"][0];
    let dataType = templateCurves["dataType"];

    let div_id = template_overall["div_id"];

    let height = template_overall["height"] * _verticalZoomHeightMultiplier - 120;
    ///console.log(height);
    let height_components = template_overall["height"];
    let width = template_overall["width"];
    width = Math.round((await _mod.windowSize()).width / (trackCount + 1.00)); //JLL _mod.windowSize and window.innerWith are the same. I have to reduce by some extra space to avoid wrapping. the constant makes the whitespace on the right wider if increases.
    //console.log(trackCount, window.innerWidth, (await _mod.windowSize()).width, width ) 
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
        .style("overflow-y", "hidden")
        .style("position", "sticky")
        .style("top", 0)
        .style("background-color", await _mod.getRenderContext().styling.general.backgroundColor)
        .style("z-index", 1)
        .style("height", headerHeight)
        .style("display", "inline-flex")
        .style("flex-direction", "row")
        .style("align-items", "flex-end")
        .style("margin-bottom", "10px")

        //this is the gear configuration button
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
            document.getElementById("config_menu").style.visibility="visible";
            //ui_config.config_menu_open(d); //d should be the accordion index
            let k=div_id.slice(-1);
            var accordionTab = document.querySelectorAll(".ui-accordion-header")[k];
            if (accordionTab.getAttribute("aria-expanded") == "false") accordionTab.click();
        });

    var trackHeaderDivContent = trackHeaderDiv;

    const trackPlotDiv = d3
        .select("#trackHoldersContainer")
        .append("div")
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

    const logPlot_sub_div = trackPlotDiv
        .append("div")
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
    let depthMin = d3.min(valueRows, (d) => d.depth) || 0;
    let depthMax = d3.max(valueRows, (d) => d.depth) || 0;
    y = d3
        .scaleLinear()
        .domain([depthMax, depthMin])
        .range([height - margin.bottom - margin.top, margin.top]);

    let yAxis = function (g) {
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
        svg.attr("class", "components").attr("width", width).attr("height", height).style("margin", "0 auto");
        //.style("overflow-y", "visible");

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
        .data(valueRows)
        .attr("curveColors", curveColors)
        .attr("width", width - margin.left)
        .attr("x", margin.left)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", tooltipMouseover)
        .on("mouseout", tooltipMouseout)
        .on("mousemove", (event, d) => mousemove(event, valueRows));

    function tooltipMouseover(evt) {
        console.log("tooltipMouseover");
        focus.style("display", null);
        tooltipDiv.transition().duration(600).style("opacity", 0.9);
    }

    function tooltipMouseout(evt) {
        focus.style("display", "none");
        tooltipDiv.transition().duration(400).style("opacity", 0);
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

    async function mousemove(evt, data) {
        console.log("data", data);
        
        // Find the index of the data row that contains the data underneath the pointer
        let y0;
        y0 = y.invert(d3.pointer(evt)[1]);

        //... by bisecting the data, which finds the index that our y0 would be
        // Note that the performance of this doesn't seem to be too good
        let bisectData = d3.bisector(function (d) {
            return d["depth"];
        }).left;

        let index = bisectData(data, y0);

        let row = data[index];

        // console.log("mousemove");
        if (!tooltipDiv) {
            tooltipDiv = d3.select("#mod-container" + "_tooltip");
        }
        if (tooltipDiv) {
            tooltipDiv.transition().duration(400).style("opacity", 0);
        }

        var target = evt.target || evt.srcElement;
        // todo - make this more d3-like...
        let curveColorsArray;

        if (target.attributes.curveColors) {
            console.log("target", target.attributes.curveColors);
            curveColorsArray = target.attributes.curveColors.value.split(",");
        }

        console.log("curveColors", curveColorsArray);
        console.log("row", row);
        if (tooltipDiv) {
            console.log("curveNames", curveNames);
            let tooltipContent = depthCurveName + ": " + row["depth"].toFixed(2) + "<br>";
            for (let i = 0; i < curveNames.length; i++) {
                tooltipContent += curveNames[i] +  "<span style='border:1px solid navy; background-color:" +
                curveColorsArray[i] +
                "';>&nbsp;&nbsp;</span>&nbsp;" +
                ": " +
                row[curveNames[i]] +
                "<br>";
            }
            tooltipDiv.html(tooltipContent);

            let tooltipX = target.parentNode.parentNode.offsetLeft + getTooltipPositionX(curve_x_func, row[curveNames[0]]) + 10;
            let modContainer = d3.select("#mod-container");
            console.log(tooltipX);
            let tooltipY = evt.pageY > windowSize.height - 60 ? evt.pageY - 40 : evt.pageY + 10;
            console.log("Setting tooltip style");
            tooltipDiv.style("left", tooltipX + "px");
            tooltipDiv.style("top", tooltipY + "px")
                .style("visibility", "visible");

            tooltipDiv.transition().duration(600).style("opacity", 0.9);
            console.log(tooltipDiv);
        }

        focus
            .select(".x")
            .attr("transform", "translate(" + getTooltipPositionX(curve_x_func, row[curveNames[0]]) + "," + 0 + ")")
            .attr("y2", height);

        //// circle and lines
        focus
            .select(".y")
            .attr(
                "transform",
                "translate(" +
                    getTooltipPositionX(curve_x_func, row[curveNames[0]]) +
                    "," +
                    y(row["depth"]) +
                    ")"
            )
            .text(row[curveNames[0]] ? row[curveNames[0]] : "")
            .style("cursor", "default");

        focus
            .select(".yl")
            .attr("transform", "translate(" + 0 + "," + y(row["depth"]) + ")")
            .text(row[curveNames[0]] ? row[curveNames[0]] : "")
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
//var _verticalZoomHeightMultiplier = 5.0;
}

//
/**
 * JLL move to another module?? Along with logPlot
 * renders all the vertical line chart tracks.
 * @param  {Array} templates array of templates. Each one represents one track
 * @param  {Array} allDataViewRows dataview rows
 */
export async function multipleLogPlot(templates, allDataViewRows, _mod, _isInitialized, _verticalZoomHeightMultiplier, _verticalZoomHeightProperty, _dataView, windowSize) {
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
                " data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QMeFywep2yZ1QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAGNUlEQVRIx61WXWxUWxX+9s+cc6at58DMXIb+RTo18UKDTWjDgxgu5cbEGH3QNHrvgz4YSdtrTKSE8ELCC0p6iYS3oUUIGsPVRIlRch+EF4mQEEtMbit1dIQBbDvTH4b5PXPm7L2XL7djy08gxp2ch7Mevm+v9a31rc3wBmdmZiZaKpW+LYRISik9zjkFQVBWShX6+/t/PTo66r8OQ74JUbFYHNm2bdtBznkr5jhOp1Lq87lcbg3A9f+J6OzZs19kjH2fc/77ycnJ3zHG3iIiJBIJtLe3g4hQr9exsrICpVQcAM6cOfNV27ZHGWM/P3r06J+ex2TPB6ampr5j2/aIbdsIwxCVSuVvkUikx3Vdr7e3F7ZtAwDCMMTDhw9Rq9VKWut/t7W1DViWBd/3oZS6efz48aubccXmn9OnT78fjUbftSwLyWQSQRDAsqwdUkrHGINkMvnfUkiJtbU1SCkd27Z3CCGwc+dO1Go1AEgdPnz4Mzdv3vzkhYympqa+JKX8nmVZSKVSsCwLjDEsLS2hvb0d27dvh9YajG0tQqlUQrVaRXd3N4gISilks1k0Gg0YY3524sSJO1s0CoLgW9FoFMlkEpZlAQCICF1dXQAA3/dRKBRQrVZBROjo6EAymYTneXBdF0TUyjSZTCKfz6NUKr0HYCuR4zjX6vX6dxcXF+G6LoQQLbL79+8jl8tBSgnGWAt0bm4Ou3btwsDAQCtDIsLy8jJ834eU8toLGt24cSM3MjLyWc75ziAI4HkeGGO4ffs21tfXwTlHs9lEo9EohmFY01q3SSlRrVZRKBTQ09MDAHj8+DHq9TrK5fLdU6dO/bal0cmTJ61IJPIOEXUppb7guu723t5exGIxZDIZPHnyBFpr+L7/TwA/TafTTQCYmJiwAPzIsqy3LctCd3c3BgYGsL6+vkFWJqK/EtETxtifJWNs1LKsdxljjIigtUYsFoPWGrlcDpxz+L7/93Q6/eHmJviU8MPx8fFjkUhk4NGjR+jv70csFsODBw/gOI5LRO8AQL1e75SMsR1ExDo7O+F5HqLRKJRSWFlZAeccYRiCiC6+auIZY1fCMDwbiUSQz+fR09OD4eFhVKtVVCoVLC4ugoje4kEQ2EopuK4Ly7KgtQYAVCoVMMZgjGleuHCh+CqidDq9rrVucs5Rq9VgjEEYhrBtG57nQSmFZrNpcyKCMeYFACLa6DB6nY8RkdnA2TxnxpjWxwH4xhg8e/YMtVoNSikYY9DW1gZjDKSU9tjYWMerSMbGxjqEEA4Rob29HcYYKKVQq9VQLBahtYYQoikBFMIwRDabbd3iwIEDSCQSWFhYgJSShBA/ADD1MiIhxA8jkQhprVkikQAR4e7duxv6bWSUF+fOncvMz8/LMAwbSqmolNKWUrZuV6lUGOc8sW/fvs8NDQ1lZmdnfQAYHx+P7d+//wPbtt8WQrCuri4kEgkUCgUUi0X4vl82xvxDKTU7MjLymy3GNTk5+YEQYjgWi2H37t1gjOHevXvwfR9EhCAIWjpwziGlBOcc0WgUw8PDMMYgm80in89Da/2X8+fPp19whmPHjh3WWn+FMYbBwUFsiNvd3Q3f9+H7PoQQiEQikFJCCAHGGOLxOPbu3dvqVs/zsLS0BKVU98GDB/07d+78a4vX+b7/Dcuy0NfX19Jqo/v6+/uRSqWwvLyMcrkMIoLrui3H1lq3uhQAUqkUMpkMyuXy1wH8cQuRlPJqGIZHMpkMXNeFbdswxiCXyyEWi8HzPCSTyS07KQxDVKtVrK6uoq+vD4wxNJtNLCwsIAxDOI7zq5du2ImJifeJ6MuccwwODmJ+fr6VmdYahw4dajk3Ywy3bt2CEAJEBM459uzZg7m5OWitYYy5MTMz89FLN+zs7Oz80NCQZ4zZtbq6CqUUlFJZrbXDOY/E4/HWrqrValhcXESz2WwQ0aMwDGOrq6vQWiMIgpuXLl36aDM2f34upqenfxGNRq/6vl8TQvzh4sWLPwFwT2uNp0+fol6vw/f91jBqrWenp6d/HI1GrwdBUHcc55dXrly5+trHycvOkSNHvkZE33w+/mlZr12+fPn6/+VdF4/HP15bWxtsNBptUkpHKWWEECFjrOq67sdvgvEfBu05dDtxgGIAAAAASUVORK5CYII="
            )
            .on("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();                    
                    vanilla_drawer.config_menu_open();
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
                    let _scrollTop = currentTarget.scrollTop;
                    let  y0 = y_function.invert(rectangle.y);
                    let  y1 = y_function.invert(rectangle.y + rectangle.height);
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
    let curveCount = templates.length;
    templates.forEach((template, i) => {

        logPlot(template, headerHeight + "px", _verticalZoomHeightMultiplier,  _dataView, _mod, curveCount, windowSize);
    });

    // Apply the height and scroll settings after everything has been rendered - AJB todo - remove hard coded value!
    // let modContainer = d3.select("#mod-container")._groups[0][0];
    let modContainer = d3.select("#mod-container");


    trackHoldersContainerDiv.attr(
        "style",
        "height:" +
            (modContainer.node().getBoundingClientRect().height -
                headersContainerDiv.node().getBoundingClientRect().height -
                100) +
            "px;" +
            "overflow-y:scroll"
    );

    // JLL: what is this for?
    // Just calling scrollTop() doesn't work - hence the need to animate
    // -- would be preferable to do this in a d3 native way rather than jQuery, but d3 doesn't seem to work...
    // $("#trackHoldersContainer").animate({ scrollTop: _scrollTop }, 10);


 

}


