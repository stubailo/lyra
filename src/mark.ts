class MarkType {
  constructor(private _name: string){}

  public get name(){
    return this._name;
  }
  public static LINE = new MarkType("path");
  public static CIRCLE = new MarkType("circle");
  public static RECTANGLE = new MarkType("rect");
}

class Mark extends ContextNode {
  public static className: string = "marks";

  /* Each property is a function of one item that specifies that property of an SVG element.
   * So for example a circle would have one function for "cx", one for "cy", etc.
   */
  private _source: DataSet;
  private _area: Area;
  private _type: MarkType;
  private _markProperties;

  public static parse(spec: any, context: Context) {
    return new Mark(spec, context, Mark.className);
  }

  public load() {
    var context = this.context;
    switch(this.get("type")) {
      case "circle":
        this._type = MarkType.CIRCLE;
        break;
      case "line":
        this._type = MarkType.LINE;
        break;
      case "rect":
        this._type = MarkType.RECTANGLE;
        break;
      default:
        throw new Error("Unsupported mark type: " + this.get("type"));
    }
    this.parseMarkProperties(this.get("properties"));

    this._area = context.getNode(Area.className, this.get("area"));
    this._source = context.getNode(DataSet.className, this.get("source"));
    this._source.on(DataSet.EVENT_READY, $.proxy(this.dataSetChanged, this));
    this.dataSetChanged();
  }

  private parseProperty(name: string, spec: any) {

    if(this.get(name)) {
      throw new Error("Duplicate property in mark specification: " + name);
    }

    var scale;
    if(spec["scale"]) {
      scale = this.context.getNode(Scale.className, spec["scale"]);
    } else {
      scale = Scale.parse({type: "identity"}, new Context());
    }



    // HACKHACK we need real event handling
    scale.on(ContextNode.EVENT_READY, () => {
      this.dataSetChanged();
    });

    var valueFunc;

    if(typeof(spec["value"]) === "string") {
      valueFunc = function(dataItem) {
        if(dataItem != null && dataItem[spec["value"]] != null) {
          return scale.apply(dataItem[spec["value"]]);
        } else {
          return scale.apply(spec["value"]);
        }
      }
    } else {
      valueFunc = function(dataItem){
        return scale.apply(spec["value"]);
      }
    }

    this.set(name, valueFunc);
    this._markProperties.push(name);
  }

  private parseMarkProperties(properties: any): void {
    this._markProperties = [];

    for(var key in properties) {
      this.parseProperty(key, properties[key]);
    }
  }

  private dataSetChanged(): void {
    this.trigger("change");
  }

  public get source() {
    return this._source;
  }

  public get area() {
    return this._area;
  }

  public get type() {
    return this._type;
  }

  public get markProperties() {
    return this._markProperties;
  }
}

class MarkView extends ContextView {
  public static className: string = Mark.className;
  public static EVENT_RENDER: string = "render";

  private _markSelection: D3.Selection;

  public load() {
    var render = $.proxy(this.render, this);
    this.node.on(ContextNode.EVENT_READY, render);
    this.on("change", render);
  }

  public static createView(mark: Mark, element: D3.Selection, viewContext: Context) {
    switch(mark.type) {
      case MarkType.CIRCLE:
        return new CircleMarkView(mark, element, viewContext, MarkView.className);
      case MarkType.LINE:
        return new LineMarkView(mark, element, viewContext, MarkView.className);
      case MarkType.RECTANGLE:
        return new RectMarkView(mark, element, viewContext, MarkView.className);
      default:
        throw new Error("Invalid MarkView type: " + mark.type);

    }
  }

  public render() {
    throw new Error ("This method is abstract, derived mark views must implement this method");
  }

  public get markSelection() {
    return this.element.selectAll(this.node.type.name + "." + this.node.name);
  }
}

class CircleMarkView extends MarkView {
  public render() {
    this.markSelection
      .data(this.node.source.items)
      .enter()
      .append("circle")
      .attr("class", this.node.name);

    _.each(this.node.markProperties, (key) => {
      this.markSelection.attr(key, (item) => {
        return this.getProperty(key)(item);
      });
    });

    this.trigger(MarkView.EVENT_RENDER);
  }
}

class LineMarkView extends MarkView {
  public render() {
     this.markSelection
      .data([this.node.source.items])
      .enter()
      .append("path")
      .attr("class", this.node.name);

    var line = d3.svg.line();
    _.each(this.node.markProperties, (key) => {
      switch(key) {
        case "x" :
          line.x((item) => {
            return this.getProperty("x")(item);
          });
          break;
        case "y" :
          line.y((item) => {
            return this.getProperty("y")(item);
          });
          break;
        case "interpolate":
          line.interpolate(this.getProperty("interpolate")());
          break;
        default:
          this.markSelection.attr(key, (item) => {
           return this.getProperty(key)(item);
          });
          break;
      }
    });

    this.markSelection.attr("d", line);

    this.trigger(MarkView.EVENT_RENDER);
  }
}

class RectMarkView extends MarkView {

    public render() {
      this.markSelection
        .data(this.node.source.items)
        .enter()
        .append("rect")
        .attr("class", this.node.name);

      this.markSelection.attr("width", (item) => {
        return this.getProperty("x2")(item) - this.getProperty("x")(item);
      });

      this.markSelection.attr("height", (item) => {
        return this.getProperty("y2")(item) - this.getProperty("y")(item);
      });

      _.each(this.node.markProperties, (key) => {
        this.markSelection.attr(key, (item) => {
          return this.getProperty(key)(item);
        });
      });

      this.trigger(MarkView.EVENT_RENDER);
    }
}
