/*
 * Copyright © 2020. TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */

//@ts-check
import * as d3 from "d3";
import { sliderRight } from "d3-simple-slider";
import { invalidateTooltip } from "./extended-api.js";
import { plot_template as default_plot_templates } from "./PlotTemplate.js";

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
    // Implementation of logic to call markIndices or markIndices2 goes here
    var indicesToMark = [];
    var markData = {};

    var js_chart = d3.select('#mod-container')._groups[0][0];
    var header = d3.select('.trackHeaderDiv')._groups[0][0];
    var headerHeight = parseFloat(header.style.height.replace(/\D/g, '')) + parseFloat(header.style.marginBottom.replace(/\D/g, ''));
    // console.dir( headerHeight  );


    markData.markMode = markMode;


    var y0 = y_function.invert(rectangle.y - headerHeight + js_chart.scrollTop);
    var y1 = y_function.invert(rectangle.y - headerHeight + rectangle.height + js_chart.scrollTop);


    var bisectData = d3.bisector(function (d) { return d.continuous("DEPTH").value() }).left;
    let allRows = await _dataView.allRows();
    var i = bisectData(allRows, y0);

    var d1 = allRows[i];
    var d0 = allRows[i - 1];

    var d = null;

    if (d0 && d1) {
        if (d0.continuous("DEPTH").value() && d1.continuous("DEPTH").value()) {
            d = (y0 - d0.continuous("DEPTH").value() > d1.continuous("DEPTH").value() - y0) ? d1 : d0;
        }
    }
    if (d == null) { d = d1; }
    if (d == null) { d = d0; }

    // console.log(d);

    var j = i;
    let rowsToMark = [];
    while (allRows[j].continuous("DEPTH").value() <= y1) {
        rowsToMark.push(allRows[j]);

        j = j + 1;
    }
    _dataView.mark(rowsToMark, "Replace");

}


document.querySelector("body").addEventListener("mousedown", function (mouseDownEvent) {
    var getMarkMode = function (e) {
        if (e.shiftKey) {
            return "Add";
        }
        else if (e.ctrlKey) {
            return "Toggle";
        }

        return "Replace";
    };

    mouseDownEvent.preventDefault();

    var markMode = getMarkMode(mouseDownEvent);
    var x = mouseDownEvent.pageX,
        y = mouseDownEvent.pageY,
        width = 1,
        height = 1;

    var selection = document.createElement('div');
    selection.style.position = 'absolute';
    selection.style.border = '1px solid #0a1530';
    selection.style.backgroundColor = '#8daddf';
    selection.style.opacity = '0.5';
    selection.style.display = 'none';
    this.appendChild(selection);

    this.addEventListener("mousemove", function mouseMove(mouseMoveEvent) {
        x = Math.min(mouseDownEvent.pageX, mouseMoveEvent.pageX);
        y = Math.min(mouseDownEvent.pageY, mouseMoveEvent.pageY);
        width = Math.abs(mouseDownEvent.pageX - mouseMoveEvent.pageX);
        height = Math.abs(mouseDownEvent.pageY - mouseMoveEvent.pageY);

        selection.style.left = x + 'px';
        selection.style.top = y + 'px';
        selection.style.width = width + 'px';
        selection.style.height = height + 'px';

        selection.style.display = 'block';
    });

    this.addEventListener("mouseup", function mouseUp() {
        var rectangle = {
            'x': x,
            'y': y,
            'width': width,
            'height': height
        };

        if (typeof (markModel) != 'undefined') {
            markModel(markMode, rectangle);
        }

        this.removeChild(selection);
        this.removeEventListener("mouseup", mouseUp);
        this.removeEventListener("mousemove", mouseMove);
    });
});

// @todo - remove as many global vars as we can!
var tooltipDiv;
var plot_templates;
var ZoomPanelWidth = 32;
var depthLabelPanelWidth = 15;
var _verticalZoomHeightMultiplier = 5.0;
var _verticalZoomHeightProperty;
var sliderZoom;
var initialized = false;

var updateAccordionTools = true;
var vanilla_drawer;
var _dataView;
var yAxis;


//var pPerfilHeightMultiplier;

var y_function;

