class MarkType {
  constructor(private _name: string){}

  public get name(){
    return this._name;
  }
  public static LINE = new MarkType("path");
  public static CIRCLE = new MarkType("circle");
}

class Mark extends ContextNode {
  /*
    Each property is a function of one item that specifies that property of an SVG element.
    So for example a circle would have one function for "cx", one for "cy", etc.
  */
  private _properties: any;
  private _source: DataSet;
  private _type: MarkType;

  private static className: string = "Mark";

  public static EVENT_CHANGE: string = "change";

  public static parse(spec: any, context: Context) {
    switch(spec["type"]) {
      case "circle":
        return new Mark(spec, context, MarkType.CIRCLE);
      case "line" : 
        return new Mark(spec, context, MarkType.LINE);
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

  constructor(spec: any, context: Context, type: MarkType) {
    super(spec["name"], context, Mark.className);

    this._type = type;
    this._properties = {};
    this.parseProperties(spec["properties"]);

    this._source = context.getNode(DataSet.className, spec["source"]);
    this.addDependency(this._source);
    this._source.on(DataSet.EVENT_CHANGE, $.proxy(this.dataSetChanged, this));
    this.dataSetChanged();
  }

  private dataSetChanged(): void {
    this.trigger(Mark.EVENT_CHANGE);
  }

  public get properties() {
    return this._properties;
  }

  public get source() {
    return this._source;
  }

  public get type() {
    return this._type;
  }
}

class MarkView extends ContextNode {
  private _model: Mark;
  private _element: D3.Selection; // the canvas
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

  public static createView(mark: Mark, element: D3.Selection, viewContext: Context) {
    switch(mark.type) {
      case MarkType.CIRCLE:
        return new CircleMarkView(mark, element, viewContext);
      case MarkType.LINE:
        return new LineMarkView(mark, element, viewContext);
    }
  }

  public render() {
    throw new Error ("This method is abstract, derived mark views must implement this method");
  }
  
  public get model() {
    return this._model;
  }

  public get element() {
    return this._element;
  }

  public get markSelection() {
    return this._element.selectAll(this.model.type.name + "." + this._model.name);
  }
}

class CircleMarkView extends MarkView {
  constructor(mark: Mark, element: D3.Selection, viewContext: Context) {
    super(mark, element, viewContext);
  }


  public render() {
    var properties = this.model.properties;
    this.markSelection
      .data(this.model.source.items)
      .enter()
      .append("circle")
      .attr("class", this.model.name);
    for(var key in properties) {
      this.markSelection.attr(key, function(item) {
        return properties[key](item)
      });
    }

    this.trigger(MarkView.EVENT_RENDER);
  }
}

class LineMarkView extends MarkView {
   constructor(mark: Mark, element: D3.Selection, viewContext: Context) {
    super(mark, element, viewContext);
  }

  public render() {
    var properties = this.model.properties;
  
     this.markSelection
      .data([this.model.source.items])
      .enter()
      .append("svg:path")
      .attr("class", this.model.name);
      
    var line = d3.svg.line();
    for(var key in properties) {
      switch(key) {
        case "x" :
          line.x(function(item) {
            return properties["x"](item);
          });
          break;
        case "y" :
          line.y(function(item) {
            return properties["y"](item);
          });
          break;
        case "interpolate":
          line.interpolate(properties["interpolate"]("value"));
          break;
        default:
          this.markSelection.attr(key, function(item) {
           return properties[key](item)
          });
          break;
      }
    }

    this.markSelection.attr("d", line);

    this.trigger(MarkView.EVENT_RENDER);
  }
}