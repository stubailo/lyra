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

class Lyra {

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
}
