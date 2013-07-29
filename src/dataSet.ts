/*
  This class represents a set of items that can be the basis for marks in the chart area.
*/

class DataSet extends ContextNode {
  public static className: string = "datasets";
  public static EVENT_CHANGE: string = "change";

  public static parse(spec: any, context: Context) {
    return new DataSet(spec, context, DataSet.className);
  }

  get items(): any[] {
    return _.clone(this.get("items"));
  }

  set items(items: any[]) {
    this.set("items", _.clone(items));
    this.trigger(DataSet.EVENT_CHANGE);
  }
}
