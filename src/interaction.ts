/*
  This class represents an interactive feature, it is the only class so far that has access to the model
  and view contexts, since it can modify the model based on view events.
*/

class Interaction {
  public static className: string = "Interaction";

  public static TYPE_CLICK_PRINT: string = "clickPrint";
  public static TYPE_PAN: string = "pan";
  public static TYPE_COLOR_HOVER: string = "colorHover";
  public static TYPE_ZOOM: string = "zoom";
  public static TYPE_ADD_POINT: string = "addPoint";

  private _modelContext: Context;
  private _viewContext: Context;
  private _id: number;

  constructor(modelContext: Context, viewContext: Context, id: number) {
    this._modelContext = modelContext;
    this._viewContext = viewContext;
    this._id = id;
  }

  public static parseAll(specList: any[], modelContext: Context, viewContext: Context): Interaction[] {
    var count = -1;
    return _.map(specList, function(spec) {
      count++;
      return Interaction.parse(spec, modelContext, viewContext, count);
    });
  }

  public static parse(spec: any, modelContext: Context, viewContext: Context, i: number): Interaction {
    switch(spec["type"]) {
      case Interaction.TYPE_CLICK_PRINT:
        return new ClickPrintInteraction(spec, modelContext, viewContext, i);
      case Interaction.TYPE_PAN:
        return new PanInteraction(spec, modelContext, viewContext, i);
      case Interaction.TYPE_COLOR_HOVER:
        return new ColorHoverInteraction(spec, modelContext, viewContext, i);
      case Interaction.TYPE_ZOOM:
        return new ZoomInteraction(spec, modelContext, viewContext, i);
      case Interaction.TYPE_ADD_POINT:
        return new AddPointInteraction(spec, modelContext, viewContext, i);
      default:
        throw new Error("Unsupported interaction type: " + spec["type"]);
    }
    return null;
  }

  public get modelContext(): Context {
    return this._modelContext;
  }

  public get viewContext(): Context {
    return this._viewContext;
  }

  public get id(): number {
    return this._id;
  }
}

class ClickPrintInteraction extends Interaction {
  private _markView: MarkView;

  constructor(spec: any, modelContext: Context, viewContext: Context, id: number) {
    super(modelContext, viewContext, id);

    if(spec["mark"]) {
      this._markView = this.viewContext.getNode(Mark.className, spec["mark"]);
    } else {
      throw new Error("No mark specified in ClickPrintInteraction.");
    }

    this.addEvents();
    this._markView.on(MarkView.EVENT_RENDER, $.proxy(this.addEvents, this));
  }

  private addEvents() {
    this._markView.markSelection.on("click.ClickPrintInteraction", $.proxy(this.onClick, this));
  }

  private onClick(d, i) {
    console.log(d3.event);
  }
}

class PanInteraction extends Interaction {
  private _element: D3.Selection;
  private _scale: Scale;
  private _direction: string;

  private _startPosition: number[];
  private _currentPosition: number[];
  private _dragging: boolean;

  private addEvents;
  private startDrag;
  private drag;
  private stopDrag;

  constructor(spec: any, modelContext: Context, viewContext: Context, id: number) {
    super(modelContext, viewContext, id);

    if(spec["area"]) {
      this._element = this.viewContext.getNode(Area.className, spec["area"]).graphSelection;
    } else if(spec["axis"]) {
      this._element = this.viewContext.getNode(Axis.className, spec["axis"]).axisSelection;
    } else {
      throw new Error("No axis or area specified in PanInteraction.");
    }

    if(spec["scale"]) {
      this._scale = this.modelContext.getNode(Scale.className, spec["scale"]);
    } else {
      throw new Error("No scale specified in PanInteraction.");
    }

    if(spec["direction"]) {
      this._direction = spec["direction"];
    } else {
      this._direction = "e";
    }

    this.addEvents = () => {
      this._element.on("mousedown." + this.id, this.startDrag);
    };

    this.drag = (event) => {
      var newPosition: number[] = [event.clientX, event.clientY];
      var dx = newPosition[0] - this._currentPosition[0];
      var dy = newPosition[1] - this._currentPosition[1];
      this._currentPosition = _.clone(newPosition);

      switch(this._direction) {
        case "n":
          this._scale.pan(dy);
        break;
        case "s":
          this._scale.pan(-dy);
        break;
        case "e":
          this._scale.pan(dx);
        break;
        case "w":
          this._scale.pan(-dx);
        break;
        default:
          throw new Error("Invalid pan direction: " + this._direction);
      }
    };

    this.startDrag = () => {
      this._startPosition = [d3.event.x, d3.event.y];
      this._currentPosition = _.clone(this._startPosition);
      this._dragging = true;
      $(window).on("mousemove", this.drag);
      $(window).one("mouseup", this.stopDrag);
    };

    this.stopDrag = (event) => {
      $(window).off("mousemove", this.drag);
    };

    this.addEvents();
  }
}

// TODO: completely broken
class ColorHoverInteraction extends Interaction {
  private _markView: MarkView;
  private _properties: any;
  private _oldColor: string;

