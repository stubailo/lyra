class Mark extends ContextNode {
  /*
    Each property is a function of one item that specifies that property of an SVG element.
    So for example a circle would have one function for "cx", one for "cy", etc.
  */
  private _properties: any;
  private _source: DataSet;

  private static className: string = "Mark";

  public static TYPE_SYMBOL: string = "symbol";

  public static EVENT_CHANGE: string = "change";

  public static parse(spec: any, context: Context) {
    switch(spec["type"]) {
      case Mark.TYPE_SYMBOL:
        return new Mark(spec, context);
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
      scale = new IdentityScale({}, new Context());
    }

    this.addDependency(scale);
    // HACKHACK we need real event handling
    scale.on(Scale.EVENT_CHANGE, $.proxy(this.dataSetChanged, this));

    if(typeof(spec["value"]) === "string") {
      this._properties[name] = function(dataItem){
        if(dataItem[spec["value"]]) {
          return scale.apply(dataItem[spec["value"]]);
        } else {
          return scale.apply(spec["value"]);
        }
      }
    } else {
      this._properties[name] = function(dataItem){
        return scale.apply(spec["value"]);
      }
    }
  }

  private parseProperties(properties: any): void {
    for(var key in properties) {
      this.parseProperty(key, properties[key]);
    }
  }

  constructor(spec: any, context: Context) {
    super(spec["name"], context, Mark.className);

    this._properties = {};
    this.parseProperties(spec["properties"]);

    this._source = context.getNode(DataSet.className, spec["source"]);
    this.addDependency(this._source);
    this._source.on(DataSet.EVENT_CHANGE, $.proxy(this.dataSetChanged, this));
    this.dataSetChanged();
  }

  private dataSetChanged(): void {
    console.log("triggered change");
    console.log(this);
    this.trigger(Mark.EVENT_CHANGE);
  }

  public get properties() {
    return this._properties;
  }

  public get source() {
    return this._source;
  }
}

class MarkView extends ContextNode {
  private _model: Mark;
  private _element: D3.Selection;
  private _markSelection: D3.Selection;

  public static className: string = "MarkView";

  public static EVENT_RENDER: string = "render";

  constructor(mark: Mark, element: D3.Selection, viewContext: Context) {
    super(mark.name, viewContext, MarkView.className);
    this._model = mark;
    this._element = element;

    var render = $.proxy(this.render, this);
    this._model.on(Mark.EVENT_CHANGE, render);
  }

  public render() {
    var properties = this._model.properties;
    this.markSelection
      .data(this._model.source.items)
      .enter()
      .append("circle")
      .attr("class", this._model.name);

    var props = [];
    for(var key in properties) {
      this.markSelection.attr(key, function(item) {
        return properties[key](item)
      });
    }

    this.trigger(MarkView.EVENT_RENDER);
  }

  public get element() {
    return this._element;
  }

  public get markSelection() {
    return this._element.selectAll("circle." + this._model.name);
  }
}
