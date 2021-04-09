/*
 * Copyright © 2020. TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */

//@ts-check
import * as d3 from "d3";
import { sliderRight } from 'd3-simple-slider';
import * as $ from "jquery";
import { invalidateTooltip } from "./extended-api.js";
import { nodeFormattedPathAsArray } from "./extended-api.js";
import { addHandlersSelection } from "./ui-input.js";

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

/**
 * Main svg container
 */
const svg = modContainer.append("svg").attr("xmlns", "http://www.w3.org/2000/svg");

var depthCurveName;
var depthUnit;
var selectedWell;
var wellColumnName;
var zoneLogTrackWidth = 140;
var ZoomPanelWidth = 32;
var depthLabelPanelWidth = 15;
var verticalZoomHeightMultiplier = 5;
var sliderZoom;

const config = {
    pPerfilIndicadorCurvasBR: "Sim",
    pPerfilEixoY: "Profundidade",
    pPerfilHeightMultiplier: 2,
    pPerfilTrack01EspessuraCurva01: "MEDIA",
    pPerfilTrack01TracoCurva01: "SOLIDO",
    pPerfilTrack01CorCurva01: "VERDE",
    pPerfilTrack01PreenchimentoArea01: "ESQUERDA",
    pPerfilTrack01CorArea01: "GRADIENTE ESPECTRO",
    pPerfilTrack01EscalaMinCurva01: "",
    pPerfilTrack01EscalaMaxCurva01: "",
    pPerfilTrack01Limite01Curva01: "",
    pPerfilTrack01Limite02Curva01: "",
    pPerfilTrack01EspessuraCurva02: "MEDIA",
    pPerfilTrack01TracoCurva02: "SOLIDO",
    pPerfilTrack01CorCurva02: "PRETO",
    pPerfilTrack01PreenchimentoArea02: "",
    pPerfilTrack01CorArea02: "PRETO",
    pPerfilTrack01EscalaMinCurva02: "",
    pPerfilTrack01EscalaMaxCurva02: "",
    pPerfilTrack01Limite01Curva02: "",
    pPerfilTrack01Limite02Curva02: "",
    pPerfilTrack02EspessuraCurva01: "MEDIA",
    pPerfilTrack02TracoCurva01: "SOLIDO",
    pPerfilTrack02CorCurva01: "PRETO",
    pPerfilTrack02PreenchimentoArea01: "ESQUERDA",
    pPerfilTrack02CorArea01: "AZUL",
    pPerfilTrack02EscalaMinCurva01: "",
    pPerfilTrack02EscalaMaxCurva01: "",
    pPerfilTrack02Limite01Curva01: "175",
    pPerfilTrack02Limite02Curva01: "",
    pPerfilTrack02EspessuraCurva02: "MEDIA",
    pPerfilTrack02TracoCurva02: "SOLIDO",
    pPerfilTrack02CorCurva02: "VERMELHO",
    pPerfilTrack02PreenchimentoArea02: "",
    pPerfilTrack02CorArea02: "VERMELHO",
    pPerfilTrack02EscalaMinCurva02: "",
    pPerfilTrack02EscalaMaxCurva02: "",
    pPerfilTrack02Limite01Curva02: "",
    pPerfilTrack02Limite02Curva02: "",
    pPerfilTrack03EspessuraCurva01: "MEDIA",
    pPerfilTrack03TracoCurva01: "SOLIDO",
    pPerfilTrack03CorCurva01: "AZUL",
    pPerfilTrack03PreenchimentoArea01: "ENTRE",
    pPerfilTrack03CorArea01: "AZUL",
    pPerfilTrack03EscalaMinCurva01: "",
    pPerfilTrack03EscalaMaxCurva01: "",
    pPerfilTrack03Limite01Curva01: "",
    pPerfilTrack03Limite02Curva01: "",
    pPerfilTrack03EspessuraCurva02: "MEDIA",
    pPerfilTrack03TracoCurva02: "SOLIDO",
    pPerfilTrack03CorCurva02: "VERMELHO",
    pPerfilTrack03PreenchimentoArea02: "",
    pPerfilTrack03CorArea02: "VERMELHO",
    pPerfilTrack03EscalaMinCurva02: "",
    pPerfilTrack03EscalaMaxCurva02: "",
    pPerfilTrack03Limite01Curva02: "",
    pPerfilTrack03Limite02Curva02: "",
    pPerfilTrack04EspessuraCurva01: "MEDIA",
    pPerfilTrack04TracoCurva01: "TRACEJADO",
    pPerfilTrack04CorCurva01: "VERMELHO",
    pPerfilTrack04PreenchimentoArea01: "ESQUERDA",
    pPerfilTrack04CorArea01: "GRADIENTE VERMELHO",
    pPerfilTrack04EscalaMinCurva01: "",
    pPerfilTrack04EscalaMaxCurva01: "",
    pPerfilTrack04Limite01Curva01: "",
    pPerfilTrack04Limite02Curva01: "",
    pPerfilTrack04EspessuraCurva02: "PEQUENA",
    pPerfilTrack04TracoCurva02: "SOLIDO",
    pPerfilTrack04CorCurva02: "VERMELHO",
    pPerfilTrack04PreenchimentoArea02: "",
    pPerfilTrack04CorArea02: "VERMELHO",
    pPerfilTrack04EscalaMinCurva02: "",
    pPerfilTrack04EscalaMaxCurva02: "",
    pPerfilTrack04Limite01Curva02: "",
    pPerfilTrack04Limite02Curva02: "",
    pPerfilTrack05EspessuraCurva01: "PEQUENA",
    pPerfilTrack05TracoCurva01: "SOLIDO",
    pPerfilTrack05CorCurva01: "PRETO",
    pPerfilTrack05PreenchimentoArea01: "",
    pPerfilTrack05CorArea01: "PRETO",
    pPerfilTrack05EscalaMinCurva01: "",
    pPerfilTrack05EscalaMaxCurva01: "",
    pPerfilTrack05Limite01Curva01: "",
    pPerfilTrack05Limite02Curva01: "",
    pPerfilTrack05EspessuraCurva02: "MEDIA",
    pPerfilTrack05TracoCurva02: "SOLIDO",
    pPerfilTrack05CorCurva02: "PRETO",
    pPerfilTrack05PreenchimentoArea02: "",
    pPerfilTrack05CorArea02: "PRETO",
    pPerfilTrack05EscalaMinCurva02: "",
    pPerfilTrack05EscalaMaxCurva02: "",
    pPerfilTrack05Limite01Curva02: "",
    pPerfilTrack05Limite02Curva02: "",
    pPerfilTrack06Curva01: "",
    pPerfilTrack06EspessuraCurva01: "MEDIA",
    pPerfilTrack06TracoCurva01: "SOLIDO",
    pPerfilTrack06CorCurva01: "PRETO",
    pPerfilTrack06PreenchimentoArea01: "",
    pPerfilTrack06CorArea01: "PRETO",
    pPerfilTrack06EscalaMinCurva01: "",
    pPerfilTrack06EscalaMaxCurva01: "",
    pPerfilTrack06Limite01Curva01: "",
    pPerfilTrack06Limite02Curva01: "",
    pPerfilTrack06Curva02: "",
    pPerfilTrack06EspessuraCurva02: "MEDIA",
    pPerfilTrack06TracoCurva02: "SOLIDO",
    pPerfilTrack06CorCurva02: "PRETO",
    pPerfilTrack06PreenchimentoArea02: "",
    pPerfilTrack06CorArea02: "PRETO",
    pPerfilTrack06EscalaMinCurva02: "",
    pPerfilTrack06EscalaMaxCurva02: "",
    pPerfilTrack06Limite01Curva02: "",
    pPerfilTrack06Limite02Curva02: "",
    pPerfilTrack01TipoEscalaCurva01: "linear",
    pPerfilTrack01TipoEscalaCurva02: "linear",
    pPerfilTrack02TipoEscalaCurva01: "linear",
    pPerfilTrack02TipoEscalaCurva02: "log",
    pPerfilTrack03TipoEscalaCurva01: "linear",
    pPerfilTrack03TipoEscalaCurva02: "linear",
    pPerfilTrack04TipoEscalaCurva01: "linear",
    pPerfilTrack04TipoEscalaCurva02: "log",
    pPerfilTrack05TipoEscalaCurva01: "linear",
    pPerfilTrack05TipoEscalaCurva02: "linear",
    pPerfilTrack06TipoEscalaCurva01: "linear",
    pPerfilTrack06TipoEscalaCurva02: "linear"
};

/*--------------------------------------------------

	VanillaDrawer Ver.1.0 2017-05-16

--------------------------------------------------*/
function VanillaDrawer() {
    this.drawer_menu_w = 300;
    this.drawer_menu_span = 20;
    this.drawer_content_scroll_x = 0;
    this.drawer_content_scroll_y = 0;
    this.drawer_menu_x = 0;
    this.drawer_content_rect = "";
    this.drawer_content_x = 0;
    this.drawer_content_y = 0;
    this.drawer_content_w = 0;
    this.drawer_content_h = 0;
    this.touch_start_x = 0;
    this.touch_start_y = 0;
    this.touch_move_x = 0;
    this.touch_move_y = 0;
    this.touch_diff = 0;
    this.scroll_start = 0;
    this.scroll_end = 0;
    this.scroll_diff = 0;
    this.drawer_content = document.getElementById("drawer_content");
    this.drawer_wall = document.getElementById("drawer_wall");
    this.drawer_menu = document.getElementById("drawer_menu");
    this.drawer_menu.style.width = this.drawer_menu_w + "px";
    this.drawer_menu.style.left = "-" + this.drawer_menu_w + "px";
    // --------------------------------------------------
    this.drawer_menu_open = function () {
        this.drawer_menu_x = parseInt(this.drawer_menu.style.left);
        if (this.drawer_menu_x >= 0) {
            return false;
        }
        this.drawer_menu.scrollTop = 0;
        this.drawer_content_scroll_x = window.pageXOffset;
        this.drawer_content_scroll_y = window.pageYOffset;
        this.drawer_content_rect = this.drawer_content.getBoundingClientRect();
        this.drawer_content_x = Math.round(this.drawer_content_rect.left);
        this.drawer_content_y = Math.round(this.drawer_content_rect.top);
        this.drawer_content_w = Math.round(this.drawer_content_rect.width);
        this.drawer_content_h = Math.round(this.drawer_content_rect.height);
        vanilla_drawer.drawer_menu_open_effect(
            this.drawer_content_w,
            this.drawer_content_x,
            this.drawer_content_y,
            this.drawer_menu_x
        );
    };
    // --------------------------------------------------
    this.drawer_menu_open_effect = function (drawer_content_w, drawer_content_x, drawer_content_y, drawer_menu_x) {
        this.drawer_wall.style.display = "block";
        drawer_menu_x = drawer_menu_x + this.drawer_menu_span;
        this.drawer_menu.style.left = drawer_menu_x + "px";
        if (drawer_menu_x >= 0) {
            this.drawer_content.style.position = "fixed";
            this.drawer_content.style.zIndex = "1";
            this.drawer_content.style.width = drawer_content_w + "px";
            this.drawer_content.style.left = drawer_content_x + "px";
            this.drawer_content.style.top = drawer_content_y + "px";
        } else {
            setTimeout(function () {
                vanilla_drawer.drawer_menu_open_effect(
                    drawer_content_w,
                    drawer_content_x,
                    drawer_content_y,
                    drawer_menu_x
                );
            }, 10);
        }
    };
    // --------------------------------------------------
    this.drawer_menu_close = function () {
        this.drawer_menu_x = parseInt(this.drawer_menu.style.left);
        vanilla_drawer.drawer_menu_close_effect(
            this.drawer_content_w,
            this.drawer_content_x,
            this.drawer_content_y,
            this.drawer_menu_x
        );
    };
    // --------------------------------------------------
    this.drawer_menu_close_effect = function (drawer_content_w, drawer_content_x, drawer_content_y, drawer_menu_x) {
        drawer_menu_x = drawer_menu_x - this.drawer_menu_span;
        this.drawer_menu.style.left = drawer_menu_x + "px";
        if (drawer_menu_x <= -1 * this.drawer_menu_w) {
            this.drawer_wall.style.display = "none";
            this.drawer_content.style.position = "static";
            window.scrollTo(0, this.drawer_content_scroll_y);
        } else {
            setTimeout(function () {
                vanilla_drawer.drawer_menu_close_effect(
                    drawer_content_w,
                    drawer_content_x,
                    drawer_content_y,
                    drawer_menu_x
                );
            }, 10);
        }
    };
    // --------------------------------------------------
    this.touch_start = function (event) {
        this.touch_start_x = 0;
        this.touch_start_y = 0;
        this.touch_move_x = 0;
        this.touch_move_y = 0;
        this.touch_diff = 0;
        this.scroll_start = 0;
        this.scroll_end = 0;
        this.scroll_diff = 0;
        this.scroll_start = window.pageYOffset;
        this.touch_start_x = event.touches[0].pageX;
        this.touch_start_y = event.touches[0].pageY;
    };
    // --------------------------------------------------
    this.touch_move = function (event) {
        this.touch_move_x = event.changedTouches[0].pageX;
        this.touch_move_y = event.changedTouches[0].pageY;
    };
    // --------------------------------------------------
    this.touch_end = function (event) {
        this.scroll_end = window.pageYOffset;
        if (this.scroll_end < this.scroll_start) {
            this.scroll_diff = this.scroll_start - this.scroll_end;
        } else if (this.scroll_end > this.scroll_start) {
            this.scroll_diff = this.scroll_end - this.scroll_start;
        }
        if (this.touch_start_y < this.touch_move_y) {
            this.touch_diff = this.touch_move_y - this.touch_start_y;
        } else if (this.touch_start_y > this.touch_move_y) {
            this.touch_diff = this.touch_start_y - this.touch_move_y;
        }
        if (this.touch_start_x > this.touch_move_x) {
            if (this.touch_start_x > this.touch_move_x + 50 && this.touch_diff < 50 && this.scroll_diff < 50) {
                vanilla_drawer.drawer_menu_close();
            }
        } else if (this.touch_start_x < this.touch_move_x) {
            if (this.touch_start_x + 50 < this.touch_move_x && this.touch_diff < 50 && this.scroll_diff < 50) {
                vanilla_drawer.drawer_menu_open();
            }
        }
    };

    window.addEventListener(
        "load",
        function (event) {
            window.addEventListener(
                "touchstart",
                function (event) {
                    vanilla_drawer.touch_start(event);
                },
                false
            );
            window.addEventListener(
                "touchmove",
                function (event) {
                    vanilla_drawer.touch_move(event);
                },
                false
            );
            window.addEventListener(
                "touchend",
                function (event) {
                    vanilla_drawer.touch_end(event);
                },
                false
            );
        },
        false
    );
}

