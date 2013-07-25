class Area extends ContextNode {
	public static className: string = "Area";

	constructor(spec: any, context: Context) {
		super(spec, context, Area.className);
	}

	public static parse(spec: any, context: Context) {
		return new Area(spec, context);
	}
}

class AreaView extends ContextView {
	public static className: string = "AreaView";
	public static EVENT_RENDER: string = "render";

	public static PADDING: number = 35;

	private _totalSelection: D3.Selection;
	private _graphSelection: D3.Selection;

	private _model: Area;

  	constructor(area: Area, element: D3.Selection, viewContext: Context) {
    	super(area, viewContext, AreaView.className);

		this._model = area;
    	this._totalSelection = element.append("svg");
		this._graphSelection = this._totalSelection.append("svg");
		this._graphSelection
		.attr("x", AreaView.PADDING)
		.attr("y",  AreaView.PADDING)
		.attr("width",  this._model.get("width"))
		.attr("height",  this._model.get("height"));

 	}

	public render() {
		this._totalSelection.attr("name", this._model.name);
		for (var property in this.model.attributes) {
			if (property == "height" || property == "width") {
			  this._totalSelection.attr(property, this.getProperty(property) + AreaView.PADDING * 2);
			} else {
			  this._totalSelection.attr(property, this.getProperty(property) + AreaView.PADDING * 2);
			}
		}


		this._graphSelection.append("rect")
	        .attr("x", 0)
	        .attr("y", 0)
	        .attr("width", this._model.get("width"))
	        .attr("height", this._model.get("height"))
	        .attr("fill", "white");

        this.trigger(AreaView.EVENT_RENDER);
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
