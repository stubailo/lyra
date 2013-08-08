/*
  This class represents an interactive feature, it is the only class so far that has access to the model
  and view contexts, since it can modify the model based on view events.
*/

class Interaction {
    private static SPEC_TYPE_KEY: string = "type";

    public static className: string = "Interaction";

    public static TYPE_CLICK_PRINT: string = "clickPrint";
    public static TYPE_PAN: string = "pan";
    public static TYPE_COLOR_HOVER: string = "colorHover";
    public static TYPE_ZOOM: string = "zoom";
    public static TYPE_ADD_POINT: string = "addPoint";

    private _modelContext: Context;
    private _viewContext: Context;
    private _id: number;

    constructor(modelContext: Context, viewContext: Context, id: number) {
        this._modelContext = modelContext;
        this._viewContext = viewContext;
        this._id = id;
    }

    public static parseAll(specList: any[], modelContext: Context, viewContext: Context): Interaction[] {
        var count = -1;
        return _.map(specList, function(spec) {
            count++;
            return Interaction.parse(spec, modelContext, viewContext, count);
        });
    }

    public static parse(spec: any, modelContext: Context, viewContext: Context, i: number): Interaction {
        switch (spec[Interaction.SPEC_TYPE_KEY]) {
            case Interaction.TYPE_CLICK_PRINT:
                return new ClickPrintInteraction(spec, modelContext, viewContext, i);
            case Interaction.TYPE_PAN:
                return new PanInteraction(spec, modelContext, viewContext, i);
            case Interaction.TYPE_COLOR_HOVER:
                return new ColorHoverInteraction(spec, modelContext, viewContext, i);
            case Interaction.TYPE_ZOOM:
                return new ZoomInteraction(spec, modelContext, viewContext, i);
            case Interaction.TYPE_ADD_POINT:
                return new AddPointInteraction(spec, modelContext, viewContext, i);
            default:
                throw new Error("Unsupported interaction type: " + spec[Interaction.SPEC_TYPE_KEY]);
        }
        return null;
    }

    public get modelContext(): Context {
        return this._modelContext;
    }

    public get viewContext(): Context {
        return this._viewContext;
    }

    public get id(): number {
        return this._id;
    }
}

class ClickPrintInteraction extends Interaction {
    private static MARK_KEY: string = "mark";

    private _markView: MarkView;

    constructor(spec: any, modelContext: Context, viewContext: Context, id: number) {
        super(modelContext, viewContext, id);

        if (spec[ClickPrintInteraction.MARK_KEY]) {
            this._markView = this.viewContext.getNode(Mark.className, spec[ClickPrintInteraction.MARK_KEY]);
        } else {
            throw new Error("No " + ClickPrintInteraction.MARK_KEY + " specified in ClickPrintInteraction.");
        }

        this.addEvents();
        this._markView.on(MarkView.EVENT_RENDER, $.proxy(this.addEvents, this));
    }

    private addEvents() {
        this._markView.markSelection.on("click.ClickPrintInteraction", $.proxy(this.onClick, this));
    }

    private onClick(d, i) {
        console.log(d3.event);
    }
}

class PanInteraction extends Interaction {
    private static AREA_KEY: string = "area";
    private static AXIS_KEY: string = "axis";
    private static SCALE_KEY: string = "scale";
    private static DIRECTION_KEY: string = "direction";

    private _element: D3.Selection;
    private _scale: Scale;
    private _direction: string;

    private _startPosition: number[];
    private _currentPosition: number[];
    private _dragging: boolean;

    private addEvents;
    private startDrag;
    private drag;
    private stopDrag;

