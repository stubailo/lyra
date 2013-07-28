class Area extends ContextNode {
	public static className: string = "areas";

	private _axes: Axis[];
	constructor(spec: any, context: Context) {
		super(spec, context, Area.className);
		this._axes = [];
	}

	public static parse(spec: any, context: Context) {
		return new Area(spec, context);
	}

	public addAxis(axis: Axis) {
		this._axes.push(axis);
	}

	public get axes() {
		return this._axes;
	}
}

class AreaView extends ContextView {
	public static className: string = "AreaView";
	public static EVENT_RENDER: string = "render";

	private _totalSelection: D3.Selection;
	private _graphSelection: D3.Selection;
	private _background: D3.Selection;

	private _model: Area;
	private _axisViews: AxisView[];

	constructor(area: Area, element: D3.Selection, viewContext: Context) {
    super(area, viewContext, AreaView.className);

		this._model = area;
    this._totalSelection = element.append("svg");
		this._graphSelection = this._totalSelection.append("svg").attr("class", "graph");
		this._background = this._graphSelection.append("rect");
		// Create views for existing model nodes (should potentially be refactored into new method)

  	var createAxisView = (axis: Axis) => {
    		var axisView = new AxisView(axis, this._totalSelection, viewContext);
    		this._axisViews.push(axisView);
 		 }
  	createAxisView = $.proxy(createAxisView, this);

  	this._axisViews = [];
  	_.each(this._model.axes, createAxisView);

		this._model.on(ContextNode.EVENT_READY, () => {this.render()});
 	}

	public render() {
    var axisInfo = this.renderAxis();
    this._graphSelection
      .attr("x", axisInfo["left"])
      .attr("y",  axisInfo["top"])
      .attr("width",  this._model.get("width"))
      .attr("height",  this._model.get("height"));

    this._totalSelection.attr("name", this._model.name);
    for (var property in this.model.attributes) {
      if (property == "height") {
        this._totalSelection.attr(property, this.getProperty(property) + axisInfo["x"]);
      } else if (property == "width") {
        this._totalSelection.attr(property, this.getProperty(property) + axisInfo["y"]);
      } else {
        this._totalSelection.attr(property, this.getProperty(property));
      }
    }

		this._background
	        .attr("x", 0)
	        .attr("y", 0)
	        .attr("width", this._model.get("width"))
	        .attr("height", this._model.get("height"))
	        .attr("fill", "white");

        this.trigger(AreaView.EVENT_RENDER);
	}

	private renderAxis() {
		var axisInfo = [];
    axisInfo["left"] = 0, axisInfo["top"] = 0, axisInfo["x"] = 0, axisInfo["y"] = 0;
		_.each(this._model.axes, (axis: Axis) => {
			switch(axis.get("location")) {
				case "left":
					axisInfo["left"] += axis.get(Axis.AXIS_WIDTH);
				case "right":
					axisInfo["y"] += axis.get(Axis.AXIS_WIDTH);
					break;
				case "top":
					axisInfo["top"] += axis.get(Axis.AXIS_WIDTH);
				case "bottom":
					axisInfo["x"] += axis.get(Axis.AXIS_WIDTH);
					break;
				default:
					throw new Error("Unknown axis location: " + axis.get("location"));
			}
		});

    var numLeft = 0, numRight = 0, numTop = 0, numBottom = 0;
    console.log(axisInfo);
    _.each(this._axisViews, (axisView: AxisView) => {
      switch (axisView.model.get("location")) {
        case "left":
          axisView.setOffsets(numLeft, axisInfo["top"]);
          numLeft += axisView.model.get(Axis.AXIS_WIDTH);
          break;
        case "right":
          axisView.setOffsets((axisInfo["left"] + numRight), axisInfo["top"]);
          numRight += axisView.model.get(Axis.AXIS_WIDTH);;
          break;
        case "top":
          axisView.setOffsets(axisInfo["left"], numTop);
          numTop += axisView.model.get(Axis.AXIS_WIDTH);;
          break;
        case "bottom":
          axisView.setOffsets(axisInfo["left"], axisInfo["top"] + numBottom);
          numTop += axisView.model.get(Axis.AXIS_WIDTH);
          break;
        }
    });
    return axisInfo;
	}

	public get graphSelection() {
		return this._graphSelection;
	}

	public get totalSelection() {
		return this._totalSelection;
	}

	public get model() {
		return this._model;
	}


}
