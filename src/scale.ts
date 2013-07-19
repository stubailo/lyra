class Scale extends ContextNode {
  public apply(input: any): any {
    throw new Error("Apply method not overridden for scale.");
  }

  private static _className: string = "Scale";

  public static get className() {
    return Scale._className;
  }

  constructor(spec: any, context: Context) {
    super(spec["name"], context, Scale.className);
  }

  public static parseAll(specList: any[], context: Context): Scale[] {
    return _.map(specList, function(spec) {
      return Scale.parse(spec, context);
    });
  }

  public static parse(spec: any, context: Context): Scale {
    var newScale: Scale;

    switch(spec["type"]) {
      case "linear":
        newScale = new LinearScale(spec, context);
      break;
      default:
        throw new Error("Invalid Scale type: " + spec["type"]);
    }

    return newScale;
  }
}

class LinearScale extends Scale {

  private _scale;

  constructor(spec: any, context: Context) {
    super(spec, context);

    this._scale = d3.scale.linear().domain(spec["domain"]).range(spec["range"]);
  }

  public apply(input) {
    return this._scale(input);
  }

}
