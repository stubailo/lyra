/// <reference path="../../typings/chai.d.ts" />
/// <reference path="../../typings/chai-assert.d.ts" />
/// <reference path="../../typings/mocha.d.ts" />

/// <reference path="../../src/main.ts" />

module Lyra {
    (function() {
        var assert = chai.assert;
        describe("Dependencies", function() {
            it("Underscore", function() {
                assert.ok(_);
            });

            it("Backbone", function() {
                assert.ok(Backbone);
            });

            it("d3", function() {
                assert.ok(d3);
            });

            it("Q", function() {
                assert.ok(Q);
            });
        });

        describe("Property Events", function() {
            it("Correctly fires events", function() {
                var context: Context = new Context();

                var node1 = new ContextNode({
                    name: "node1",
                    prop: 3
                }, context, "Node");

                var node2 = new ContextNode({
                    name: "node2",
                    prop: "Node:node1.prop"
                }, context, "Node");

                assert.equal(node1.get("prop"), node2.get("prop"));

                node1.set("prop", 4);

                assert.equal(node1.get("prop"), node2.get("prop"));
            });
        });
    })();
}
