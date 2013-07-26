class Area extends ContextNode {
	public static className: string = "areas";

	private _axes: Axis[];

  public static parse(spec: any, context: Context) {
    return new Area(spec, context, Area.className);
  }

  public load() {
    this._axes = [];
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

	private _axisViews: AxisView[];

  public load() {
    this._totalSelection = this.element.append("svg").attr("class", AreaView.className).attr("name", this.node.name);
    this._graphSelection = this._totalSelection.append("svg").attr("class", "graph");
    this._background = this._graphSelection.append("rect");
    // Create views for existing nodes (should potentially be refactored into new method)

    var createAxisView = (axis: Axis) => {
      var axisView = new AxisView(axis, this._totalSelection, this.context, Axis.className);
      this._axisViews.push(axisView);
    }
    createAxisView = $.proxy(createAxisView, this);

    this._axisViews = [];
    _.each(this.node.axes, createAxisView);

    this.node.on(ContextNode.EVENT_READY, () => {this.render()});
  }

	public render() {
    var axisInfo = this.renderAxis();
    this._graphSelection
      .attr("x", axisInfo["left"])
      .attr("y",  axisInfo["top"])
      .attr("width",  this.node.get("width"))
      .attr("height",  this.node.get("height"));

    for (var property in this.node.attributes) {
      if (property == "height") {
        this._totalSelection.attr(property, (this.getProperty(property) + axisInfo["x"]));
      } else if (property == "width") {
        this._totalSelection.attr(property, (this.getProperty(property) + axisInfo["y"]));
      } else {
        this._totalSelection.attr(property, this.getProperty(property));
      }
    }

		this._background
	        .attr("x", 0)
	        .attr("y", 0)
	        .attr("width", this.node.get("width"))
	        .attr("height", this.node.get("height"))
	        .attr("fill", "white");

        this.trigger(AreaView.EVENT_RENDER);
	}

  private renderAxis() {
    var axisInfo = [];
    axisInfo["left"] = 0, axisInfo["top"] = 0, axisInfo["x"] = 0, axisInfo["y"] = 0;
		_.each(this.node.axes, (axis: Axis) => {
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
    _.each(this._axisViews, (axisView: AxisView) => {
      switch (axisView.node.get("location")) {
        case "left":
          axisView.setOffsets(numLeft, axisInfo["top"]);
          numLeft += axisView.node.get(Axis.AXIS_WIDTH);
          break;
        case "right":
          axisView.setOffsets((axisInfo["left"] + numRight), axisInfo["top"]);
          numRight += axisView.node.get(Axis.AXIS_WIDTH);;
          break;
        case "top":
          axisView.setOffsets(axisInfo["left"], numTop);
          numTop += axisView.node.get(Axis.AXIS_WIDTH);;
          break;
        case "bottom":
          axisView.setOffsets(axisInfo["left"], axisInfo["top"] + numBottom);
          numTop += axisView.node.get(Axis.AXIS_WIDTH);
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
}
