/*
  This class represents a set of items that can be the basis for marks in the chart area.
*/

class DataSet extends ContextNode {
  private _items: any[];

  private static _className: string = "DataSet";

  public static EVENT_CHANGE: string = "change";

  public static get className() {
    return DataSet._className;
  }

  constructor(name: string, context: Context) {
    super(name, context, DataSet.className);
  }

  public static parseAll(specList: any[], context: Context): DataSet[] {
    return _.map(specList, function(spec) {
      return DataSet.parse(spec, context);
    });
  }

  public static parse(spec: any, context: Context): DataSet {
    var dataSet = new DataSet(spec["name"], context);

    // This should probably validate somehow
    dataSet.items = spec["items"];

    return dataSet;
  }

  get items(): any[] {
    return _.clone(this._items);
  }

  set items(items: any[]) {
    this._items = _.clone(items);
    this.trigger(DataSet.EVENT_CHANGE);
  }
}