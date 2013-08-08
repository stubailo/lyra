/// <reference path="../defs/jquery.d.ts" />
/// <reference path="../defs/underscore-typed.d.ts" />
/// <reference path="../defs/backbone.d.ts" />
/// <reference path="../defs/d3.d.ts" />
/// <reference path="../defs/Q.d.ts" />

/// <reference path="contextNode.ts" />
/// <reference path="contextView.ts" />
/// <reference path="context.ts" />
/// <reference path="dataSet.ts" />
/// <reference path="scale.ts" />
/// <reference path="mark.ts" />
/// <reference path="axis.ts" />
/// <reference path="interaction.ts" />
/// <reference path="area.ts" />
/// <reference path="label.ts" />

// Model class, should not be exposed as API eventually
class LyraModel {
    private _context: Context;

    constructor(spec: any) {
        // Initialize
        this._context = new Context();

        // Parse all of the models
        for (var className in spec) {
            if (Lyra.getModel(className) !== undefined) {
                ContextNode.parseAll(spec[className], this.context, Lyra.getModel(className));
            }
        }
    }

    public get context(): Context {
        return this._context;
    }
}

// Entry point into library
class Lyra {

    /**
    Static variables and methods to register plugins
    */
    private static _classNameToView: Object = {};
    private static _classNameToModel: Object = {};
    // Method for adding new types of model nodes
    public static addModel(specKey: string, classReference): void {
        classReference.className = specKey;
        Lyra._classNameToModel[specKey] = classReference;
    }

    public static addView(specKey: string, classReference): void {
        classReference.className = specKey;
        Lyra._classNameToView[specKey] = classReference;
    }

    public static getModel(specKey: string) {
        return Lyra._classNameToModel[specKey];
    }

    public static getView(specKey: string) {
        return Lyra._classNameToView[specKey];
    }

    public static createViewForModel(model: ContextNode, element: D3.Selection, viewContext: Context) {
        console.log("create view");
        console.log(model);
        return new (Lyra.getView(model.className))(model, element, viewContext);
    }

    ///////////////////////////////


    // Necessary properties
    private _model: LyraModel;
    private _viewContext: Context;

    // Spec-produced objects
    private _interactions: Interaction[];

    // DOM elements and such
    private _element: HTMLElement;
    private _svg: D3.Selection;

    constructor(spec: any, element: HTMLElement) {
        // Initialize
        this._viewContext = new Context();
        this._model = new LyraModel(spec);

        // Initialize DOM
        this._element = element;

        // Generate all the views for this model
        this.generateViews();
        this.render();

        // Parse interactions
        for (var key in spec) {
            if (spec.hasOwnProperty(key)) {
                var value = spec[key];
                switch (key) {
                    case "interactions":
                        this._interactions = Interaction.parseAll(value, this.model.context, this._viewContext);
                        break;
                }
            }
        }
    }

    public get model(): LyraModel {
        return this._model;
    }

    public render() {
        for (var specKey in Lyra._classNameToView) {
            if (Lyra._classNameToView.hasOwnProperty(specKey)) {
                _.each(<ContextView[]> this._viewContext.getNodesOfClass(specKey), function(view) {
                    view.render();
                });
            }
        }
    }

    private generateViews() {
        this._svg = d3.select(this._element).append("svg:svg");

        // Creates the view for area
        _.each(this.model.context.getNodesOfClass(Area.className), (area: Area) => {
            new AreaView(area, this._svg, this._viewContext);

        });

        _.each(this.model.context.getNodesOfClass(Mark.className), (mark: Mark) => {
            console.log(mark);
            MarkView.createView(mark,
                this._viewContext.getNode(Area.className, mark.get("area").name).graphSelection, this._viewContext);
        });
    }

    private setUpLayout() {
        var window_width: number = $(window).width();
        var curX = 0, curY = 0, maxY = 0, yBound = 0, xBound = 0;

        _.each(<AreaView[]> this._viewContext.getNodesOfClass(Area.className), (areaView) => {
            var areaWidth = parseFloat(areaView.totalSelection.attr("width"));
            var areaHeight = parseFloat(areaView.totalSelection.attr("height"));
            if ((curX + areaWidth) >= window_width) {
                curX = 0;
                curY = maxY;
                maxY = 0;
            }
            areaView.totalSelection.attr("x", curX).attr("y", curY);
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

Lyra.addView("areas", AreaView);
Lyra.addView("marks", MarkView);
Lyra.addView("axes", AxisView);

Lyra.addModel("data", DataSet);
Lyra.addModel("scales", Scale);
Lyra.addModel("marks", Mark);
Lyra.addModel("axes", Axis);
Lyra.addModel("areas", Area);
