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
    export class Element extends ListenableDictionary {
        private selection: D3.Selection;

        constructor(selection: D3.Selection) {
            super();
            this.selection = selection;
        }

        defaults() {
            return _(super.defaults()).extend({
                "requestedHeight": 0,
                "requestedWidth": 0,
                "height": 1000,
                "width": 1000
            });
        }

        public getSelection(): D3.Selection {
            return this.selection;
        }
    }
}
