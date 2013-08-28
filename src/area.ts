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
        public defaults() {
            return _(super.defaults()).extend({
                "totalHeight": 300,
                "totalWidth": 400
            });
        }

        public load() {
            this.set("height", this.get("totalHeight"));
            this.set("width", this.get("totalWidth"));
        }
    }

    export class AreaView extends ContextView {
        public static ATTACH_INSIDE: string = "inside";
        public static ATTACH_TOP: string = "top";
        public static ATTACH_RIGHT: string = "right";
        public static ATTACH_BOTTOM: string = "bottom";
        public static ATTACH_LEFT: string = "left";

        public getAttachmentPoints(): string[] {
            return [AreaView.ATTACH_TOP, AreaView.ATTACH_RIGHT, AreaView.ATTACH_BOTTOM, AreaView.ATTACH_LEFT, AreaView.ATTACH_INSIDE];
        }

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
            this.calculateLayout();

            this.getModel().on("change:totalWidth change:totalHeight", $.proxy(this.updateDimensions, this));
            this.getModel().on("change:height change:width\
                change:paddingLeft change:paddingRight\
                change:paddingTop change:paddingBottom",
                $.proxy(this.render, this)
            );
            this.on(ContextView.LAYOUT_CHANGE, $.proxy(this.calculateLayout, this));
        }

        private buildViews() {
            this.totalSelection = this.getSelection().append("svg").attr("class", Area.pluginName).attr("name", this.getModel().getName());
            this.graphSelection = this.totalSelection.append("svg").attr("class", "graph");
            this.background = this.graphSelection.append("rect");
        }

        public getElementForAttachmentPoint(attachmentPoint: string): Element {
            if (!_.contains(this.getAttachmentPoints(), attachmentPoint)) {
                throw new Error("No attachment point with name " + attachmentPoint + " exists on Area " + this.get("name"));
            }

            var subViewGroup: D3.Selection;

            if (attachmentPoint === AreaView.ATTACH_INSIDE) {
                subViewGroup = this.graphSelection.append("g");
            } else {
                subViewGroup = this.totalSelection.append("g");
            }

            var element: Element = new Element(subViewGroup);
            var update: () => void;

            switch (attachmentPoint) {
                case AreaView.ATTACH_INSIDE:
                    update = () => {
                        element.set({
                            width: this.get("width"),
                            height: this.get("height")
                        });
                    };

                    update();
                    this.getModel().on("change:height change:width", update);
                    break;
                case AreaView.ATTACH_LEFT:
                case AreaView.ATTACH_RIGHT:
                    update = () => {
                        element.set({
                            height: this.get("height")
                        });
                    };

                    update();
                    this.getModel().on("change:height", update);
                    break;
                case AreaView.ATTACH_TOP:
                case AreaView.ATTACH_BOTTOM:
                    update = () => {
                        element.set({
                            width: this.get("width")
                        });
                    };

                    update();
                    this.getModel().on("change:width", update);
                    break;
            }

            this.registerAttachedElement(element, attachmentPoint);
            this.trigger(ContextView.LAYOUT_CHANGE);
            return element;
        }

        private updateDimensions() {
            this.getModel().set({
                "width": this.getModel().get("totalWidth") - this.get("paddingLeft") - this.get("paddingRight"),
                "height": this.getModel().get("totalHeight") - this.get("paddingTop") - this.get("paddingBottom")
            });
        }

        private calculateLayout() {
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

            _.each(this.getAttachmentPoints(), (attachmentPoint: string) => {
                _.each(this.getAttachedElements()[attachmentPoint], (element: Element) => {
                    var x: number = 0;
                    var y: number = 0;

                    switch (attachmentPoint) {
                        case AreaView.ATTACH_LEFT:
                            padding.left += element.get("requestedWidth");
                            break;
                        case AreaView.ATTACH_RIGHT:
                            padding.right += element.get("requestedWidth");
                            break;
                        case AreaView.ATTACH_TOP:
                            padding.top += element.get("requestedHeight");
                            break;
                        case AreaView.ATTACH_BOTTOM:
                            padding.bottom += element.get("requestedHeight");
                            break;
                        case AreaView.ATTACH_INSIDE:
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

            this.totalSelection.attr("height", this.getModel().get("totalHeight"));
            this.totalSelection.attr("width", this.getModel().get("totalWidth"));

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

            _.each(this.getAttachmentPoints(), (attachmentPoint: string) => {
                _.each(this.getAttachedElements()[attachmentPoint], (element: Element) => {
                    var x: number = 0;
                    var y: number = 0;

                    switch (attachmentPoint) {
                        case AreaView.ATTACH_LEFT:
                            currentDistances.left += element.get("requestedWidth");
                            x = padding.left - currentDistances.left;
                            y = padding.top;
                            break;
                        case AreaView.ATTACH_RIGHT:
                            currentDistances.right += element.get("requestedWidth");
                            x = currentDistances.right + padding.left - element.get("requestedWidth") + this.get("width");
                            y = padding.top;
                            break;
                        case AreaView.ATTACH_TOP:
                            currentDistances.top += element.get("requestedHeight");
                            x = padding.left;
                            y = padding.top - currentDistances.top;
                            break;
                        case AreaView.ATTACH_BOTTOM:
                            currentDistances.bottom += element.get("requestedHeight");
                            x = padding.left;
                            y = padding.top + currentDistances.bottom - element.get("requestedHeight") + this.get("height");
                            break;
                        case AreaView.ATTACH_INSIDE:
                            // 0, 0 is fine
                            break;
                    }

                    element.getSelection().attr("transform", "translate(" + x + ", " + y + ")");
                });
            });
        }
    }
}