    constructor(spec: any, modelContext: Context, viewContext: Context, id: number) {
        super(modelContext, viewContext, id);

        if (spec[PanInteraction.AREA_KEY]) {
            this._element = this.viewContext.getNode(Area.className, spec[PanInteraction.AREA_KEY]).graphSelection;
        } else if (spec[PanInteraction.AXIS_KEY]) {
            this._element = this.viewContext.getNode(Axis.className, spec[PanInteraction.AXIS_KEY]).axisSelection;
        } else {
            throw new Error("No " + PanInteraction.AXIS_KEY + " or " + PanInteraction.AREA_KEY + " specified in PanInteraction.");
        }

        if (spec[PanInteraction.SCALE_KEY]) {
            this._scale = this.modelContext.getNode(Scale.className, spec[PanInteraction.SCALE_KEY]);
        } else {
            throw new Error("No " + PanInteraction.SCALE_KEY + " specified in PanInteraction.");
        }

        if (spec[PanInteraction.DIRECTION_KEY]) {
            this._direction = spec[PanInteraction.DIRECTION_KEY];
        } else {
            this._direction = "e";
        }

        this.addEvents = () => {
            this._element.on("mousedown." + this.id, this.startDrag);
        };

        this.drag = (event) => {
            var newPosition: number[] = [event.clientX, event.clientY];
            var dx = newPosition[0] - this._currentPosition[0];
            var dy = newPosition[1] - this._currentPosition[1];
            this._currentPosition = _.clone(newPosition);

            switch (this._direction) {
                case "n":
                    this._scale.pan(dy);
                    break;
                case "s":
                    this._scale.pan(-dy);
                    break;
                case "e":
                    this._scale.pan(dx);
                    break;
                case "w":
                    this._scale.pan(-dx);
                    break;
                default:
                    throw new Error("Invalid pan direction: " + this._direction);
            }
        };

        this.startDrag = () => {
            this._startPosition = [d3.event.x, d3.event.y];
            this._currentPosition = _.clone(this._startPosition);
            this._dragging = true;
            $(window).on("mousemove", this.drag);
            $(window).one("mouseup", this.stopDrag);
        };

        this.stopDrag = (event) => {
            $(window).off("mousemove", this.drag);
        };

        this.addEvents();
    }
}

class ZoomInteraction extends Interaction {
    private static AREA_KEY: string = "area";
    private static AXIS_KEY: string = "axis";
    private static SCALE_KEY: string = "scale";
    private static ZOOM_FACTOR_KEY: string = "scale";

    private _element: D3.Selection;
    private _scale: Scale;
    private _properties: any;
    private _zoomFactor: number;

    private static DEFAULT_ZOOM_FACTOR: number = 0.02;
    // TODO : separate horizontal and vertical zoom factors?


    constructor(spec: any, modelContext: Context, viewContext: Context, id: number) {
        super(modelContext, viewContext, id);

        if (spec[ZoomInteraction.AREA_KEY]) {
            this._element = this.viewContext.getNode(Area.className, spec[ZoomInteraction.AREA_KEY]).graphSelection;
        } else if (spec[ZoomInteraction.AXIS_KEY]) {
            this._element = this.viewContext.getNode(Axis.className, spec[ZoomInteraction.AXIS_KEY]).axisSelection;
        } else {
            throw new Error("No " + ZoomInteraction.AXIS_KEY + " or " + ZoomInteraction.AREA_KEY + " specified in PanInteraction.");
        }

        if (spec[ZoomInteraction.SCALE_KEY]) {
            this._scale = this.modelContext.getNode(Scale.className, spec[ZoomInteraction.SCALE_KEY]);
        } else {
            throw new Error("No scale specified for ZoomInteraction");
        }

        if (spec[ZoomInteraction.ZOOM_FACTOR_KEY]) {
            this._zoomFactor = spec[ZoomInteraction.ZOOM_FACTOR_KEY];
        } else {
            this._zoomFactor = ZoomInteraction.DEFAULT_ZOOM_FACTOR;
        }

        this.addEvents();
    }

    private addEvents() {
        $(this._element[0][0]).mousewheel($.proxy(this.onZoom, this));
    }

    private onZoom(e, delta, deltaX, deltaY) {
        this._scale.zoom(1 + ((deltaY < 0) ? 1 : -1) * this._zoomFactor);
        return false;
    }
}
