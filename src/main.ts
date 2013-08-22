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

/// <reference path="../typings/jquery.d.ts" />
/// <reference path="../typings/underscore.d.ts" />
/// <reference path="../typings/backbone.d.ts" />
/// <reference path="../typings/d3.d.ts" />
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
/// <reference path="label.ts" />
/// <reference path="element.ts" />

module Lyra {
    // Model class, should not be exposed as API eventually
    export class LyraModel {
        private context: Context;

        constructor(spec: any) {
            // Initialize
            this.context = new Context();

            // Parse all of the models
            for (var pluginName in spec) {
                if (Lyra.getModel(pluginName) !== undefined) {
                    ContextModel.createModels(Lyra.getModel(pluginName), spec[pluginName], this.context);
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

        constructor(spec: any, element: HTMLElement, model: LyraModel) {
            // Initialize
            this.viewContext = new Context();
            this.model = model;
            this.element = element;

            // Generate all the views for this model
            this.generateViews();
            this.setUpLayout();
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
            _.each(<AreaView[]> this.viewContext.getNodesOfClass(Area.pluginName), (areaView) => {
                areaView.render();
            });
        }

        private generateViews() {
            this.svg = d3.select(this.element).append("svg:svg");

            // Creates the view for area
            _.each(this.model.getContext().getNodesOfClass(Area.pluginName), (area: Area) => {
                var areaGroup = this.svg.append("g");
                var element = new Element(areaGroup);
                Lyra.createViewForModel(area, element, this.viewContext);
            });
        }

        private setUpLayout() {
            var windowWidth: number = $(window).width();
            var curX = 0, curY = 0, maxY = 0, yBound = 0, xBound = 0;

            _.each(<AreaView[]> this.viewContext.getNodesOfClass(Area.pluginName), (areaView) => {
                var areaWidth = areaView.get("totalWidth");
                var areaHeight = areaView.get("totalHeight");
                if ((curX + areaWidth) >= windowWidth) {
                    curX = 0;
                    curY = maxY;
                    maxY = 0;
                }
                areaView.getSelection().attr("transform", "translate(" + curX + ", " + curY + ")");
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

            this.svg.attr("width", xBound).attr("height", yBound);
        }
    }

    /**
     * Variables and methods to add plugins.
     *
     * The variables are hidden in the module, but the methods are exported
     * to attach plugins.
     */
    var pluginNameToView: Object = {};
    var pluginNameToModel: Object = {};

    var CONTAINER_CLASS: string = "lyra-chart";

    // Method for adding new types of model nodes
    export function addModel(pluginName: string, classReference): void {
        classReference.pluginName = pluginName;
        pluginNameToModel[pluginName] = classReference;
    }

    export function addView(pluginName: string, classReference): void {
        classReference.pluginName = pluginName;
        pluginNameToView[pluginName] = classReference;
    }

    export function getModel(pluginName: string) {
        return pluginNameToModel[pluginName];
    }

    export function getView(pluginName: string) {
        return pluginNameToView[pluginName];
    }

    export function createViewForModel(model: ContextNode, element: Element, viewContext: Context) {
        return new (Lyra.getView(model.getPluginName())).createView(model, element, viewContext);
    }

    // Entry point into library
    export function createChart(spec: any, element: HTMLElement): Object {
        var chart: any = {};
        $(element).addClass(CONTAINER_CLASS);
        chart.model = new LyraModel(spec);
        chart.view = new LyraView(spec, element, chart.model);
        return chart;
    }

    Lyra.addView("areas", AreaView);
    Lyra.addView("marks", MarkView);
    Lyra.addView("axes", AxisView);
    Lyra.addView("labels", LabelView);

    Lyra.addModel("data", DataSet);
    Lyra.addModel("scales", Scale);
    Lyra.addModel("marks", Mark);
    Lyra.addModel("axes", Axis);
    Lyra.addModel("areas", Area);
    Lyra.addModel("labels", Label);
}


