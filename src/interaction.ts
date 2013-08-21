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
    /*
      This class represents an interactive feature, it is the only class so far that has access to the model
      and view contexts, since it can modify the model based on view events.
    */

    export class Interaction {
        private static SPEC_TYPE_KEY: string = "type";

        public static TYPE_PAN: string = "pan";
        public static TYPE_ZOOM: string = "zoom";

        private modelContext: Context;
        private viewContext: Context;
        private id: number;

        constructor(modelContext: Context, viewContext: Context, id: number) {
            this.modelContext = modelContext;
            this.viewContext = viewContext;
            this.id = id;
        }

        public static parseAll(specList: any[], modelContext: Context, viewContext: Context): Interaction[] {
            var count = 0;
            return _.map(specList, function(spec) {
                return Interaction.parse(spec, modelContext, viewContext, count++);
            });
        }

        public static parse(spec: any, modelContext: Context, viewContext: Context, i: number): Interaction {
            switch (spec[Interaction.SPEC_TYPE_KEY]) {
                case Interaction.TYPE_PAN:
                    return new PanInteraction(spec, modelContext, viewContext, i);
                case Interaction.TYPE_ZOOM:
                    return new ZoomInteraction(spec, modelContext, viewContext, i);
                default:
                    throw new Error("Unsupported interaction type: " + spec[Interaction.SPEC_TYPE_KEY]);
            }
            return null;
        }

        public getModelContext(): Context {
            return this.modelContext;
        }

        public getViewContext(): Context {
            return this.viewContext;
        }

        public getId(): number {
            return this.id;
        }
    }

    class PanInteraction extends Interaction {
        private static AREA_KEY: string = "area";
        private static AXIS_KEY: string = "axis";
        private static SCALE_KEY: string = "scale";
        private static DIRECTION_KEY: string = "direction";

        private element: D3.Selection;
        private scale: Scale;
        private direction: string;

        private startPosition: number[];
        private currentPosition: number[];
        private dragging: boolean;

        private addEvents;
        private startDrag;
        private drag;
        private stopDrag;

        constructor(spec: any, modelContext: Context, viewContext: Context, id: number) {
            super(modelContext, viewContext, id);

            if (spec[PanInteraction.AREA_KEY]) {
                var areaView: AreaView = <AreaView> this.getViewContext().getNode(Area.pluginName, spec[PanInteraction.AREA_KEY]);
                this.element = areaView.getGraphArea();
            } else if (spec[PanInteraction.AXIS_KEY]) {
                var axisView: AxisView = <AxisView> this.getViewContext().getNode(Axis.pluginName, spec[PanInteraction.AXIS_KEY]);
                this.element = axisView.getElement();
            } else {
                throw new Error("No " + PanInteraction.AXIS_KEY + " or " + PanInteraction.AREA_KEY + " specified in PanInteraction.");
            }

            if (spec[PanInteraction.SCALE_KEY]) {
                this.scale = this.getModelContext().getNode(Scale.pluginName, spec[PanInteraction.SCALE_KEY]);
            } else {
                throw new Error("No " + PanInteraction.SCALE_KEY + " specified in PanInteraction.");
            }

            if (spec[PanInteraction.DIRECTION_KEY]) {
                this.direction = spec[PanInteraction.DIRECTION_KEY];
            } else {
                this.direction = "e";
            }

            this.addEvents = () => {
                this.element.on("mousedown." + this.getId(), this.startDrag);
            };

            this.drag = (event) => {
                var newPosition: number[] = [event.clientX, event.clientY];
                var dx = newPosition[0] - this.currentPosition[0];
                var dy = newPosition[1] - this.currentPosition[1];
                this.currentPosition = _.clone(newPosition);

                switch (this.direction) {
                    case "n":
                        this.scale.pan(dy);
                        break;
                    case "s":
                        this.scale.pan(-dy);
                        break;
                    case "e":
                        this.scale.pan(dx);
                        break;
                    case "w":
                        this.scale.pan(-dx);
                        break;
                    default:
                        throw new Error("Invalid pan direction: " + this.direction);
                }
            };

            this.startDrag = () => {
                this.startPosition = [d3.event.x, d3.event.y];
                this.currentPosition = _.clone(this.startPosition);
                this.dragging = true;
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
        private static ZOOM_FACTOR_KEY: string = "zoomFactor";

        private element: D3.Selection;
        private scale: Scale;
        private properties: any;
        private zoomFactor: number;

        private static DEFAULT_ZOOM_FACTOR: number = 0.02;

        constructor(spec: any, modelContext: Context, viewContext: Context, id: number) {
            super(modelContext, viewContext, id);

            if (spec[ZoomInteraction.AREA_KEY]) {
                var areaView: AreaView = <AreaView> this.getViewContext().getNode(Area.pluginName, spec[ZoomInteraction.AREA_KEY]);
                this.element = areaView.getGraphArea();
            } else if (spec[ZoomInteraction.AXIS_KEY]) {
                var axisView: AxisView = <AxisView> this.getViewContext().getNode(Axis.pluginName, spec[ZoomInteraction.AXIS_KEY]);
                this.element = axisView.getElement();
            } else {
                throw new Error("No " + ZoomInteraction.AXIS_KEY + " or " + ZoomInteraction.AREA_KEY + " specified in PanInteraction.");
            }

            if (spec[ZoomInteraction.SCALE_KEY]) {
                this.scale = this.getModelContext().getNode(Scale.pluginName, spec[ZoomInteraction.SCALE_KEY]);
            } else {
                throw new Error("No scale specified for ZoomInteraction");
            }

            if (spec[ZoomInteraction.ZOOM_FACTOR_KEY]) {
                this.zoomFactor = spec[ZoomInteraction.ZOOM_FACTOR_KEY];
            } else {
                this.zoomFactor = ZoomInteraction.DEFAULT_ZOOM_FACTOR;
            }

            this.addEvents();
        }

        private addEvents() {
            $(this.element[0][0]).mousewheel($.proxy(this.onZoom, this));
        }

        private onZoom(e, delta, deltaX, deltaY) {
            this.scale.zoom(1 + ((deltaY < 0) ? 1 : -1) * this.zoomFactor);
            return false;
        }
    }
}
