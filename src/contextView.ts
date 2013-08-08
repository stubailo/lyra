// Only one view per model please
class ContextView extends ContextNode {
  private _node: ContextNode;
  private _element: D3.Selection;


  constructor (node: ContextNode, element: D3.Selection, viewContext: Context) {
    this._node = node;
    this._element = element;

    super({"name": node.name}, viewContext, node.className);
  }

  public get(key: string): any {
    if(super.get(key) !== undefined && super.get(key) !== null){
      return super.get(key);
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

  public calculatedWidth(): number {
    throw new Error("View for " + this.className + " did not specify its width.");
  }

  public calculatedHeight(): number {
    throw new Error("View for " + this.className + " did not specify its height.");
  }


}