  constructor(spec: any, modelContext: Context, viewContext: Context, id: number) {
    super(modelContext, viewContext, id);
    if (spec["mark"]){
       this._markView = this.viewContext.getNode(Mark.className, spec["mark"]);
    } else {
      throw new Error("No mark specified in ClickPrintInteraction.");
    }

    this.addEvents();
    this._markView.on(MarkView.EVENT_RENDER, $.proxy(this.addEvents, this));
  }

  private addEvents() {
    this._markView.markSelection.on("mouseover", $.proxy(this.onHoverIn, this));
    this._markView.markSelection.on("mouseout", $.proxy(this.onHoverOut, this));
  }

  private onHoverIn(d, i) {
    this._markView.set("stroke", () => {return "green"});
    this._markView.trigger("change:stroke");
  }

  private onHoverOut(d, i) {
    this._markView.set("stroke", null);
  }
}

class ZoomInteraction extends Interaction {
  private _element: D3.Selection;
  private _scale: Scale;
  private _properties: any;
  private _zoomFactor: number;

  private static DEFAULT_ZOOM_FACTOR: number = 0.02;
  // TODO : separate horizontal and vertical zoom factors?


  constructor(spec: any, modelContext: Context, viewContext: Context, id: number) {
    super(modelContext, viewContext, id);

    if(spec["area"]) {
      this._element = this.viewContext.getNode(Area.className, spec["area"]).graphSelection;
    } else if(spec["axis"]) {
      this._element = this.viewContext.getNode(Axis.className, spec["axis"]).axisSelection;
    } else {
      throw new Error("No axis or area specified in PanInteraction.");
    }

    if (spec["scale"]) {
      this._scale = this.modelContext.getNode(Scale.className, spec["scale"]);
    } else {
      throw new Error("No scale specified for ZoomInteraction");
    }

    if (spec["zoomFactor"]) {
      this._zoomFactor = spec["zoomFactor"];
    } else {
      this._zoomFactor = ZoomInteraction.DEFAULT_ZOOM_FACTOR;
    }

    this.addEvents();
  }

  private addEvents() {
    $(this._element[0][0]).mousewheel($.proxy(this.onZoom, this));
  }

  private onZoom(e, delta, deltaX, deltaY) {
    this._scale.zoom(1 + ((deltaY < 0) ? 1 : -1) * this._zoomFactor);
    return false;
  }
}

class AddPointInteraction extends Interaction {
  private _markView: MarkView;
  private _areaView: AreaView;
  private _domainScale: Scale;
  private _rangeScale: Scale;
  private _properties: any;
  private _dataSetName: string;
  private _domain: string;
  private _range: string;

  private addPoint;
  private addEvents;

  constructor(spec: any, modelContext: Context, viewContext: Context, id: number) {
    super(modelContext, viewContext, id);

    if (spec["mark"]) {
      this._markView = this.viewContext.getNode(Mark.className, spec["mark"]);
      this._dataSetName = this._markView.node.get("source");
    } else {
      throw new Error("No mark specified in AddPointInteraction.");
    }

    if (spec["area"]) {
      this._areaView = this.viewContext.getNode(Area.className, spec["area"]);
    } else {
      throw new Error("No area specified in AddPointInteraction.");
    }

    if (spec["domain"]) {
      this._domain = spec["domain"];
    } else {
      throw new Error("No domain specified for AddPointInteraction.");
    }

    if (spec["range"]) {
      this._range = spec["range"];
    } else {
      throw new Error("No range specified for AddPointInteraction.");
    }

    if (spec["domainScale"]) {
      this._domainScale = this.modelContext.getNode(Scale.className, spec["domainScale"]);
    } else {
      throw new Error("No domain scale specified for AddPointInteraction.");
    }

    if (spec["rangeScale"]) {
      this._rangeScale = this.modelContext.getNode(Scale.className, spec["rangeScale"]);
    } else {
      throw new Error("No domain range scale specified for AddPointInteraction.");
    }

    this.addPoint = (d, i) => {
      var data = this.modelContext.getNode(DataSet.className, this._dataSetName);
      var items = data.items;

      var clickLocation: number[] = [
                                     d.clientX - parseFloat(this._areaView.graphSelection.attr(this._domain)) - parseFloat(this._areaView.totalSelection.attr(this._domain)),
                                     d.clientY - parseFloat(this._areaView.graphSelection.attr(this._range)) - parseFloat(this._areaView.totalSelection.attr(this._range))
                                    ];
      var newDataPoint = {};
      newDataPoint[this._domain] = this._domainScale.inverse(clickLocation[0]);
      newDataPoint[this._range] = this._rangeScale.inverse(clickLocation[1]);

      items.push(newDataPoint);
      items = _.sortBy(items, this._domain);

      data.items = items;
    };

    this.addEvents = () => {
      $(this._areaView.graphSelection[0][0]).on("dblclick", this.addPoint);
    };

    this.addEvents();
  }

}
