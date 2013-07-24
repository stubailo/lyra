/*
  This class represents an interactive feature, it is the only class so far that has access to the model
  and view contexts, since it can modify the model based on view events.
*/

class Interaction {
  public static className: string = "Interaction";

  public static TYPE_CLICK_PRINT: string = "clickPrint";
  public static TYPE_PAN: string = "pan";
  public static TYPE_COLOR_HOVER: string = "colorHover";

  private _modelContext: Context;
  private _viewContext: Context;

  constructor(modelContext: Context, viewContext: Context) {
    this._modelContext = modelContext;
    this._viewContext = viewContext;
  }

  public static parseAll(specList: any[], modelContext: Context, viewContext: Context): Interaction[] {
    return _.map(specList, function(spec) {
      return Interaction.parse(spec, modelContext, viewContext);
    });
  }

  public static parse(spec: any, modelContext: Context, viewContext: Context): Interaction {
    switch(spec["type"]) {
      case Interaction.TYPE_CLICK_PRINT:
        return new ClickPrintInteraction(spec, modelContext, viewContext);
      case Interaction.TYPE_PAN:
        return new PanInteraction(spec, modelContext, viewContext);
      case Interaction.COLOR_HOVER:
        return new ColorHoverInteraction(spec, modelContext, viewContext);
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
}

class ClickPrintInteraction extends Interaction {
  private _markView: MarkView;
  private _properties: any;

  constructor(spec: any, modelContext: Context, viewContext: Context) {
    super(modelContext, viewContext);

    if(spec["mark"]) {
      this._markView = this.viewContext.getNode(MarkView.className, spec["mark"]);
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
  private _markView: MarkView;
  private _scale: Scale;
  private _properties: any;
  private _direction: string;

  private _startPosition: number[];
  private _currentPosition: number[];
  private _dragging: boolean;

  private addEvents;
  private startDrag;
  private drag;
  private stopDrag;

  constructor(spec: any, modelContext: Context, viewContext: Context) {
    super(modelContext, viewContext);

    if(spec["mark"]) {
      this._markView = this.viewContext.getNode(MarkView.className, spec["mark"]);
    } else {
      throw new Error("No mark specified in PanInteraction.");
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
      $(this._markView.element[0][0]).on("mousedown", this.startDrag);
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

    this.startDrag = (event) => {
      this._startPosition = [event.clientX, event.clientY];
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


class ColorHoverInteraction extends Interaction { 
  private _markView: MarkView;
  private _properties: any;
  private _oldColor: string;

  constructor(spec: any, modelContext: Context, viewContext: Context) {
    super(modelContext, viewContext);
    if (spec["mark"]){
       this._markView = this.viewContext.getNode(MarkView.className, spec["mark"]);
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
    //HACK HACK: this does not work with other interactions 
    this._markView.markSelection.attr("stroke", "green");
  }

  private onHoverOut(d, i) {
    //HACK HACK: this removes all temporary properties
    this._markView.render();
  }
}