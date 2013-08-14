module Lyra {
    export class Area extends ContextModel {
        public static className: string;

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
            return new Area(spec, context, Area.className);
        }

        public load() {
            // Nothing to do!
        }

        public calculatedWidth(): number {
            return this.get("paddingLeft") + this.get("width") + this.get("paddingRight");
        }

        public calculatedHeight(): number {
            return this.get("paddingTop") + this.get("height") + this.get("paddingBottom");
        }
    }

    export class AreaView extends ContextView {
        public static EVENT_RENDER: string = "render";

        private _totalSelection: D3.Selection;
        private _graphSelection: D3.Selection;
        private _background: D3.Selection;

        public static createView(area: Area, element: D3.Selection, viewContext: Context): AreaView {
            return new AreaView(area, element, viewContext);
        }

        public load() {
            this.buildViews();
            this.buildSubviews();

            this.model.on("change", $.proxy(this.render, this));
        }

        public buildViews() {
            this._totalSelection = this.element.append("svg").attr("class", Area.className).attr("name", this.model.getName());
            this._graphSelection = this._totalSelection.append("svg").attr("class", "graph");
            this._background = this._graphSelection.append("rect");
        }


        private buildSubviews() {
            _.each(this.model.getAttachmentPoints(), (attachmentPoint: string) => {
                _.each(this.model.getSubViewModels()[attachmentPoint], (subViewModel: ContextModel) => {
                    var subViewGroup: D3.Selection;

                    if(attachmentPoint === Area.ATTACH_INSIDE) {
                        subViewGroup = this._graphSelection.append("g");
                    } else {
                        subViewGroup = this._totalSelection.append("g");
                    }

                    this.addSubView(Lyra.createViewForModel(subViewModel, subViewGroup, this.getContext()), attachmentPoint);
                });
            });

        }

        public render() {
            this._graphSelection
                .attr("x", this.get("paddingLeft"))
                .attr("y", this.get("paddingTop"))
                .attr("width", this.get("width"))
                .attr("height", this.get("height"));

            for (var property in this.model.attributes) {
                if (property === "height") {
                    this._totalSelection.attr(property, this.get("height") + this.get("paddingTop") + this.get("paddingBottom"));
                } else if (property === "width") {
                    this._totalSelection.attr(property, this.get("width") + this.get("paddingLeft") + this.get("paddingRight"));
                } else {
                    this._totalSelection.attr(property, this.get(property));
                }
            }

            this._background
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", this.model.get("width"))
                .attr("height", this.model.get("height"))
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

            _.each(this.model.getAttachmentPoints(), (attachmentPoint: string) => {
                _.each(this.subViews[attachmentPoint], (subView: ContextView) => {
                    var subViewGroup: D3.Selection = subView.element;

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
                            x = currentDistances.right + this.get("paddingLeft") - subView.calculatedWidth();
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
                            y = this.get("paddingTop") + currentDistances.bottom - subView.calculatedHeight();
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


        public get graphSelection(): D3.Selection {
            return this._graphSelection;
        }

        public get totalSelection(): D3.Selection {
            return this._totalSelection;
        }
    }
}
