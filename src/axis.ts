class Axis extends ContextNode {
  public static className: string = "axes";
  /*
   * Each property is a function of one item that specifies that property of an SVG element.
   * So for example a circle would have one function for "cx", one for "cy", etc.
   */
  public static AXIS_WIDTH: string = "axis_width";

  public static parse(spec: any, context: Context) {
      return new Axis(spec, context, Axis.className);
  }

  public load() {
    this.set(Axis.AXIS_WIDTH, 45);
  }
}

class AxisView extends ContextView {
  private _axisSelection: D3.Selection;
  private _axis;
  private _xOffset: number;
  private _yOffset: number;
  public render;

  public static className: string = Axis.className;
  public static EVENT_RENDER: string = "render";

  public get axisSelection () {
    return this._axisSelection;
  }

  public load() {
    this._axis = d3.svg.axis()
    this._xOffset = 0;
    this._yOffset = 0;

    var axisSvg = this.element
      .append("g")
      .attr("class", AxisView.className)
      .attr("name", this.node.name);

      if (this.node.get("gridline")) {
        var gridSvg = this.element.selectAll("svg.graph")
          .append("g")
          .attr("class", "grid")
      }

      var gridFunction;
      if (this.node.get("location") == "bottom" || this.node.get("location") == "top") {
          gridFunction = (selection, curScale, height: number, width: number) => {
            selection.attr("d", (d) => {
              return "M " + curScale(d) + " 0 L" + curScale(d)  + " " + height;
            });
          }
      } else {
          gridFunction = (selection, curScale, height: number, width: number) => {
            selection.attr("d", (d) => {
              return "M 0 "+ curScale(d) + " L" + width + " " + curScale(d);
            });
          }
      }

      var transformFunction;
      switch(this.node.get("location")) {
        case "bottom":
        transformFunction = (axisSvg, areaHeight, areaWidth) => {
            axisSvg.attr("transform", "translate(" + this._xOffset + "," + (this._yOffset + areaHeight) +")");
          };
        break;
        case "top":
        transformFunction = (axisSvg, areaHeight, areaWidth) => {
          axisSvg.attr("transform", "translate(" + this._xOffset + "," + this._yOffset  +")");
        };
        break;
        case "left":
        transformFunction = (axisSvg, areaHeight, areaWidth) => {
          axisSvg.attr("transform", "translate(" + this._xOffset + "," + this._yOffset  +")");
        };
        break;
        case "right":
        transformFunction = (axisSvg, areaHeight, areaWidth) => {
          axisSvg.attr("transform", "translate(" +(this._xOffset + areaWidth) +"," + this._yOffset +  ")");
        };
        break;
        default:
      }

      this.render = () => {
        var curScale = this.node.get("scale").scaleRepresentation;
        var areaHeight = this.node.get("area").get("height");
        var areaWidth =  this.node.get("area").get("width");
        this._axis
          .scale(curScale)
          .orient(this.node.get("orient"))
          .ticks(this.node.get("ticks"));

        axisSvg.call(this._axis);

        if (gridSvg) {
          var gridSelection = gridSvg.selectAll("path." + this.node.name)
            .data(curScale.ticks(this.node.get("ticks")));

            gridSelection.enter()
            .append("path")
            .attr("class", this.node.name)
            .attr("stroke", this.node.get("gridline"));

            gridFunction(gridSelection, curScale, areaHeight, areaWidth);

            gridSelection.exit().remove();
        }

          transformFunction(axisSvg, areaHeight, areaWidth);
          this.trigger(AxisView.EVENT_RENDER);
      }

    this._axisSelection = axisSvg;
    this.node.on(ContextNode.EVENT_READY, this.render);
  }

  public setOffsets(x: number, y: number) {
    this._xOffset = x;
    this._yOffset = y;
    if (this.node.get("orient") == "left") {
      this._xOffset += this.node.get(Axis.AXIS_WIDTH);
    }
    if (this.node.get("orient") == "top") {
       this._yOffset += this.node.get(Axis.AXIS_WIDTH);
    }
    this.render();
  }
}
