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
    export class Label extends ContextModel {
        public static className: string;

        public static TEXT_HEIGHT = 30;

        public static TEXT_KEY = "text";

        public static parse(spec: any, context: Context) {
            return new Label(spec, context, Label.className);
        }

        public defaults() {
            return _(super.defaults()).extend({
                "text": "Default Text",
                "location": "top"
            });
        }

        public load() {
            this.get("area").addSubViewModel(this, this.get("location"));
        }
    }

    export class LabelView extends ContextView {
        public static EVENT_RENDER: string = "render";

        public static createView(label: Label, element: Element, viewContext: Context): LabelView {
            return new LabelView(label, element, viewContext);
        }

        public load() {
            this.getSelection().append("text");

            this.getModel().on("change", $.proxy(this.render, this));
        }

        public render() {
            var textElement: D3.Selection = this.getSelection().select("text");

            textElement.text(this.get(Label.TEXT_KEY))
                .attr("style", "font-family: sans-serif; font-size: " + this.get("size"))
                .attr("text-anchor", "middle");

            var bbox = textElement[0][0].getBBox();

            if(this.get("location") === "top" || this.get("location") === "bottom") {
                textElement.attr("x", this.get("area").get("width")/2);
                textElement.attr("y", Label.TEXT_HEIGHT/2);
            } else {
                textElement.attr("x", -this.get("area").get("height")/2);
                textElement.attr("y", Label.TEXT_HEIGHT/2);
                textElement.attr("transform", "rotate(-90)");
            }
        }

        public calculatedWidth(): number {
            if (this.get("location") === "left" || this.get("location") === "right") {
                return Label.TEXT_HEIGHT;
            } else {
                throw new Error("Label got asked about its undetermined length.");
            }
        }

        public calculatedHeight(): number {
            if (this.get("location") === "top" || this.get("location") === "bottom") {
                return Label.TEXT_HEIGHT;
            } else {
                throw new Error("Label got asked about its undetermined length.");
            }
        }
    }
}
