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