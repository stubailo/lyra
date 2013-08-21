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
    export class Area extends ContextModel {
        public static pluginName: string;

        public static ATTACH_INSIDE: string = "inside";

        public getAttachmentPoints(): string[] {
            return ["top", "right", "bottom", "left", Area.ATTACH_INSIDE];
        }

        public defaults() {
            return _(super.defaults()).extend({
                "height": 300,
                "width": 400,
                "paddingTop": 10,
                "paddingRight": 10,
                "paddingBottom": 10,
                "paddingLeft": 10
            });
        }

        public static parse(spec: any, context: Context) {
            return new Area(spec, context, Area.pluginName);
        }

        public load() {
            // Nothing to do!
        }
    }

    export class AreaView extends ContextView {
        public static EVENT_RENDER: string = "render";

        private totalSelection: D3.Selection;
        private graphSelection: D3.Selection;
        private background: D3.Selection;

        public static createView(area: Area, element: D3.Selection, viewContext: Context): AreaView {
            return new AreaView(area, element, viewContext);
        }

        public getGraphArea(): D3.Selection {
            return this.graphSelection;
        }

        public load() {
            this.buildViews();
            this.buildSubviews();

            this.getModel().on("change", $.proxy(this.render, this));
        }

        public calculatedWidth(): number {
            return this.get("paddingLeft") + this.get("width") + this.get("paddingRight");
        }

        public calculatedHeight(): number {
            return this.get("paddingTop") + this.get("height") + this.get("paddingBottom");
        }

        public buildViews() {
            this.totalSelection = this.getElement().append("svg").attr("class", Area.pluginName).attr("name", this.getModel().getName());
            this.graphSelection = this.totalSelection.append("svg").attr("class", "graph");
            this.background = this.graphSelection.append("rect");
        }

        private buildSubviews() {
            _.each(this.getModel().getAttachmentPoints(), (attachmentPoint: string) => {
                _.each(this.getModel().getSubViewModels()[attachmentPoint], (subViewModel: ContextModel) => {
                    var subViewGroup: D3.Selection;

                    if(attachmentPoint === Area.ATTACH_INSIDE) {
                        subViewGroup = this.graphSelection.append("g");
                    } else {
                        subViewGroup = this.totalSelection.append("g");
                    }

                    this.addSubView(Lyra.createViewForModel(subViewModel, subViewGroup, this.getContext()), attachmentPoint);
                });
            });

        }

        public render() {
            this.graphSelection
                .attr("x", this.get("paddingLeft"))
                .attr("y", this.get("paddingTop"))
                .attr("width", this.get("width"))
                .attr("height", this.get("height"));

            for (var property in this.getModel().attributes) {
                if (property === "height") {
                    this.totalSelection.attr(property, this.get("height") + this.get("paddingTop") + this.get("paddingBottom"));
                } else if (property === "width") {
                    this.totalSelection.attr(property, this.get("width") + this.get("paddingLeft") + this.get("paddingRight"));
                } else {
                    this.totalSelection.attr(property, this.get(property));
                }
            }

            this.background
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", this.getModel().get("width"))
                .attr("height", this.getModel().get("height"))
                .attr("fill", "white");

            var currentDistances: {
                left: number;
                right: number;
                top: number;
                bottom: number
            };

            currentDistances = {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            };

            _.each(this.getModel().getAttachmentPoints(), (attachmentPoint: string) => {
                _.each(this.getSubViews()[attachmentPoint], (subView: ContextView) => {
                    var subViewGroup: D3.Selection = subView.getElement();

                    var x: number = 0;
                    var y: number = 0;

                    switch (attachmentPoint) {
                        case "left":
                            currentDistances.left += subView.calculatedWidth();
                            x = this.get("paddingLeft") - currentDistances.left;
                            y = this.get("paddingTop");
                            break;
                        case "right":
                            currentDistances.right += subView.calculatedWidth();
                            x = currentDistances.right + this.get("paddingLeft") - subView.calculatedWidth() + this.get("width");
                            y = this.get("paddingTop");
                            break;
                        case "top":
                            currentDistances.top += subView.calculatedHeight();
                            x = this.get("paddingLeft");
                            y = this.get("paddingTop") - currentDistances.top;
                            break;
                        case "bottom":
                            currentDistances.bottom += subView.calculatedHeight();
                            x = this.get("paddingLeft");
                            y = this.get("paddingTop") + currentDistances.bottom - subView.calculatedHeight() + this.get("height");
                            break;
                        case "inside":
                            // 0, 0 is fine
                            break;
                    }

                    subViewGroup.attr("transform", "translate(" + x + ", " + y + ")");
                });
            });

            this.trigger(AreaView.EVENT_RENDER);
        }
    }
}
