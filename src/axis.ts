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

    this.render = () => {
      this._axis
        .scale(this._model.get("scale").scaleRepresentation)
        .orient(this._model.get("orient"))
        .ticks(this._model.get("ticks"));

      axisSvg.call(this._axis);

  		switch(this._model.get("location")) {
  			case "bottom":
  			  axisSvg.attr("transform", "translate(" + AreaView.PADDING + "," + (AreaView.PADDING + this._model.get("area").get("height")) +")");
  			break;
  			case "top":
  			  axisSvg.attr("transform", "translate(" + AreaView.PADDING + "," + AreaView.PADDING  +")");
  			break;
  			case "left":
  			  axisSvg.attr("transform", "translate(" + AreaView.PADDING + "," + AreaView.PADDING  +")");
  			break;
  			case "right":
  			  axisSvg.attr("transform", "translate(" +(AreaView.PADDING + this._model.get("area").get("width")) +"," + AreaView.PADDING +  ")");
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