var pPerfilEixoY;
var zoneLogTrackWidth = 120;
//var pPerfilHeightMultiplier;

var y_function;
var sfData;

function getCurveIndex(curveName, sfData) {
    for (var nCol = 0; nCol < sfData.columns.length; nCol++) {
        if (curveName == sfData.columns[nCol]) {
            return nCol;
        }
    }
    return null;
}

function getCurveData(lineIndex, curveName, sfData) {
    var item;
    if (curveName == "ZONE" || curveName == "FACIES" || curveName == "WELL") {
        item = sfData[lineIndex].categorical(curveName).value();
    } else {
        item = sfData[lineIndex].continuous(curveName).value();
    }

    return item;
}

/**
 * A container for X axis labels.
 * Instead of figuring out the layout in special cases when labels don't fit, we delegate
 * this job to the DOM layout engine.
 */
const xLabelsContainer = modContainer.append("div").attr("class", "x-axis-label-container");

/**
 * Renders the chart.
 * @param {Object} state
 * @param {Spotfire.Mod} mod
 * @param {Spotfire.DataView} dataView - dataView
 * @param {Spotfire.Size} windowSize - windowSize
 * @param {Spotfire.ModProperty<string>} example - an example property
 */
export async function render(state, mod, dataView, windowSize, example) {
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

    // Return and wait for next call to render when reading data was aborted.
    // Last rendered data view is still valid from a users perspective since
    // a document modification was made during a progress indication.
    // Hard abort if row count exceeds an arbitrary selected limit
    const xLimit = 1250;
    const colorLimit = 100;
    const colorCount = (await dataView.hierarchy("Color")).leafCount;
    const xCount = (await dataView.hierarchy("X")).leafCount;
    if (colorCount > colorLimit || xCount > xLimit) {
        svg.selectAll("*").remove();
        mod.controls.errorOverlay.show(`Exceeded data size limit (colors: ${colorLimit}, x: ${xLimit})`, "rowCount");
        return;
    } else {
        mod.controls.errorOverlay.hide("rowCount");
    }

    const allRows = await dataView.allRows();
    console.log(allRows);
    allRows.sort((a, b) => a.continuous("DEPTH").value() - b.continuous("DEPTH").value());

    if (allRows == null) {
        // Return and wait for next call to render when reading data was aborted.
        // Last rendered data view is still valid from a users perspective since
        // a document modification was made during a progress indication.
        return;
    }

    const colorHierarchy = await dataView.hierarchy("Color");
    const xHierarchy = await dataView.hierarchy("X");

    const xLeaves = (await xHierarchy.root()).leaves();
    const colorLeaves = (await colorHierarchy.root()).leaves();

    //const xAxisMeta = await mod.visualization.axis("X");
    //const yAxisMeta = await mod.visualization.axis("Y");
    const colorAxisMeta = await mod.visualization.axis("Color");

    const margin = { top: 20, right: 40, bottom: 40, left: 80 };
    modContainer.style("height", windowSize.height - margin.bottom - margin.top).style("overflow-y", "scroll");

    /**
     * Maximum number of Y scale ticks is an approximate number
     * To get the said number we divide total available height by font size with some arbitrary padding
     */
    const yScaleTickNumber = windowSize.height / (styling.scales.font.fontSize * 2 + 6);

    /**
     * Sets the viewBox to match windowSize
     */
    svg.attr("viewBox", [0, 0, windowSize.width, windowSize.height]);
    svg.selectAll("*").remove();

    /**
     * Creates a clipping region that will be used to mask out everything outside of it.
     */
    svg.append("defs")
        .append("clipPath")
        .attr("id", "clipPath")
        .append("rect")
        .attr("x", margin.left)
        .attr("y", margin.top)
        .attr("width", windowSize.width - margin.left)
        .attr("height", windowSize.height - (margin.bottom + margin.top));

    /**
     * Background rectangle - used to catch click events and clear marking.
     */
    svg.append("rect")
        .attr("fill", "#000")
        .attr("fill-opacity", 0)
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", windowSize.width)
        .attr("height", windowSize.height)
        .on("click", () => dataView.clearMarking());

    /**
     * Prepare groups that will hold all elements of an area chart.
     * The groups are drawn in a specific order for the best user experience:
     * - 'unmarked-area', 'unmarked line' - contains all areas and lines drawn with their respective 'unmarked' color
     * - 'marked-area', 'marked-line' - contains areas and lines that we consider 'marked' (consecutive marked points)
     * - 'unmarked-circles' - contains circles that represent unmarked points; only appear in a special case when 'X axis expression' == 'Color axis expression'
     * - 'marked-circles' - contains circles that represent marked points; will show only edge points if the whole group is marked;
     * - 'hover-line' - contains all lines; lines are hidden by default but show up with an outline when hovered
     */
    svg.append("g").attr("class", "unmarked-area").attr("clip-path", "url(#clipPath)");
    svg.append("g").attr("class", "unmarked-line").attr("clip-path", "url(#clipPath)");
    svg.append("g").attr("class", "marked-area").attr("clip-path", "url(#clipPath)");
    svg.append("g").attr("class", "marked-line").attr("clip-path", "url(#clipPath)");

    svg.append("g").attr("class", "hover-line").attr("clip-path", "url(#clipPath)");

    for (const row of allRows) {
        console.log(row.categorical("X").value());
    }

    for (const colorLeaf of colorLeaves) {
        console.log(colorLeaf.formattedPath());
    }
    for (const xLeaf of xLeaves) {
        console.log(xLeaf.formattedPath());
    }

    // Now render here!

    var escala = "linear";
    var scwidth = window.innerWidth - 30;
    var scheight = window.innerHeight - 30;

    //Propriedades do gráfico:
    var pPerfilHeightMultiplier = config["pPerfilHeightMultiplier"];
    pPerfilEixoY = config["pPerfilEixoY"]; //'Profundidade' ou 'Cora'
    var pPerfilIndicadorCurvasBR = config["pPerfilIndicadorCurvasBR"];

    var zoneLogTrackWidth = 120;
    var numberOfTracks = 4;

    var trackWidth = (scwidth - zoneLogTrackWidth - zoneLogTrackWidth) / numberOfTracks;

    console.log(JSON.stringify(config));

    //Track 01: ----------------------------------------------------------------------------------
    var pPerfilTrack01EspessuraCurva01 = config["pPerfilTrack01EspessuraCurva01"];
    var pPerfilTrack01TracoCurva01 = config["pPerfilTrack01TracoCurva01"];
    var pPerfilTrack01CorCurva01 = config["pPerfilTrack01CorCurva01"];
    var pPerfilTrack01PreenchimentoArea01 = config["pPerfilTrack01PreenchimentoArea01"];
    var pPerfilTrack01CorArea01 = config["pPerfilTrack01CorArea01"];
    var pPerfilTrack01EscalaMinCurva01 = config["pPerfilTrack01EscalaMinCurva01"];
    var pPerfilTrack01EscalaMaxCurva01 = config["pPerfilTrack01EscalaMaxCurva01"];
    var pPerfilTrack01Limite01Curva01 = config["pPerfilTrack01Limite01Curva01"];
    var pPerfilTrack01Limite02Curva01 = config["pPerfilTrack01Limite02Curva01"];
    var pPerfilTrack01TipoEscalaCurva01 = config["pPerfilTrack01TipoEscalaCurva01"];

    var pPerfilTrack01EspessuraCurva02 = config["pPerfilTrack01EspessuraCurva02"];
    var pPerfilTrack01TracoCurva02 = config["pPerfilTrack01TracoCurva02"];
    var pPerfilTrack01CorCurva02 = config["pPerfilTrack01CorCurva02"];
    var pPerfilTrack01PreenchimentoArea02 = config["pPerfilTrack01PreenchimentoArea02"];
    var pPerfilTrack01CorArea02 = config["pPerfilTrack01CorArea02"];
    var pPerfilTrack01EscalaMinCurva02 = config["pPerfilTrack01EscalaMinCurva02"];
    var pPerfilTrack01EscalaMaxCurva02 = config["pPerfilTrack01EscalaMaxCurva02"];
    var pPerfilTrack01Limite01Curva02 = config["pPerfilTrack01Limite01Curva02"];
    var pPerfilTrack01Limite02Curva02 = config["pPerfilTrack01Limite02Curva02"];
    var pPerfilTrack01TipoEscalaCurva02 = config["pPerfilTrack01TipoEscalaCurva02"];

    //Track 02: ----------------------------------------------------------------------------------
    var pPerfilTrack02EspessuraCurva01 = config["pPerfilTrack02EspessuraCurva01"];
    var pPerfilTrack02TracoCurva01 = config["pPerfilTrack02TracoCurva01"];
    var pPerfilTrack02CorCurva01 = config["pPerfilTrack02CorCurva01"];
    var pPerfilTrack02PreenchimentoArea01 = config["pPerfilTrack02PreenchimentoArea01"];
    var pPerfilTrack02CorArea01 = config["pPerfilTrack02CorArea01"];
    var pPerfilTrack02EscalaMinCurva01 = config["pPerfilTrack02EscalaMinCurva01"];
    var pPerfilTrack02EscalaMaxCurva01 = config["pPerfilTrack02EscalaMaxCurva01"];
    var pPerfilTrack02Limite01Curva01 = config["pPerfilTrack02Limite01Curva01"];
    var pPerfilTrack02Limite02Curva01 = config["pPerfilTrack02Limite02Curva01"];
    var pPerfilTrack02TipoEscalaCurva01 = config["pPerfilTrack02TipoEscalaCurva01"];

    var pPerfilTrack02EspessuraCurva02 = config["pPerfilTrack02EspessuraCurva02"];
    var pPerfilTrack02TracoCurva02 = config["pPerfilTrack02TracoCurva02"];
    var pPerfilTrack02CorCurva02 = config["pPerfilTrack02CorCurva02"];
    var pPerfilTrack02PreenchimentoArea02 = config["pPerfilTrack02PreenchimentoArea02"];
    var pPerfilTrack02CorArea02 = config["pPerfilTrack02CorArea02"];
    var pPerfilTrack02EscalaMinCurva02 = config["pPerfilTrack02EscalaMinCurva02"];
    var pPerfilTrack02EscalaMaxCurva02 = config["pPerfilTrack02EscalaMaxCurva02"];
    var pPerfilTrack02Limite01Curva02 = config["pPerfilTrack02Limite01Curva02"];
    var pPerfilTrack02Limite02Curva02 = config["pPerfilTrack02Limite02Curva02"];
    var pPerfilTrack02TipoEscalaCurva02 = config["pPerfilTrack02TipoEscalaCurva02"];

    //Track 03: ----------------------------------------------------------------------------------
    var pPerfilTrack03EspessuraCurva01 = config["pPerfilTrack03EspessuraCurva01"];
    var pPerfilTrack03TracoCurva01 = config["pPerfilTrack03TracoCurva01"];
    var pPerfilTrack03CorCurva01 = config["pPerfilTrack03CorCurva01"];
    var pPerfilTrack03PreenchimentoArea01 = config["pPerfilTrack03PreenchimentoArea01"];
    var pPerfilTrack03CorArea01 = config["pPerfilTrack03CorArea01"];
    var pPerfilTrack03EscalaMinCurva01 = config["pPerfilTrack03EscalaMinCurva01"];
    var pPerfilTrack03EscalaMaxCurva01 = config["pPerfilTrack03EscalaMaxCurva01"];
    var pPerfilTrack03Limite01Curva01 = config["pPerfilTrack03Limite01Curva01"];
    var pPerfilTrack03Limite02Curva01 = config["pPerfilTrack03Limite02Curva01"];
    var pPerfilTrack03TipoEscalaCurva01 = config["pPerfilTrack03TipoEscalaCurva01"];

    var pPerfilTrack03EspessuraCurva02 = config["pPerfilTrack03EspessuraCurva02"];
    var pPerfilTrack03TracoCurva02 = config["pPerfilTrack03TracoCurva02"];
    var pPerfilTrack03CorCurva02 = config["pPerfilTrack03CorCurva02"];
    var pPerfilTrack03PreenchimentoArea02 = config["pPerfilTrack03PreenchimentoArea02"];
    var pPerfilTrack03CorArea02 = config["pPerfilTrack03CorArea02"];
    var pPerfilTrack03EscalaMinCurva02 = config["pPerfilTrack03EscalaMinCurva02"];
    var pPerfilTrack03EscalaMaxCurva02 = config["pPerfilTrack03EscalaMaxCurva02"];
    var pPerfilTrack03Limite01Curva02 = config["pPerfilTrack03Limite01Curva02"];
    var pPerfilTrack03Limite02Curva02 = config["pPerfilTrack03Limite02Curva02"];
    var pPerfilTrack03TipoEscalaCurva02 = config["pPerfilTrack03TipoEscalaCurva02"];

    //Track 04: ----------------------------------------------------------------------------------
    var pPerfilTrack04EspessuraCurva01 = config["pPerfilTrack04EspessuraCurva01"];
    var pPerfilTrack04TracoCurva01 = config["pPerfilTrack04TracoCurva01"];
    var pPerfilTrack04CorCurva01 = config["pPerfilTrack04CorCurva01"];
    var pPerfilTrack04PreenchimentoArea01 = config["pPerfilTrack04PreenchimentoArea01"];
    var pPerfilTrack04CorArea01 = config["pPerfilTrack04CorArea01"];
    var pPerfilTrack04EscalaMinCurva01 = config["pPerfilTrack04EscalaMinCurva01"];
    var pPerfilTrack04EscalaMaxCurva01 = config["pPerfilTrack04EscalaMaxCurva01"];
    var pPerfilTrack04Limite01Curva01 = config["pPerfilTrack04Limite01Curva01"];
    var pPerfilTrack04Limite02Curva01 = config["pPerfilTrack04Limite02Curva01"];
    var pPerfilTrack04TipoEscalaCurva01 = config["pPerfilTrack04TipoEscalaCurva01"];

    var pPerfilTrack04EspessuraCurva02 = config["pPerfilTrack04EspessuraCurva02"];
    var pPerfilTrack04TracoCurva02 = config["pPerfilTrack04TracoCurva02"];
    var pPerfilTrack04CorCurva02 = config["pPerfilTrack04CorCurva02"];
    var pPerfilTrack04PreenchimentoArea02 = config["pPerfilTrack04PreenchimentoArea02"];
    var pPerfilTrack04CorArea02 = config["pPerfilTrack04CorArea02"];
    var pPerfilTrack04EscalaMinCurva02 = config["pPerfilTrack04EscalaMinCurva02"];
    var pPerfilTrack04EscalaMaxCurva02 = config["pPerfilTrack04EscalaMaxCurva02"];
    var pPerfilTrack04Limite01Curva02 = config["pPerfilTrack04Limite01Curva02"];
    var pPerfilTrack04Limite02Curva02 = config["pPerfilTrack04Limite02Curva02"];
    var pPerfilTrack04TipoEscalaCurva02 = config["pPerfilTrack04TipoEscalaCurva02"];

    //Track 05: ----------------------------------------------------------------------------------
    var pPerfilTrack05EspessuraCurva01 = config["pPerfilTrack05EspessuraCurva01"];
    var pPerfilTrack05TracoCurva01 = config["pPerfilTrack05TracoCurva01"];
    var pPerfilTrack05CorCurva01 = config["pPerfilTrack05CorCurva01"];
    var pPerfilTrack05PreenchimentoArea01 = config["pPerfilTrack05PreenchimentoArea01"];
    var pPerfilTrack05CorArea01 = config["pPerfilTrack05CorArea01"];
    var pPerfilTrack05EscalaMinCurva01 = config["pPerfilTrack05EscalaMinCurva01"];
    var pPerfilTrack05EscalaMaxCurva01 = config["pPerfilTrack05EscalaMaxCurva01"];
    var pPerfilTrack05Limite01Curva01 = config["pPerfilTrack05Limite01Curva01"];
    var pPerfilTrack05Limite02Curva01 = config["pPerfilTrack05Limite02Curva01"];
    var pPerfilTrack05TipoEscalaCurva01 = config["pPerfilTrack05TipoEscalaCurva01"];

    var pPerfilTrack05EspessuraCurva02 = config["pPerfilTrack05EspessuraCurva02"];
    var pPerfilTrack05TracoCurva02 = config["pPerfilTrack05TracoCurva02"];
    var pPerfilTrack05CorCurva02 = config["pPerfilTrack05CorCurva02"];
    var pPerfilTrack05PreenchimentoArea02 = config["pPerfilTrack05PreenchimentoArea02"];
    var pPerfilTrack05CorArea02 = config["pPerfilTrack05CorArea02"];
    var pPerfilTrack05EscalaMinCurva02 = config["pPerfilTrack05EscalaMinCurva02"];
    var pPerfilTrack05EscalaMaxCurva02 = config["pPerfilTrack05EscalaMaxCurva02"];
    var pPerfilTrack05Limite01Curva02 = config["pPerfilTrack05Limite01Curva02"];
    var pPerfilTrack05Limite02Curva02 = config["pPerfilTrack05Limite02Curva02"];
    var pPerfilTrack05TipoEscalaCurva02 = config["pPerfilTrack05TipoEscalaCurva02"];

    //Track 06: ----------------------------------------------------------------------------------
    var pPerfilTrack06Curva01 = config["pPerfilTrack06Curva01"].trim() != "" ? config["pPerfilTrack06Curva01"] : null;
    var pPerfilTrack06EspessuraCurva01 = config["pPerfilTrack06EspessuraCurva01"];
    var pPerfilTrack06TracoCurva01 = config["pPerfilTrack06TracoCurva01"];
    var pPerfilTrack06CorCurva01 = config["pPerfilTrack06CorCurva01"];
    var pPerfilTrack06PreenchimentoArea01 = config["pPerfilTrack06PreenchimentoArea01"];
    var pPerfilTrack06CorArea01 = config["pPerfilTrack06CorArea01"];
    var pPerfilTrack06EscalaMinCurva01 = config["pPerfilTrack06EscalaMinCurva01"];
    var pPerfilTrack06EscalaMaxCurva01 = config["pPerfilTrack06EscalaMaxCurva01"];
    var pPerfilTrack06Limite01Curva01 = config["pPerfilTrack06Limite01Curva01"];
    var pPerfilTrack06Limite02Curva01 = config["pPerfilTrack06Limite02Curva01"];
    var pPerfilTrack06TipoEscalaCurva01 = config["pPerfilTrack06TipoEscalaCurva01"];

    var pPerfilTrack06Curva02 = config["pPerfilTrack06Curva02"].trim() != "" ? config["pPerfilTrack06Curva02"] : null;
    var pPerfilTrack06EspessuraCurva02 = config["pPerfilTrack06EspessuraCurva02"];
    var pPerfilTrack06TracoCurva02 = config["pPerfilTrack06TracoCurva02"];
    var pPerfilTrack06CorCurva02 = config["pPerfilTrack06CorCurva02"];
    var pPerfilTrack06PreenchimentoArea02 = config["pPerfilTrack06PreenchimentoArea02"];
    var pPerfilTrack06CorArea02 = config["pPerfilTrack06CorArea02"];
    var pPerfilTrack06EscalaMinCurva02 = config["pPerfilTrack06EscalaMinCurva02"];
    var pPerfilTrack06EscalaMaxCurva02 = config["pPerfilTrack06EscalaMaxCurva02"];
    var pPerfilTrack06Limite01Curva02 = config["pPerfilTrack06Limite01Curva02"];
    var pPerfilTrack06Limite02Curva02 = config["pPerfilTrack06Limite02Curva02"];
    var pPerfilTrack06TipoEscalaCurva02 = config["pPerfilTrack06TipoEscalaCurva02"];

    function EspessuraLinhaTrack(espessura) {
        if (espessura == "PEQUENA") {
            return 0.5;
        } else if (espessura == "MEDIA") {
            return 1;
        } else if (espessura == "GRANDE") {
            return 2;
        } else {
            return 1;
        }
    }

    function TracoLinhaTrack(traco) {
        if (traco == "SOLIDO") {
            return "solid";
        } else if (traco == "PONTILHADO") {
            return "2,2";
        } else if (traco == "TRACEJADO") {
            return "5,5";
        } else {
            return "solid";
        }
    }

    function CorLinhaTrack(cor) {
        if (cor == "PRETO") {
            return "black";
        } else if (cor == "VERDE") {
            return "green";
        } else if (cor == "AZUL") {
            return "blue";
        } else if (cor == "VERMELHO") {
            return "red";
        } else if (cor == "MAGENTA") {
            return "fuchsia";
        } else if (cor == "AMARELO") {
            return "yellow";
        } else if (cor == "ROXO") {
            return "purple";
        } else {
            return "black";
        }
    }

    function PreenchimentoAreaTrack(preenchimento) {
        if (preenchimento == "ESQUERDA") {
            return "yes";
        } else if (preenchimento == "DIREITA") {
            return "yes";
        } else if (preenchimento == "ENTRE") {
            return "yes";
        } else {
            return "no";
        }
    }

    function DirecaoPreenchimentoAreaTrack(preenchimento) {
        if (preenchimento == "ESQUERDA") {
            return "left";
        } else if (preenchimento == "DIREITA") {
            return "right";
        } else if (preenchimento == "ENTRE") {
            return "between";
        } else {
            return "left";
        }
    }

    function CorPreenchimentoAreaTrack(corPreenchimento) {
        if (corPreenchimento == "PRETO") {
            return "black";
        } else if (corPreenchimento == "VERDE") {
            return "green";
        } else if (corPreenchimento == "AZUL") {
            return "blue";
        } else if (corPreenchimento == "VERMELHO") {
            return "red";
        } else if (corPreenchimento == "MAGENTA") {
            return "fuchsia";
        } else if (corPreenchimento == "AMARELO") {
            return "yellow";
        } else if (corPreenchimento == "CIANO") {
            return "cyan";
        } else if (corPreenchimento == "MARROM") {
            return "brown";
        } else if (corPreenchimento == "VERDE ESCURO") {
            return "darkgreen";
        } else if (corPreenchimento == "ROXO") {
            return "purple";
        } else if (corPreenchimento == "GRADIENTE ESPECTRO") {
            return "gradient";
        } else if (corPreenchimento == "GRADIENTE VERMELHO") {
            return "gradient";
        } else if (corPreenchimento == "GRADIENTE AZUL") {
            return "gradient";
        } else {
            return "gray";
        }
    }

    function GradientePreenchimentoAreaTrack(corPreenchimento) {
        if (corPreenchimento == "PRETO") {
            return null;
        } else if (corPreenchimento == "VERDE") {
            return null;
        } else if (corPreenchimento == "AZUL") {
            return null;
        } else if (corPreenchimento == "VERMELHO") {
            return null;
        } else if (corPreenchimento == "MAGENTA") {
            return null;
        } else if (corPreenchimento == "AMARELO") {
            return null;
        } else if (corPreenchimento == "CIANO") {
            return null;
        } else if (corPreenchimento == "MARROM") {
            return null;
        } else if (corPreenchimento == "ROXO") {
            return null;
        } else if (corPreenchimento == "VERDE ESCURO") {
            return null;
        } else if (corPreenchimento == "GRADIENTE ESPECTRO") {
            return d3.interpolateSpectral;
        } else if (corPreenchimento == "GRADIENTE VERMELHO") {
            return d3.interpolateReds;
        } else if (corPreenchimento == "GRADIENTE AZUL") {
            return d3.interpolateBlues;
        } else {
            return d3.interpolateSpectral;
        }
    }

    function getColor(name, type) {
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
        } else if (name.search("gradient") >= 0) {
            if (type == "light") {
                return "RGBA(255,255,255, 0.25)";
            } else if (type == "dark") {
                return "RGBA(0,0,0, 0.25)";
            } else {
                return "gradient";
            }
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

    function getFillColorName(value) {
        if (value == "#212121") {
            return "black";
        }
        if (value == "#4caf50") {
            return "green";
        }
        if (value == "#3f51b5") {
            return "blue";
        }
        if (value == "#f44336") {
            return "red";
        }
        if (value == "#ad1457") {
            return "fuchsia";
        }
        if (value == "#ffeb3b") {
            return "yellow";
        }
        if (value == "#40E0D0") {
            return "cyan";
        }
        if (value == "#A0522D") {
            return "brown";
        }
        if (value == "#006400") {
            return "darkgreen";
        }
        if (value == "#9c27b0") {
            return "purple";
        } else return "";
    }

    var WELL = "";

    var ZONE = new Array(dataView.rowCount());
    var FACIES = new Array(dataView.rowCount());

    //var COTA = new Array(sfdata.data.length);
    //var ZONA = new Array(sfdata.data.length);
    var profundidade = null;
    var zonaDepthFirst = null;
    var zonaDepthLast = null;
    var nomeZona = null;
    var ZONAS_RECT = [];
    var ZONAS_DOMINIO = [];

    var facieDepthFirst = null;
    var facieDepthLast = null;
    var nomeFacie = null;
    var FACIES_RECT = [];
    var FACIES_DOMINIO = [];

    var index = 0;
    var zoneMarkIds = [];
    var faciesMarkIds = [];


    var plot_templates;
 
    var vanilla_drawer;

    var updateAccordionTools = true;

    var y_function;
    var sfRawData;

    var initialized = false;
    var tooltipDiv;

    function buildTemplates(sfdata) {
        depthCurveName = "DEPTH";
        depthUnit = "km";

        wellColumnName = "WELL";

        selectedWell = getCurveData(0, wellColumnName, sfdata);

        var escala = "linear";
        var scwidth = window.innerWidth;
        var scheight = window.innerHeight;

        var numberOfTracks = 4;

        var trackWidth =
            (scwidth - zoneLogTrackWidth - zoneLogTrackWidth - ZoomPanelWidth - depthLabelPanelWidth - 30) /
            numberOfTracks;

        if (zoneLogTrackWidth > trackWidth) {
            trackWidth = (scwidth - ZoomPanelWidth - depthLabelPanelWidth - 30) / (numberOfTracks + 2);
            zoneLogTrackWidth = trackWidth;
        }

        var pPerfilTrack01CorArea01 = "interpolateSpectral";
        var pPerfilTrack01CorCurva01 = "green";
        var pPerfilTrack01EscalaMaxCurva01 = "";
        var pPerfilTrack01EscalaMinCurva01 = "";
        var pPerfilTrack01EspessuraCurva01 = "2";
        var pPerfilTrack01Limite01Curva01 = "";
        var pPerfilTrack01Limite02Curva01 = "";
        var pPerfilTrack01PreenchimentoArea01 = "right";
        var pPerfilTrack01TipoEscalaCurva01 = "linear";
        var pPerfilTrack01TracoCurva01 = "2,2";

        var pPerfilTrack02CorArea01 = "blue";
        var pPerfilTrack02CorCurva01 = "black";
        var pPerfilTrack02EscalaMaxCurva01 = "";
        var pPerfilTrack02EscalaMinCurva01 = "";
        var pPerfilTrack02EspessuraCurva01 = "1";
        var pPerfilTrack02Limite01Curva01 = "175";
        var pPerfilTrack02Limite02Curva01 = "180";
        var pPerfilTrack02PreenchimentoArea01 = "left";
        var pPerfilTrack02TipoEscalaCurva01 = "linear";
        var pPerfilTrack02TracoCurva01 = "solid";

        var pPerfilTrack03CorArea01 = "blue";
        var pPerfilTrack03CorArea02 = "red";
        var pPerfilTrack03CorCurva01 = "blue";
        var pPerfilTrack03CorCurva02 = "red";
        var pPerfilTrack03EscalaMaxCurva01 = "";
        var pPerfilTrack03EscalaMaxCurva02 = "";
        var pPerfilTrack03EscalaMinCurva01 = "";
        var pPerfilTrack03EscalaMinCurva02 = "";
        var pPerfilTrack03EspessuraCurva01 = "1";
        var pPerfilTrack03EspessuraCurva02 = "1";
        var pPerfilTrack03Limite01Curva01 = "";
        var pPerfilTrack03Limite01Curva02 = "";
        var pPerfilTrack03Limite02Curva01 = "";
        var pPerfilTrack03Limite02Curva02 = "";
        var pPerfilTrack03PreenchimentoArea01 = "between";
        var pPerfilTrack03PreenchimentoArea02 = "between";
        var pPerfilTrack03TipoEscalaCurva01 = "linear";
        var pPerfilTrack03TipoEscalaCurva02 = "linear";
        var pPerfilTrack03TracoCurva01 = "solid";
        var pPerfilTrack03TracoCurva02 = "solid";

        var pPerfilTrack04CorArea01 = "interpolateReds";
        var pPerfilTrack04CorCurva01 = "red";
        var pPerfilTrack04EscalaMaxCurva01 = "";
        var pPerfilTrack04EscalaMinCurva01 = "";
        var pPerfilTrack04EspessuraCurva01 = "1";
        var pPerfilTrack04Limite01Curva01 = "";
        var pPerfilTrack04Limite02Curva01 = "";
        var pPerfilTrack04PreenchimentoArea01 = "left";
        var pPerfilTrack04TipoEscalaCurva01 = "linear";
        var pPerfilTrack04TracoCurva01 = "5,5";

        var plot_template_1 = [
            {
                components: [
                    {
                        curves: [
                            {
                                curveColors: [getFillColor(pPerfilTrack01CorCurva01, "normal")],
                                curveNames: ["GR"],
                                curveStrokeDashArray: [pPerfilTrack01TracoCurva01],
                                curveUnits: [""],
                                dataType: "curve",
                                depthCurveName: depthCurveName,
                                depthUnit: depthUnit,
                                fill: [
                                    {
                                        curve2: "",
                                        curveName: "GR",
                                        cutoffs: [
                                            -99999999,
                                            pPerfilTrack01Limite01Curva01,
                                            pPerfilTrack01Limite02Curva01
                                        ],
                                        fill: "yes",
                                        fillColors: [
                                            getFillColor(pPerfilTrack01CorArea01, "normal"),
                                            getFillColor(pPerfilTrack01CorArea01, "dark"),
                                            getFillColor(pPerfilTrack01CorArea01, "light")
                                        ],
                                        fillDirection: pPerfilTrack01PreenchimentoArea01,
                                        colorInterpolator: [getColorInterpolator(pPerfilTrack01CorArea01), null, null],
                                        maxScaleX: pPerfilTrack01EscalaMaxCurva01,
                                        minScaleX: pPerfilTrack01EscalaMinCurva01
                                    }
                                ],
                                scaleTypeLinearLog: [pPerfilTrack01TipoEscalaCurva01],
                                strokeLinecap: ["butt"],
                                strokeWidth: [pPerfilTrack01EspessuraCurva01],
                                wellNames: [selectedWell]
                            }
                        ]
                    }
                ],
                trackBox: {
                    width: trackWidth,
                    height: scheight,
                    div_id: "well_holder_track_01",
                    margin: { top: 5, right: 10, bottom: 5, left: 60 }
                }
            }
        ];

        var plot_template_2 = [
            {
                components: [
                    {
                        curves: [
                            {
                                curveColors: [getFillColor(pPerfilTrack02CorCurva01, "normal")],
                                curveNames: ["CAL"],
                                curveStrokeDashArray: [pPerfilTrack02TracoCurva01],
                                curveUnits: [""],
                                dataType: "curve",
                                depthCurveName: depthCurveName,
                                depthUnit: depthUnit,
                                fill: [
                                    {
                                        curve2: "",
                                        curveName: "CAL",
                                        cutoffs: [
                                            -99999999,
                                            pPerfilTrack02Limite01Curva01,
                                            pPerfilTrack02Limite02Curva01
                                        ],
                                        fill: "yes",
                                        fillColors: [
                                            getFillColor(pPerfilTrack02CorArea01, "normal"),
                                            getFillColor(pPerfilTrack02CorArea01, "dark"),
                                            getFillColor(pPerfilTrack02CorArea01, "light")
                                        ],
                                        colorInterpolator: [getColorInterpolator(pPerfilTrack02CorArea01), null, null],
                                        fillDirection: pPerfilTrack02PreenchimentoArea01,
                                        colorInterpolator: [getColorInterpolator(pPerfilTrack02CorArea01), null, null],
                                        maxScaleX: pPerfilTrack02EscalaMaxCurva01,
                                        minScaleX: pPerfilTrack02EscalaMinCurva01
                                    }
                                ],
                                scaleTypeLinearLog: [pPerfilTrack02TipoEscalaCurva01],
                                strokeLinecap: ["butt"],
                                strokeWidth: [pPerfilTrack02EspessuraCurva01],
                                wellNames: [selectedWell]
                            }
                        ]
                    }
                ],
                trackBox: {
                    width: trackWidth,
                    height: scheight,
                    div_id: "well_holder_track_02",
                    margin: { top: 5, right: 10, bottom: 5, left: 60 }
                }
            }
        ];

        var plot_template_3 = [
            {
                components: [
                    {
                        curves: [
                            {
                                curveColors: [
                                    getFillColor(pPerfilTrack03CorCurva01, "normal"),
                                    getFillColor(pPerfilTrack03CorCurva02, "normal")
                                ],
                                curveNames: ["PHIN", "PHID"],
                                curveStrokeDashArray: [pPerfilTrack03TracoCurva01, pPerfilTrack03TracoCurva02],
                                curveUnits: ["", ""],
                                dataType: "curve",
                                depthCurveName: depthCurveName,
                                depthUnit: depthUnit,
                                fill: [
                                    {
                                        curveName: "PHIN",
                                        fill: "yes",
                                        fillDirection: pPerfilTrack03PreenchimentoArea01,
                                        cutoffs: [
                                            -99999999,
                                            pPerfilTrack03Limite01Curva01,
                                            pPerfilTrack03Limite02Curva01
                                        ],
                                        fillColors: [
                                            getFillColor(pPerfilTrack03CorArea01, "normal"),
                                            getFillColor(pPerfilTrack03CorArea01, "dark"),
                                            getFillColor(pPerfilTrack03CorArea01, "light")
                                        ],
                                        colorInterpolator: [getColorInterpolator(pPerfilTrack03CorArea01), null, null],
                                        maxScaleX: pPerfilTrack03EscalaMaxCurva01,
                                        minScaleX: pPerfilTrack03EscalaMinCurva01,
                                        curve2: "PHID"
                                    },
                                    {
                                        curveName: "PHID",
                                        fill: "yes",
                                        fillDirection: pPerfilTrack03PreenchimentoArea02,
                                        cutoffs: [
                                            -99999999,
                                            pPerfilTrack03Limite01Curva02,
                                            pPerfilTrack03Limite02Curva02
                                        ],
                                        fillColors: [
                                            getFillColor(pPerfilTrack03CorArea02, "normal"),
                                            getFillColor(pPerfilTrack03CorArea02, "dark"),
                                            getFillColor(pPerfilTrack03CorArea02, "light")
                                        ],
                                        colorInterpolator: [getColorInterpolator(pPerfilTrack03CorArea02), null, null],
                                        maxScaleX: pPerfilTrack03EscalaMaxCurva02,
                                        minScaleX: pPerfilTrack03EscalaMinCurva02,
                                        curve2: "PHIN"
                                    }
                                ],
                                scaleTypeLinearLog: [pPerfilTrack03TipoEscalaCurva01, pPerfilTrack03TipoEscalaCurva02],
                                strokeLinecap: ["butt"],
                                strokeWidth: [pPerfilTrack03EspessuraCurva01, pPerfilTrack03EspessuraCurva02],
                                wellNames: [selectedWell]
                            }
                        ]
                    }
                ],
                trackBox: {
                    width: trackWidth,
                    height: scheight,
                    div_id: "well_holder_track_02",
                    margin: { top: 5, right: 10, bottom: 5, left: 60 }
                }
            }
        ];

        var plot_template_4 = [
            {
                components: [
                    {
                        curves: [
                            {
                                curveColors: [getFillColor(pPerfilTrack04CorCurva01, "normal")],
                                curveNames: ["RESD"],
                                curveStrokeDashArray: [pPerfilTrack04TracoCurva01],
                                curveUnits: [""],
                                dataType: "curve",
                                depthCurveName: depthCurveName,
                                depthUnit: depthUnit,
                                fill: [
                                    {
                                        curve2: "",
                                        curveName: "RESD",
                                        cutoffs: [
                                            -99999999,
                                            pPerfilTrack04Limite01Curva01,
                                            pPerfilTrack04Limite02Curva01
                                        ],
                                        fill: "yes",
                                        fillColors: [
                                            getFillColor(pPerfilTrack04CorArea01, "normal"),
                                            getFillColor(pPerfilTrack04CorArea01, "dark"),
                                            getFillColor(pPerfilTrack04CorArea01, "light")
                                        ],
                                        colorInterpolator: [getColorInterpolator(pPerfilTrack04CorArea01), null, null],
                                        fillDirection: pPerfilTrack04PreenchimentoArea01,
                                        maxScaleX: pPerfilTrack04EscalaMaxCurva01,
                                        minScaleX: pPerfilTrack04EscalaMinCurva01
                                    }
                                ],
                                scaleTypeLinearLog: [pPerfilTrack04TipoEscalaCurva01],
                                strokeLinecap: ["butt"],
                                strokeWidth: [pPerfilTrack04EspessuraCurva01],
                                wellNames: [selectedWell]
                            }
                        ]
                    }
                ],
                trackBox: {
                    width: trackWidth,
                    height: scheight,
                    div_id: "well_holder_track_02",
                    margin: { top: 5, right: 10, bottom: 5, left: 60 }
                }
            }
        ];

        var plot_template_Zone = [
            {
                components: [
                    {
                        //"rectangles": ZONAS_RECT,
                        curves: [
                            {
                                curveColors: [null, null, null],
                                curveNames: ["ZONE"],
                                curveStrokeDashArray: [null],
                                curveUnits: [""],
                                dataType: "category",
                                depthCurveName: depthCurveName,
                                depthUnit: depthUnit,
                                fill: [
                                    {
                                        curve2: "",
                                        curveName: "",
                                        cutoffs: [null, null, null],
                                        fill: "no",
                                        fillColors: [null, null, null],
                                        colorInterpolator: [null, null, null],
                                        fillDirection: "",
                                        maxScaleX: "",
                                        minScaleX: ""
                                    }
                                ],
                                scaleTypeLinearLog: [null],
                                strokeLinecap: ["butt"],
                                strokeWidth: [null],
                                wellNames: [selectedWell]
                            }
                        ]
                    }
                ],
                trackBox: {
                    width: zoneLogTrackWidth,
                    height: scheight,
                    div_id: "zone_well_holder",
                    margin: { top: 5, right: 10, bottom: 5, left: 60 }
                }
            }
        ];

        var plot_template_Facies = [
            {
                components: [
                    {
                        //"rectangles": FACIES_RECT,
                        curves: [
                            {
                                curveColors: [null, null, null],
                                curveNames: ["FACIES"],
                                curveStrokeDashArray: [null],
                                curveUnits: [""],
                                dataType: "category",
                                depthCurveName: depthCurveName,
                                depthUnit: depthUnit,
                                fill: [
                                    {
                                        curve2: "",
                                        curveName: "",
                                        cutoffs: [null, null, null],
                                        fill: "no",
                                        fillColors: [null, null, null],
                                        colorInterpolator: [null, null, null],
                                        fillDirection: "",
                                        maxScaleX: "",
                                        minScaleX: ""
                                    }
                                ],
                                scaleTypeLinearLog: [null],
                                strokeLinecap: ["butt"],
                                strokeWidth: [null],
                                wellNames: [selectedWell]
                            }
                        ]
                    }
                ],
                trackBox: {
                    width: zoneLogTrackWidth,
                    height: scheight,
                    div_id: "zone_well_holder",
                    margin: { top: 5, right: 10, bottom: 5, left: 60 }
                }
            }
        ];

        return [
            plot_template_1,
            plot_template_2,
            plot_template_3,
            plot_template_4,
            plot_template_Zone,
            plot_template_Facies
        ];
    }

    function Initialize(div_id, templates, sfData) {
        d3.select("#" + div_id)
            .style("margin", "0")
            .style("padding", "0")
            .style("border", "0");

        $("#" + div_id).append(
            '<DIV id=drawer_content style="DISPLAY: none"></DIV>' +
                "<DIV id=drawer_wall></DIV>" +
                '<DIV id=drawer_menu><DIV id="drawer_menu_content" style="position:relative;">' +
                '<A id=abtnfechar style="cursor: pointer; float: right;"><IMG style="HEIGHT: 18px; WIDTH: 18px; PADDING-RIGHT:5px; PADDING-TOP:3px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QMaATMDnvmzBwAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAADF0lEQVRIx72WMW/bRhTH3zveMR3irp2kIgWcD5CgSwqkMAzIJzJSjW4NsmXoVCBLp2ZsvoD1UQya5MmMmwbwFmctIgEB5HYOamUIyXf3OohsVdaSqA55C0EQd7/3Hv/3vwdhOIA6wnBwNBwestbBL72e/gQA4OCgD5tC66B+3uz3Qx4ODzkMB0dL+wIuvfwshPgJERkRsSiK87IsH5yemncHB31I03glJElOoNfTHc/zZr7vMzMDM6Nz7lkUHT8FAPCaEIAF3PO8DiLe63Y/N+NxOtc6wOl00oRgBbkjpfxNKQXVeqwSvr+7e1tNJm+eYxgOjoQQPyxDloOIXhPRE2OSX+vsG5V8JaU8kVJ+ek3BXFU2wuHwkAHgWsgS7IqI9oxJLur/sVTJ2QrI3zAAQOz3Q676iut+OBEBEXWNSS4BAHo93ZFSzqSUa4WCiFAUBaDWwU1EnFf9XRtlWQIz71QbtF1z7pzdxy2z46IoEACgZRde5nnxTZaZd0LrAIxJLonoLhFdrVvIzKiUAqUUtIC8zvP8uyxbHA+RJCdQwS6IKNgEaxPW2isiepJl4z/qM4iNM8GVkl5tauM60Vhr76ZpfFHvCU1Jrzjl2AaAiFyWJTrnuklyctnvhxDH0T/fV1nKNmqsK2HmnTiO3jchAAACPlKIVa1DxLnv+9x2I6UUI+Jc66ATx9F/XF+sMMhZGwk3pS+lBCHE2729/c/SNP4XzLvGIMdSyhv/u0VCgOd5X3Y63bPTU/On1gFMpxPAJUgbg2xdIBFdEtG3xiSvtA5gWwuCPM9fLCzoxtcLY25nxNua6rm1dh8RQAgvU0rda2vEoq26iOhlWZYPjEk+pGnywTn3iIg2Juf7PiPiXFTq2gQ5y/P8YT0/aB1AmsZvWxoxKKVAWGtHlYx5DeRxlo1/rw1yCyNmZkZr7cibTN7Eu7u3FSLeb84Ni/skf5Rl41lzEppOJ6B1gGkaz27d+sIAwPdCiOvmhWdRdPzjRxu3RD1ARtHxU+fcCAAwz/MX1tr9TZB6SKkvT2beqW5gdM6NakgYDuAvrltBwrCYxZ8AAAAASUVORK5CYII="></I></I></A>' +
                '<DIV id="selectedWellDiv" style="clear: right; color: black; display:flex; align-items: center;"></DIV>' +
                '<DIV id="accordionConf" style="clear: right;">' +
                "</DIV>" +
                "</DIV>" +
                "</DIV>"
        );

        vanilla_drawer = new VanillaDrawer();

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

    var dataRows = await dataView.allRows();

    plot_templates = buildTemplates(dataRows);

    Initialize("mod-container", plot_templates, dataRows);

    multipleLogPlot("mod-container", plot_templates, dataRows);
}

function curveBox(template_for_plotting, sfData) {
    //////////////  DEFINING VARIABLES so the longer name doesn't have to be used //////////////
    //// These parts of the function establish variables from the config JSON in shorter variable names
    //// If they are necessary for plotting & there is a chance the template might not include them, then default values might be defined here for cases where they are accidentally not defined
    // default values might be defined here for cases where they are accidentally not defined

    let template_overall = template_for_plotting[0]["curve_box"];
    let template_components = template_for_plotting[0]["components"];

    let template_curves = template_components[0]["curves"][0];
    let template_lines = template_components[0]["lines"];
    let template_rectangles = template_components[0]["rectangles"];

    /// Parameters that define shape & size of overall curve box

    let div_id = template_overall["div_id"];
    d3.select("#" + div_id)
        .selectAll("*")
        .remove();
    let height_multiplier_components = 1;
    if (template_overall["height_multiplier_components"]) {
        height_multiplier_components = template_overall["height_multiplier_components"];
    }
    let height = template_overall["height"] * height_multiplier_components;
    let height_components = template_overall["height"];
    let width = template_overall["width"];
    let margin = template_overall["margin"];
    let gridlines_color = "#D3D3D3";
    let gridlines_stroke_width = 0.2;
    //// Data is in d3.js form. An array of objects consisting of single level key:value pairs
    let data = template_curves["data"];
    let curve_names = template_curves["curve_names"];
    let curve_colors = template_curves["curve_colors"];
    let curve_stroke_dasharray = template_curves["curve_stroke_dasharray"];
    let scale_linear_log_or_yours = template_curves["scale_linear_log_or_yours"];
    let depth_curve_name = template_curves["depth_curve_name"];

    let curve_units = "";
    if (template_curves["curve_units"]) {
        curve_units = template_curves["curve_units"];
    }

    let depth_units_string = "";
    if (template_curves["depth_units_string"]) {
        depth_units_string = template_curves["depth_units_string"];
    }

    ///////// NEED TO FIX DEPTHS AS THERE ARE MULTIPLE DEPTH LIMITS AND THEY NEED TO BE CALCULATED PROPERLY !!!!! //////////////////////////
    //       //// Calculate depth min and max if depth min and/or max is not given explicitly in the template

    let depth_min = d3.min(sfData.data, function (d, i) {
        return getCurveData(i, depth_curve_name, sfData);
    });
    let depth_max = d3.max(sfData.data, function (d, i) {
        return getCurveData(i, depth_curve_name, sfData);
    });

    //////////////  Initiate Divs + SVGs. Different depending single SVG or header separate =>//////////////
    let svg;
    let svg_holder;
    let svg_header;

    svg_holder = d3
        .select("#" + div_id)
        .append("div")
        .attr("class", "svg_holder")
        .style("overflow-x", "visible")
        .style("overflow-y", "visible")
        .style("position", "sticky")
        .style("top", 0)
        .style("background-color", "white")
        .style("z-index", 1)
        //.style("margin", 0)
        .style("margin-bottom", "10px");

    svg_header = d3.select("#" + div_id + " div.svg_holder").append("svg");
    svg_header.attr("class", "header");
    svg_header.attr("width", width).attr("height", "100px");
    //.attr("height","8.3em");
    svg_header.append("g");
    svg_header.style("display", "block");

    const curveBox_main_div = d3.select("#" + div_id).append("div");
    curveBox_main_div
        .attr("height", height_components + "px")
        .attr("class", "component_outter")
        .style("display", "flex")
        .style("position", "relative")
        .style("margin", 0)
        .style("padding", 0)
        .style("border", 0)
        .style("box-sizing", "border-box");

    const curveBox_sub_div = d3.select("#" + div_id + " div.component_outter").append("div");
    curveBox_sub_div
        .attr("class", "component_inner")
        //.style('overflow-y',"auto")
        .style("position", "relative");
    //.style('max-height',height_components+"px")

    svg = d3.select("#" + div_id + " div.component_outter div.component_inner").append("svg");

    //   //// This will help save the x axis function for first curve if there are more than one curve
    //   /// and they are at different scales. We need this in order to use the 'between' method of fill!
    //   let x_for_k_is_0
    //   //// This will help save the x axis function for second curve if there are more than one curve
    //   /// and they are at different scales. We need this in order to use the 'between' method of fill!
    //   let x_for_k_is_1
    //   //// This will help save the x axis function for third curve if there are more than one curve
    //   /// and they are at different scales. We need this in order to use the 'between' method of fill!
    //   let x_for_k_is_2
    //   //// This will help save the x axis function for fourth curve if there are more than one curve
    //   /// and they are at different scales. We need this in order to use the 'between' method of fill!
    //   let x_for_k_is_3

    let x_functions_for_each_curvename = {}; //// populate with {"curvename":curvename,"x_func":func}

    let mins = [];
    let maxes = [];
    let curvesDescription = "";
    let y;
    let yAxis;
    let yAxis2;

    //////////////////// define y scale, aka the one for the depth  ////////////////////

    y = d3
        .scaleLinear()
        .domain([depth_max, depth_min])
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

    //yAxis2= function(g) { return g.attr("transform", `translate(${margin.left-35},0)`)
    //                              .call(d3.axisLeft(y))
    //                              .call(function(g) { return g.select(".domain");}); }

    //////////////  Building curves within curvebox =>//////////////
    for (let k = 0; k < curve_names.length; k++) {
        //// code that creates a line for each Curve in order provided and applies
        //// the color in the color array in order provided

        var max_scale_x = null;
        var min_scale_x = null;
        var gradient_color_fills = [];

        if (template_curves["fill"] && k < template_curves["fill"].length) {
            min_scale_x = template_curves["fill"][k]["min_scale_x"] ? template_curves["fill"][k]["min_scale_x"] : null;
            max_scale_x = template_curves["fill"][k]["max_scale_x"] ? template_curves["fill"][k]["max_scale_x"] : null;
            gradient_color_fills = template_curves["fill"][k]["gradient_color_scale"];
        }

        let min_this = d3.min(sfData.data, function (d, i) {
            return getCurveData(i, curve_names[k], sfData);
        });
        let max_this = d3.max(sfData.data, function (d, i) {
            return getCurveData(i, curve_names[k], sfData);
        });

        mins.push(min_this);
        maxes.push(max_this);

        //escala fixa
        if (min_scale_x) {
            min_this = min_scale_x;
        }
        if (max_scale_x) {
            max_this = max_scale_x;
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
        if (scale_linear_log_or_yours[k] == "log") {
            x = d3
                .scaleLog()
                .domain([min_this, max_this])
                .range([margin.left, width - margin.right]);
        } else if (!min_this && !max_this) {
            x = d3
                .scaleOrdinal()
                .domain(["", " "])
                .range([margin.left, width - margin.right]);
        } else if (scale_linear_log_or_yours[k] == "linear") {
        }
        if (k == 0) {
            x_func == x;
        }

        //// This creates an object to hold multiple x axis scale functions
        //// that will be used if 'between' style fill is selected.
        x_functions_for_each_curvename[curve_names[k]] = x;
    }

    for (let k = 0; k < curve_names.length; k++) {
        let min = mins[k];
        let max = maxes[k];

        let header_text_line = curve_names[k];

        curvesDescription = curvesDescription + "-" + curve_names[k];

        let curveUnit = "";
        if (curve_units[k]) {
            curveUnit = curve_units[k];
        }

        if (!isNaN(min) && !isNaN(max)) {
            header_text_line = min.toFixed(1) + " - " + curve_names[k] + " " + curveUnit + " - " + max.toFixed(1);
        } else {
            header_text_line = curve_names[k];
        }

        //////////////  Building curvebox parts that aren't header. First define size & title =>//////////////
        svg.attr("class", "components")
            .attr("width", width)
            .attr("height", height)
            .style("margin", "0 auto")
            .style("overflow", "scroll");

        let y_axis_text = depth_curve_name + (depth_units_string != "" ? " (" + depth_units_string + ")" : "");
        svg.append("g")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("dy", ".75em")
            .attr("y", 0 - margin.left * 0.9)
            .attr("x", height / -2 + margin.top)
            .style("text-anchor", "end")
            .text(y_axis_text)
            .style("fill", "#2b2929");

        //// Code that assumes multiple curves are plotted in same curvebox

        var gridlines_obj = d3
            .axisTop()
            .ticks((width - margin.left - margin.right) / 25)
            .tickFormat("")
            .tickSize(-height + margin.top + 10)
            .scale(x_functions_for_each_curvename[curve_names[0]]);
        svg.append("g")
            .attr("class", "grid")
            .call(gridlines_obj)
            .style("stroke", gridlines_color)
            .style("stroke-width", gridlines_stroke_width);

        //////////////  Header text, two way depending on  =>//////////////

        let distance_from_top = (1 + k * 3.5).toString() + "em";
        svg_header
            .append("text")
            .attr("x", (margin.left + width) / 2)
            .attr("y", 0 + distance_from_top)
            .attr("text-anchor", "middle")
            .style("font-size", "11px")
            .style("text-decoration", "underline")
            .style("fill", curve_colors[k])
            .text(header_text_line);

        let translate_string = "translate(0," + (17 + k * 38.5).toString() + ")";

        let xAxis_header = function (g) {
            return g.attr("transform", translate_string).call(
                d3
                    .axisBottom(x_functions_for_each_curvename[curve_names[k]])
                    .ticks((width - margin.left - margin.right) / 25)
                    .tickSizeOuter(0)
            );
        };

        svg_header.append("g").call(xAxis_header).append("text");

        //////////////   define the area filled under the curve =>//////////////

        var defs = svg.append("defs");

        var filter = defs
            .append("filter")
            .attr("id", "tooltip_background")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 1)
            .attr("height", 1);

        filter.append("feFlood").attr("flood-color", "rgba(255, 255, 255,0.8)").attr("result", "bg");

        var feMerge = filter.append("feMerge").attr("flood-color", "yellow").attr("result", "bg");

        feMerge.append("feMergeNode").attr("in", "bg");

        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        defs.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("x", margin.left)
            .attr("y", margin.top)
            .attr("width", width - margin.right - margin.left)
            .attr("height", y(depth_max) - y(depth_min));

        function opacityFunc(n, threshold_curve1, threshold_curve2) {
            if (n == 0) return 1;
            else if (threshold_curve1) return 1;
            else if (threshold_curve2) return 1;
            else return 0;
        }

        for (let i = 0; i < template_curves["fill"].length; i++) {
            //let i = k
            if (template_curves["fill"][i]["fill"] == "yes") {
                let number_colors = template_curves["fill"][i]["fill_colors"].length;
                let curve_name1 = template_curves["fill"][i]["curve_name"];

                for (let j = 0; j < number_colors; j++) {
                    let area1 = d3.area();
                    let threshold = -99999999;
                    let fill_color = "gray";
                    let gradient_color_interpolation = d3.interpolateSpectral;

                    if (number_colors !== 0) {
                        threshold = template_curves["fill"][i]["cutoffs"][j];
                        fill_color = template_curves["fill"][i]["fill_colors"][j];
                        gradient_color_interpolation = template_curves["fill"][i]["gradient_color_scale"][j];
                    }

                    if (fill_color == "gradient" && gradient_color_interpolation) {
                        //let gradient_color_fill_interpolation = d3.interpolateSpectral;

                        ///if (template_curves["fill"][i]["gradient_color_scale"]) {
                        //	if (template_curves["fill"][i]["gradient_color_scale"][0]) {
                        //	    gradient_color_fill_interpolation = template_curves["fill"][i]["gradient_color_scale"][0];
                        //	}
                        //}

                        let color_gradient_functions_for_each_curvename = {};

                        if (scale_linear_log_or_yours[k] == "linear") {
                            //color_gradient_functions_for_each_curvename[curve_name1] = function(d) { return 'red' };
                            color_gradient_functions_for_each_curvename[curve_name1 + "_" + j] = d3
                                .scaleSequential(gradient_color_interpolation)
                                .domain(x_functions_for_each_curvename[curve_name1].domain());
                        } else if (scale_linear_log_or_yours[k] == "log") {
                            //color_gradient_functions_for_each_curvename[curve_name1] = function(d) { return 'blue' };
                            color_gradient_functions_for_each_curvename[curve_name1 + "_" + j] = d3
                                .scaleSequentialLog(gradient_color_interpolation)
                                .domain(x_functions_for_each_curvename[curve_name1].domain());
                        }

                        var grd = svg
                            .append("defs")
                            .append("linearGradient")
                            .attr("id", "linear-gradient-" + curve_name1 + "_" + j)
                            .attr("gradientUnits", "userSpaceOnUse")
                            .attr("x1", 0)
                            .attr("x2", 0)
                            .attr("y1", y(depth_min))
                            .attr("y2", y(depth_max))
                            .selectAll("stop")
                            .data(sfData.data)
                            .join("stop")
                            .attr("offset", function (d, i) {
                                return (
                                    ((y(getCurveData(i, depth_curve_name, sfData)) - y(depth_min)) /
                                        (y(depth_max) - y(depth_min))) *
                                        100.0 +
                                    "%"
                                );
                            })
                            .attr("stop-color", function (d, i) {
                                return !isNaN(getCurveData(i, curve_name1, sfData))
                                    ? color_gradient_functions_for_each_curvename[curve_name1 + "_" + j](
                                          getCurveData(i, curve_name1, sfData)
                                      )
                                    : "rgba(0,0,0,0)";
                            });

                        if (color_gradient_functions_for_each_curvename[curve_name1 + "_" + j]) {
                            svg.append("defs")
                                .append("linearGradient")
                                .attr("id", "linear-gradient-legend-" + curve_name1 + "_" + j)
                                .attr("gradientUnits", "userSpaceOnUse")
                                .attr("x1", margin.left)
                                .attr("x2", width - margin.right)
                                .attr("y1", 0)
                                .attr("y2", 0)
                                .selectAll("stop")
                                .data(
                                    d3.range(
                                        x_functions_for_each_curvename[curve_name1].domain()[0],
                                        x_functions_for_each_curvename[curve_name1].domain()[1]
                                    )
                                )
                                .join("stop")
                                .attr("offset", function (d) {
                                    return (
                                        ((d - x_functions_for_each_curvename[curve_name1].domain()[0]) /
                                            (x_functions_for_each_curvename[curve_name1].domain()[1] -
                                                x_functions_for_each_curvename[curve_name1].domain()[0] -
                                                1)) *
                                            100 +
                                        "%"
                                    );
                                })
                                .attr("stop-color", function (d) {
                                    return color_gradient_functions_for_each_curvename[curve_name1 + "_" + j](d);
                                });

                            svg_header
                                .append("rect")
                                .attr("x", margin.left)
                                .attr("y", margin.top + 60)
                                .attr("width", width - margin.left - margin.right)
                                .attr("height", 18 / (j + 1))
                                .attr("fill", "url(#linear-gradient-legend-" + curve_name1 + "_" + j + ")")
                                .attr("stroke", "black")
                                .attr("stroke-width", 0.5);
                        }

                        fill_color = "url(#linear-gradient-" + curve_name1 + "_" + j + ")";
                    }

                    if (template_curves["fill"][i]["fill_direction"] == "left") {
                        let start_from_left = template_overall["margin"]["left"];
                        area1
                            .x1(function (d, i) {
                                return x_functions_for_each_curvename[curve_name1](
                                    getCurveData(i, curve_name1, sfData)
                                );
                            })
                            .x0(function (d, i) {
                                return start_from_left;
                            })
                            .defined(function (d, i) {
                                return getCurveData(i, curve_name1, sfData) > threshold;
                            })
                            .y(function (d, i) {
                                return y(getCurveData(i, depth_curve_name, sfData));
                            });

                        svg.append("path")
                            .datum(sfData.data)
                            .attr("class", "area")
                            .attr("clip-path", "url('#clip')")
                            .attr("d", area1)
                            .attr("stroke", "none")
                            .attr("fill", fill_color)
                            .attr("fill-opacity", opacityFunc(j, threshold, null));
                    }
                    if (template_curves["fill"][i]["fill_direction"] == "right") {
                        let start_from_right = template_overall["margin"]["right"];
                        let start_from_left = template_overall["margin"]["left"];
                        area1
                            .x1(function (d, i) {
                                return width - start_from_right;
                            })
                            .defined(function (d, i) {
                                return getCurveData(i, curve_name1, sfData) > threshold;
                            })
                            .x0(function (d, i) {
                                return x_functions_for_each_curvename[curve_name1](
                                    getCurveData(i, curve_name1, sfData)
                                );
                            })
                            .y(function (d, i) {
                                return y(getCurveData(i, depth_curve_name, sfData));
                            });

                        svg.append("path")
                            .datum(sfData.data)
                            .attr("class", "area")
                            .attr("clip-path", "url('#clip')")
                            .attr("d", area1)
                            .attr("stroke", "none")
                            .attr("fill", fill_color)
                            .attr("fill-opacity", opacityFunc(j, threshold, null));
                    }
                    if (template_curves["fill"][i]["fill_direction"] == "between") {
                        let between_2_curve = template_curves["fill"][i]["curve2"];

                        var indexCurve2;
                        for (let c = 0; c < curve_names.length; c++) {
                            if (between_2_curve == curve_names[c]) {
                                indexCurve2 = c;
                                break;
                            }
                        }

                        let curve_2_color = template_curves["fill"][indexCurve2]["fill_colors"][j];
                        let curve_2_threshold = template_curves["fill"][indexCurve2]["cutoffs"][j];

                        //// for through x_functions_for_each_curvename object and find the key that
                        //// matches between_2_curve which should be a curvename
                        //// get the x function for the second curve and the curve that is curvenames[k]
                        let second_curve_x_func = x_functions_for_each_curvename[between_2_curve];
                        let first_curve_x_func = x_functions_for_each_curvename[curve_name1];

                        area1
                            .x1(function (d, i) {
                                return first_curve_x_func(getCurveData(i, curve_name1, sfData));
                            })
                            .x0(function (d, i) {
                                return second_curve_x_func(getCurveData(i, between_2_curve, sfData));
                            })
                            .defined(function (d, i) {
                                return (
                                    getCurveData(i, curve_name1, sfData) > threshold &&
                                    getCurveData(i, between_2_curve, sfData) > curve_2_threshold &&
                                    first_curve_x_func(getCurveData(i, curve_name1, sfData)) >
                                        second_curve_x_func(getCurveData(i, between_2_curve, sfData))
                                );
                            })
                            .y(function (d, i) {
                                return y(getCurveData(i, depth_curve_name, sfData));
                            });

                        svg.append("path")
                            .datum(sfData.data)
                            .attr("class", "area")
                            .attr("clip-path", "url('#clip')")
                            .attr("d", area1)
                            .attr("stroke", "none")
                            .attr("fill", fill_color)
                            .attr("fill-opacity", opacityFunc(j, threshold, curve_2_threshold));

                        let area2 = d3.area();
                        area2
                            .x1(function (d, i) {
                                return first_curve_x_func(getCurveData(i, curve_name1, sfData));
                            })
                            .x0(function (d, i) {
                                return second_curve_x_func(getCurveData(i, between_2_curve, sfData));
                            })
                            .defined(function (d, i) {
                                return (
                                    getCurveData(i, curve_name1, sfData) > threshold &&
                                    getCurveData(i, between_2_curve, sfData) > curve_2_threshold &&
                                    first_curve_x_func(getCurveData(i, curve_name1, sfData)) <
                                        second_curve_x_func(getCurveData(i, between_2_curve, sfData))
                                );
                            })
                            .y(function (d, i) {
                                return y(getCurveData(i, depth_curve_name, sfData));
                            });

                        svg.append("path")
                            .datum(sfData.data)
                            .attr("class", "area")
                            .attr("clip-path", "url('#clip')")
                            .attr("d", area2)
                            .attr("stroke", "none")
                            .attr("fill", curve_2_color)
                            .attr("fill-opacity", opacityFunc(j, threshold, curve_2_threshold));
                    }
                }
            }
        }

        //////////////  Appends a curve line but doesn't include fill yet =>//////////////
        let another_line = d3
            .line()
            .x(function (d, i) {
                return x_functions_for_each_curvename[curve_names[k]](getCurveData(i, curve_names[k], sfData));
            })
            .y(function (d, i) {
                return y(getCurveData(i, depth_curve_name, sfData));
            })
            .defined(function (d, i) {
                return getCurveData(i, curve_names[k], sfData) ? true : false;
            });
        //.defined(function(d,i) { return  (getCurveData(i, curve_names[k], sfData) !== null	) && !isNaN(getCurveData(i, curve_names[k], sfData)); });

        svg.append("path")
            .datum(sfData.data)
            //.datum(sfData.data.filter(another_line.defined()))
            .attr("fill", "none")

            .attr("clip-path", "url('#clip')")
            .attr("stroke", curve_colors[k])
            .attr("stroke-width", template_curves["stroke_width"][k])
            //template_curves["fill"][k]["fill"] == "yes" ? 1.5 : 0.5)
            //template_curves["stroke_width"][k])
            .attr("stroke-linecap", template_curves["stroke_linecap"][k])
            .attr("stroke-dasharray", curve_stroke_dasharray[k])
            .attr("d", function (d, i) {
                return another_line(d, i);
            });
    }

    //////////////  Rectangles for ZoneLog =>//////////////
    try {
        if (template_rectangles) {
            for (let i = 0; i < template_rectangles.length; i++) {
                let this_rectangle = template_rectangles[i];

                svg.append("rect")
                    .datum(sfData.data)
                    .attr("x", margin.left)
                    .attr("y", y(this_rectangle.depth_top))
                    .attr("width", width - margin.right - margin.left)
                    .attr("height", function (d) {
                        //console.log("y: " + y(this_rectangle.depth_bottom) - y(this_rectangle.depth_top));
                        //return y(d);
                        return Math.abs(y(this_rectangle.depth_top) - y(this_rectangle.depth_bottom));
                        //return y(Math.min(this_rectangle.depth_bottom,depth_max)) - y(Math.max(this_rectangle.depth_top,depth_min));
                    })

                    .style("fill", this_rectangle.fill)
                    .style("opacity", this_rectangle.opacity)
                    .style("cursor", "pointer")
                    .on("mouseover", function (d) {
                        console.log("mouseover");
                    })
                    .on("click", function (d) {
                        console.log("onclick");
                        console.dir(d);
                    });

                svg.append("text")
                    .attr("class", "wrapme")
                    .attr("x", margin.left + (width - margin.right - margin.left) * 0.5)
                    .attr("width", width - margin.right - margin.left)
                    .attr("y", function (d) {
                        return (
                            y(this_rectangle.depth_top) +
                            Math.abs(y(this_rectangle.depth_top) - y(this_rectangle.depth_bottom)) / 2
                        );
                    })
                    .style("font-size", "10px")
                    .attr("text-anchor", "middle")
                    .text(this_rectangle.label)
                    .call(wrap)
                    .attr("transform", function (d) {
                        //return "translate(0,0)";
                        return "translate(0," + (this.getBBox().height / 2 - 1) + ")";
                    });
            }
        }
    } catch (err) {
        console.log("could not do rectangle in curveBox function for some reason. error= ", err);
    }

    /* Marking Representation */

    var areaMark = d3
        .area()
        .x1(width - margin.right)
        .x0(margin.left + 1)
        .defined(function (d, i) {
            //return d.hints.marked;
            return false; // Needs updating!
        })
        .y(function (d, i) {
            return y(getCurveData(i, depth_curve_name, sfData));
        });

    var areaPath = svg
        .append("path")
        .datum(sfData.data)
        .attr("class", "area")
        .attr("clip-path", "url('#clip')")
        .attr("d", areaMark)
        .attr("stroke", "none")
        .attr("fill", "rgb(0,0,0)")
        .attr("fill-opacity", 0.2);
    //.style("stroke-dasharray", ("7,3")) // make the stroke dashed
    //.style("stroke", "rgba(0,0,0,0.4)")   // set the line colour
    ////////////////      TOOLTIP Part 1       ///////////////////

    function getTooltipXCoordinate(xFunction, xArgument) {
        if (xFunction && xArgument && xFunction(xArgument)) {
            return xFunction(xArgument);
        } else if (margin.left) {
            return margin.left;
        } else {
            return 1;
        }
    }

    //// statements to make sure the mouseover_curvename is a present curve and if not use first curve
    //if(mouseover_curvename == "default"){mouseover_curvename = curve_names[0]}
    //else if (curve_names.includes(mouseover_curvename)){mouseover_curvename = mouseover_curvename}
    //else{mouseover_curvename = curve_names[0]}

    let curve_x_func = x_functions_for_each_curvename[curve_names[0]];

    var second_curve = null;
    var second_curve_x_func = null;

    if (template_curves["fill"][0]["curve2"]) {
        second_curve = template_curves["fill"][0]["curve2"];
        second_curve_x_func = x_functions_for_each_curvename[second_curve];
    }

    //// statement to handle color of curve text and circle on hover
    let curve_on_mouseover_color = curve_colors[0];

    //// appends start of mouseover rectange used for showing hover content
    var focus = svg.append("g").style("display", "none");

    //// function called to change hover style & contents when mouseover rectangle appended to svg svg
    function mousemove(evt) {
        let depthIndex = getCurveIndex(depth_curve_name, sfData);
        let curve1Index = getCurveIndex(curve_names[0], sfData);
        let curve2Index = getCurveIndex(curve_names[1], sfData);

        var bisectData = d3.bisector(function (d) {
            return d.continuous("DEPTH").value();
        }).left;

        var y0 = y.invert(d3.pointer(evt)[1]);
        var i = bisectData(sfData.data, y0);

        var d1 = sfData.data[i];
        var d0 = sfData.data[i - 1];

        var d = null;

        if (d0 && d1) {
            if (d0[depthIndex] && d1[depthIndex]) {
                d = y0 - d0[depthIndex] > d1[depthIndex] - y0 ? d1 : d0;
            }
        }
        if (d == null) {
            d = d1;
        }
        if (d == null) {
            d = d0;
        }

        //// depth value
        focus
            .select("text.y2")
            .attr("filter", "url(#tooltip_background)")
            .attr(
                "transform",
                "translate(" +
                    getTooltipXCoordinate(curve_x_func, d.continuous(curve_names[0]).value()) +
                    "," +
                    y(d.continuous("DEPTH").value()) +
                    ")"
            )
            .text(d.continuous("DEPTH").value() ? d.continuous("DEPTH").value().toFixed(2) : "");

        //// curve value
        focus
            .select("text.y4")
            .attr("filter", "url(#tooltip_background)")
            .attr("width", width - margin.right - margin.left)
            .attr("x", getTooltipXCoordinate(curve_x_func, d.continuous(curve_names[1]).value()) + 7)
            .attr("y", y(d.continuous("DEPTH").value()) + 12)
            .text(d.continuous(curve_names[1]).value() ? d.continuous(curve_names[1]).value() : "")
            .call(wrapTooltip);

        if (second_curve) {
            focus
                .select("text.y6")
                .attr("filter", "url(#tooltip_background)")
                .attr(
                    "transform",
                    "translate(" +
                        getTooltipXCoordinate(curve_x_func, d.continuous(curve_names[1]).value()) +
                        "," +
                        y(d.continuous("DEPTH").value()) +
                        ")"
                )
                .text(d.continuous(curve_names[1]).value() ? d.continuous(curve_names[1]).value() : "");
        }

        focus
            .select(".x")
            .attr(
                "transform",
                "translate(" + getTooltipXCoordinate(curve_x_func, d.continuous(curve_names[0]).value()) + "," + 0 + ")"
            )
            .attr("y2", height);

        //// circle y class part 2
        focus
            .select(".y")
            .attr(
                "transform",
                "translate(" +
                    getTooltipXCoordinate(curve_x_func, d.continuous(curve_names[0]).value()) +
                    "," +
                    y(d.continuous("DEPTH").value()) +
                    ")"
            )
            .text(d.continuous(curve_names[0]).value() ? d.continuous(curve_names[0]).value() : "");

        focus
            .select(".yl")
            .attr("transform", "translate(" + 0 + "," + y(d.continuous("DEPTH").value()) + ")")
            .text(d.continuous(curve_names[0]).value() ? d.continuous(curve_names[0]).value() : "");
    }
    // append the x line
    focus
        .append("line")
        .attr("class", "x")
        .style("stroke", "red")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("y1", 0)
        .attr("y2", width);

    // append the y line
    focus
        .append("line")
        .attr("class", "yl")
        .style("stroke", "blue")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("x1", 0)
        .attr("x2", height);

    // append the circle at the intersection
    focus
        .append("circle")
        .attr("class", "y")
        .style("fill", "none")
        .style("stroke", curve_on_mouseover_color ? curve_on_mouseover_color : "black")
        .attr("r", 3);

    //// depth value on hover
    //if(mouseover_depth_or_depth_and_curve == "depth" || mouseover_depth_or_depth_and_curve == "depth_and_curve"){
    focus
        .append("text")
        .attr("class", "y2")
        .attr("dx", 6)
        .attr("dy", "-.7em")
        .attr("text-anchor", "left")
        .style("font-size", "0.8em");
    //.text(function(d) { return "teste teste"; }).call(getBB);
    //}

    //// curve value on hover
    //if(mouseover_depth_or_depth_and_curve == "curve" || mouseover_depth_or_depth_and_curve == "depth_and_curve"){
    focus
        .append("text")
        .attr("class", "y4")
        //.attr("dx", 0)
        //.attr("dy", "1.3em")
        .attr("text-anchor", "left")
        .style("font-size", "0.8em")
        .style("fill", curve_on_mouseover_color ? curve_on_mouseover_color : "black")
        .style("font-weight", "bold");
    //.style("stroke", curve_on_mouseover_color ? curve_on_mouseover_color : 'black' )
    //.style("stroke-width", "0.5px");

    if (second_curve) {
        focus
            .append("text")
            .attr("class", "y6")
            .attr("dx", 6)
            .attr("dy", "2.4em")
            .attr("text-anchor", "left")
            .style("font-size", "0.8em")
            .style("fill", curve_colors[1] ? curve_colors[1] : "black")
            .style("font-weight", "bold");
        //.style("stroke", curve_colors[1])
        //.style("stroke-width", "0.5px");
    }
    //}

    // append the rectangle to capture mouse               // **********
    svg.append("rect") // **********
        .attr("width", width) // **********
        .attr("height", height) // **********
        .style("fill", "none") // **********
        .style("pointer-events", "all") // **********
        .on("mouseover", function () {
            focus.style("display", null);
        })
        .on("mouseout", function () {
            focus.style("display", "none");
        })
        .on("mousemove", mousemove); // **********

    //////////////  Calling node. Only returning svg node for saving single SVG file purposes =>//////////////
    svg_holder.node();
    svg_header.node();
    return svg.node();
}

function wrapTooltip(text) {
    text.each(function () {
        var text = d3.select(this);
        var words = text
            .text()
            .split(/[ ,.]+/)
            .reverse(); //.split(/\s+/).reverse();
        var lineHeight = 12;
        var width = parseFloat(text.attr("width"));

        var y = parseFloat(text.attr("y"));
        var x = text.attr("x");
        var anchor = text.attr("text-anchor");
        var tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("text-anchor", anchor);
        var lineNumber = 0;
        var line = [];
        var word = words.pop();

        while (word) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                lineNumber += 1;
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                //tspan = text.append('tspan').attr('x', x).attr('y', y + lineNumber * lineHeight).attr('text-anchor', anchor).text(word);
                tspan = text
                    .append("tspan")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", lineNumber * lineHeight)
                    .attr("text-anchor", anchor)
                    .text(word);
            }
            word = words.pop();
        }
    });
}

