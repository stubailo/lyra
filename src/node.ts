/* ContextNode is a generalized class that represents a node in the
 * graph context.
 */
class ContextNode extends Backbone.Model {
  // Private references to the context and the name
  private _context: Context;
  private _name: string;

  public static EVENT_READY: string = "EVENT_READY";

  public static parseAll(specList: any[], context: Context, classType: any) : any[] {
    return _.map(specList, function(spec) {
      return classType.parse(spec, context);
    });
  }

  constructor (spec: any, context: Context, className: string) {
    super();
    this._name = spec["name"];
    this._context = context;
    this._context.set(className + ":" + this.name, this);
    this.parseProperties(spec);

    this.refresh();
    this.on("change", () => {
      this.refresh();
    });
  }

  // look at all of the spec properties
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
          // REFACTOR THIS SHIT
          this.refresh();
        });
      } else {
        this.set(key, value);
      }
    }
  }

  private static isPropertyReference(obj: string) {
    var propertyRegex = /^[A-Za-z_\-0-9]+:[A-Za-z_\-0-9]+\.[A-Za-z_\-0-9]+$/;
    return ((typeof(obj) === "string") && propertyRegex.test(obj));
  }

  private static isObjectReference(obj: string) {
    var objectRegex = /^[A-Za-z_\-0-9]+:[A-Za-z_\-0-9]+$/;
    return ((typeof(obj) === "string") && objectRegex.test(obj));
  }

  public get name(): string {
    return this._name;
  }

  public get context(): Context {
    return this._context;
  }

  public recalculate(callback) {
    callback();
  }

  private refresh() {
    this.recalculate(() => {
      this.trigger(ContextNode.EVENT_READY);
    });
  }
}

// Only one view per model please
class ContextView extends ContextNode {
  private _propertyFallback: ContextNode;

  constructor (propertyFallback: ContextNode, viewContext: Context, className: string) {
    super({"name": propertyFallback.name}, viewContext, className);
    this._propertyFallback = propertyFallback;
  }

  public getProperty(key: string): any {
    if(this.has(key)){
      return this.get(key);
    } else {
      return this._propertyFallback.get(key);
    }
  }
}
