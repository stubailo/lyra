module Lyra {
    // Only one view per model please
    export class ContextView extends ContextNode {
        private _model: ContextModel;
        private _element: D3.Selection;
        private _subViews: Object;

        constructor(model: ContextModel, element: D3.Selection, viewContext: Context) {
            this._model = model;
            this._element = element;

            this._subViews = {};
            _.each(this.model.getAttachmentPoints(), (attachmentPoint) => {
                this._subViews[attachmentPoint] = [];
            });

            super(model.name, viewContext, model.className);

            this.load();
        }

        public get(key: string): any {
            if (super.get(key) !== undefined && super.get(key) !== null) {
                return super.get(key);
            } else {
                return this._model.get(key);
            }
        }
        public get model(): ContextModel {
            return this._model;
        }

        public get element(): D3.Selection {
            return this._element;
        }

        public addSubView(view: ContextView, attachmentPoint: string) {
            if (_.contains(this.model.getAttachmentPoints(), attachmentPoint)) {
                this._subViews[attachmentPoint].push(view);
            } else {
                throw new Error("Attachment point " + attachmentPoint + " doesn't exist on " + this.className + ".");
            }
        }

        public get subViews(): Object {
            return this._subViews;
        }

        public calculatedWidth(): number {
            throw new Error("View for " + this.className + " did not specify its width.");
        }

        public calculatedHeight(): number {
            throw new Error("View for " + this.className + " did not specify its height.");
        }

        public render(): void {
            // no-op
        }

        public load(): void {
            // no-op
        }
    }
}
