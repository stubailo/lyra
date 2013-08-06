/// <reference path="../defs/jquery.d.ts" />
/// <reference path="../defs/underscore-typed.d.ts" />
/// <reference path="../defs/backbone.d.ts" />
/// <reference path="../defs/d3.d.ts" />
/// <reference path="../defs/Q.d.ts" />

/// <reference path="node.ts" />
/// <reference path="context.ts" />
/// <reference path="dataSet.ts" />
/// <reference path="scale.ts" />
/// <reference path="mark.ts" />
/// <reference path="axis.ts" />
/// <reference path="interaction.ts" />
/// <reference path="area.ts" />

// Model class, should not be exposed as API eventually
class LyraModel {
  private _context: Context;

  private static _classNameToClass: Object = {};

  constructor(spec: any) {
    // Initialize
    this._context = new Context();

    // Parse all of the models
    for(var className in spec) {
      if (LyraModel._classNameToClass[className] !== undefined) {
        ContextNode.parseAll(spec[className], this.context, LyraModel._classNameToClass[className]);
      }
    }
  }

  public get context(): Context {
    return this._context;
  }

  // Method for adding new types of model nodes
  public static addClass(specKey: string, classReference): void {
    LyraModel._classNameToClass[specKey] = classReference;
  }
}

LyraModel.addClass("data", DataSet);
LyraModel.addClass("scales", Scale);
LyraModel.addClass("marks", Mark);
LyraModel.addClass("axes", Axis);
LyraModel.addClass("areas", Area);

// Entry point into library
class Lyra {
  private static AREA_SPACE = 25;
  // Necessary properties
  private _model: LyraModel;
  private _viewContext: Context;

  // Spec-produced objects
  private _interactions: Interaction[];

  // DOM elements and such
  private _element: HTMLElement;
  private _svg: D3.Selection;

  private static _classNameToClass: Object = {};

  public static addClass(specKey: string, classReference): void {
    Lyra._classNameToClass[specKey] = classReference;
  }

  constructor(spec: any, element: HTMLElement) {
    // Initialize
    this._viewContext = new Context();
    this._model = new LyraModel(spec);

    // Initialize DOM
    this._element = element;

    // Generate all the views for this model
    this.generateViews();

    this.render();

    // Set up the layout for the chart areas
    var bounds = this.setUpLayout();

    this._svg.attr("width", bounds[0]).attr("height", bounds[1]);
    // Parse new nodes that don't have models already (should potentially be refactored into new method)
    for(var key in spec) {
      var value = spec[key];
      switch(key) {
        case "interactions":
          this._interactions = Interaction.parseAll(value, this.model.context, this._viewContext);
        break;
      }
    }

  }

  public get model(): LyraModel {
    return this._model;
  }

  public render() {
    _.each(<ContextView[]> this._viewContext.getNodesOfClass(Area.className), function(areaView) {
      areaView.render();
    });
    _.each(<ContextView[]> this._viewContext.getNodesOfClass(Mark.className), function(markView) {
      markView.render();
    });
  }

  private generateViews() {
    this._svg = d3.select(this._element).append('svg:svg');

    for(var specKey in Lyra._classNameToClass) {
      console.log("generating views for: " + specKey);
    }
    // Creates the view for area
    _.each(this.model.context.getNodesOfClass(Area.className), (area: Area) => {
      new AreaView(area, this._svg, this._viewContext, AreaView.className);

    });

    _.each(this.model.context.getNodesOfClass(Mark.className), (mark: Mark) => {
      MarkView.createView(mark,
        this._viewContext.getNode(AreaView.className, mark.area.name).graphSelection, this._viewContext);
    });
  }

  private setUpLayout() {
    var window_width: number = $(window).width();
    var curX = 0, curY = Lyra.AREA_SPACE+10, maxY = 0, yBound = 0, xBound = 0;

    _.each(<AreaView[]> this._viewContext.getNodesOfClass(Area.className), (areaView) => {
      var areaWidth = parseFloat(areaView.totalSelection.attr("width"));
      var areaHeight = parseFloat(areaView.totalSelection.attr("height"));
      if ((curX + areaWidth) >= window_width) {
        curX = 0;
        curY = maxY + Lyra.AREA_SPACE;
        maxY = 0;
      }
      areaView.totalSelection.attr("x", curX).attr("y", curY);
      curX += areaWidth + Lyra.AREA_SPACE;
      if (areaHeight > maxY) {
          maxY = areaHeight;
        }
      if (yBound < curY + areaHeight) {
        yBound = curY + areaHeight;
      }
      if (xBound < curX) {
        xBound = curX;
      }
    });
    return [xBound, yBound];
  }
}

Lyra.addClass("areas", AreaView);
Lyra.addClass("marks", MarkView);