function wrap(text) {
    text.each(function () {
        var text = d3.select(this);
        var words = text
            .text()
            .split(/[ ,.]+/)
            .reverse(); //.split(/\s+/).reverse();
        var lineHeight = 10;
        var width = parseFloat(text.attr("width"));
        var height = parseInt(d3.select(this).node().previousElementSibling.getBoundingClientRect().height);
        var y = parseFloat(text.attr("y"));
        var x = text.attr("x");
        var anchor = text.attr("text-anchor");
        var tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("text-anchor", anchor);
        var lineNumber = 0;
        var line = [];
        var word = words.pop();

        while (word) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                lineNumber += 1;
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text
                    .append("tspan")
                    .attr("x", x)
                    .attr("y", y + lineNumber * lineHeight)
                    .attr("anchor", anchor)
                    .text(word);
            }
            word = words.pop();
        }

        if ((lineNumber + 1) * lineHeight > height * 0.9) {
            text.selectAll("tspan").remove();
        }
    });
}

function getBB(selection) {
    selection.each(function (d) {
        d.bbox = this.getBBox();
    });
}
function logPlot(template_for_plotting, sfData, headerHeight) {
    let template_overall = template_for_plotting[0]["trackBox"];
    let template_components = template_for_plotting[0]["components"];
    let templateCurves = template_components[0]["curves"][0];
    let dataType = templateCurves["dataType"];

    let div_id = template_overall["div_id"];
    d3.select("#" + div_id)
        .selectAll("*")
        .remove();
    let height = template_overall["height"] * verticalZoomHeightMultiplier - 110;
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
    let yAxis;

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

        xAxis_header = function (g) {
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
                                .data(sfData.data)
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
                                .datum(sfData.data)
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
                                .datum(sfData.data)
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
                                .datum(sfData.data)
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
                                .datum(sfData.data)
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
                .datum(sfData.data)
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
        if (i <= 0 || i > sfData.data.lenght) {
            return false;
        } else {
            return sfData.data[i - 1].hints.marked;
        }
    }

    var areaMark = d3
        .area()
        .x0(margin.left)
        .x1(width - margin.right)

        .defined(function (d, i) {
            return d.hints.marked || checkPreviousMarked(d, i);
        })
        .y(function (d, i) {
            return y(getCurveData(i, depthCurveName, sfData));
        });

    var areaPath = svg
        .append("path")
        .datum(sfData.data)
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
            return d.hints.marked || checkPreviousMarked(d, i);
        })
        .y(function (d, i) {
            return y(getCurveData(i, depthCurveName, sfData));
        });

    var areaTagPathRight = svg
        .append("path")
        .datum(sfData.data)
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
            return d.hints.marked || checkPreviousMarked(d, i);
        })
        .y(function (d, i) {
            return y(getCurveData(i, depthCurveName, sfData));
        });

    var areaTagPathLeft = svg
        .append("path")
        .datum(sfData.data)
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

            //var index =0;
            var categoryMarkIds = [];

            for (let index = 0; index < sfData.data.length; index++) {
                var item = sfData.data[index];

                nextItem = null;
                if (sfData.data[index + 1]) {
                    nextItem = sfData.data[index + 1];
                }

                Depth = item.items[getCurveIndex(depthCurveName, sfData)];
                nextDepth = null;
                if (nextItem) {
                    nextDepth = nextItem.items[getCurveIndex(depthCurveName, sfData)];
                } else {
                    nextDepth = Depth;
                }

                if (!isNaN(Depth) && Depth !== null) {
                    if (categoryName == item.items[getCurveIndex(categoryColumnName, sfData)]) {
                        categoryDepthLast = nextDepth;
                    }

                    if (
                        categoryName != item.items[getCurveIndex(categoryColumnName, sfData)] ||
                        index == sfData.data.length - 1
                    ) {
                        if (categoryName) {
                            if (!categoriesDomain.includes(categoryName)) {
                                categoriesDomain.push(categoryName);
                            }
                            categoriesRectangles.push({
                                top: categoryDepthFirst,
                                bottom: categoryDepthLast,
                                category: categoryName,
                                markIds: categoryMarkIds.slice()
                            });
                        }
                        categoryDepthFirst = Depth;
                        categoryDepthLast = nextDepth;
                        categoryMarkIds = [];
                    }
                    categoryName = item.items[getCurveIndex(categoryColumnName, sfData)];
                    categoryMarkIds.push(item.hints.index);
                }
            }

            range = [
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
                        var elem;
                        if (this.attributes.rectCategoryId) {
                            elem = d3.select("#" + this.attributes.rectCategoryId.value)._groups[0][0];
                        } else elem = this;

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
                        // Implementation of logic to call markIndices or markIndices2 goes here
                        var indicesToMark = [];
                        if (elem) {
                            indicesToMark = elem.__data__;
                        }
                        var markData = {};
                        markData.markMode = markMode;
                        markData.indexSet = indicesToMark;
                        markIndices(markData);
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
        depthIndex = getCurveIndex(depthCurveName, sfData);
        curve1Index = getCurveIndex(curveNames[0], sfData);
        curve2Index = getCurveIndex(curveNames[1], sfData);

        if (!tooltipDiv) {
            tooltipDiv = d3.select("#js_chart" + "_tooltip");
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
            return d.items[depthIndex];
        }).left;

        var y0;

        if (parseInt(d3.version.charAt(0)) >= 6) {
            y0 = y.invert(d3.pointer(evt)[1]);
        } else {
            y0 = y.invert(d3.event.y);
        }

        var i = bisectData(sfData.data, y0);

        var d1 = sfData.data[i];
        var d0 = sfData.data[i - 1];

        var d = null;

        if (d0 && d1) {
            if (d0[depthIndex] && d1[depthIndex]) {
                d = y0 - d0[depthIndex] > d1[depthIndex] - y0 ? d1 : d0;
            }
        }
        if (d == null) {
            d = d1;
        }
        if (d == null) {
            d = d0;
        }

        if (tooltipDiv) {
            js_chart = d3.select("#js_chart")._groups[0][0];

            tooltipDiv.html(
                (d.items[depthIndex] ? depthCurveName + ": " + d.items[depthIndex].toFixed(2) + "<br>" : "") +
                    (curveNames[0] && d.items[curve1Index]
                        ? "<span style='border:1px solid gray; background-color:" +
                          curveColor0 +
                          "';>&nbsp;&nbsp;</span>&nbsp;" +
                          curveNames[0] +
                          ": " +
                          d.items[curve1Index] +
                          "<br>"
                        : "") +
                    (curveNames[1] && d.items[curve2Index]
                        ? "<span style='border:1px solid gray; background-color:" +
                          curveColor1 +
                          "';>&nbsp;&nbsp;</span>&nbsp;" +
                          curveNames[1] +
                          ": " +
                          d.items[curve2Index] +
                          "<br>"
                        : "")
            );

            tooltipX =
                target.parentNode.parentNode.offsetLeft + getTooltipPositionX(curve_x_func, d.items[curve1Index]) + 10;

            tooltipY = evt.pageY + js_chart.scrollTop + 24;

            tooltipDiv.style("left", tooltipX + "px");
            tooltipDiv.style("top", tooltipY + "px");

            tooltipDiv.transition().duration(600).style("opacity", 0.9);
        }

        focus
            .select(".x")
            .attr("transform", "translate(" + getTooltipPositionX(curve_x_func, d.items[curve1Index]) + "," + 0 + ")")
            .attr("y2", height);

        //// circle and lines
        focus
            .select(".y")
            .attr(
                "transform",
                "translate(" +
                    getTooltipPositionX(curve_x_func, d.items[curve1Index]) +
                    "," +
                    y(d.items[depthIndex]) +
                    ")"
            )
            .text(d.items[curve1Index] ? d.items[curve1Index] : "")
            .style("cursor", "default");

        focus
            .select(".yl")
            .attr("transform", "translate(" + 0 + "," + y(d.items[depthIndex]) + ")")
            .text(d.items[curve1Index] ? d.items[curve1Index] : "")
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

