class Transform<P, Q> {

  //TODO: Make generics actually matter

  public apply(input: P, output: Q){
    throw new Error("The apply method of this transform was not overridden.");
  }

  public static parse(spec: any) {
    switch(spec["type"]) {
      case "max":
        return new MaxDataSetTransform(spec);
      break;
      default:
        throw new Error("Invalid Transform type: " + spec["type"]);
    }
  }
}

class MaxDataSetTransform extends Transform<DataSet, Property> {
  private _parameterToMax: String;

  constructor(spec: any) {
    super();
    if(! (typeof(spec["parameter"]) == 'string')) {
      throw new Error("Missing parameter to maximize for max transform.");
    }

    this._parameterToMax = spec["parameter"]
  }

  public apply (input: DataSet, output: Property) {
    var outputValue = 0;
    var parameterToMax = this._parameterToMax;
    var maxItem = _.max(input.items, function(item): number {
      return item[parameterToMax];
    });

    outputValue = maxItem[this._parameterToMax];

    output.val = outputValue;
  }
}
