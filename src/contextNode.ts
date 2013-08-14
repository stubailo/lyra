module Lyra {

    /**
     * ContextNode is a generalized class that represents a node in the
     * model or view context.
     */
    export class ContextNode extends Backbone.Model {

        // Private references to the context, and name
        private _context: Context;
        private _name: string;
        private _className: string;

        /* Creates a ContextNode, setting up the name, context, and properties from the specification
         * passed to it.
         *
         * This method should not be overriden. Instead, override the load method to perform additional
         * operations before the contextNode is rendered.
         */
        constructor(name: string, context: Context, className: string) {
            super();

            // Setup instance variables
            this._name = name;
            this._context = context;
            this._className = className;

            // Save this ContextNode in the context
            this._context.set(className + ":" + this.name, this);
        }

        /* The behavior of load is set as a no-op, but can be overriden to add additional behavior.
         *
         * This method is called immediately after a ContextNode is constructed.
         */
        public load() {
            // NO-OP
        }

        public get name(): string {
            return this._name;
        }

        public get context(): Context {
            return this._context;
        }

        public get className(): string {
            return this._className;
        }
    }
}
