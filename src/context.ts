class Context extends Backbone.Model {

  // Gets a certain type of object with a certain name from the context, checking if it exists in the process.
  // The reason this has a className is to avoid name collisions between different types of things.
  public getNode(className: string, nodeName: string) {
    var result = this.get(className + ":" + nodeName);
    if(result) {
      return result;
    } else {
      throw new Error("No " + className + " with name " + nodeName + " exists.");
    }
  }

  public static isPropertyReference(obj: any) {
    var propertyRegex = /^[A-Za-z_\-0-9]+:[A-Za-z_\-0-9]+\.[A-Za-z_\-0-9]+$/;
    return ((typeof(obj) === "string") && propertyRegex.test(obj));
  }

  public getProperty(path: string) {
    // [type, name, propertyName]
    var list = path.split(/:|\./);
    var node: ContextNode = this.getNode(list[0], list[1]);
    var property = node.get(list[2]);
    console.log(property);
  }
}