function getColorInterpolator(value) {
    if (value == "interpolateBlues") {
        return d3.interpolateBlues;
    } else if (value == "interpolateReds") {
        return d3.interpolateReds;
    } else if (value == "interpolateRdBu") {
        return d3.interpolateRdBu;
    } else if (value == "interpolateViridis") {
        return d3.interpolateViridis;
    } else if (value == "interpolatePlasma") {
        return d3.interpolatePlasma;
    } else if (value == "interpolateCool") {
        return d3.interpolateCool;
    } else if (value == "interpolateWarm") {
        return d3.interpolateWarm;
    } else if (value == "interpolateSpectral") {
        return d3.interpolateSpectral;
    } else {
        return null;
    }
}

function getFillColor(name, type) {
    if (name == "black") {
        if (type == "light") {
            return "#484848";
        } else if (type == "dark") {
            return "#000000";
        } else {
            return "#212121";
        }
    } else if (name == "green") {
        if (type == "light") {
            return "#80e27e";
        } else if (type == "dark") {
            return "#087f23";
        } else {
            return "#4caf50";
        }
    } else if (name == "blue") {
        if (type == "light") {
            return "#757de8";
        } else if (type == "dark") {
            return "#002984";
        } else {
            return "#3f51b5";
        }
    } else if (name == "red") {
        if (type == "light") {
            return "#ff7961";
        } else if (type == "dark") {
            return "#ba000d";
        } else {
            return "#f44336";
        }
    } else if (name == "fuchsia") {
        if (type == "light") {
            return "#e35183";
        } else if (type == "dark") {
            return "#78002e";
        } else {
            return "#ad1457";
        }
    } else if (name == "yellow") {
        if (type == "light") {
            return "#ffff72";
        } else if (type == "dark") {
            return "#c8b900";
        } else {
            return "#ffeb3b";
        }
    } else if (name == "cyan") {
        if (type == "light") {
            return "#00FFFF";
        } else if (type == "dark") {
            return "#008B8B";
        } else {
            return "#40E0D0";
        }
    } else if (name == "brown") {
        if (type == "light") {
            return "#CD853F";
        } else if (type == "dark") {
            return "#8B4513";
        } else {
            return "#A0522D";
        }
    } else if (name == "darkgreen") {
        if (type == "light") {
            return "#556B2F";
        } else if (type == "dark") {
            return "#004d00";
        } else {
            return "#006400";
        }
    } else if (name == "purple") {
        if (type == "light") {
            return "#d05ce3";
        } else if (type == "dark") {
            return "#6a0080";
        } else {
            return "#9c27b0";
        }
    } else if (name.search("interpolate") >= 0) {
        if (type == "light") {
            return "RGBA(255,255,255, 0.55)";
        } else if (type == "dark") {
            return "RGBA(0,0,0, 0.25)";
        } else {
            return "interpolator";
        }
    }
}


function getCurveData(lineIndex, curveName, sfData) {
    var item;
    if (curveName == "ZONE" || curveName == "FACIES" || curveName == "WELL") {
        item = sfData[lineIndex].categorical(curveName).formattedValue();
    } else {
        item = sfData[lineIndex].continuous(curveName).value();
    }

    return item;
}


/**
 * Renders the chart.
 * @param {Object} state
 * @param {Spotfire.Mod} mod
 * @param {Spotfire.DataView} dataView - dataView
 * @param {Spotfire.Size} windowSize - windowSize
 * @param {Spotfire.ModProperty<string>} verticalZoomHeightProperty - an example property
 * @param {Spotfire.ModProperty<string>} trackDocPropMappings - json array holding tracks definition
 * @param {Spotfire.ModProperty<string>} trackVisibility - json array holding tracks definition
 */
