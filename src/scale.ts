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
    export class Scale extends ContextModel {
        private static TYPE_KEY: string = "type";

        public static EVENT_CHANGE: string = "change";

        public static createModel(spec: any): any {
            switch (spec[Scale.TYPE_KEY]) {
                case "linear":
                    return LinearScale;
                case "time":
                    return TimeScale;
                case "identity":
                    return IdentityScale;
                default:
                    throw new Error("Invalid Scale type: " + spec[Scale.TYPE_KEY]);
            }
        }
        // Main method for any scale, delegates to D3 most of the time
        public apply(input: any): any {
            throw new Error("Apply method not overridden for scale.");
        }

        public inverse(input: any): any {
            throw new Error("Invert method not overridden for scale.");
        }

        public pan(pixels: number) {
            throw new Error("Pan method not overridden for scale.");
        }

        public zoom(zoomFactor: number) {
            throw new Error("Zoom method not overridden for scale.");
        }

        public getScaleRepresentation(): any {
            throw new Error("getScaleRepresentation not overridden for scale.");
        }
    }

    /*
      Represents a linear D3 scale.
    */
    class LinearScale extends Scale {
        private scale;
        private dirty: boolean; // does the scale need to be recalculated?

        public load() {
            this.dirty = true;
            this.on("change:domainBegin change:domainEnd change:rangeBegin change:rangeEnd", () => {
                this.dirty = true;
            });
        }

        public apply(input) {
            return this.getScaleRepresentation()(input);
        }

        public inverse(input) {
            return this.getScaleRepresentation().invert(input);
        }

        public pan(pixels) {
            var dx = this.inverse(pixels) - this.inverse(0);

            this.set({
                domainBegin: this.get("domainBegin") - dx,
                domainEnd: this.get("domainEnd") - dx
            });
        }

        public zoom(zoomFactor: number) {
            var domain = [this.get("domainBegin"), this.get("domainEnd")];
            var mean = (domain[0] + domain[1]) / 2;
            var domainLength = domain[1] - domain[0];

            domain[0] = mean - (domainLength * zoomFactor / 2);
            domain[1] = mean + (domainLength * zoomFactor / 2);

            this.set({
                domainBegin: domain[0],
                domainEnd: domain[1]
            });
        }

        public getScaleRepresentation(): any {
            if (this.dirty) {
                // create new scale object
                var domain = [this.get("domainBegin"), this.get("domainEnd")];
                var range = [this.get("rangeBegin"), this.get("rangeEnd")];
                this.scale = d3.scale.linear().domain(domain).range(range);
                this.dirty = false;
            }
            return this.scale;
        }
    }

    /*
      Represents a D3 time scale
      */

    class TimeScale extends Scale {
        private scale;
        private dirty: boolean; // does the scale need to be recalculated?

        public load() {
            this.dirty = true;
            this.on("change:domainBegin change:domainEnd change:rangeBegin change:rangeEnd", () => {
                this.dirty = true;
            });
        }

        public apply(input) {
            return this.getScaleRepresentation()(input);
        }

        public inverse(input) {
            return this.getScaleRepresentation().invert(input);
        }

        public pan(pixels) {
            var dx = this.inverse(pixels).getTime() - this.inverse(0).getTime();

            this.set({
                domainBegin: new Date(this.get("domainBegin").getTime() - dx),
                domainEnd: new Date(this.get("domainEnd").getTime() - dx)
            });
        }

        public zoom(zoomFactor: number) {
            var domain = [this.get("domainBegin").getTime(), this.get("domainEnd").getTime()];
            var mean = (domain[0] + domain[1]) / 2;
            var domainLength = domain[1] - domain[0];

            domain[0] = mean - (domainLength * zoomFactor / 2);
            domain[1] = mean + (domainLength * zoomFactor / 2);

            this.set({
                domainBegin: (new Date(domain[0])),
                domainEnd: (new Date(domain[1]))
            });
        }

        public getScaleRepresentation(): any {
            if (this.dirty) {
                // create new scale object
                var domain = [this.get("domainBegin"), this.get("domainEnd")];
                var range = [this.get("rangeBegin"), this.get("rangeEnd")];
                this.scale = d3.time.scale().domain(domain).range(range);
                this.dirty = false;
            }
            return this.scale;
        }
    }

    /*
      This scale doesn't change the input at all.
    */
    class IdentityScale extends Scale {
        public apply(input) {
            return input;
        }

        public inverse(input) {
            return input;
        }

        public pan(pixels) {
            // does nothing
        }

        public zoom(pixels) {
            // does nothing
        }
    }
}
