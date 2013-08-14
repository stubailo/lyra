module Lyra {
    // Only one view per model please
    export class ContextView extends ContextNode {
        private model: ContextModel;
        private element: D3.Selection;
        private subViews: Object;

        constructor(model: ContextModel, element: D3.Selection, viewContext: Context) {
            this.model = model;
            this.element = element;

            this.subViews = {};
            _.each(this.model.getAttachmentPoints(), (attachmentPoint) => {
                this.subViews[attachmentPoint] = [];
            });

            super(model.getName(), viewContext, model.getClassName());

            this.load();
        }

        public get(key: string): any {
            if (super.get(key) !== undefined && super.get(key) !== null) {
                return super.get(key);
            } else {
                return this.model.get(key);
            }
        }
        public getModel(): ContextModel {
            return this.model;
        }

        public getElement(): D3.Selection {
            return this.element;
        }

        public getSubViews(): Object {
            return _.clone(this.subViews);
        }

        public addSubView(view: ContextView, attachmentPoint: string) {
            if (_.contains(this.model.getAttachmentPoints(), attachmentPoint)) {
                this.subViews[attachmentPoint].push(view);
            } else {
                throw new Error("Attachment point " + attachmentPoint + " doesn't exist on " + this.getClassName() + ".");
            }
        }

        public calculatedWidth(): number {
            throw new Error("View for " + this.getClassName() + " did not specify its width.");
        }

        public calculatedHeight(): number {
            throw new Error("View for " + this.getClassName() + " did not specify its height.");
        }

        public render(): void {
            // no-op
        }

        public load(): void {
            // no-op
        }
    }
}
