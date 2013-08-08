class Area extends ContextNode {
	public static className: string;

  public getAttachmentPoints(): string[] {
    return ["top", "right", "bottom", "left"];
  }

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

    _.each(this.node.getAttachmentPoints(), (attachmentPoint: string) => {
  		_.each(this.node.subViewModels[attachmentPoint], (subViewModel: ContextNode) => {
        var axisGroup: D3.Selection = this._totalSelection.append("g");

        var x: number = 0;
        var y: number = 0;

  			switch(attachmentPoint) {
  				case "left":
  					currentDistances.left += subViewModel.calculatedWidth();
            x = this.get("paddingLeft") - currentDistances.left;
            y = this.get("paddingTop");
            break;
  				case "right":
            currentDistances.right += subViewModel.calculatedWidth();
            x = currentDistances.right + this.get("paddingLeft") - subViewModel.calculatedWidth();
            y = this.get("paddingTop");
  					break;
  				case "top":
            currentDistances.top += subViewModel.calculatedHeight();
            x = this.get("paddingLeft");
            y = this.get("paddingTop") - currentDistances.top;
            break;
  				case "bottom":
            currentDistances.bottom += subViewModel.calculatedHeight();
            x = this.get("paddingLeft");
            y = this.get("paddingTop") + currentDistances.bottom - subViewModel.calculatedWidth();
  					break;
  			}

        axisGroup.attr("transform", "translate(" + x + ", " + y + ")");

        Lyra.createViewForModel(subViewModel, axisGroup, this.context);
  		});
    });

	}

	public get graphSelection() {
		return this._graphSelection;
	}

	public get totalSelection() {
		return this._totalSelection;
	}
}