export async function render(state, mod, dataView, windowSize, verticalZoomHeightProperty, trackDocPropMappings, trackVisibility) {

    //clear canvas and console
    // d3.select("#mod-container").html("");
    console.clear()

    _dataView = dataView;
    _verticalZoomHeightProperty = verticalZoomHeightProperty;
    _verticalZoomHeightMultiplier = _verticalZoomHeightProperty.value();
    // console.log("Render called");
    if (state.preventRender) {
        // Early return if the state currently disallows rendering.
        return;
    }


    const styling = mod.getRenderContext().styling;
    const { tooltip, popout } = mod.controls;
    const { radioButton, checkbox } = popout.components;
    const { section } = popout;

    invalidateTooltip(tooltip);

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


    const allRows = await dataView.allRows();
    // console.log(allRows); 
    allRows.sort((a, b) => a.continuous("DEPTH").value() - b.continuous("DEPTH").value());

    if (allRows == null) {
        // Return and wait for next call to render when reading data was aborted.
        // Last rendered data view is still valid from a users perspective since
        // a document modification was made during a progress indication.
        return;
    }


    const margin = { top: 20, right: 40, bottom: 40, left: 80 };
    modContainer.style("height", windowSize.height - margin.bottom - margin.top).style("overflow-y", "scroll");


    var zoneLogTrackWidth = 120;


    /**
     *
     * Drawing code!
     *
     */

    var dataRows = await dataView.allRows();

    //number of tracks (also creates checkboxes based on the number of tracks)
    //create checkboxes
    var numberOfTracksString = await trackVisibility.value();
    let container = document.getElementById("track-visibility-checkboxes");
    container.innerHTML = "Track visibility: ";
    [...numberOfTracksString].forEach((bit, index) => {
        let checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.checked = bit === "1";
        checkbox.addEventListener('click', () => {
            let newVisibility = [...numberOfTracksString];
            newVisibility[index] = checkbox.checked ? "1" : "0";
            trackVisibility.set(newVisibility.join(""));
        });
    
        let label = document.createElement('label');
        label.textContent = `Track ${index + 1}: `;
        container.appendChild(label);
        container.appendChild(checkbox);
    });






    //lets use hardcoded template if nothing is already saved in the tarckDocPropMappings mod property
    if (await trackDocPropMappings.value() == "") {
        console.log("using default plot templates")
        plot_templates = default_plot_templates;
    } else {
        console.log("using saved plot templates")
        plot_templates = JSON.parse(await trackDocPropMappings.value());
    }


    //set width
    var numberOfTracks = [...trackVisibility.value()].reduce((a, b) => a + parseInt(b), 0);
    console.log(numberOfTracks, "<= number of tracks");
    
    var trackWidth = (window.innerWidth - zoneLogTrackWidth - zoneLogTrackWidth - ZoomPanelWidth - depthLabelPanelWidth - 30) / numberOfTracks;
    
    //fix widths
    plot_templates.forEach(x => {
        x[0].trackBox.height = window.innerHeight ;
        x[0].trackBox.width = trackWidth * 1.1;
    });


    //populate inputs
    mod.property("trackVisibility").then(p => {
        document.getElementById("trackVisibility").value = p.value()
    });

    //accept keystrokes
    document.getElementById("dialog").onmousedown = function (e) { e.stopPropagation() }

    //save settings
    document.getElementById("setSettings")?.addEventListener("click", () => {
        mod.property("trackVisibility").then(p => { p.set(document.getElementById("trackVisibility").value) })

        trackDocPropMappings.set(editor.getValue());
        console.log("saved");
    })

    //create ace editor
    //insted of using ace editor, it would be great to use https://github.com/json-editor/json-editor
    var editor = ace.edit("trackMappings");
    editor.setTheme("ace/theme/eclipse");
    editor.getSession().setMode("ace/mode/javascript");
    mod.property("trackDocPropMappings").then(q => {
        // let json = JSON.parse(q.value());
        let json = q.value();
        editor.setValue(JSON.stringify(plot_templates, null, 4));
        editor.clearSelection();
        // editor.setValue(JSON.stringify(json, null, 4));
    });
    
    
    multipleLogPlot("mod-container", plot_templates, dataRows, mod);
}

