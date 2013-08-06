class Area extends ContextNode {
	public static className: string = "areas";

	private _axes: Axis[];

  public defaults() {
    return _(super.defaults()).extend({
      "height": 300,
      "width": 400,
      "paddingTop": 10,
      "paddingRight": 10,
      "paddingBottom": 10,
      "paddingLeft": 10
    });
  }

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
	public static className: string = "areas";
	public static EVENT_RENDER: string = "render";

	private _totalSelection: D3.Selection;
	private _graphSelection: D3.Selection;
	private _background: D3.Selection;

	private _axisViews: AxisView[];

  public load() {
    this.buildViews();

    this.node.on(ContextNode.EVENT_READY, () => {this.render()});
  }

  public buildViews() {
    this._totalSelection = this.element.append("svg").attr("class", AreaView.className).attr("name", this.node.name);
    this._graphSelection = this._totalSelection.append("svg").attr("class", "graph");
    this._background = this._graphSelection.append("rect");
    // Create views for existing nodes (should potentially be refactored into new method)

    var createAxisView = (axis: Axis) => {
      var axisView = new AxisView(axis, this._totalSelection, this.context, Axis.className);
      this._axisViews.push(axisView);
      console.log("creating axis");
    }
    createAxisView = $.proxy(createAxisView, this);

    this._axisViews = [];
    _.each(this.node.axes, createAxisView);
  }

	public render() {
    this.renderAxis();
    this._graphSelection
      .attr("x", this.getProperty("paddingLeft"))
      .attr("y",  this.getProperty("paddingTop"))
      .attr("width",  this.getProperty("width"))
      .attr("height",  this.getProperty("height"));

    for (var property in this.node.attributes) {
      if (property == "height") {
        this._totalSelection.attr(property, this.getProperty("height") + this.getProperty("paddingTop") + this.getProperty("paddingBottom"));
      } else if (property == "width") {
        this._totalSelection.attr(property, this.getProperty("width") + this.getProperty("paddingLeft") + this.getProperty("paddingRight"));
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
    var currentDistances: { left: number; right: number; top: number; bottom: number }
      = { left: 0, right: 0, top: 0, bottom: 0 };

		_.each(this._axisViews, (axisView: AxisView) => {
			switch(axisView.getProperty("location")) {
				case "left":
					currentDistances.left += axisView.getProperty(Axis.AXIS_WIDTH);
          axisView.setOffsets(this.getProperty("paddingLeft") - currentDistances.left, this.getProperty("paddingTop"));
          break;
				case "right":
          currentDistances.right += axisView.getProperty(Axis.AXIS_WIDTH);
          axisView.setOffsets(this.getProperty("paddingLeft") + this.getProperty("width") + currentDistances.right, this.getProperty("paddingTop"));
					break;
				case "top":
          currentDistances.top += axisView.getProperty(Axis.AXIS_WIDTH);
          axisView.render();
          break;
				case "bottom":
          currentDistances.bottom += axisView.getProperty(Axis.AXIS_WIDTH);
          axisView.setOffsets(this.getProperty("paddingLeft"), this.getProperty("paddingTop") + currentDistances.bottom - axisView.getProperty(Axis.AXIS_WIDTH));
					break;
				default:
					throw new Error("Unknown axis location: " + axisView.getProperty("location"));
			}

      console.log("setting offset..");
		});


	}

	public get graphSelection() {
		return this._graphSelection;
	}

	public get totalSelection() {
		return this._totalSelection;
	}
}
