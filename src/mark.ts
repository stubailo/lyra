class Mark extends ContextNode {
  private _properties: any;
  private _source: DataSet;

  private static className: string = "Mark";

  public static parseAll(specList: any[], context: Context): Mark[] {
    return _.map(specList, function(spec) {
      return Mark.parse(spec, context);
    });
  }

  public static parse(spec: any, context: Context): Mark {
    switch(spec["type"]) {
      case "symbol":
        return new Mark(spec, context);
      break;
      default:
        throw new Error("Unsupported mark type: " + spec["type"]);
    }
  }

  private parseProperty(name: string, spec: any) {
    if(this._properties[name]) {
      throw new Error("Duplicate property in mark specification: " + name);
    }

    var scale;

    if(spec["scale"]) {
      scale = this.context.getNode(Scale.className, spec["scale"]);
    } else {
      scale = {apply: function(x){return x}};
    }

    if(typeof(spec["value"]) === "string") {
      this._properties[name] = function(dataItem){
        return scale.apply(dataItem[spec["value"]]);
      }
    } else {
      this._properties[name] = function(dataItem){
        return scale.apply(spec["value"]);
      }
    }
  }

  private parseProperties(properties: any) {
    for(var key in properties) {
      this.parseProperty(key, properties[key]);
    }
  }

  constructor(spec: any, context: Context) {
    super(spec["name"], context, Mark.className);

    this._properties = {};
    this._source = context.getNode(DataSet.className, spec["source"]);
    this.parseProperties(spec["properties"]);

    SymbolMark.render(null, this._properties, this._source);
  }

  public render() {
    throw new Error("Render method on mark unimplemented.");
  }
}

class SymbolMark {
  public static render(drawArea, properties: any, source: DataSet) {
    _.each(source.items, function(item) {
      console.log(["x", properties["x"](item),"y", properties["y"](item),"size", properties["size"](item)]);
    });
  }
}
