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