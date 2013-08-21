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
    // Only one view per model please
    export class ContextView extends ContextNode {
        public static WIDTH_KEY = "ContextViewWidth";
        public static HEIGHT_KEY = "ContextViewHeight";
        public static WIDTH_CHANGE = "change:ContextViewWidth";
        public static HEIGHT_CHANGE = "change:ContextViewHeight";

        public static LAYOUT_CHANGE = "ContextViewLayoutChange";

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
                console.log(view);
                view.on(ContextView.WIDTH_CHANGE + " " + ContextView.HEIGHT_CHANGE, () => {
                    this.trigger(ContextView.LAYOUT_CHANGE);
                });
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
