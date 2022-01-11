import * as d3 from "d3";
import * as colorHelpers from "./color-helpers.js";



export async function logPlot(template_for_plotting, allDataViewRows, headerHeight,_verticalZoomHeightMultiplier, _mod, _dataView, yAxis) {
    let template_overall = template_for_plotting[0]["trackBox"];
    let template_components = template_for_plotting[0]["components"];
    let templateCurves = template_components[0]["curves"][0];
    let dataType = templateCurves["dataType"];

    let div_id = template_overall["div_id"];
    let k = div_id.slice(-1);

    let height = template_overall["height"] * _verticalZoomHeightMultiplier - 120;
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
            //ui_config.drawer_menu_open(d); //d should be the accordion index
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

    ///y_function = y;

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

    //////////////  Rectangles for Categories ////////////// JLL move to another module
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

                    var fgObj = svg
                        .append("foreignObject")
                        .attr("x", margin.left)
                        .attr("y", y(categoryRectangle.top))
                        .attr("width", width - margin.right - margin.left)
                        .attr("height", Math.abs(y(categoryRectangle.top) - y(categoryRectangle.bottom)));
                    //.style("cursor", "pointer")
                    //.on("mousedown", rectClick)
                    //.on("mousemove", mousemove);

                    var fgDiv = fgObj
                        .append("xhtml:div")
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
                        .style("padding-right", "2px");
                    //.on("mouseout", rectMouseOut)
                    //.on("mouseover", rectMouseOver)
                    //.on("mousedown", rectClick);

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

    function mousemove(evt) {
        // console.log("mousemove");
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
            // console.log("Setting tooltip style");
            tooltipDiv.style("left", tooltipX + "px");
            tooltipDiv.style("top", tooltipY + "px")
                .style("visibility", "visible");

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
//var _verticalZoomHeightMultiplier = 5.0;
}
