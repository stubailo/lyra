/// <reference path="../typings/jquery.d.ts" />
/// <reference path="../typings/underscore.d.ts" />
/// <reference path="../typings/backbone.d.ts" />
/// <reference path="../typings/d3.d.ts" />
/// <reference path="../typings/Q.d.ts" />
/// <reference path="../typings/jquery-mousewheel.d.ts" />

/// <reference path="contextNode.ts" />
/// <reference path="contextModel.ts" />
/// <reference path="contextView.ts" />
/// <reference path="context.ts" />
/// <reference path="dataSet.ts" />
/// <reference path="scale.ts" />
/// <reference path="mark.ts" />
/// <reference path="axis.ts" />
/// <reference path="interaction.ts" />
/// <reference path="area.ts" />

module Lyra {
    // Model class, should not be exposed as API eventually
    export class LyraModel {
        private context: Context;

        constructor(spec: any) {
            // Initialize
            this.context = new Context();

            // Parse all of the models
            for (var className in spec) {
                if (Lyra.getModel(className) !== undefined) {
                    ContextModel.parseAll(spec[className], this.context, Lyra.getModel(className));
                }
            }
        }

        public getContext(): Context {
            return this.context;
        }
    }

    // View class, should not be exposed as API eventually
    export class LyraView {
        // Necessary properties
        private model: LyraModel;
        private viewContext: Context;

        // Spec-produced objects
        private interactions: Interaction[];

        // View elements
        private element: HTMLElement;
        private svg: D3.Selection;

        constructor(spec: any, element: HTMLElement) {
            // Initialize
            this.viewContext = new Context();
            this.model = new LyraModel(spec);

            // Initialize DOM
            this.element = element;

            // Generate all the views for this model
            this.generateViews();
            this.render();

            // Parse interactions
            for (var key in spec) {
                if (spec.hasOwnProperty(key)) {
                    var value = spec[key];
                    switch (key) {
                        case "interactions":
                            this.interactions = Interaction.parseAll(value, this.getModel().getContext(), this.viewContext);
                            break;
                    }
                }
            }
        }

        public getModel(): LyraModel {
            return this.model;
        }

        public render() {
            _.each(<ContextView[]> this.viewContext.getNodes(), function(view) {
                view.render();
            });
        }

        private generateViews() {
            this.svg = d3.select(this.element).append("svg:svg");

            // Creates the view for area
            _.each(this.model.getContext().getNodesOfClass(Area.className), (area: Area) => {
                var areaGroup = this.svg.append("g");
                Lyra.createViewForModel(area, areaGroup, this.viewContext);
            });
        }

        private setUpLayout() {
            var window_width: number = $(window).width();
            var curX = 0, curY = 0, maxY = 0, yBound = 0, xBound = 0;

            _.each(<AreaView[]> this.viewContext.getNodesOfClass(Area.className), (areaView) => {
                var areaWidth = areaView.calculatedWidth();
                var areaHeight = areaView.calculatedHeight();
                if ((curX + areaWidth) >= window_width) {
                    curX = 0;
                    curY = maxY;
                    maxY = 0;
                }
                areaView.getElement().attr("x", curX).attr("y", curY);
                curX += areaWidth;
                if (areaHeight > maxY) {
                    maxY = areaHeight;
                }
                if (yBound < curY + areaHeight) {
                    yBound = curY + areaHeight;
                }
                if (xBound < curX) {
                    xBound = curX;
                }
            });
            return [xBound, yBound];
        }
    }

    /**
     * Variables and methods to add plugins.
     *
     * The variables are hidden in the module, but the methods are exported
     * to attach plugins.
     */
    var classNameToView: Object = {};
    var classNameToModel: Object = {};

    var CONTAINER_CLASS: string = "lyra-chart";

    // Method for adding new types of model nodes
    export function addModel(specKey: string, classReference): void {
        classReference.className = specKey;
        classNameToModel[specKey] = classReference;
    }

    export function addView(specKey: string, classReference): void {
        classReference.className = specKey;
        classNameToView[specKey] = classReference;
    }

    export function getModel(specKey: string) {
        return classNameToModel[specKey];
    }

    export function getView(specKey: string) {
        return classNameToView[specKey];
    }

    // Entry point into library
    export function createChart(spec: any, element: HTMLElement): Object {
        var chart: any = {};
        $(element).addClass(CONTAINER_CLASS);
        chart.view = new LyraView(spec, element);
        return chart;
    }

    export function createViewForModel(model: ContextNode, element: D3.Selection, viewContext: Context) {
        return new (Lyra.getView(model.getClassName())).createView(model, element, viewContext);
    }

    Lyra.addView("areas", AreaView);
    Lyra.addView("marks", MarkView);
    Lyra.addView("axes", AxisView);

    Lyra.addModel("data", DataSet);
    Lyra.addModel("scales", Scale);
    Lyra.addModel("marks", Mark);
    Lyra.addModel("axes", Axis);
    Lyra.addModel("areas", Area);
}


