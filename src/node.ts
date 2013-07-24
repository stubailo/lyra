class ContextNode extends Backbone.Model {
  private _context: Context;
  private _name: string;

  constructor (name: string, context: Context, className: string) {
    super();
    this._name = name;
    this._context = context;
    this._context.set(className + ":" + name, this);
  }

  public static parseAll(specList: any[], context: Context, classType: any) : any[] {
    return _.map(specList, function(spec) {
      return ContextNode.parse(spec, context, classType);
    });
  }

  public static parse(spec : any, context: Context, classType: any) : any {
    return classType.parse(spec, context);
  }

  public get name(): string {
    return this._name;
  }

  public get context(): Context {
    return this._context;
  }
}

// Only one view per model please
class ContextView extends ContextNode {
  private _propertyFallback: ContextNode;

  constructor (propertyFallback: ContextNode, viewContext: Context, className: string) {
    super(propertyFallback.name, viewContext, className);
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
