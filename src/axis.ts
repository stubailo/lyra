class Axis extends ContextNode {
  /*
    Each property is a function of one item that specifies that property of an SVG element.
    So for example a circle would have one function for "cx", one for "cy", etc.
  */
  private _scale: Scale;
  private _orient: string;
  private _ticks: string;
  private _area: Area;

  private static className: string = "Axis";

  public static parse(spec: any, context: Context) {
      return new Axis(spec, context);
  }

  constructor(spec: any, context: Context) {
    super(spec["name"], context, Axis.className);

    this._scale = context.getNode(Scale.className, spec["scale"]);
	this._orient = spec["orient"];
	this._ticks = spec["ticks"];
	this._area = this.context.getNode(Area.className, spec["area"]);
	this.set(spec);
  }

  public get scale() {
    return this._scale;
  }

  public get area() {
	return this._area;
  }
	
  public get orient() {
    return this._orient;
  }

  public get ticks() {
    return this._ticks;
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
	  .scale(this._model.scale.scaleRepresentation)
	  .orient(this._model.get("orient"))
	  .ticks(this._model.get("ticks"))

    this.render = () => {
	  var axisSvg = this._element
	    .append("g")
		.attr("class", AxisView.className)
		.attr("name", this.model.name)
		.call(this._axis);
		
		switch(this._model.get("location")) {
			case "bottom":
			  axisSvg.attr("transform", "translate(" + AreaView.PADDING + "," + (AreaView.PADDING + this._model.area.get("height")) +")");
			break;
			case "top":
			  axisSvg.attr("transform", "translate(" + AreaView.PADDING + "," + AreaView.PADDING  +")");
			break;
			case "left":
			  axisSvg.attr("transform", "translate(" + AreaView.PADDING + "," + AreaView.PADDING  +")");
			break;
			case "right":
			  axisSvg.attr("transform", "translate(" +(AreaView.PADDING + this._model.area.get("width")) +"," + AreaView.PADDING +  ")");
			break;
			default:
		}
	  this.trigger(AxisView.EVENT_RENDER);
	}
    this._model.on("change", this.render);
  }

  public get model() {
    return this._model;
  }

  public get element() {
    return this._element;
  }
}