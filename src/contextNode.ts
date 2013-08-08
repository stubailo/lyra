/**
 * ContextNode is a generalized class that represents a node in the
 * model or view context.
 */
class ContextNode extends Backbone.Model {
    // Private references to the context, and name
    private _context: Context;
    private _name: string;
    private _className: string;
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
      return classType.parse(spec, context)
    });
    }

    /* Creates a ContextNode, setting up the name, context, and properties from the specification
     * passed to it.
     *
     * This method should not be overriden. Instead, override the load method to perform additional
     * operations before the contextNode is rendered.
     */
    constructor(spec: any, context: Context, className: string) {
        super();
        Backbone.Model.apply(this, arguments);

        // Setup instance variables
        this._name = spec["name"];
        this._context = context;
        this._className = className;

        // Save this ContextNode in the context
        this._context.set(className + ":" + this.name, this);

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
            var value = properties[key];

            if (ContextNode.isPropertyReference(value)) {
                var propertyFunction = this.context.getPropertyFunction(value);
                var updateProperty = ((currentKey) => {return () => {
                    this.set(currentKey, propertyFunction())
        }
                })(key);
                updateProperty()
        this.context.getNode(value).on("change", updateProperty)
      } else if (ContextNode.isObjectReference(value)) {
                console.log("object ref: " + value);
                ((currentKey) => {
                    this.set(currentKey, this.context.getNode(value));
                    this.get(currentKey).on("change", () => {
                        this.trigger("change");
                    });
                })(key);
            } else {
                this.set(key, value);
            }
        }
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
    /* Private method to check if a property string is a property reference.
     *
     * This method checks if the string is of the form: <className>:<name>.<property>
     */
    private static isPropertyReference(obj: string) {
        var propertyRegex = /^[A-Za-z_\-0-9]+:[A-Za-z_\-0-9]+\.[A-Za-z_\-0-9]+$/;
        return propertyRegex.test(obj);
    }

    /* Private method to check if a property string is an object reference.
     *
     * This method checks if the string is of the form: <className>:<name>
     */
    private static isObjectReference(obj: string) {
        var objectRegex = /^[A-Za-z_\-0-9]+:[A-Za-z_\-0-9]+$/;
        return objectRegex.test(obj);
    }

    public addSubViewModel(model: ContextNode, attachmentPoint: string) {
        if (_.contains(this.getAttachmentPoints(), attachmentPoint)) {
            this._subViewModels[attachmentPoint].push(model);
        } else {
            throw new Error("Attachment point " + attachmentPoint + " doesn't exist on " + this.className + ".");
        }
    }

    public get subViewModels(): Object {
        return this._subViewModels;
    }

    public getAttachmentPoints(): string[] {
        return [];
    }


}
