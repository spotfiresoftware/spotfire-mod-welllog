/*--------------------------------------------------

	VanillaDrawer Ver.1.0 2017-05-16

--------------------------------------------------*/

import * as d3 from "d3";
const $ = require("jquery");
import * as colorHelpers from "./color-helpers.js";
import * as render from "./render.js"; 
import * as renderPlot from "./renderPlot.js"
export var accordionId

import "jquery-ui/ui/widgets/tabs";
import "jquery-ui/ui/widgets/accordion"; 
import "jquery-ui/ui/widgets/draggable"; 


//makes a div draggable 
function draggable(elmnt) {

}

//creates or re-creates a draggable configuration Dialog popup with close buttons and accordion placeholder
export function configDialog(plot_templates, allDataViewRows, _dataView, _mod, _verticalZoomHeightMultiplier, _verticalZoomHeightProperty) {

    let elementId = "config_menu"
    accordionId = elementId+"_accordion"

    //add dialog placeholder to #mod-container
    d3.select("#mod-container")
        .style("margin", "0")
        .style("padding", "0")
        .style("border", "0")
        .append("div")
        .html(
            `
            <DIV id="${elementId}">
                <DIV id="${elementId}_content" style="position:relative;">
                    <A id=closeBtn title="Close settings" >✖</I></I></A>
                    <div id="trackBtns" >
                        <a id="duplicateTrackBtn" title="Duplicate last track" >◫</a>
                        <a id="removeTrackBtn" title="Delete last track" >⊘</a>
                    </div>
                    <h3 class="${elementId}_header" style="float: left;margin-left: 10px;color:black;margin-top:7px">Well Log Tracks Settings</h3>
                    <DIV id="${accordionId}" style="clear:both;padding-left:6px;padding-right:6px"></DIV>
                </DIV>
            </DIV>
            <style>
            #${elementId}{width:333px}
            #closeBtn{color:darkgray;cursor:pointer;float:right;font-size:1.5em;margin:5px} 
            #closeBtn:hover {color:#1b8888;}
            #trackBtns {float:right;margin: 0px 2px 0 0;top: 6px;left: -3px;}
            #trackBtns a {font-size:1.5em;color: darkgray;padding: 1px;width: 7px;}            
            #trackBtns a:hover {color:#1b8888;}
            #duplicateTrackBtn{top: 5px; position: relative;left:-3px;}
            #removeTrackBtn{position: relative;top: 4px;margin-left: 2px;} 
            .ui-accordion-content{height:auto };
            </style>
            `
        );

    //setup close button
    this.close = function(){document.getElementById(elementId).style.visibility="hidden";}

    document.getElementById('closeBtn').addEventListener('click', this.close ); 

    //hide the config dialog
    document.getElementById(elementId).style.visibility="hidden"; 

    //makes the configuration popup draggable
    $("#"+elementId).draggable();
    
    //Populates accordion panels
    for (const i of plot_templates.keys()) createAccordionTabs(plot_templates, i, allDataViewRows, _dataView, _mod);

    //generate an accordion
    $("#"+accordionId).accordion({ collapsible: true,heightStyle: 'content'});

} 

