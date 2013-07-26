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
  private _xOffset: number;
  private _yOffset: number;
  public render;

  public static className: string = "AxisView";
  public static EVENT_RENDER: string = "render";
  public static AXIS_WIDTH: number = 35;

  constructor(axis: Axis, element: D3.Selection, viewContext: Context) {
    super(axis, viewContext, AxisView.className);

    this._element = element;
    this._model = axis;
  	this._axis = d3.svg.axis()
    this._xOffset = 0;
    this._yOffset = 0;

	  var axisSvg = this._element
	    .append("g")
  		.attr("class", AxisView.className)
  		.attr("name", this.model.name);

      if (this._model.get("gridline")) {
        var gridSvg = this._element.selectAll("svg.graph")
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
            return "M " + curScale(d) + " 0 L" + curScale(d)  + " " + areaHeight;
          });
        } else {
          gridSelection.attr("d", (d) => {
            return "M 0 "+ curScale(d) + " L" + areaWidth + " " + curScale(d);
            });
        }

          gridSelection.exit().remove();
      }

  		switch(this._model.get("location")) {
  			case "bottom":
  			  axisSvg.attr("transform", "translate(" + this._xOffset + "," + (this._yOffset + areaHeight) +")");
  			break;
  			case "top":
  			  axisSvg.attr("transform", "translate(" + this._xOffset + "," + this._yOffset  +")");
  			break;
  			case "left":
  			  axisSvg.attr("transform", "translate(" + this._xOffset + "," + this._yOffset  +")");
  			break;
  			case "right":
  			  axisSvg.attr("transform", "translate(" +(this._xOffset + areaWidth) +"," + this._yOffset +  ")");
  			break;
  			default:
  		}
  	  this.trigger(AxisView.EVENT_RENDER);
  	}

    this.render();
    this._model.on(ContextNode.EVENT_READY, this.render);
  }

  public setOffsets(x: number, y: number) {
    this._xOffset = x;
    this._yOffset = y;
    if (this._model.get("orient") == "left") {
      this._xOffset += AxisView.AXIS_WIDTH;
    }
    if (this._model.get("orient") == "top") {
      this._yOffset += AxisView.AXIS_WIDTH;
    }
    this.render();
  }

  public get model() {
    return this._model;
  }

  public get element() {
    return this._element;
  }
}
