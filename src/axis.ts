module Lyra {
    export class Axis extends ContextModel {
        public static className: string;

        /*
         * Each property is a function of one item that specifies that property of an SVG element.
         * So for example a circle would have one function for "cx", one for "cy", etc.
         */
        public static AXIS_WIDTH: string = "axisWidth";
        public static AXIS_PADDING: string = "axisPadding";

        public static parse(spec: any, context: Context) {
            return new Axis(spec, context, Axis.className);
        }

        public defaults() {
            return _(super.defaults()).extend({
                "axisPadding": 2,
                "axisWidth": 45
            });
        }

        public load() {
            this.get("area").addSubViewModel(this, this.get("location"));
        }
    }

    export class AxisView extends ContextView {
        private _axisSelection: D3.Selection;
        private _axis;
        private _xOffset: number;
        private _yOffset: number;
        private renderHelper;

        public static EVENT_RENDER: string = "render";

        public get axisSelection(): D3.Selection {
            return this._axisSelection;
        }

        public load() {
            this._axis = d3.svg.axis();
            this._xOffset = 0;
            this._yOffset = 0;
            if (this.model.get("orient") === "left") {
                this._xOffset += this.model.get(Axis.AXIS_WIDTH);
            }
            if (this.model.get("orient") === "top") {
                this._yOffset += this.model.get(Axis.AXIS_WIDTH);
            }

            var totalSvg = this.element
                .append("g");

            var rectSvg = totalSvg
                .append("svg:rect")
                .attr("fill-opacity", 0);

            var axisSvg = totalSvg.append("g")
                .attr("class", Axis.className)
                .attr("name", this.model.name);

            if (this.model.get("gridline")) {
                var gridSvg = this.context.getNode(Area.className, this.model.get("area").name).graphSelection
                    .append("g")
                    .attr("class", "grid");
            }

            var gridFunction;
            if (this.model.get("location") === "bottom" || this.model.get("location") === "top") {
                gridFunction = (selection, curScale, height: number, width: number) => {
                    selection.attr("d", (d) => {
                        return "M " + curScale(d) + " 0 L" + curScale(d) + " " + height;
                    });
                };
            } else {
                gridFunction = (selection, curScale, height: number, width: number) => {
                    selection.attr("d", (d) => {
                        return "M 0 " + curScale(d) + " L" + width + " " + curScale(d);
                    });
                };
            }

            var transformFunction;
            switch (this.model.get("location")) {
                case "bottom":
                    transformFunction = (axisSvg, areaHeight, areaWidth) => {
                        axisSvg.attr("transform", "translate(" + this._xOffset + "," + (this._yOffset + areaHeight) + ")");
                        rectSvg.attr("x", this._xOffset).attr("y", (this._yOffset + areaHeight))
                            .attr("height", this.model.get(Axis.AXIS_WIDTH)).attr("width", areaWidth);
                    };
                    break;
                case "top":
                    transformFunction = (axisSvg, areaHeight, areaWidth) => {
                        axisSvg.attr("transform", "translate(" + this._xOffset + "," + this._yOffset + ")");
                        rectSvg.attr("x", this._xOffset).attr("y", this._yOffset - this.model.get(Axis.AXIS_WIDTH))
                            .attr("height", this.model.get(Axis.AXIS_WIDTH)).attr("width", areaWidth);
                    };
                    break;
                case "left":
                    transformFunction = (axisSvg, areaHeight, areaWidth) => {
                        axisSvg.attr("transform", "translate(" + this._xOffset + "," + this._yOffset + ")");
                        rectSvg.attr("x", this._xOffset - this.model.get(Axis.AXIS_WIDTH)).attr("y", this._yOffset)
                            .attr("height", areaHeight).attr("width", this.model.get(Axis.AXIS_WIDTH));
                    };
                    break;
                case "right":
                    transformFunction = (axisSvg, areaHeight, areaWidth) => {
                        axisSvg.attr("transform", "translate(" + (this._xOffset + areaWidth) + "," + this._yOffset + ")");
                        rectSvg.attr("x", (this._xOffset + areaWidth)).attr("y", this._yOffset)
                            .attr("height", areaHeight).attr("width", this.model.get(Axis.AXIS_WIDTH));
                    };
                    break;
                default:
            }

            this.renderHelper = () => {
                var curScale = this.model.get("scale").scaleRepresentation;
                var areaHeight = this.model.get("area").get("height");
                var areaWidth = this.model.get("area").get("width");
                this._axis
                    .scale(curScale)
                    .orient(this.model.get("orient"))
                    .ticks(this.model.get("ticks"));

                axisSvg.call(this._axis);

                if (gridSvg) {
                    var gridSelection = gridSvg.selectAll("path." + this.model.name)
                        .data(curScale.ticks(this.model.get("ticks")));

                    gridSelection.enter()
                        .append("path")
                        .attr("class", this.model.name)
                        .attr("stroke", this.model.get("gridline"));

                    gridFunction(gridSelection, curScale, areaHeight, areaWidth);

                    gridSelection.exit().remove();
                }

                this._axisSelection = totalSvg;

                transformFunction(axisSvg, areaHeight, areaWidth);
                this.trigger(AxisView.EVENT_RENDER);
            };

            this.model.on("change", $.proxy(this.render, this));
        }

        public render() {
            this.renderHelper();
        }

        public calculatedWidth(): number {
            if (this.get("orient") === "left" || this.get("orient") === "right") {
                return this.get(Axis.AXIS_WIDTH);
            } else {
                throw new Error("Axis got asked about its undetermined length.");
            }
        }

        public calculatedHeight(): number {
            if (this.get("orient") === "top" || this.get("orient") === "bottom") {
                return this.get(Axis.AXIS_WIDTH);
            } else {
                throw new Error("Axis got asked about its undetermined length.");
            }
        }
    }
}
