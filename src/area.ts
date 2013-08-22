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
        public static ATTACH_TOP: string = "top";
        public static ATTACH_RIGHT: string = "right";
        public static ATTACH_BOTTOM: string = "bottom";
        public static ATTACH_LEFT: string = "left";

        public getAttachmentPoints(): string[] {
            return [Area.ATTACH_TOP, Area.ATTACH_RIGHT, Area.ATTACH_BOTTOM, Area.ATTACH_LEFT, Area.ATTACH_INSIDE];
        }

        public defaults() {
            return _(super.defaults()).extend({
                "totalHeight": 300,
                "totalWidth": 400
            });
        }

        public static parse(spec: any, context: Context) {
            return new Area(spec, context, Area.pluginName);
        }

        public load() {
            this.set("height", this.get("totalHeight"));
            this.set("width", this.get("totalWidth"));
        }
    }

    export class AreaView extends ContextView {
        private totalSelection: D3.Selection;
        private graphSelection: D3.Selection;
        private background: D3.Selection;

        public static createView(area: Area, element: Element, viewContext: Context): AreaView {
            return new AreaView(area, element, viewContext);
        }

        public getGraphArea(): D3.Selection {
            return this.graphSelection;
        }

        public load() {
            this.buildViews();
            this.buildSubviews();
            this.calculateLayout();

            this.getModel().on("change:totalWidth change:totalHeight", $.proxy(this.updateDimensions, this));
            this.getModel().on("change:height change:width change:paddingLeft change:paddingRight change:paddingTop change:paddingBottom", $.proxy(this.render, this));
            this.on(ContextView.LAYOUT_CHANGE, $.proxy(this.calculateLayout, this));
        }

        public buildViews() {
            this.totalSelection = this.getSelection().append("svg").attr("class", Area.pluginName).attr("name", this.getModel().getName());
            this.graphSelection = this.totalSelection.append("svg").attr("class", "graph");
            this.background = this.graphSelection.append("rect");
        }

        public getElementForAttachmentPoint(attachmentPoint: string): Element {
            var subViewGroup: D3.Selection;

            if(attachmentPoint === Area.ATTACH_INSIDE) {
                subViewGroup = this.graphSelection.append("g");
            } else {
                subViewGroup = this.totalSelection.append("g");
            }

            var element: Element = new Element(subViewGroup);

            switch(attachmentPoint) {
                case Area.ATTACH_INSIDE:
                    this.getModel().on("change:height change:width", () => {
                        element.set({
                            width: this.get("width"),
                            height: this.get("height")
                        });
                    });
                    break;
                case Area.ATTACH_LEFT:
                case Area.ATTACH_RIGHT:
                    this.getModel().on("change:height", () => {
                        element.set({
                            height: this.get("height")
                        });
                    });
                    break;
                case Area.ATTACH_TOP:
                case Area.ATTACH_BOTTOM:
                    this.getModel().on("change:width", () => {
                        element.set({
                            width: this.get("width")
                        });
                    });
                    break;
            }

            return element;
        }

        private buildSubviews() {
            _.each(this.getModel().getAttachmentPoints(), (attachmentPoint: string) => {
                _.each(this.getModel().getSubViewModels()[attachmentPoint], (subViewModel: ContextModel) => {
                    var element: Element = this.getElementForAttachmentPoint(attachmentPoint);

                    Lyra.createViewForModel(subViewModel, element, this.getContext());
                    this.addSubView(element, attachmentPoint);
                });
            });
        }

        private updateDimensions() {
            this.getModel().set({
                "width": this.getModel().get("totalWidth") - this.get("paddingLeft") - this.get("paddingRight"),
                "height": this.getModel().get("totalHeight") - this.get("paddingTop") - this.get("paddingBottom")
            });
        }

        public calculateLayout() {
            var padding: {
                left: number;
                right: number;
                top: number;
                bottom: number
            };

            padding = {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            };

            _.each(this.getModel().getAttachmentPoints(), (attachmentPoint: string) => {
                _.each(this.getSubViews()[attachmentPoint], (element: Element) => {
                    var x: number = 0;
                    var y: number = 0;

                    switch (attachmentPoint) {
                        case "left":
                            padding.left += element.get("requestedWidth");
                            break;
                        case "right":
                            padding.right += element.get("requestedWidth");
                            break;
                        case "top":
                            padding.top += element.get("requestedHeight");
                            break;
                        case "bottom":
                            padding.bottom += element.get("requestedHeight");
                            break;
                        case "inside":
                            // 0, 0 is fine
                            break;
                    }
                });
            });

            this.getModel().set({
                "paddingLeft": padding.left,
                "paddingRight": padding.right,
                "paddingTop": padding.top,
                "paddingBottom": padding.bottom,
                "width": this.getModel().get("totalWidth") - padding.left - padding.right,
                "height": this.getModel().get("totalHeight") - padding.top - padding.bottom
            });
        }

        public render() {
            var padding: {
                left: number;
                right: number;
                top: number;
                bottom: number
            };

            padding = {
                left: this.get("paddingLeft"),
                right: this.get("paddingRight"),
                top: this.get("paddingTop"),
                bottom: this.get("paddingBottom")
            };

            for (var property in this.getModel().attributes) {
                if (property === "height") {
                    this.totalSelection.attr(property, this.getModel().get("height") + padding.top + padding.bottom);
                } else if (property === "width") {
                    this.totalSelection.attr(property, this.getModel().get("width") + padding.left + padding.right);
                } else {
                    this.totalSelection.attr(property, this.get(property));
                }
            }

            this.graphSelection
                .attr("x", padding.left)
                .attr("y", padding.top)
                .attr("width", this.get("width"))
                .attr("height", this.get("height"));

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
                _.each(this.getSubViews()[attachmentPoint], (element: Element) => {
                    var x: number = 0;
                    var y: number = 0;

                    switch (attachmentPoint) {
                        case "left":
                            currentDistances.left += element.get("requestedWidth");
                            x = padding.left - currentDistances.left;
                            y = padding.top;
                            break;
                        case "right":
                            currentDistances.right += element.get("requestedWidth");
                            x = currentDistances.right + padding.left - element.get("requestedWidth") + this.get("width");
                            y = padding.top;
                            break;
                        case "top":
                            currentDistances.top += element.get("requestedHeight");
                            x = padding.left;
                            y = padding.top - currentDistances.top;
                            break;
                        case "bottom":
                            currentDistances.bottom += element.get("requestedHeight");
                            x = padding.left;
                            y = padding.top + currentDistances.bottom - element.get("requestedHeight") + this.get("height");
                            break;
                        case "inside":
                            // 0, 0 is fine
                            break;
                    }

                    element.getSelection().attr("transform", "translate(" + x + ", " + y + ")");
                });
            });
        }
    }
}
