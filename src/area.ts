class Area extends ContextNode {
	public static className: string = "Area";
	
	private _height: number;
	private _width: number;

	constructor(spec: any, context: Context) {
		super(spec["name"], context, Area.className);

		this._height = spec["height"];
		this._width = spec["width"];

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

	public get height() {
		return this._height;
	}

	public get width() {
		return this._width;
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
	        .attr("width", this._model.width)
	        .attr("height", this._model.height)
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