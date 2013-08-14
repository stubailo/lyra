module Lyra {

    /**
     * ContextNode is a generalized class that represents a node in the
     * model or view context.
     */
    export class ContextNode extends Backbone.Model {

        // Private references to the context, and name
        private context: Context;
        private name: string;
        private className: string;

        /* Creates a ContextNode, setting up the name, context, and properties from the specification
         * passed to it.
         *
         * This method should not be overriden. Instead, override the load method to perform additional
         * operations before the contextNode is rendered.
         */
        constructor(name: string, context: Context, className: string) {
            super();

            // Setup instance variables
            this.name = name;
            this.context = context;
            this.className = className;

            // Save this ContextNode in the context
            this.context.set(className + ":" + this.name, this);
        }

        public getName(): string {
            return this.name;
        }

        public getContext(): Context {
            return this.context;
        }

        public getClassName(): string {
            return this.className;
        }
    }
}
