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

  private _dataSets: DataSet[];
  private _scales: Scale[];
  private _marks: Mark[];
  private _interactions: Interaction[];
  private _areas: Area[];

  private _context: Context;

  constructor(spec: any) {
    // Initialize
    this._context = new Context();

    var axisArray = [];
    // Parse all of the models
    for(var key in spec) {
      var value = spec[key];
      var context = this.context;
      switch(key) {
        case "data":
          this._dataSets = ContextNode.parseAll(value, context, DataSet);
        break;
        case "scales":
          this._scales = ContextNode.parseAll(value, context, Scale);
        break;
        case "marks":
          this._marks = ContextNode.parseAll(value, context, Mark);
          break;
		    case "axes":
          axisArray = ContextNode.parseAll(value, context, Axis);
        break;
        case "areas":
          this._areas = ContextNode.parseAll(value, context, Area);
        break;
      }
    }

    _.each(axisArray, (axis: Axis) => {
      axis.get("area").addAxis(axis);
    });
  }

  public get marks(): Mark[] {
    return this._marks;
  }
  
  public get areas(): Area[] {
    return this._areas;
  }

  public get context(): Context {
    return this._context;
  }
}

// Entry point into library
class Lyra {
  // Necessary properties
  private _model: LyraModel;
  private _viewContext: Context;

  // Spec-produced objects
  private _markViews: MarkView[];
  private _interactions: Interaction[];
  private _areaViews : AreaView[];

  // DOM elements and such
  private _element: HTMLElement;


  constructor(spec: any, element: HTMLElement) {
    // Initialize
    this._viewContext = new Context();
    this._model = new LyraModel(spec);

    // Initialize DOM
    this._element = element;

    var svg = d3.select(this._element).append('svg:svg');

    // Creates the view for areas
    var createAreas = function(area: Area) {
        this._areaViews.push(new AreaView(area, svg, this._viewContext));
    }

    createAreas = $.proxy(createAreas, this);
    this._areaViews = [];
    _.each(this.model.areas, createAreas);

    // HACK HACK: ghetto translate
    var translate = 0;

    _.each(this._areaViews, function(area: AreaView) {
      area.totalSelection.attr("x", translate);
      translate += area.model.get("width") + 4 *  AxisView.AXIS_WIDTH;
    });

    // Create views for existing model nodes (should potentially be refactored into new method)
    var createMarkView = function(mark: Mark) {
      var markView = MarkView.createView(mark, this._viewContext.getNode(AreaView.className, mark.area.name).graphSelection, this._viewContext);
      this._markViews.push(markView);
    }
    createMarkView = $.proxy(createMarkView, this);

    this._markViews = [];
    _.each(this.model.marks, createMarkView);

    // Parse new nodes that don't have models already (should potentially be refactored into new method)
    for(var key in spec) {
      var value = spec[key];
      switch(key) {
        case "interactions":
          this._interactions = Interaction.parseAll(value, this.model.context, this._viewContext);
        break;
      }
    }

    // Render for the first time
    this.render();
  }

  public get model(): LyraModel {
    return this._model;
  }

  public render() {
    _.each(this._areaViews, function(areaView) {
      areaView.render();
    });
    _.each(this._markViews, function(markView) {
      markView.render();
    });
  }
}
