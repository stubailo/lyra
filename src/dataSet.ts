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
      This class represents a set of items that can be the basis for marks in the chart area.
    */

    export class DataSet extends ContextModel {
        private static SPEC_TYPE_KEY: string = "type";

        public static EVENT_CHANGE: string = "change";

        public static createModel(spec: any) {
            if (spec[DataSet.SPEC_TYPE_KEY]) {
                switch (spec[DataSet.SPEC_TYPE_KEY]) {
                    case "bar":
                        return BarDataSetTransform;
                        break;
                    default:
                        throw new Error("Unsupported transform type: " + spec[DataSet.SPEC_TYPE_KEY]);
                }
            } else {
                return DataSet;
            }
        }

        public getItems(): any[] {
            return _.clone(this.get("items"));
        }

        public setItems(items: any[]) {
            this.set("items", _.clone(items));
            this.trigger(DataSet.EVENT_CHANGE);
        }
    }

    class BarDataSetTransform extends DataSet {
        private static BAR_WIDTH_KEY: string = "barWidth";
        private static BAR_DOMAIN_KEY: string = "barDomain";
        private static BAR_DOMAIN2_KEY: string = "barDomain2";
        private static BAR_BASE_KEY: string = "barBase";

        public getItems(): any[] {
            var barWidth: number = Infinity;
            var domain: string = this.get("domain");
            var prevItems = this.get("source").items;
            var prevValue = -Infinity;

            _.each(_.sortBy(prevItems, domain), (item) => {
                if (item[domain] - prevValue < barWidth) {
                    barWidth = item[domain] - prevValue;
                }

                prevValue = item[domain];
            });

            barWidth = barWidth * .95;

            return _.map(prevItems, (item) => {
                item = _.clone(item);
                item[BarDataSetTransform.BAR_WIDTH_KEY] = barWidth;
                item[BarDataSetTransform.BAR_DOMAIN_KEY] = item[domain] - barWidth / 2;
                item[BarDataSetTransform.BAR_DOMAIN2_KEY] = item[domain] + barWidth / 2;
                item[BarDataSetTransform.BAR_BASE_KEY] = 0;
                return item;
            });
        }

        public setItems(items: any[]) {
            throw new Error("Setting items not supported by data transforms.");
        }
    }
}