function multipleLogPlot(div_id, templates, sfData) {
    function checkWell(item, i) {
        let wellColumnName = "WELL"; // todo - tidy this!
        return getCurveData(i, wellColumnName, sfData) == selectedWell;
    }

    sfData = sfData.filter(checkWell);

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

    if (!d3.select("#TracksDepthLabel")._groups[0][0]) {
        var TracksDepthLabel = d3.select("#" + div_id).append("div");

        TracksDepthLabel.style("vertical-align", "middle")
            .attr("id", "TracksDepthLabel")
            .style("display", "inline-block")
            .style("position", "relative")
            .style("width", depthLabelPanelWidth + "px")
            .on("mousedown", function (evt) {
                if (evt instanceof MouseEvent) {
                    evt.stopPropagation();
                } else {
                    d3.event.stopPropagation();
                }
            });

        TracksDepthLabel = TracksDepthLabel.append("div")
            .style("position", "fixed")
            .style("top", window.innerHeight * 0.5 + "px")
            .style("left", "5px")
            .attr("height", window.innerHeight);

        var depth_label_svg = TracksDepthLabel.append("svg").attr("height", 300).attr("width", 20);

        depth_label_svg
            .append("text")
            .style("fill", "black")
            .style("text-anchor", "end")
            .attr("transform", "rotate(-90) translate(0,10)")
            .text(depthCurveName + (depthUnit != "" ? " (" + depthUnit + ")" : ""))
            .style("fill", "#2b2929");
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
                if (verticalZoomHeightMultiplier + 0.25 <= 15) {
                    sliderZoom.value(verticalZoomHeightMultiplier + 0.25);
                }
            });

        var divGVertical = TracksToolDiv.append("div").attr("id", "slider-zoom").style("margin", "0px");

        sliderZoom = sliderRight()
            .min(1)
            .max(15)
            .step(0.25)
            .height(window.innerHeight * 0.35)
            .ticks(0)
            .default(verticalZoomHeightMultiplier)
            .handle(d3.symbol().type(d3.symbolCircle).size(120)())
            //.fill('#2196f3')
            .on("onchange", function (val) {
                verticalZoomHeightMultiplier = val;
                multipleLogPlot("js_chart", plot_templates, sfData);
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
                if (verticalZoomHeightMultiplier - 0.25 >= 1) {
                    sliderZoom.value(verticalZoomHeightMultiplier - 0.25);
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
            let check = logPlot(template, sfData, maxHeaderHeight + "px");
        }

        if (updateAccordionTools) {
            for (let i = 0; i < templates.length; i++) {
                if (templates[i]) {
                    accordionTemplate(templates, i);
                }
            }
            updateAccordionTools = false;
        }
    }

    $("#accordionConf").accordion({ collapsible: true });

    // add the tooltip area to the webpage

    d3.select("#" + "js_chart" + "_tooltip").remove();
    tooltipDiv = d3
        .select("#" + div_id)
        .append("div")
        .attr("class", "tooltip")
        .attr("id", "js_chart" + "_tooltip")
        .style("opacity", 0);

    initialized = true;

    return new_templates;
}
