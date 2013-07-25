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

  public static isObjectReference(obj: any) {
    var propertyRegex = /^[A-Za-z_\-0-9]+:[A-Za-z_\-0-9]+$/;
    return ((typeof(obj) === "string") && propertyRegex.test(obj));
  }

  public getPropertyFunction(path: string) {
    // [type, name, propertyName]
    var list = path.split(/:|\./);
    var node: ContextNode = this.getNode(list[0], list[1]);

    var key = list[2];

    return () => {
      return node.get(key);
    }
  }

  public getObject(path: string) {
    // [type, name, propertyName]
    var list = path.split(/:|\./);
    return this.getNode(list[0], list[1]);
  }

  public addPropertyListener(path: string, listener) {
    var list = path.split(/:|\./);
    var node: ContextNode = this.getNode(list[0], list[1]);
    var key = list[2];
    node.on("change:" + key, listener);
  }
}
