class Property extends ContextNode {
  private _spec: string;
  private _val: any;

  private static className: string;

  /**
    The spec is optional, can be provided via setter
  */
  constructor (name: string, context: Context, _spec?: string) {
    super(name, context, Property.className);

    this.spec = _spec;
  }

  get spec(): string {
    return this._spec;
  }

  set spec(newSpec: string) {
    if(newSpec !== this.spec) {
      this._spec = newSpec;
    }
  }

  get val(): any {
    return _.clone(this._val);
  }

  set val(newVal: any) {
    this._val = _.clone(newVal);
    this.trigger("change");
  }
}
