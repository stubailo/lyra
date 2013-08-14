module Lyra {

    /**
     * ContextNode is a generalized class that represents a node in the
     * model or view context.
     */
    export class ContextModel extends ContextNode {
        private static SPEC_NAME_KEY: string = "name";

        private _subViewModels: Object;

        public defaults() {
            return {};
        }

        /* Utility method that returns an array of ContextNodes of a certain type.
         *
         * @param specList A list of specifications that will be passed to each new node
         * @param context The universal context
         * @param classType A class (should be extending ContextNode) that will be created
         * @return An array of ContextNodes of type classtype
         */
        public static parseAll(specList: any[], context: Context, classType: any): any[] {
            return _.map(specList, function(spec) {
                return classType.parse(spec, context);
            });
        }

        /* Creates a ContextNode, setting up the name, context, and properties from the specification
         * passed to it.
         *
         * This method should not be overriden. Instead, override the load method to perform additional
         * operations before the contextNode is rendered.
         */
        constructor(spec: any, context: Context, className: string) {
            super(spec[ContextModel.SPEC_NAME_KEY], context, className);

            this._subViewModels = {};
            _.each(this.getAttachmentPoints(), (attachmentPoint) => {
                this._subViewModels[attachmentPoint] = [];
            });

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
        public parseProperties(properties: any): void {
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



        public addSubViewModel(model: ContextNode, attachmentPoint: string) {
            if (_.contains(this.getAttachmentPoints(), attachmentPoint)) {
                this._subViewModels[attachmentPoint].push(model);
            } else {
                throw new Error("Attachment point " + attachmentPoint + " doesn't exist on " + this.getClassName() + ".");
            }
        }

        public get subViewModels(): Object {
            return this._subViewModels;
        }

        public getAttachmentPoints(): string[] {
            return [];
        }
    }
}
