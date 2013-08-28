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
    export class ContextModel extends ContextNode {
        private static SPEC_NAME_KEY: string = "name";

        public static pluginName: string = "default";

        public defaults() {
            return {};
        }

        /* Utility method that returns an array of ContextModels of a certain type.
         *
         * @param specList A list of specifications that will be passed to each new model
         * @param context The universal context
         * @param pluginClass A class (should be extending ContextNode) that will be used to create the models
         * @return An array of ContextModels
         */
        public static createModels(pluginClass: any, specList: any[], context: Context): any[] {
            return _.map(specList, function(spec) {
                var modelClass = pluginClass.chooseModelClass(spec);

                return new modelClass(spec, context, pluginClass.pluginName);
            });
        }

        /* The behavior of chooseModelClass is set to return this contextModel class, but can be overriden
         * to specify more complex behavior.
         *
         * Override this if the spec specifies certain properties that need to be saved ahead of time
         * or if a different model class is supposed to be used besides the default.
         */
        public static chooseModelClass(spec): any {
            return this;
        }

        /* Creates a ContextNode, setting up the name, context, and properties from the specification
         * passed to it.
         *
         * This method should not be overriden. Instead, override the load method to perform additional
         * operations before the contextNode is rendered.
         */
        constructor(spec: any, context: Context, pluginName: string) {
            super(spec[ContextModel.SPEC_NAME_KEY], pluginName, context);

            // Parse the properties of this node from the specification
            this.parseProperties(spec);

            // Additional initialization
            this.load();
        }

        /* The behavior of load is set as a no-op, but can be overriden to add additional behavior.
         *
         * This method is called immediately after a ContextNode is constructed.
         */
        public load() {
            // NO-OP
        }

        /* Given a hash of properties, attaches the properties to the contextNode.
         *
         * This method parses three type of property values.
         * 1) Objects
         * 2) Property References (e.g. Set the property "width" of the contextNode to be the width of another contextNode)
         * 3) If the property isn't either of the above it is set as-is
         */
        private parseProperties(properties: any): void {
            for (var key in properties) {
                if (properties.hasOwnProperty(key)) {
                    var value = properties[key];

                    if (Context.isPropertyReference(value)) {
                        var propertyFunction = this.getContext().getPropertyFunction(value);
                        var updateProperty = ((currentKey) => {
                            return () => {
                                this.set(currentKey, propertyFunction());
                            };
                        })(key);
                        updateProperty();
                        this.getContext().getNode(value).on("change", updateProperty);
                    } else if (Context.isObjectReference(value)) {
                        ((currentKey) => {
                            this.set(currentKey, this.getContext().getNode(value));
                            this.get(currentKey).on("change", () => {
                                this.trigger("change");
                            });
                        })(key);
                    } else {
                        this.set(key, value);
                    }
                }
            }
        }
    }
}
