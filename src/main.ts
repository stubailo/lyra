/// <reference path="../defs/jquery.d.ts" />
/// <reference path="../defs/underscore-typed.d.ts" />
/// <reference path="../defs/backbone.d.ts" />
/// <reference path="../defs/d3.d.ts" />
/// <reference path="../defs/q.d.ts" />

/// <reference path="node.ts" />
/// <reference path="context.ts" />
/// <reference path="property.ts" />
/// <reference path="dataset.ts" />
/// <reference path="transform.ts" />
/// <reference path="scale.ts" />
/// <reference path="mark.ts" />

/// <reference path="lyraSVG.ts" />

class LyraModel {

  private _dataSets: DataSet[];
  private _scales: Scale[];
  private _marks: Mark[];

  private _context: Context;

  constructor(spec: any) {

    this._context = new Context();

    for(var key in spec) {
      var value = spec[key];
      var context = this._context;
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
        default:
          throw new Error("Unsupported Lyra spec section: " + key);
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

class Lyra {
  private _model: LyraModel;

  private _markViews: MarkView[];

  private _element: HTMLElement;
  private _svg: D3.Selection;

  constructor(spec: any, element: HTMLElement) {
    this._element = element;

    this._svg = d3.select(this._element)
      .append('svg:svg')
      .attr('width', 400)
      .attr('height', 300);

    this._model = new LyraModel(spec);
    console.log(this._model);

    var createMarkView = function(mark: Mark) {

      var markView = new MarkView(mark, this._svg);
      this._markViews.push(markView);
    }
    createMarkView = $.proxy(createMarkView, this);

    this._markViews = [];
    _.each(this.model.marks, createMarkView);

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
