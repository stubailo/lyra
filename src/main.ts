/// <reference path="../defs/jquery.d.ts" />
/// <reference path="../defs/underscore-typed.d.ts" />
/// <reference path="../defs/backbone.d.ts" />
/// <reference path="../defs/d3.d.ts" />
/// <reference path="../defs/q.d.ts" />

/// <reference path="node.ts" />
/// <reference path="context.ts" />
/// <reference path="dataset.ts" />
/// <reference path="scale.ts" />
/// <reference path="mark.ts" />
/// <reference path="interaction.ts" />

// Model class, should not be exposed as API eventually
class LyraModel {

  private _dataSets: DataSet[];
  private _scales: Scale[];
  private _marks: Mark[];
  private _interactions: Interaction[];

  private _context: Context;

  constructor(spec: any) {
    // Initialize
    this._context = new Context();

    // Parse all of the models
    for(var key in spec) {
      var value = spec[key];
      var context = this.context;
      switch(key) {
        case "data":
          this._dataSets = DataSet.parseAll(value, context);
        break;
        case "scales":
          this._scales = Scale.parseAll(value, context);
        break;
        case "marks":
          this._marks = Mark.parseAll(value, context);
        break;
      }
    }
  }

  public get marks(): Mark[] {
    return this._marks;
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

  // DOM elements and such
  private _element: HTMLElement;
  private _svg: D3.Selection;

  constructor(spec: any, element: HTMLElement) {
    // Initialize
    this._viewContext = new Context();
    this._model = new LyraModel(spec);

    // Initialize DOM
    this._element = element;

    // The width and height here should be dynamic properties that can be referenced by
    // scales, and changed during runtime
    this._svg = d3.select(this._element)
      .append('svg:svg')
      .attr('width', 400)
      .attr('height', 300)
      .attr('style', "border: 1px solid red");

    // Create views for existing model nodes (should potentially be refactored into new method)
    var createMarkView = function(mark: Mark) {
      var markView = new MarkView(mark, this._svg, this._viewContext);
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
    _.each(this._markViews, function(markView) {
      markView.render();
    });
  }
}
