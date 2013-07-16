class Context extends Backbone.Model {

  public getNode(className: string, nodeName: string) {
    return this.get(className + ":" + nodeName);
  }

}
