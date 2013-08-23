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
    /* The context is an object created by the Lyra model that contains a
     * reference to every contextNode in the model. The context has several overloaded
     * methods to get nodes stored in it and their properties to make it easier to access.
     *
     * The context also supports a simple string syntax to access its elements of the form
     * "pluginName:nodeName" or "pluginName:nodeName.property". Failure to follow this form
     * will throw an error.
     *
     * There is one Context object for the model, and one for the view, so that access can be
     * restricted to only model nodes or only view nodes.
     */
    export class Context {

        // A dictionary to hold everything
        private nodes: Object;

        public get(key: string): any {
            return this.nodes[key];
        }

        public set(key: string, value: any): void {
            this.nodes[key] = value;
        }

        constructor() {
            this.nodes = {};
        }

        /* Gets a node in the Context stored with a key of the form "pluginName:nodeName".
         *
         * This method is overloaded to accept either the two arguments pluginName and nodeName
         * separately or one argument of either the form "pluginName:nodeName" or
         * "pluginName:nodeName.property" (the "property" will be ignored).
         */
        public getNode(path: string): any;
        public getNode(pluginName: string, nodeName: string): any;
        public getNode(pathOrPluginName: string, nodeName?: string): any {
            // Create key depending on which method is called
            var path: string = pathOrPluginName;
            if (nodeName) {
                path = pathOrPluginName + ":" + nodeName;
            } else {
                path = Context.getPath(pathOrPluginName);
            }

            // Get the node associated with the key
            var result = this.get(path);

            if (result) {
                return result;
            } else {
                // Split the path to get the pluginName/nodeName and throw an error
                var list = path.split(/:|\./);
                throw new Error("No " + list[0] + " with name " + list[1] + " exists.");
            }
        }

        /* Gets a property of a node stored in the Context.
         *
         * This method is overloaded to accept either the three arguments pluginName, nodeName,
         * and property separately or one argument of the form "pluginName:nodeName.property".
         */
        public getProperty(argument: string): any;
        public getProperty(pluginName: string, nodeName: string, property: string): any;
        public getProperty(argumentOrPluginName: string, nodeName?: string, property?: string): any {
            // Create path and property depending on which method is called
            var path: string = null;
            var property: string = null;
            if (nodeName) {
                path = argumentOrPluginName + ":" + nodeName;
            } else {
                path = Context.getPath(argumentOrPluginName);
                property = Context.getProp(argumentOrPluginName);
            }

            // Get the property of the node associated with the key
            return this.getNode(path).get(property);
        }

        /* Returns a function that retrieves the value of a property of a node stored in the Context.
         *
         * This method is overloaded to accept either the three arguments pluginName, nodeName,
         * and property separately or one argument of the form "pluginName:nodeName.property".
         */
        public getPropertyFunction(argument: string): any;
        public getPropertyFunction(pluginName: string, nodeName: string, property: string): any;
        public getPropertyFunction(argumentOrPluginName: string, nodeName?: string, property?: string): any {
            // Create argument depending on which method is called
            var argument: string = argumentOrPluginName;
            if (nodeName) {
                argument = argumentOrPluginName + ":" + nodeName + "." + property;
            }
            return () => {
                return this.getProperty(argument);
            };
        }

        /* Attaches a listener to a property change of a node stored in the Context.
         */
        public addPropertyListener(argument: string, listener) {
            var property = Context.getProp(argument);
            var node = this.getNode(argument);
            node.on("change:" + property, listener);
        }

        /* Get a list of all the ContextNodes in the context */
        public getNodes(): Object {
            return _.values(this.nodes);
        }

        /* Get all ContextNodes of a certain pluginName */
        public getNodesOfClass(pluginName: string): ContextNode[] {
            return _.filter(this.nodes, (node) => {
                return node.pluginName === pluginName;
            });
        }

        /* Private method to get the path of the form "pluginName:nodeName" given an
         * argument of the form "pluginName:nodeName.property".
         */
        private static getPath(argument: string): string {
            Context.checkArgument(argument);
            return argument.split(/\./)[0];
        }

        /* Private method to get the property given an argument of the form
         * "pluginName:nodeName.property".
         */
        private static getProp(argument: string): string {
            Context.checkArgument(argument, true);
            return argument.split(/\./)[1];
        }

        /* Method to check if a property string is a property reference.
         *
         * This method checks if the string is of the form: <pluginName>:<name>.<property>
         */
        public static isPropertyReference(obj: string) {
            var propertyRegex = /^[A-Za-z_\-0-9]+:[A-Za-z_\-0-9]+\.[A-Za-z_\-0-9]+$/;
            return propertyRegex.test(obj);
        }

        /* Method to check if a property string is an object reference.
         *
         * This method checks if the string is of the form: <pluginName>:<name>
         */
        public static isObjectReference(obj: string) {
            var objectRegex = /^[A-Za-z_\-0-9]+:[A-Za-z_\-0-9]+$/;
            return objectRegex.test(obj);
        }

        /* Private method to check if a given argument follows the appropriate formatting detailed above.
         */
        private static checkArgument(argument: string, checkProperty?: boolean): void {
            var correct: boolean;

            if (checkProperty) {
                correct = Context.isPropertyReference(argument);
            } else {
                correct = Context.isPropertyReference(argument) || Context.isObjectReference(argument);
            }

            if (!correct) {
                throw new Error("Context: '" + argument + "' is not a properly formatted argument or path.");
            }
        }
    }
}
