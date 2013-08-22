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

    /**
     * ContextNode is a generalized class that represents a node in the
     * model or view context.
     */
    export class ContextNode extends Backbone.Model {

        // Private references to the context, and name
        private context: Context;
        private name: string;
        private pluginName: string;

        /* Creates a ContextNode, setting up the name, context, and properties from the specification
         * passed to it.
         *
         * This method should not be overriden. Instead, override the load method to perform additional
         * operations before the contextNode is rendered.
         */
        constructor(name: string, pluginName: string, context: Context) {
            super();
            Backbone.Model.apply(this, []); // Backbone.defaults don't work otherwise

            // Setup instance variables
            this.name = name;
            this.context = context;
            this.pluginName = pluginName;

            // Save this ContextNode in the context
            this.context.set(pluginName + ":" + this.name, this);
        }

        public getName(): string {
            return this.name;
        }

        public getContext(): Context {
            return this.context;
        }

        public getPluginName(): string {
            return this.pluginName;
        }
    }
}
