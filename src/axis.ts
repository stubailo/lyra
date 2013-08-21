/*
 * Copyright 2013 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module Lyra {
    export class Axis extends ContextModel {
        public static pluginName: string;

        /*
         * Each property is a function of one item that specifies that property of an SVG element.
         * So for example a circle would have one function for "cx", one for "cy", etc.
         */
        public static AXIS_WIDTH: string = "axisWidth";
        public static AXIS_PADDING: string = "axisPadding";

        public static parse(spec: any, context: Context) {
            return new Axis(spec, context, Axis.pluginName);
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
        private axis;
        private xOffset: number;
        private yOffset: number;
        private renderHelper;

        public static EVENT_RENDER: string = "render";

        public static createView(axis: Axis, element: D3.Selection, viewContext: Context): AxisView {
            return new AxisView(axis, element, viewContext);
        }

        public load() {
            this.axis = d3.svg.axis();
            this.xOffset = 0;
            this.yOffset = 0;
            if (this.getModel().get("orient") === "left") {
                this.xOffset += this.getModel().get(Axis.AXIS_WIDTH);
            }
            if (this.getModel().get("orient") === "top") {
                this.yOffset += this.getModel().get(Axis.AXIS_WIDTH);
            }

            var totalSvg = this.getElement()
                .append("g");

            var rectSvg = totalSvg
                .append("svg:rect")
                .attr("fill-opacity", 0);

            var axisSvg = totalSvg.append("g")
                .attr("class", Axis.pluginName)
                .attr("name", this.getModel().getName());

            if (this.getModel().get("gridline")) {
                var areaView: AreaView = <AreaView> this.getContext().getNode(Area.pluginName, this.getModel().get("area").getName());

                var gridSvg = areaView.getGraphArea()
                    .append("g")
                    .attr("class", "grid");
            }

            var gridFunction;
            if (this.getModel().get("location") === "bottom" || this.getModel().get("location") === "top") {
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
            switch (this.getModel().get("location")) {
                case "bottom":
                    transformFunction = (axisSvg, areaHeight, areaWidth) => {
                        axisSvg.attr("transform", "translate(" + this.xOffset + "," + (this.yOffset) + ")");
                        rectSvg.attr("x", this.xOffset).attr("y", (this.yOffset))
                            .attr("height", this.getModel().get(Axis.AXIS_WIDTH)).attr("width", areaWidth);
                    };
                    break;
                case "top":
                    transformFunction = (axisSvg, areaHeight, areaWidth) => {
                        axisSvg.attr("transform", "translate(" + this.xOffset + "," + this.yOffset + ")");
                        rectSvg.attr("x", this.xOffset).attr("y", this.yOffset - this.getModel().get(Axis.AXIS_WIDTH))
                            .attr("height", this.getModel().get(Axis.AXIS_WIDTH)).attr("width", areaWidth);
                    };
                    break;
                case "left":
                    transformFunction = (axisSvg, areaHeight, areaWidth) => {
                        axisSvg.attr("transform", "translate(" + this.xOffset + "," + this.yOffset + ")");
                        rectSvg.attr("x", this.xOffset - this.getModel().get(Axis.AXIS_WIDTH)).attr("y", this.yOffset)
                            .attr("height", areaHeight).attr("width", this.getModel().get(Axis.AXIS_WIDTH));
                    };
                    break;
                case "right":
                    transformFunction = (axisSvg, areaHeight, areaWidth) => {
                        axisSvg.attr("transform", "translate(" + (this.xOffset) + "," + this.yOffset + ")");
                        rectSvg.attr("x", (this.xOffset)).attr("y", this.yOffset)
                            .attr("height", areaHeight).attr("width", this.getModel().get(Axis.AXIS_WIDTH));
                    };
                    break;
                default:
            }

            this.renderHelper = () => {
                var scale = <Scale> this.getModel().get("scale");
                var d3Scale = scale.getScaleRepresentation();

                var area: Area = <Area> this.getModel().get("area");
                var areaHeight = area.get("height");
                var areaWidth = area.get("width");
                this.axis
                    .scale(d3Scale)
                    .orient(this.getModel().get("orient"))
                    .ticks(this.getModel().get("ticks"));

                axisSvg.call(this.axis);

                if (gridSvg) {
                    var gridSelection = gridSvg.selectAll("path." + this.getModel().getName())
                        .data(d3Scale.ticks(this.getModel().get("ticks")));

                    gridSelection.enter()
                        .append("path")
                        .attr("class", this.getModel().getName())
                        .attr("stroke", this.getModel().get("gridline"))
                        .attr("stroke-width", 0.5);

                    gridFunction(gridSelection, d3Scale, areaHeight, areaWidth);

                    gridSelection.exit().remove();
                }

                transformFunction(axisSvg, areaHeight, areaWidth);
                this.trigger(AxisView.EVENT_RENDER);
            };

            this.getModel().on("change", $.proxy(this.render, this));
        }

        public render() {
            this.renderHelper();
        }

        public calculatedWidth(): number {
            if (this.get("orient") === "left" || this.get("orient") === "right") {
                return this.get(Axis.AXIS_WIDTH);
            } else {
                throw new Error("Axis " + this.getName() + " got asked about its undetermined length.");
            }
        }

        public calculatedHeight(): number {
            if (this.get("orient") === "top" || this.get("orient") === "bottom") {
                return this.get(Axis.AXIS_WIDTH);
            } else {
                throw new Error("Axis " + this.getName() + " got asked about its undetermined length.");
            }
        }
    }
}
