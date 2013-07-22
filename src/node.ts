class ContextNode {
  private _context: Context;
  private _dispatch;
  private _name: string;

  private _dependencies: ContextNode[];

  constructor (name: string, context: Context, className: string) {
    this._name = name;
    this._context = context;
    this._dispatch = _.clone(Backbone.Events);
    this._context.set(className + ":" + name, this);
    this._dependencies = [];
  }

  public static parseAll(specList: any[], context: Context, classType: any) : any[] {
    return _.map(specList, function(spec) {
      return ContextNode.parse(spec, context, classType);
    });
  }

  public static parse(spec : any, context: Context, classType: any) : any {
    switch(classType) {
      case Scale:
        return Scale.parse(spec, context);
      case DataSet:
        return DataSet.parse(spec, context);
      case Mark:
        return Mark.parse(spec, context);
      default:
        throw new Error("Invalid Context Node: " + classType);
    }
  }
  
  public trigger(eventName: string) {
    this._dispatch.trigger(eventName);
  }

  public on(eventName: string, callback: (...args: any[]) => void) {
    this._dispatch.on(eventName, callback);
  }

  public get name(): string {
    return this._name;
  }

  public get context(): Context {
    return this._context;
  }

  public addDependency(node: ContextNode) {
    this._dependencies.push(node);
  }
}
