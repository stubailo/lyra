class Area extends ContextNode {
	public static className: string = "Area";
	
	constructor(spec: any, context: Context) {
		super(spec["name"], context, Area.className);

		this.parseProperties(spec);
	}

	private parseProperties(properties: any) {
		for (var key in properties) {
			this.set(key, properties[key]);
		}
	}

	public static parse(spec: any, context: Context) {
		return new Area(spec, context);
	}
}

class AreaView extends ContextView {
	public static className: string = "AreaView";
	public static EVENT_RENDER: string = "render";
	
	private _areaSelection: D3.Selection;
	private _model: Area;

  	constructor(area: Area, element: D3.Selection, viewContext: Context) {
    	super(area, viewContext, AreaView.className);

    	this._areaSelection = element.append("svg");
    	this._model = area;
 	}

	public render() {
		this._areaSelection.attr("name", this._model.name).append("rect")
	        .attr("x", 0)
	        .attr("y", 0)
	        .attr("width", this._model.get("width"))
	        .attr("height", this._model.get("height"))
	        .attr("fill", "white");

	    for (var property in this.model.attributes) {
          this._areaSelection.attr(property, this.getProperty(property));
        }

        this.trigger(AreaView.EVENT_RENDER);
	}

	public get selection() {
		return this._areaSelection;
	}

	public get model() {
		return this._model;
	}

	
}