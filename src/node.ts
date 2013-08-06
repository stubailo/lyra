/**
 * ContextNode is a generalized class that represents a node in the
 * model or view context.
 */
class ContextNode extends Backbone.Model {
  // Private references to the context, and name
  private _context: Context;
  private _name: string;
  private _className: string;

  public defaults() {
    return {};
  }

  // This event is triggered when a context node has finished rendering.
  public static EVENT_READY: string = "EVENT_READY";

  /* Utility method that returns an array of ContextNodes of a certain type.
   *
   * @param specList A list of specifications that will be passed to each new node
   * @param context The universal context
   * @param classType A class (should be extending ContextNode) that will be created
   * @return An array of ContextNodes of type classtype
   */
  public static parseAll(specList: any[], context: Context, classType: any) : any[] {
    return _.map(specList, function(spec) {
      return classType.parse(spec, context)
    });
  }

  /* Creates a ContextNode, setting up the name, context, and properties from the specification
   * passed to it.
   *
   * This method should not be overriden. Instead, override the load method to perform additional
   * operations before the contextNode is rendered.
   */
  constructor (spec: any, context: Context, className: string) {
    super();
    Backbone.Model.apply(this, arguments);

    // Setup instance variables
    this._name = spec["name"];
    this._context = context;
    this._className = className;

    // Save this ContextNode in the context
    this._context.set(className + ":" + this.name, this);

    // Parse the properties of this node from the specification
    this.parseProperties(spec);

    // Event to be removed
    // TODO: this shit is not good
    this.refresh();
    this.on("change", () => {
      this.refresh();
    });

    // Additional initialization
    this.load();
  }

  /* The behavior of load is set as a no-op, but can be overriden to add additional behavior.
   *
   * This method is called immediately after a ContextNode is constructed.
   */
  public load() {
    // NO-OP
  }

  /* Given a hash of properties, attaches the properties to the contextNode.
   *
   * This method parses three type of property values.
   * 1) Objects
   * 2) Property References (e.g. Set the property "width" of the contextNode to be the width of another contextNode)
   * 3) If the property isn't either of the above it is set as-is
   */
  public parseProperties(properties: any): void {
    for(var key in properties) {
      var value = properties[key];
      if(ContextNode.isPropertyReference(value)) {
        var propertyFunction = this.context.getPropertyFunction(value);
        var updateProperty = () => {this.set(key, propertyFunction())}
        updateProperty()
        this.context.getNode(value).on(ContextNode.EVENT_READY, updateProperty)
      } else if (ContextNode.isObjectReference(value)) {
        this.set(key, this.context.getNode(value));
        this.get(key).on(ContextNode.EVENT_READY, () => {
          // REFACTOR THIS SHIT <- Eventing needs to be cleaned up.
          this.refresh();
        });
      } else {
        this.set(key, value);
      }
    }
  }

  public get name(): string {
    return this._name;
  }

  public get context(): Context {
    return this._context;
  }

  public get className(): string {
    return this._className;
  }

  public recalculate(callback) {
    callback();
  }

  /* Private method to check if a property string is a property reference.
   *
   * This method checks if the string is of the form: <className>:<name>.<property>
   */
  private static isPropertyReference(obj: string) {
    var propertyRegex = /^[A-Za-z_\-0-9]+:[A-Za-z_\-0-9]+\.[A-Za-z_\-0-9]+$/;
    return propertyRegex.test(obj);
  }

  /* Private method to check if a property string is an object reference.
   *
   * This method checks if the string is of the form: <className>:<name>
   */
  private static isObjectReference(obj: string) {
    var objectRegex = /^[A-Za-z_\-0-9]+:[A-Za-z_\-0-9]+$/;
    return objectRegex.test(obj);
  }

  private refresh() {
    this.recalculate(() => {
      this.trigger(ContextNode.EVENT_READY);
    });
  }
}

// Only one view per model please
class ContextView extends ContextNode {
  private _node: any;
  private _element: D3.Selection;

  constructor (node: any, element: D3.Selection, viewContext: Context, className: string) {
    this._node = node;
    this._element = element;
    super({"name": node.name}, viewContext, className);
  }

  public getProperty(key: string): any {
    if(this.has(key)){
      return this.get(key);
    } else {
      return this._node.get(key);
    }
  }

  public get node() {
    return this._node;
  }

  public get element() {
    return this._element;
  }
}
