class Label extends ContextNode {
  public static className: string = "labels";

  public static parse(spec: any, context: Context) {
    return new Label(spec, context, Label.className);
  }

  public load() {
    this.get("area").addSubViewModel(this, this.get("location"));
  }
}

class LabelView extends ContextView {
  public load() {
    this.element.append("text").text("hello, world");
  }

  public calculatedHeight(): number {
    return 50;
  }

  public render() {

  }
}
