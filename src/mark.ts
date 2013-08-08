module Lyra {
    export class MarkType {
        constructor(private _name: string) { }

        public get name() {
            return this._name;
        }
        public static LINE = new MarkType("path");
        public static CIRCLE = new MarkType("circle");
        public static RECTANGLE = new MarkType("rect");
    }

    export class Mark extends ContextNode {
        private static SCALE_KEY: string = "scale";
        private static VALUE_KEY: string = "value";

        public static className: string;

        /* Each property is a function of one item that specifies that property of an SVG element.
         * So for example a circle would have one function for "cx", one for "cy", etc.
         */
        private _type: MarkType;
        private _markProperties;

        public static parse(spec: any, context: Context) {
            return new Mark(spec, context, Mark.className);
        }

        public load() {
            var context = this.context;
            switch (this.get("type")) {
                case "circle":
                    this._type = MarkType.CIRCLE;
                    break;
                case "line":
                    this._type = MarkType.LINE;
                    break;
                case "rect":
                    this._type = MarkType.RECTANGLE;
                    break;
                default:
                    throw new Error("Unsupported mark type: " + this.get("type"));
            }
            this.parseMarkProperties(this.get("properties"));
        }

        private parseProperty(name: string, spec: any) {

            if (this.get(name)) {
                throw new Error("Duplicate property in mark specification: " + name);
            }

            var scale;
            if (spec[Mark.SCALE_KEY]) {
                scale = this.context.getNode(Scale.className, spec[Mark.SCALE_KEY]);
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
            this._markProperties.push(name);
        }

        private parseMarkProperties(properties: any): void {
            this._markProperties = [];

            for (var key in properties) {
                if (properties.hasOwnProperty(key)) {
                    this.parseProperty(key, properties[key]);
                }
            }
        }

        private dataSetChanged(): void {
            this.trigger("change");
        }

        public get type() {
            return this._type;
        }

        public get markProperties() {
            return this._markProperties;
        }
    }

    export class MarkView extends ContextView {
        public static EVENT_RENDER: string = "render";

        private _markSelection: D3.Selection;

        public load() {
            var render = $.proxy(this.render, this);
            this.node.on("change", render);
            this.on("change", render);
        }

        public static createView(mark: Mark, element: D3.Selection, viewContext: Context) {
            switch (mark.type) {
                case MarkType.CIRCLE:
                    return new CircleMarkView(mark, element, viewContext);
                case MarkType.LINE:
                    return new LineMarkView(mark, element, viewContext);
                case MarkType.RECTANGLE:
                    return new RectMarkView(mark, element, viewContext);
                default:
                    throw new Error("Invalid MarkView type: " + mark.type);

            }
        }

        public render() {
            throw new Error("This method is abstract, derived mark views must implement this method");
        }

        public get markSelection() {
            return this.element.selectAll((<Mark> this.node).type.name + "." + this.node.name);
        }
    }

    class CircleMarkView extends MarkView {
        public render() {
            this.markSelection
                .data(this.node.get("source").items)
                .enter()
                .append("circle")
                .attr("class", this.node.name);

            _.each((<Mark> this.node).markProperties, (key) => {
                this.markSelection.attr(key, (item) => {
                    return this.get(key)(item);
                });
            });

            this.trigger(MarkView.EVENT_RENDER);
        }
    }

    class LineMarkView extends MarkView {
        public render() {
            this.markSelection
                .data([this.get("source").items])
                .enter()
                .append("path")
                .attr("class", this.name);

            var line = d3.svg.line();
            _.each((<Mark> this.node).markProperties, (key) => {
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
                        this.markSelection.attr(key, (item) => {
                            return this.get(key)(item);
                        });
                        break;
                }
            });

            line.interpolate("linear");

            this.markSelection.attr("d", line);

            this.trigger(MarkView.EVENT_RENDER);
        }
    }

    class RectMarkView extends MarkView {

        public render() {
            this.markSelection
                .data(this.node.get("source").items)
                .enter()
                .append("rect")
                .attr("class", this.node.name);

            this.markSelection.attr("width", (item) => {
                return this.get("x2")(item) - this.get("x")(item);
            });

            this.markSelection.attr("height", (item) => {
                return this.get("y2")(item) - this.get("y")(item);
            });

            _.each((<Mark> this.node).markProperties, (key) => {
                this.markSelection.attr(key, (item) => {
                    return this.get(key)(item);
                });
            });

            this.trigger(MarkView.EVENT_RENDER);
        }
    }
}
