class Scale extends ContextNode {
  private static _className: string = "Scale";

  public static EVENT_CHANGE: string = "change";

  public static get className() {
    return Scale._className;
  }

  constructor(spec: any, context: Context) {
    super(spec["name"], context, Scale.className);
  }

  public static parse(spec: any, context: Context) : Scale {
    switch(spec["type"]) {
      case "linear":
        return new LinearScale(spec, context);
      break;
      default:
        throw new Error("Invalid Scale type: " + spec["type"]);
    }
  }
  // Main method for any scale, delegates to D3 most of the time
  public apply(input: any): any {
    throw new Error("Apply method not overridden for scale.");
  }

  public inverse(input: any): any {
    throw new Error("Invert method not overridden for scale.");
  }

  public pan(pixels: number) {
    throw new Error("Pan method not overridden for scale.");
  }
}

/*
  Represents a linear D3 scale.
*/
class LinearScale extends Scale {

  private _scale;

  constructor(spec: any, context: Context) {
    super(spec, context);

    this._scale = d3.scale.linear().domain(spec["domain"]).range(spec["range"]);
  }

  public apply(input) {
    return this._scale(input);
  }

  public inverse(input) {
    return this._scale.invert(input);
  }

  public pan(pixels) {
    var domain = _.clone(this._scale.domain());
    var dx = this.inverse(pixels) - this.inverse(0);
    domain[0] -= dx;
    domain[1] -= dx;
    this._scale.domain(domain);
    this.trigger(Scale.EVENT_CHANGE);
  }
}

/*
  This scale doesn't change the input at all.
*/
class IdentityScale extends Scale {
  constructor(spec: any, context: Context) {
    super(spec, context);
  }

  public apply(input) {
    return input;
  }

  public inverse(input) {
    return input;
  }

  public pan(pixels) {
    // does nothing
  }
}
