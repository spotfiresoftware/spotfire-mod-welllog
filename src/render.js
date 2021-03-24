/*
 * Copyright © 2020. TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */

//@ts-check
import * as d3 from "d3";
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

    const xAxisMeta = await mod.visualization.axis("X");
    const yAxisMeta = await mod.visualization.axis("Y");
    const colorAxisMeta = await mod.visualization.axis("Color");

    const margin = { top: 20, right: 40, bottom: 40, left: 80 };

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
  
}
