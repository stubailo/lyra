class Context extends Backbone.Model {

  public getNode(className: string, nodeName: string) {
    var result = this.get(className + ":" + nodeName);
    if(result) {
      return result;
    } else {
      throw new Error("No " + className + " with name " + nodeName + " exists.");
    }
  }

}