//creates a jquery accordion. Each panel contains one or more tabs
//an accordion panel represents a track (template[0])
//a tab contains track curves (template_components[0]["curves"][0];)
export async function createAccordionTabs(templates, templateIdx, allDataViewRows, _dataView, _mod) {

    let template = templates[templateIdx];
    let template_components = template[0]["components"];
    let templateCurves = template_components[0]["curves"][0];

    if (templateCurves["dataType"] == "curve") {
        let curveNames = templateCurves["curveNames"];
        let curveColors = templateCurves["curveColors"]; 

        d3.select("#"+accordionId)
            .append("h3")
            .text("Track " + (templateIdx + 1) + ": " + curveNames);

        let content = d3.select("#"+accordionId).append("div");

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

        // Add a "[+]" tab, so you can add another measure to this track ◫ ⧉ ⊘	 “🗑”“🗑”  🗑️ ✂️️📄🗑️⧉
        ul.append("li")
            .append("a")
            .attr("href", "#tab_" + templateIdx + "_ctrlBtn")
            .attr("class", "ctrlBtn")
            .attr("title", "Duplicates last curve")
            .html("+")//⧉
            .on("mousedown", (evt) => {
                render.propertyOnChange(templateIdx, curveNames.length, templates, allDataViewRows, null, "duplicateCurve");
                evt.preventDefault;
            });

        // Add a "[-]" tab, so you can remove the previous measure from this track
        ul.append("li")
            .append("a")
            .attr("href", "#tab_" + templateIdx + "_ctrlBtn")
            .attr("class", "ctrlBtn")
            .attr("title", "Removes last curve")
            .html("-")//⊘
            .on("mousedown", (evt) => {
                render.propertyOnChange(templateIdx, curveNames.length, templates, allDataViewRows, null, "removeCurve");
                evt.preventDefault;
            });


        //because these buttons are outside the loop, I am preventing to bind the button multiple times
        //it would be ideal to have these buttons it on the track header level to copy or delete the selected track
        //and not duplicate or remove the last track from the templates
        //BUG: it only binds once. for some reason it looses its mousedown powers.
        if (!templateIdx-1){
            d3.select("#removeTrackBtn").on("click", (evt) => {
                render.propertyOnChange(templateIdx, curveNames.length, templates, allDataViewRows, null, "removeTrack");
                evt.preventDefault;
            });
            d3.select("#duplicateTrackBtn").on("click", (evt) => {
                render.propertyOnChange(templateIdx, curveNames.length, templates, allDataViewRows, null, "duplicateTrack");
                evt.preventDefault;
            }); 
        }


        //JLL: Do not remove as it is a placeholder for future functionality. You can test by uncommenting
        // Add a "[*]" tab, so you duplicates the entire track
        /*
        ul.append("li")
            .append("a")
            .attr("href", "#tab_" + templateIdx + "_ctrlBtn")
            .attr("class", "ctrlBtn")
            .attr("title", "Duplicates the entire track")
            .html("⧉") //⧉
            .on("mousedown", (evt) => {
                render.PropertyOnChange(templateIdx, curveNames.length, templates, allDataViewRows, null, "duplicateTrack");
                evt.preventDefault;
            });

        // Add a "[x]" tab to remove the entire track
        ul.append("li")
            .append("a")
            .attr("href", "#tab_" + templateIdx + "_ctrlBtn")
            .attr("class", "ctrlBtn")
            .attr("title", "Duplicates the entire track")
            .html("⊘")//🗑
            .on("mousedown", (evt) => {
                render.PropertyOnChange(templateIdx, curveNames.length, templates, allDataViewRows, null, "removeTrack");
                evt.preventDefault;
            });

        */  

        // The contents of the tabs
        for (let k = 0; k < curveNames.length; k++) {
            await addAccordionTabContents(templateIdx, k, curveNames, tabs, templates, allDataViewRows, curveColors, _dataView, _mod);
        }
    }

    //render tabs
    $("#" + "tabs_" + templateIdx).tabs();

}


