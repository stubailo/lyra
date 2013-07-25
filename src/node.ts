class ContextNode extends Backbone.Model {
  private _context: Context;
  private _name: string;

  private _propertyFunctions;

  public static EVENT_READY: string = "EVENT_READY";

  constructor (spec: any, context: Context, className: string) {
    super();
    this._name = spec["name"];
    this._context = context;
    this._context.set(className + ":" + this.name, this);
    this._propertyFunctions = {};
    this.parseProperties(spec);

    this.refresh();
    this.on("change", () => {
      this.refresh();
    });
  }

  public static parseAll(specList: any[], context: Context, classType: any) : any[] {
    return _.map(specList, function(spec) {
      return ContextNode.parse(spec, context, classType);
    });
  }

  public static parse(spec : any, context: Context, classType: any) : any {
    return classType.parse(spec, context);
  }

  // look at all of the spec properties
  public parseProperties(properties: any): void {
    for(var key in properties) {
      var value = properties[key];
      if(Context.isPropertyReference(value)) {
        this._propertyFunctions[key] = this.context.getPropertyFunction(value);

        var currKey = key;
        var updateProperty = () => {
          this.set(currKey, this._propertyFunctions[currKey]());
        }

        updateProperty();
        this.context.getObject(value).on(ContextNode.EVENT_READY, () => {updateProperty()});
      } else if (Context.isObjectReference(value)) {
        this.set(key, this.context.getObject(value));
        this.get(key).on(ContextNode.EVENT_READY, () => {
          // REFACTOR THIS SHIT
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
