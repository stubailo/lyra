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
        public static className: string;

        public static parse(spec: any, context: Context) {
            return new Axis(spec, context, Axis.className);
        }

        public defaults() {
            return _(super.defaults()).extend({
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
        private bbox;

        private axisSvg: D3.Selection;
        private backgroundSvg: D3.Selection;
        private gridSvg: D3.Selection;

        public static EVENT_RENDER: string = "render";

        public static createView(axis: Axis, element: D3.Selection, viewContext: Context): AxisView {
            return new AxisView(axis, element, viewContext);
        }

        private buildViews() {

            var totalSvg = this.getElement()
                .append("g");

            this.backgroundSvg = totalSvg
                .append("svg:rect")
                .attr("fill-opacity", 0);

            this.axisSvg = totalSvg.append("g")
                .attr("class", Axis.className)
                .attr("name", this.getModel().getName());

            // TODO refactor out gridlines as separate thing
            if (this.getModel().get("gridline")) {
                var areaView: AreaView = <AreaView> this.getContext().getNode(Area.className, this.getModel().get("area").getName());

                this.gridSvg = areaView.getGraphArea()
                    .append("g")
                    .attr("class", "grid");
            }
        }

        private renderAxis() {
            var scale = <Scale> this.getModel().get("scale");
            var d3Scale = scale.getScaleRepresentation();
            var axis = d3.svg.axis()
                .scale(d3Scale)
                .orient(this.getModel().get("orient"))
                .ticks(this.getModel().get("ticks"));
            this.axisSvg.call(axis);
        }

        private renderGrid() {
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
            var scale = <Scale> this.getModel().get("scale");
            var d3Scale = scale.getScaleRepresentation();
            var area: Area = <Area> this.getModel().get("area");
            var areaHeight = area.get("height");
            var areaWidth = area.get("width");

            var gridSelection = this.gridSvg.selectAll("path." + this.getModel().getName())
                .data(d3Scale.ticks(this.getModel().get("ticks")));

            gridSelection.enter()
                .append("path")
                .attr("class", this.getModel().getName())
                .attr("stroke", this.getModel().get("gridline"))
                .attr("stroke-width", 0.5);

            gridFunction(gridSelection, d3Scale, areaHeight, areaWidth);

            gridSelection.exit().remove();
        }

        private updateLayout() {
            var transformFunction;
            switch (this.getModel().get("location")) {
                case "bottom":
                    transformFunction = (axisSvg, areaHeight, areaWidth) => {
                        axisSvg.attr("transform", "translate(" + this.xOffset + "," + (this.yOffset) + ")");
                        this.backgroundSvg.attr("x", this.xOffset).attr("y", (this.yOffset))
                            .attr("height", this.bbox.width).attr("width", areaWidth);
                    };
                    break;
                case "top":
                    transformFunction = (axisSvg, areaHeight, areaWidth) => {
                        axisSvg.attr("transform", "translate(" + this.xOffset + "," + this.yOffset + ")");
                        this.backgroundSvg.attr("x", this.xOffset).attr("y", this.yOffset - this.bbox.width)
                            .attr("height", this.bbox.width).attr("width", areaWidth);
                    };
                    break;
                case "left":
                    transformFunction = (axisSvg, areaHeight, areaWidth) => {
                        axisSvg.attr("transform", "translate(" + this.xOffset + "," + this.yOffset + ")");
                        this.backgroundSvg.attr("x", this.xOffset - this.bbox.width).attr("y", this.yOffset)
                            .attr("height", areaHeight).attr("width", this.bbox.width);
                    };
                    break;
                case "right":
                    transformFunction = (axisSvg, areaHeight, areaWidth) => {
                        axisSvg.attr("transform", "translate(" + (this.xOffset) + "," + this.yOffset + ")");
                        this.backgroundSvg.attr("x", (this.xOffset)).attr("y", this.yOffset)
                            .attr("height", areaHeight).attr("width", this.bbox.width);
                    };

                    break;
                default:
            }

            // Layout junk

            var area: Area = <Area> this.getModel().get("area");
            var areaHeight = area.get("height");
            var areaWidth = area.get("width");
            this.bbox = this.axisSvg.node().getBBox();
            this.bbox.width = Math.ceil(this.bbox.width/5)*5;
            this.bbox.height = Math.ceil(this.bbox.height/5)*5;
            this.set({
                "ContextViewWidth": this.bbox.width,
                "ContextViewHeight": this.bbox.height
            });

            if (this.getModel().get("orient") === "left") {
                this.xOffset = this.bbox.width;
            }
            if (this.getModel().get("orient") === "top") {
                this.yOffset = this.bbox.width;
            }
            transformFunction(this.axisSvg, areaHeight, areaWidth);
        }

        public load() {
            this.xOffset = 0;
            this.yOffset = 0;

            this.buildViews();
            this.render();

            this.getModel().on("change", () => {this.render()});
        }

        public render() {
            this.renderAxis();

            // Render the grid
            if (this.gridSvg) {
                this.renderGrid();
            }

            this.updateLayout();

            this.trigger(AxisView.EVENT_RENDER);
        }

        public calculatedWidth(): number {
            if (this.get("orient") === "left" || this.get("orient") === "right") {
                return this.bbox.width;
            } else {
                throw new Error("Axis " + this.getName() + " got asked about its undetermined length.");
            }
        }

        public calculatedHeight(): number {
            if (this.get("orient") === "top" || this.get("orient") === "bottom") {
                return this.bbox.height;
            } else {
                throw new Error("Axis " + this.getName() + " got asked about its undetermined length.");
            }
        }
    }
}