//populates accordion widgets
export async function addAccordionTabContents(templateIdx, curveIdx, curveNames, tabs, templates, allDataViewRows, curveColors, _dataView, _mod) {

    //we can take them out of this function, but it is only used within this scope
    function insertTextInput(divContent, i, k, templates, propName, allDataViewRows) {188

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
            .on("input", function (d) { //consider using render.propertyOnChange instead
                render.propertyOnChange(i, k, templates, allDataViewRows, this.value, propName); 
                }
            );
    }

    //we can take them out of this function, but it is only used within this scope
    let insertDropdown = function(divContent, templateIdx, curveIdx, templates, name, allDataViewRows) {
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
    
        if (templates[templateIdx]) {
            var template = templates[templateIdx];
            let template_components = template[0]["components"];
            let templateCurves = template_components[0]["curves"];
            ///let curveNames = templateCurves[0]["curveNames"];
    
            if (name == "Thickness") {
                selectedValue = templateCurves[0]["strokeWidth"][curveIdx];
            } else if (name == "LineStyle") {
                selectedValue = templateCurves[0]["curveStrokeDashArray"][curveIdx];
            } else if (name == "LineColor") {
                selectedValue = document.querySelector(`#lineColor${templateIdx}`).value;
            } else if (name == "AreaFill") {
                selectedValue =
                    templateCurves[0]["fill"][curveIdx]["fill"] == "no"
                        ? "none"
                        : (selectedValue = templateCurves[0]["fill"][curveIdx]["fillDirection"]);
            } else if (name == "AreaFill2Curve") {
                selectedValue =
                    templateCurves[0]["fill"][curveIdx]["fill"] == "no"
                        ? "none"
                        : (selectedValue = templateCurves[0]["fill"][curveIdx]["fillDirection"]);
            } else if (name == "ScaleType") {
                selectedValue = templateCurves[0]["scaleTypeLinearLog"][curveIdx];
            } else if (name == "AreaColor") {
                selectedValue = colorHelpers.getFillColorName(templateCurves[0]["fill"][curveIdx]["fillColors"][0]);
                if (selectedValue == "")
                    selectedValue = colorHelpers.getColorInterpolator(templateCurves[0]["fill"][curveIdx]["colorInterpolator"][0]);
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
                { text: "Right", value: "right", selected: selectedValue == "right" },
                { text: "Between", value: "between", selected: selectedValue == "between" }
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
                    selected: selectedValue == "interpolateReds",
                    imageSrc: interpolateRedsImgSrc
                },
                {
                    value: "interpolateRdBu",
                    selected: selectedValue == "interpolateRdBu",
                    imageSrc: interpolateRdBuImgSrc
                },
                {
                    value: "interpolateSpectral",
                    selected: selectedValue == "interpolateSpectral",
                    imageSrc: interpolateSpectralImgSrc
                },
                {
                    value: "interpolateViridis",
                    selected: selectedValue == "interpolateViridis",
                    imageSrc: interpolateViridisImgSrc
                },
                //{ value: "interpolatePlasma", selected: (selectedValue == d3.interpolatePlasma), imageSrc: interpolatePlasmaImgSrc},
                //{ value: "interpolateWarm", selected: (selectedValue == d3.interpolateWarm), imageSrc: interpolateWarmImgSrc },
                { value: "interpolateCool", selected: selectedValue == d3.interpolateCool, imageSrc: interpolateCoolImgSrc }
            ]
        };
    
        var dropdownButton = divContent.append("select").attr("id", "dropdown" + name + "_" + templateIdx + "_" + curveIdx);
    
        let NCurves = templates[templateIdx][0]["components"][0]["curves"][0]["curveNames"].length;
    
        let name2 = name == "AreaFill" && NCurves >= 2 ? "AreaFill2Curve" : name;
    
        $("#dropdown" + name + "_" + templateIdx + "_" + curveIdx).ddslick({
            data: ddData[name2],
            //height: "15px",
            width: "100px",
            defaultSelectedIndex: 0,
            selectText: "Select an item",
            onSelected: function (data) {
                var selData = data.selectedData;
                render.propertyOnChange(templateIdx, curveIdx, templates, allDataViewRows, selData, name);
            }
        });
    }
    
    
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
                render.propertyOnChange(templateIdx, curveIdx, templates, allDataViewRows, selData, "curveName");

                //update tab and accordion name
                let anAccordionHeader = document.querySelector(
                    "#"+accordionId+" h3[aria-expanded='true'] span"
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
        insertDropdown(divItem, templateIdx, curveIdx, templates, "Thickness", allDataViewRows);

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
                render.propertyOnChange(
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
        insertDropdown(divItem, templateIdx, curveIdx, templates, "LineStyle", allDataViewRows);

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
        insertDropdown(divItem, templateIdx, curveIdx, templates, "AreaFill", allDataViewRows);

        //Area Color
        divItem = controlgroup
            .append("div")
            .attr("class", "controlGroupDiv")
            .on("mousedown", function (evt) {
                evt.stopPropagation();
            });
        divItem.text("Color:").append("br");
        insertDropdown(divItem, templateIdx, curveIdx, templates, "AreaColor", allDataViewRows);

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
        insertDropdown(divItem, templateIdx, curveIdx, templates, "ScaleType", allDataViewRows);

        controlgroup = fieldset.append("div").attr("class", "controlgroup");

        //Scale Min
        divItem = controlgroup
            .append("div")
            .attr("class", "controlGroupDiv")
            .on("mousedown", function (evt) {
                evt.stopPropagation();
            });
        divItem.text("Min:").append("br");
        insertTextInput(divItem, templateIdx, curveIdx, templates, "ScaleMin", allDataViewRows);

        divItem = controlgroup
            .append("div")
            .attr("class", "controlGroupDiv")
            .on("mousedown", function (evt) {
                evt.stopPropagation();
            });
        divItem.text("Max:").append("br");
        insertTextInput(divItem, templateIdx, curveIdx, templates, "ScaleMax", allDataViewRows);

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
        insertTextInput(divItem, templateIdx, curveIdx, templates, "CutoffShaleSilt", allDataViewRows);

        divItem = controlgroup
            .append("div")
            .attr("class", "controlGroupDiv")
            .on("mousedown", function (evt) {
                evt.stopPropagation();
            });
        divItem.text("Silt/Sand:").append("br");
        insertTextInput(divItem, templateIdx, curveIdx, templates, "CutoffSiltSand", allDataViewRows);
    }
}
