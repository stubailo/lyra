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
    // HACKHACK: Why?
    // HACKHACK: ContextView.createView needs to be somehow fixed
    export class ContextView extends ContextNode {

        public static LAYOUT_CHANGE = "ContextViewLayoutChange";

        private model: ContextModel;
        private element: Element;
        private attachedElements: {[attachmentPoint: string]: Element[]};

        constructor(model: ContextModel, element: Element, viewContext: Context) {
            this.model = model;
            this.element = element;

            this.attachedElements = {};
            _.each(this.getAttachmentPoints(), (attachmentPoint) => {
                this.attachedElements[attachmentPoint] = [];
            });

            super(model.getName(), model.getPluginName(), viewContext);

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

        public getElement(): Element {
            return this.element;
        }

        public getSelection(): D3.Selection {
            return this.element.getSelection();
        }

        public getAttachedElements(): Object {
            return _.clone(this.attachedElements);
        }

        public getAttachmentPoints(): string[] {
            return [];
        }

        public getElementForAttachmentPoint(attachmentPoint: string): Element {
            throw new Error("This element doesn't have any attachment points.");
        }

        public registerAttachedElement(element: Element, attachmentPoint: string) {
            if (_.contains(this.getAttachmentPoints(), attachmentPoint)) {
                this.attachedElements[attachmentPoint].push(element);
                element.on("change:requestedWidth change:requestedHeight", () => {
                    this.trigger(ContextView.LAYOUT_CHANGE);
                });
            } else {
                throw new Error("Attachment point " + attachmentPoint + " doesn't exist on " + this.getPluginName() + ".");
            }
        }

        public render(): void {
            // no-op
        }

        public load(): void {
            // no-op
        }
    }
}