function logPlot(template_for_plotting, sfData, headerHeight, showDepthAxis) {
    //console.log(template_for_plotting)
    let template_overall = template_for_plotting[0]["trackBox"];
    let template_components = template_for_plotting[0]["components"];
    let templateCurves = template_components[0]["curves"][0];
    let dataType = templateCurves["dataType"];

    let div_id = template_overall["div_id"];
    d3.select("#" + div_id)
        .selectAll("*")
        .remove();
    let height = template_overall["height"] * _verticalZoomHeightMultiplier - 110;
    let height_components = template_overall["height"];
    // let width = template_overall["width"];
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

    let depthMin = d3.min(sfData, function (d, i) {
        return getCurveData(i, depthCurveName, sfData);
    });
    let depthMax = d3.max(sfData, function (d, i) {
        return getCurveData(i, depthCurveName, sfData);
    });

    //////////////  Initiate DIVs //////////////
    let svg;
    let trackHeaderDiv;

    trackHeaderDiv = d3
        .select("#" + div_id)
        .append("div")
        .attr("class", "trackHeaderDiv")
        .style("overflow-x", "visible")
        .style("overflow-y", "visible")
        .style("position", "sticky")
        .style("top", 0)
        .style("background-color", "white")
        .style("z-index", 1)
        .style("height", headerHeight)
        .style("display", "inline-flex")
        .style("flex-direction", "row")
        .style("align-items", "flex-end")
        .style("margin-bottom", "10px");

    var trackHeaderDivContent = trackHeaderDiv.append("div").attr("class", "trackHeaderDivContent");

    const trackPlotDiv = d3.select("#" + div_id).append("div");
    trackPlotDiv
        .attr("height", height_components + "px")
        .attr("class", "trackPlotDiv")
        .style("margin", 0)
        .style("padding", 0)
        .style("border", 0)
        .style("box-sizing", "border-box");

    const logPlot_sub_div = trackPlotDiv.append("div");
    logPlot_sub_div.attr("class", "component_inner").style("position", "relative");

    svg = logPlot_sub_div.append("svg");

    let x_functions_for_each_curve = {};

    let mins = [];
    let maxes = [];
    let curvesDescription = "";
    let y;


    //////////////////// define Y scale (depth)  ////////////////////

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
        var colorInterpolatorfills = [];

        if (templateCurves["fill"] && k < templateCurves["fill"].length) {
            minScaleX = templateCurves["fill"][k]["minScaleX"] ? templateCurves["fill"][k]["minScaleX"] : null;
            maxScaleX = templateCurves["fill"][k]["maxScaleX"] ? templateCurves["fill"][k]["maxScaleX"] : null;
            colorInterpolatorfills = templateCurves["fill"][k]["colorInterpolator"];
        }

        let min_this = d3.min(sfData, function (d, i) {
            return getCurveData(i, curveNames[k], sfData);
        });
        let max_this = d3.max(sfData, function (d, i) {
            return getCurveData(i, curveNames[k], sfData);
        });

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
            header_text_line = min.toFixed(1) + " - " + curveNames[k] + " " + curveUnit + " - " + max.toFixed(1);
        } else {
            header_text_line = curveNames[k];
        }


        //////////////  Building Track Components  //////////////
        svg.attr("class", "components")
            .attr("width", width)
            .attr("height", height)
            .style("margin", "0 auto")
            .style("overflow", "scroll");

        //axis label    
        if (showDepthAxis) svg.append("g").call(yAxis);

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

        let distance_from_top = "1em";

        //let svg_header = ""
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
            .attr("width", 222)// width - margin.right - margin.left - 1)
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
                        let fillColor = "gray";
                        let colorInterpolation = d3.interpolateSpectral;

                        if (number_colors !== 0) {
                            threshold = templateCurves["fill"][i]["cutoffs"][j];
                            fillColor = templateCurves["fill"][i]["fillColors"][j];
                            colorInterpolation = templateCurves["fill"][i]["colorInterpolator"][j];
                        }

                        if (fillColor == "interpolator" && colorInterpolation) {
                            let colorInterpolator_functions_for_each_curve = {};

                            if (scaleTypeLinearLog[k] == "linear") {
                                colorInterpolator_functions_for_each_curve[curveName1 + "_" + j] = d3
                                    .scaleSequential(colorInterpolation)
                                    .domain(x_functions_for_each_curve[curveName1].domain());
                            } else if (scaleTypeLinearLog[k] == "log") {
                                colorInterpolator_functions_for_each_curve[
                                    curveName1 + "_" + j
                                ] = d3
                                    .scaleSequentialLog(colorInterpolation)
                                    .domain(x_functions_for_each_curve[curveName1].domain());
                            }

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
                                .data(sfData)
                                .join("stop")
                                .attr("offset", function (d, i) {
                                    return (
                                        ((y(getCurveData(i, depthCurveName, sfData)) - y(depthMin)) /
                                            (y(depthMax) - y(depthMin))) *
                                        100.0 +
                                        "%"
                                    );
                                })
                                .attr("stop-color", function (d, i) {
                                    return !isNaN(getCurveData(i, curveName1, sfData))
                                        ? colorInterpolator_functions_for_each_curve[curveName1 + "_" + j](
                                            getCurveData(i, curveName1, sfData)
                                        )
                                        : "rgba(0,0,0,0)";
                                });

                            if (colorInterpolator_functions_for_each_curve[curveName1 + "_" + j]) {
                                var svg_legend_color_scale = trackHeaderDivContent.append("div").append("svg");
                                svg_legend_color_scale.attr("height", 20).attr("width", width);

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
                                    return x_functions_for_each_curve[curveName1](getCurveData(i, curveName1, sfData));
                                })
                                .x0(function (d, i) {
                                    return start_from_left;
                                })
                                .defined(function (d, i) {
                                    return (
                                        (getCurveData(i, curveName1, sfData) ||
                                            getCurveData(i, curveName1, sfData) == 0) &&
                                        getCurveData(i, curveName1, sfData) > threshold
                                    );
                                })
                                .y(function (d, i) {
                                    return y(getCurveData(i, depthCurveName, sfData));
                                });

                            svg.append("path")
                                .datum(sfData)
                                .attr("class", "area")
                                .attr("clip-path", "url('#clip')")
                                .attr("d", area1)
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
                                    return (
                                        (getCurveData(i, curveName1, sfData) ||
                                            getCurveData(i, curveName1, sfData) == 0) &&
                                        getCurveData(i, curveName1, sfData) > threshold
                                    );
                                })
                                .x0(function (d, i) {
                                    return x_functions_for_each_curve[curveName1](getCurveData(i, curveName1, sfData));
                                })
                                .y(function (d, i) {
                                    return y(getCurveData(i, depthCurveName, sfData));
                                });

                            svg.append("path")
                                .datum(sfData)
                                .attr("class", "area")
                                .attr("clip-path", "url('#clip')")
                                .attr("d", area1)
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
                                    return first_curve_x_func(getCurveData(i, curveName1, sfData));
                                })
                                .x0(function (d, i) {
                                    return second_curve_x_func(getCurveData(i, between_2_curve, sfData));
                                })
                                .defined(function (d, i) {
                                    return (
                                        (getCurveData(i, curveName1, sfData) ||
                                            getCurveData(i, curveName1, sfData) == 0) &&
                                        getCurveData(i, curveName1, sfData) > threshold &&
                                        (getCurveData(i, between_2_curve, sfData) ||
                                            getCurveData(i, between_2_curve, sfData) == 0) &&
                                        getCurveData(i, between_2_curve, sfData) > curve2Threshold &&
                                        first_curve_x_func(getCurveData(i, curveName1, sfData)) >
                                        second_curve_x_func(getCurveData(i, between_2_curve, sfData))
                                    );
                                })
                                .y(function (d, i) {
                                    return y(getCurveData(i, depthCurveName, sfData));
                                });

                            svg.append("path")
                                .datum(sfData)
                                .attr("class", "area")
                                .attr("clip-path", "url('#clip')")
                                .attr("d", area1)
                                .attr("stroke", "none")
                                .attr("fill", fillColor)
                                .attr("fill-opacity", getOpacity(j, threshold, curve2Threshold));

                            let area2 = d3.area();
                            area2
                                .x1(function (d, i) {
                                    return first_curve_x_func(getCurveData(i, curveName1, sfData));
                                })
                                .x0(function (d, i) {
                                    return second_curve_x_func(getCurveData(i, between_2_curve, sfData));
                                })
                                .defined(function (d, i) {
                                    return (
                                        getCurveData(i, curveName1, sfData) > threshold &&
                                        getCurveData(i, between_2_curve, sfData) > curve2Threshold &&
                                        first_curve_x_func(getCurveData(i, curveName1, sfData)) <
                                        second_curve_x_func(getCurveData(i, between_2_curve, sfData))
                                    );
                                })
                                .y(function (d, i) {
                                    return y(getCurveData(i, depthCurveName, sfData));
                                });

                            svg.append("path")
                                .datum(sfData)
                                .attr("class", "area")
                                .attr("clip-path", "url('#clip')")
                                .attr("d", area2)
                                .attr("stroke", "none")
                                .attr("fill", fillColor2)
                                .attr("fill-opacity", getOpacity(j, threshold, curve2Threshold));
                        }
                    }
                }
            }
            let line = d3
                .line()
                .x(function (d, i) {
                    if (isNaN(x_functions_for_each_curve[curveNames[k]](getCurveData(i, curveNames[k], sfData)))) {
                        return null;
                    } else {
                        return x_functions_for_each_curve[curveNames[k]](getCurveData(i, curveNames[k], sfData));
                    }
                })
                .y(function (d, i) {
                    return y(getCurveData(i, depthCurveName, sfData));
                })
                .defined(function (d, i) {
                    return getCurveData(i, curveNames[k], sfData) || getCurveData(i, curveNames[k], sfData) == 0
                        ? true
                        : false;
                });
            svg.append("path")
                .datum(sfData)
                .attr("fill", "none")
                .attr("clip-path", "url('#clip')")
                .attr("stroke", curveColors[k])
                .attr("stroke-width", templateCurves["strokeWidth"][k])
                .attr("stroke-linecap", templateCurves["strokeLinecap"][k])
                .attr("stroke-dasharray", curveStrokeDashArray[k])
                .attr("d", function (d, i) {
                    return line(d, i);
                });
        }
    }

    /* Marking Representation */

    function checkPreviousMarked(d, i) {
        if (i <= 0 || i > sfData.length) {
            return false;
        } else {
            return sfData[i - 1].isMarked();
        }
    }

    var areaMark = d3
        .area()
        .x0(margin.left)
        .x1(width - margin.right)

        .defined(function (d, i) {
            return d.isMarked() || checkPreviousMarked(d, i);
        })
        .y(function (d, i) {
            return y(getCurveData(i, depthCurveName, sfData));
        });

    var areaPath = svg
        .append("path")
        .datum(sfData)
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
            return d.isMarked() || checkPreviousMarked(d, i);
        })
        .y(function (d, i) {
            return y(getCurveData(i, depthCurveName, sfData));
        });

    var areaTagPathRight = svg
        .append("path")
        .datum(sfData)
        .attr("class", "area")
        //.attr("clip-path", "url('#clip')")
        .attr("d", areaMarkTagRight)
        .attr("stroke", "none")
        .attr("fill", "gray")
        .attr("fill-opacity", 0.7);

    var areaMarkTagLeft = d3
        .area()
        .x0(margin.left - 4)
        .x1(margin.left)
        .defined(function (d, i) {
            return d.isMarked() || checkPreviousMarked(d, i);
        })
        .y(function (d, i) {
            return y(getCurveData(i, depthCurveName, sfData));
        });

    var areaTagPathLeft = svg
        .append("path")
        .datum(sfData)
        .attr("class", "area")
        //.attr("clip-path", "url('#clip')")
        .attr("d", areaMarkTagLeft)
        .attr("stroke", "none")
        .attr("fill", "gray")
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


    var overWhat
    function tooltipMouseover(evt) {
        overWhat = evt.fromElement?.tagName
        tooltipDiv.style("display", "block");
        // console.log(1,evt.fromElement?.tagName)
        focus.style("display", null);
        // tooltipDiv.transition().duration(600).style("opacity", 0.9);
    }

    function tooltipMouseout(evt) {
        if (overWhat == "line") return
        // overTrack = 0
        focus.style("display", "none");
        tooltipDiv.style("display", "none");
        // tooltipDiv.transition().duration(400).style("opacity", 0);
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

            for (let index = 0; index < sfData.length; index++) {
                let dataviewRow = sfData[index];

                let nextDataViewRow = null;
                if (sfData[index + 1]) {
                    nextDataViewRow = sfData[index + 1];
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
                        index == sfData.length - 1
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

            if (parseInt(d3.version.charAt(0)) < 6) {
                categoryColorFunc = d3.scale.ordinal(range).domain(categoriesDomain);
            } else {
                categoryColorFunc = d3.scaleOrdinal(range).domain(categoriesDomain);
            }

            ////////////////////////////

            if (parseInt(d3.version.charAt(0)) < 6) {
                categoryColorFunc = d3.scale.ordinal(d3.schemeCategory10).domain(categoryDomain);
            } else {
                categoryColorFunc = d3.scaleOrdinal(d3.schemeCategory10).domain(categoryDomain);
            }

            for (let i = 0; i < categoriesRectangles.length; i++) {
                let categoryRectangle = categoriesRectangles[i];
                if (categoryRectangle.category) {
                    function rectClick(evt, a, b) {
                        var markMode = "Replace";
                        if (evt instanceof MouseEvent) {
                            evt.preventDefault();
                            evt.stopPropagation();
                            if (evt.shiftKey) {
                                markMode = "Add";
                            } else if (evt.ctrlKey) {
                                markMode = "Toggle";
                            }
                        } else {
                            d3.event.preventDefault();
                            d3.event.stopPropagation();
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

                    var fgObj = svg.append("foreignObject");
                    fgObj
                        .attr("x", margin.left)
                        .attr("y", y(categoryRectangle.top))
                        .attr("width", width - margin.right - margin.left)
                        .attr("height", Math.abs(y(categoryRectangle.top) - y(categoryRectangle.bottom)))
                        //.style("cursor", "pointer")
                        .on("mousedown", rectClick)
                        .on("mousemove", mousemove);

                    var fgDiv = fgObj.append("xhtml:div");

                    fgDiv
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

        if (parseInt(d3.version.charAt(0)) >= 6) {
            y0 = y.invert(d3.pointer(evt)[1]);
        } else {
            y0 = y.invert(d3.event.y);
        }

        var i = bisectData(sfData, y0);

        var d1 = sfData[i];
        var d0 = sfData[i - 1];

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
            value0 = d0.continuous(curveNames[0]).value();
        }
        if (curveNames[1] == "ZONE" || curveNames[1] == "FACIES") {
            value1 = d1.categorical(curveNames[1]).formattedValue();
        } else {
            value1 = curveNames[1] ? d1.continuous(curveNames[1]).value() : "";
        }

        if (tooltipDiv) {
            let modContainer = d3.select("#mod-container")._groups[0][0];

            tooltipDiv.html(

                (d.continuous(depthCurveName).value() ? depthCurveName + ": " + d.continuous(depthCurveName).value().toFixed(2) + "<br>" : "") +
                (curveNames[0] && value0
                    ? "<span style='border:1px solid gray; background-color:" +
                    curveColor0 +
                    "';>&nbsp;&nbsp;</span>&nbsp;" +
                    curveNames[0] +
                    ": " +
                    value0 +
                    "<br>"
                    : "") +
                (curveNames[1] && value1
                    ? "<span style='border:1px solid gray; background-color:" +
                    curveColor1 +
                    "';>&nbsp;&nbsp;</span>&nbsp;" +
                    curveNames[1] +
                    ": " +
                    value1 +
                    "<br>"
                    : "")
            );

            let tooltipX =
                target.parentNode.parentNode.offsetLeft + getTooltipPositionX(curve_x_func, value0) + 10;

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


async function multipleLogPlot(div_id, templates, sfData, mod) {

    //clear the div
    d3.select("#" + div_id).selectAll("div").remove();

    //delete accordingly
    let bits = await mod.property("trackVisibility");
    var toDelete = [...bits.value()]
    templates = templates.filter((x, i) => parseInt(toDelete[i]))


    var maxHeaderHeight = 42;

    for (let i = 0; i < templates.length; i++) {
        if (templates[i]) {
            let template = templates[i];
            let template_components = template[0]["components"];
            let templateCurves = template_components[0]["curves"][0];
            let template_rectangles = template_components[0]["rectangles"];
            let curveNames = templateCurves["curveNames"];
            let curveColors = templateCurves["curveColors"];
            var NumberOfGradientScales = 0;
            for (let j = 0; j < templateCurves.fill.length; j++) {
                let fillColor = templateCurves.fill[j];
                if (fillColor.fill == "yes" && fillColor.fillColors.includes("interpolator")) {
                    NumberOfGradientScales = NumberOfGradientScales + 1;
                }
            }

            var height = curveNames.length * 42 + NumberOfGradientScales * 20;
            if (height > maxHeaderHeight) {
                maxHeaderHeight = height;
            }
        }
    }

    for (let i = 0; i < templates.length; i++) {
        d3.select("#" + div_id + "TrackHolder" + i)
            .selectAll("div")
            .remove();
        d3.select("#" + div_id + "TrackHolder" + i)
            .selectAll("svg")
            .remove();
        d3.select("#" + div_id + "TrackHolder" + i).remove();
    }


    if (!d3.select("#TracksToolDiv")._groups[0][0]) {
        var TracksToolDiv = d3.select("#" + div_id).append("div");

        TracksToolDiv.style("vertical-align", "middle")
            .attr("id", "TracksToolDiv")
            .style("display", "inline-flex")
            .style("flex-direction", "column")
            .style("justify-content", "center")
            .style("align-items", "center")
            .style("position", "fixed")
            .style("bottom", "0px")
            .style("right", "20px")
            .style("width", ZoomPanelWidth + "px")
            .on("mousedown", function (evt) {
                if (evt instanceof MouseEvent) {
                    evt.stopPropagation();
                } else {
                    d3.event.stopPropagation();
                }
            });

        var divPlusBtn = TracksToolDiv.append("div").style("height", "26px");

        var plusBtn = divPlusBtn
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

        var divGVertical = TracksToolDiv.append("div").attr("id", "slider-zoom").style("margin", "0px");

        sliderZoom = sliderRight()
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

        var gZoom = d3
            .select("div#slider-zoom")
            .append("svg")
            .attr("width", "20px")
            .attr("height", ~~(window.innerHeight * 0.35) + 17)
            .append("g")
            .attr("transform", "translate(10,5)");

        gZoom.call(sliderZoom);

        var divMinusBtnRelPos = TracksToolDiv.append("div").style("position", "relative").style("height", "26px");

        var divMinusBtn = divMinusBtnRelPos
            .append("div")
            .style("position", "absolute")
            .style("top", "-10px")
            .style("left", "-13px")
            .style("height", "26px");

        var minusBtn = divMinusBtn
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
            .on("click", function (evt) {
                if (evt instanceof MouseEvent) {
                    evt.preventDefault();
                    evt.stopPropagation();
                } else {
                    d3.event.preventDefault();
                    d3.event.stopPropagation();
                }
                vanilla_drawer.drawer_menu_open();
            });
    }

    let new_templates = [];
    for (let i = 0; i < templates.length; i++) {
        if (templates[i]) {
            let TrackHolder = d3.select("#" + div_id).append("div");

            TrackHolder.style("vertical-align", "middle")
                .attr("id", div_id + "TrackHolder" + i)
                .style("display", "inline-block");

            templates[i][0]["trackBox"]["div_id"] = div_id + "TrackHolder" + i;
            new_templates.push(templates[i]);
            let template = templates[i];
            logPlot(template, sfData, maxHeaderHeight + "px", i == 0); //labels for first track only
        }

    }

    // add the tooltip area to the webpage

    d3.select("#" + "mod-container" + "_tooltip").remove();
    tooltipDiv = d3
        .select("#" + div_id)
        .append("div")
        .attr("class", "tooltip")
        .attr("id", "mod-container" + "_tooltip")
        .style("opacity", 0);

    initialized = true;

    // horizontal line
    document.body.onmousemove = e => {
        document.getElementById("hr").style.top = e.clientY + "px"
    }

    // ace editor for settings popo
    /*    var editor = ace.edit("trackMappings",{
            mode: 'ace/mode/json',
            selectionStyle: 'text',
            showPrintMargin: false,
            theme: 'ace/theme/cobalt'
          });
        // editor.setTheme("ace/theme/cobalt");
        // editor.getSession().setMode("ace/mode/json"); 
    */

    return new_templates;
}
