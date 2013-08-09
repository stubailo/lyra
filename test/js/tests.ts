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

        describe("Context Node", function() {
            describe("Housekeeping", function() {
                it("Adds itself to the Context properly", function() {
                    var NAME_PROPERTY = "fred";
                    var NODE_CLASSNAME = "node";

                    var context: Context = new Context();
                    var node = new ContextNode({
                        name: NAME_PROPERTY
                    }, context, NODE_CLASSNAME);

                    assert.equal(node, context.getNode(NODE_CLASSNAME, NAME_PROPERTY));
                });
            });

            describe("Parsing properties", function() {
                it("Correctly parses plain spec properties", function() {
                    var context: Context = new Context();

                    var NODE_CLASSNAME = "node";
                    var NAME_PROPERTY = "node1";
                    var NUMBER_PROPERTY = 3;
                    var STRING_PROPERTY = "string";
                    var DATE_PROPERTY = new Date();

                    var node1 = new ContextNode({
                        name: NAME_PROPERTY,
                        number: NUMBER_PROPERTY,
                        string: STRING_PROPERTY,
                        date: DATE_PROPERTY
                    }, context, NODE_CLASSNAME);

                    assert.equal(node1.name, NAME_PROPERTY);
                    assert.equal(node1.get("number"), NUMBER_PROPERTY);
                    assert.equal(node1.get("string"), STRING_PROPERTY);
                    assert.equal(node1.get("date"), DATE_PROPERTY);
                });

                it("Correctly parses object references", function() {
                    var context: Context = new Context();

                    var node1 = new ContextNode({
                        name: "node1",
                        prop: 3
                    }, context, "Node");

                    var node2 = new ContextNode({
                        name: "node2",
                        otherNode: "Node:node1"
                    }, context, "Node");

                    assert.equal(node1, node2.get("otherNode"));
                });

                it("Correctly parses and updates property references", function() {
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
        });
    })();
}
