class Area extends ContextNode {
	public static className: string;

  public getAttachmentPoints(): string[] {
    return ["top", "right", "bottom", "left"];
  }

	private _axes: Object;

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
    this._axes = {};
    _.each(this.getAttachmentPoints(), (attachmentPoint) => {
      this._axes[attachmentPoint] = [];
    });
  }

	public addAxis(axis: ContextNode, attachmentPoint: string) {
    if(_.contains(this.getAttachmentPoints(), attachmentPoint)) {
		  this._axes[attachmentPoint].push(axis);
    } else {
      throw new Error("Attachment point " + attachmentPoint + " doesn't exist on " + this.className + ".");
    }
	}

	public get subViewModels(): ContextNode[] {
		return _.flatten(_.values(this._axes));
	}
}

class AreaView extends ContextView {
	public static EVENT_RENDER: string = "render";

	private _totalSelection: D3.Selection;
	private _graphSelection: D3.Selection;
	private _background: D3.Selection;

  public load() {
    this.buildViews();
    this.renderSubviews();
  }

  public buildViews() {
    this._totalSelection = this.element.append("svg").attr("class", Area.className).attr("name", this.node.name);
    this._graphSelection = this._totalSelection.append("svg").attr("class", "graph");
    this._background = this._graphSelection.append("rect");
    // Create views for existing nodes (should potentially be refactored into new method)
  }

	public render() {

    this._graphSelection
      .attr("x", this.get("paddingLeft"))
      .attr("y",  this.get("paddingTop"))
      .attr("width",  this.get("width"))
      .attr("height",  this.get("height"));

    for (var property in this.node.attributes) {
      if (property == "height") {
        this._totalSelection.attr(property, this.get("height") + this.get("paddingTop") + this.get("paddingBottom"));
      } else if (property == "width") {
        this._totalSelection.attr(property, this.get("width") + this.get("paddingLeft") + this.get("paddingRight"));
      } else {
        this._totalSelection.attr(property, this.get(property));
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

  private renderSubviews() {
    var currentDistances: { left: number; right: number; top: number; bottom: number }
      = { left: 0, right: 0, top: 0, bottom: 0 };

		_.each(this.node.subViewModels, (subViewModel: ContextNode) => {
      var subView: ContextView = Lyra.createViewForModel(subViewModel, this._totalSelection, this.context);
			switch(subView.get("location")) {
				case "left":
					currentDistances.left += subView.calculatedWidth();
          subView.setOffsets(this.get("paddingLeft") - currentDistances.left, this.get("paddingTop"));
          break;
				case "right":
          currentDistances.right += subView.calculatedWidth();
          subView.setOffsets(currentDistances.right + this.get("paddingLeft") - subView.calculatedWidth(), this.get("paddingTop"));
					break;
				case "top":
          currentDistances.top += subView.calculatedHeight();
          subView.setOffsets(this.get("paddingLeft"), this.get("paddingTop") - currentDistances.top);
          break;
				case "bottom":
          currentDistances.bottom += subView.calculatedHeight();
          subView.setOffsets(this.get("paddingLeft"), this.get("paddingTop") + currentDistances.bottom - subView.get(Axis.AXIS_WIDTH));
					break;
				default:
					throw new Error("Unknown axis location: " + subView.get("location"));
			}
		});


	}

	public get graphSelection() {
		return this._graphSelection;
	}

	public get totalSelection() {
		return this._totalSelection;
	}
}
