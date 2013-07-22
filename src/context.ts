class Context extends Backbone.Model {

  // Gets a certain type of object with a certain name from the context, checking if it exists in the process.
  public getNode(className: string, nodeName: string) {
    var result = this.get(className + ":" + nodeName);
    if(result) {
      return result;
    } else {
      throw new Error("No " + className + " with name " + nodeName + " exists.");
    }
  }

}