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

        public static parse(spec: any, context: Context) {
            return new Axis(spec, context, Axis.pluginName);
        }

        public defaults() {
            return _(super.defaults()).extend({
            });
        }

        public load() {
            this.get("area").addSubViewModel(this, this.get("location"));
        }
    }

    class GridView extends ContextView {
        private gridSvg: D3.Selection;

        public load () {
            this.buildViews();

            this.getModel().on("change", () => {this.render()});
            this.getElement().on("change", () => {this.render()});
        }

        private buildViews() {
            this.gridSvg = this.getSelection()
                .append("g")
                .attr("class", "grid");
        }

        public render() {
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

            if (this.getModel().get("location") === "bottom" || this.getModel().get("location") === "top") {
                gridSelection.attr("d", (d) => {
                    return "M " + d3Scale(d) + " 0 L" + d3Scale(d) + " " + this.getElement().get("height");
                });

            } else {
                gridSelection.attr("d", (d) => {
                    return "M 0 " + d3Scale(d) + " L" + this.getElement().get("width") + " " + d3Scale(d);
                });
            }

            gridSelection.exit().remove();
        }
    }

    export class AxisView extends ContextView {
        private axis;
        private xOffset: number;
        private yOffset: number;
        private bbox;

        private axisSvg: D3.Selection;
        private backgroundSvg: D3.Selection;

        public static createView(axis: Axis, element: Element, viewContext: Context): AxisView {
            return new AxisView(axis, element, viewContext);
        }

        private buildViews() {

            var totalSvg = this.getSelection()
                .append("g");

            this.backgroundSvg = totalSvg
                .append("svg:rect")
                .attr("fill-opacity", 0)
                .attr("x", 0)
                .attr("y", 0);

            this.axisSvg = totalSvg.append("g")
                .attr("class", Axis.pluginName)
                .attr("name", this.getModel().getName());

            var areaView: AreaView = <AreaView> this.getContext().getNode(Area.pluginName, this.getModel().get("area").getName());
            var gridView = new GridView(this.getModel(), areaView.getElementForAttachmentPoint(Area.ATTACH_INSIDE), new Context());
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

        private updateLayout() {
            // Layout junk
            this.bbox = this.axisSvg.node().getBBox();

            // Round it so that every little pixel change doesn't trigger a re-layout
            this.bbox.roundedWidth = Math.ceil(this.bbox.width/5)*5;
            this.bbox.roundedHeight = Math.ceil(this.bbox.height/5)*5;

            switch(this.getModel().get("orient")) {
                case "top":
                    this.yOffset = this.bbox.roundedHeight;
                    // no break because we want the statement below to run
                case "bottom":
                    this.getElement().set("requestedHeight", this.bbox.roundedHeight);
                    this.backgroundSvg
                        .attr("height", this.bbox.roundedHeight)
                        .attr("width", this.bbox.width)
                        .attr("x", this.bbox.x + this.xOffset);
                    break;
                case "left":
                    this.xOffset = this.bbox.roundedWidth;
                    // no break because we want the statement below to run
                case "right":
                    this.getElement().set("requestedWidth", this.bbox.roundedWidth);
                    this.backgroundSvg
                        .attr("height", this.bbox.height)
                        .attr("width", this.bbox.roundedWidth)
                        .attr("y", this.bbox.y + this.yOffset);
                    break;
            }

            this.axisSvg.attr("transform", "translate(" + this.xOffset + "," + this.yOffset + ")");

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

            this.updateLayout();

            this.trigger(AxisView.EVENT_RENDER);
        }
    }
}
