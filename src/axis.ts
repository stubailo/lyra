class Axis extends ContextNode {
  /*
    Each property is a function of one item that specifies that property of an SVG element.
    So for example a circle would have one function for "cx", one for "cy", etc.
  */

  private static className: string = "Axis";

  public static parse(spec: any, context: Context) {
      return new Axis(spec, context);
  }

  constructor(spec: any, context: Context) {
    super(spec, context, Axis.className);
  }
}

class AxisView extends ContextView {
  private _element: D3.Selection; // the canvas
  private _axisSelection: D3.Selection;
  private _model: Axis;
  private _axis;
  public render;

  public static className: string = "AxisView";
  public static EVENT_RENDER: string = "render";

  constructor(axis: Axis, element: D3.Selection, viewContext: Context) {
    super(axis, viewContext, AxisView.className);

    this._element = element;
    this._model = axis;
  	this._axis = d3.svg.axis()

	  var axisSvg = this._element
	    .append("g")
  		.attr("class", AxisView.className)
  		.attr("name", this.model.name);

      if (this._model.get("gridline")) {
        var gridSvg = this._element
          .append("g")
          .attr("class", "grid")
      }

    this.render = () => {
      var curScale = this._model.get("scale").scaleRepresentation;
      var areaHeight = this._model.get("area").get("height");
      var areaWidth =  this._model.get("area").get("width");

      this._axis
        .scale(curScale)
        .orient(this._model.get("orient"))
        .ticks(this._model.get("ticks"));

      axisSvg.call(this._axis);

      if (gridSvg) {
        var gridSelection = gridSvg.selectAll("path." + this._model.name)
          .data(curScale.ticks(this._model.get("ticks")));
          gridSelection.enter()
          .append("path")
          .attr("class", this._model.name)
          .attr("stroke", this._model.get("gridline"));

        if (this._model.get("location") == "bottom" || this._model.get("location") == "top") {
          gridSelection.attr("d", (d) => {
            return "M " + (curScale(d) + AreaView.PADDING) + " " + AreaView.PADDING + 
              " L" + (curScale(d) + AreaView.PADDING)  + " " + (areaHeight + AreaView.PADDING);
          });
        } else {
          gridSelection.attr("d", (d) => {
            return "M " + AreaView.PADDING + " " + (curScale(d) + AreaView.PADDING) + 
              " L" + (areaWidth + AreaView.PADDING)  + " " + (curScale(d) + AreaView.PADDING);
            });
        }

          gridSelection.exit().remove();
      }

  		switch(this._model.get("location")) {
  			case "bottom":
  			  axisSvg.attr("transform", "translate(" + AreaView.PADDING + "," + (AreaView.PADDING + areaHeight) +")");
  			break;
  			case "top":
  			  axisSvg.attr("transform", "translate(" + AreaView.PADDING + "," + AreaView.PADDING  +")");
  			break;
  			case "left":
  			  axisSvg.attr("transform", "translate(" + AreaView.PADDING + "," + AreaView.PADDING  +")");
  			break;
  			case "right":
  			  axisSvg.attr("transform", "translate(" +(AreaView.PADDING + areaWidth) +"," + AreaView.PADDING +  ")");
  			break;
  			default:
  		}
  	  this.trigger(AxisView.EVENT_RENDER);
  	}

    this.render();
    this._model.on(ContextNode.EVENT_READY, this.render);
  }

  public get model() {
    return this._model;
  }

  public get element() {
    return this._element;
  }
}
