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
    export class Mark extends ContextModel {
        private static SCALE_KEY: string = "scale";
        private static VALUE_KEY: string = "value";

        public static LINE_TYPE = "path";
        public static CIRCLE_TYPE = "circle";
        public static RECTANGLE_TYPE = "rect";

        public static className: string;

        /* Each property is a function of one item that specifies that property of an SVG element.
         * So for example a circle would have one function for "cx", one for "cy", etc.
         */
        private type: string;
        private markProperties;

        public static parse(spec: any, context: Context) {
            return new Mark(spec, context, Mark.className);
        }

        public load() {
            var context = this.getContext();
            switch (this.get("type")) {
                case "circle":
                    this.type = Mark.CIRCLE_TYPE;
                    break;
                case "line":
                    this.type = Mark.LINE_TYPE;
                    break;
                case "rect":
                    this.type = Mark.RECTANGLE_TYPE;
                    break;
                default:
                    throw new Error("Unsupported mark type: " + this.get("type"));
            }

            this.parseMarkProperties(this.get("properties"));

            this.get("area").addSubViewModel(this, Area.ATTACH_INSIDE);
        }

        private parseProperty(name: string, spec: any) {

            if (this.get(name)) {
                throw new Error("Duplicate property in mark specification: " + name);
            }

            var scale;
            if (spec[Mark.SCALE_KEY]) {
                scale = this.getContext().getNode(Scale.className, spec[Mark.SCALE_KEY]);
            } else {
                scale = Scale.parse({
                    type: "identity"
                }, new Context());
            }

            // HACKHACK we need real event handling
            scale.on("change", () => {
                this.dataSetChanged();
            });

            var valueFunc;

            if (typeof (spec[Mark.VALUE_KEY]) === "string") {
                valueFunc = function(dataItem) {
                    if (dataItem !== undefined && dataItem[spec[Mark.VALUE_KEY]] !== undefined) {
                        return scale.apply(dataItem[spec[Mark.VALUE_KEY]]);
                    } else {
                        return scale.apply(spec[Mark.VALUE_KEY]);
                    }
                };
            } else {
                valueFunc = function(dataItem) {
                    return scale.apply(spec[Mark.VALUE_KEY]);
                };
            }

            this.set(name, valueFunc);
            this.markProperties.push(name);
        }

        private parseMarkProperties(properties: any): void {
            this.markProperties = [];

            for (var key in properties) {
                if (properties.hasOwnProperty(key)) {
                    this.parseProperty(key, properties[key]);
                }
            }
        }

        private dataSetChanged(): void {
            this.trigger("change");
        }

        public getType(): string {
            return this.type;
        }

        public getMarkProperties(): Object {
            return this.markProperties;
        }
    }

    export class MarkView extends ContextView {
        public static EVENT_RENDER: string = "render";

        public load() {
            var render = $.proxy(this.render, this);
            this.getModel().on("change", render);
            this.on("change", render);
        }

        public static createView(mark: Mark, element: D3.Selection, viewContext: Context): MarkView {
            switch (mark.getType()) {
                case Mark.CIRCLE_TYPE:
                    return new CircleMarkView(mark, element, viewContext);
                case Mark.LINE_TYPE:
                    return new LineMarkView(mark, element, viewContext);
                case Mark.RECTANGLE_TYPE:
                    return new RectMarkView(mark, element, viewContext);
                default:
                    throw new Error("Invalid MarkView type: " + mark.getType());

            }
        }

        public render() {
            throw new Error("This method is abstract, derived mark views must implement this method");
        }

        public getMarkSelection(): D3.Selection {
            return this.getElement().selectAll((<Mark> this.getModel()).getType() + "." + this.getModel().getName());
        }
    }

    class CircleMarkView extends MarkView {
        public render() {
            var data: DataSet = <DataSet> this.getModel().get("source");

            this.getMarkSelection()
                .data(data.getItems())
                .enter()
                .append("circle")
                .attr("class", this.getModel().getName());

            _.each((<Mark> this.getModel()).getMarkProperties(), (key) => {
                this.getMarkSelection().attr(key, (item) => {
                    return this.get(key)(item);
                });
            });

            this.trigger(MarkView.EVENT_RENDER);
        }
    }

    class LineMarkView extends MarkView {
        public render() {
            var data: DataSet = <DataSet> this.getModel().get("source");

            this.getMarkSelection()
                .data([data.getItems()])
                .enter()
                .append("path")
                .attr("class", this.getName());

            var line = d3.svg.line();
            _.each((<Mark> this.getModel()).getMarkProperties(), (key) => {
                switch (key) {
                    case "x":
                        line.x((item) => {
                            return this.get("x")(item);
                        });
                        break;
                    case "y":
                        line.y((item) => {
                            return this.get("y")(item);
                        });
                        break;
                    default:
                        this.getMarkSelection().attr(key, (item) => {
                            return this.get(key)(item);
                        });
                        break;
                }
            });

            line.interpolate("linear");

            this.getMarkSelection().attr("d", line);

            this.trigger(MarkView.EVENT_RENDER);
        }
    }

    class RectMarkView extends MarkView {

        public render() {
            var data: DataSet = <DataSet> this.getModel().get("source");

            this.getMarkSelection()
                .data(data.getItems())
                .enter()
                .append("rect")
                .attr("class", this.getModel().getName());

            this.getMarkSelection().attr("width", (item) => {
                return this.get("x2")(item) - this.get("x")(item);
            });

            this.getMarkSelection().attr("height", (item) => {
                return this.get("y2")(item) - this.get("y")(item);
            });

            _.each((<Mark> this.getModel()).getMarkProperties(), (key) => {
                this.getMarkSelection().attr(key, (item) => {
                    return this.get(key)(item);
                });
            });

            this.trigger(MarkView.EVENT_RENDER);
        }
    }
}
