module Lyra {
    export class Element {
        private element: D3.Selection;

        constructor(element: D3.Selection) {
            this.element = element;
        }

        public getElement(): D3.Selection {
            return this.element;
        }
    }
}
