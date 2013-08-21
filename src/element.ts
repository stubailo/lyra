module Lyra {
    export class Element extends Backbone.Model {
        private selection: D3.Selection;

        constructor(selection: D3.Selection) {
            super();
            this.selection = selection;
        }

        public getSelection(): D3.Selection {
            return this.selection;
        }
    }
}
