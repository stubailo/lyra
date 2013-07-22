/*
  This class represents an interactive feature, it is the only class so far that has access to the model
  and view contexts, since it can modify the model based on view events.
*/

class Interaction {
  public static className: string = "Interaction";

  public static TYPE_CLICK_PRINT: string = "clickPrint";

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
    this._markView.markSelection.on("click", $.proxy(this.onClick, this));
  }

  private onClick(d, i) {
    console.log([d, i]);
  }
}
