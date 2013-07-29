/*
  This class represents a set of items that can be the basis for marks in the chart area.
*/

class DataSet extends ContextNode {
  public static className: string = "data";
  public static EVENT_CHANGE: string = "change";

  public static parse(spec: any, context: Context) {
    if(spec["type"]) {
      switch(spec["type"]) {
        case "bar":
          return new BarDataSetTransform(spec, context, DataSet.className);
          break;
        default:
          throw new Error("Unsupported transform type: " + spec["type"]);
      }
    } else {
      return new DataSet(spec, context, DataSet.className);
    }
  }

  get items(): any[] {
    return _.clone(this.get("items"));
  }

  set items(items: any[]) {
    this.set("items", _.clone(items));
    this.trigger(DataSet.EVENT_CHANGE);
  }
}

class BarDataSetTransform extends DataSet {
  get items(): any[] {
    var barWidth: number = Infinity;
    var domain: string = this.get("domain");
    var prevItems = this.get("source").items;
    var prevValue = -Infinity;

    _.each(_.sortBy(prevItems, domain), (item) => {
      if(item[domain] - prevValue < barWidth) {
        barWidth = item[domain] - prevValue;
      }

      prevValue = item[domain];
    });

    barWidth = barWidth * .95;

    return _.map(prevItems, (item) => {
      item = _.clone(item);
      item["barWidth"] = barWidth;
      item["barDomain"] = item[domain] - barWidth/2;
      item["barDomain2"] = item[domain] + barWidth/2;
      item["barBase"] = 0;
      return item;
    });
  }
}
