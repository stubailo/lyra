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

  constructor(spec: any, context: Context) {
    super(spec, context, DataSet.className);
  }

  public static parse(spec: any, context: Context) {
    return new DataSet(spec, context);
  }

  get items(): any[] {
    return _.clone(this.get("items"));
  }

  set items(items: any[]) {
    this.set("items", _.clone(items));
    this.trigger(DataSet.EVENT_CHANGE);
  }
}
