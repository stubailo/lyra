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

/// <reference path="../../typings/chai.d.ts" />
/// <reference path="../../typings/chai-assert.d.ts" />
/// <reference path="../../typings/mocha.d.ts" />

/// <reference path="../../src/main.ts" />

module Lyra {
    class ListenableDictionaryWithDefaults extends ListenableDictionary {
        defaults() {
            return _(super.defaults()).extend({
                "x": 1,
                "y": 2
            });
        }
    }

    (function() {
        var assert = chai.assert;
        describe("Dependencies", function() {
            it("Underscore", function() {
                assert.ok(_);
            });

            it("d3", function() {
                assert.ok(d3);
            });
        });

        describe("Listenable Dictionary", function() {
            describe("Getting and setting attributes", function() {
                it("Can set and get one property", function() {
                    var dict: ListenableDictionary = new ListenableDictionary();

                    assert.equal(undefined, dict.get("key"));
                    dict.set("key", "value");
                    assert.equal("value", dict.get("key"));
                });

                it("Can set and get an object of properties", function() {
                    var dict: ListenableDictionary = new ListenableDictionary();

                    assert.equal(undefined, dict.get("key1"));
                    assert.equal(undefined, dict.get("key2"));
                    dict.set({
                        key1: "value1",
                        key2: "value2"
                    });
                    assert.equal("value1", dict.get("key1"));
                    assert.equal("value2", dict.get("key2"));
                });
            });

            describe("Extending with defaults", function() {
                it("Correctly sets defaults on itself", function() {
                    var dict = new ListenableDictionaryWithDefaults();

                    assert.equal(dict.get("x"), 1);
                    assert.equal(dict.get("y"), 2);
                });
            });

            describe("Triggering events", function() {
                it("Can trigger one event", function() {
                    var dict: ListenableDictionary = new ListenableDictionary();

                    var timesHandlerCalled = 0;
                    dict.on("event", () => {
                        timesHandlerCalled++;
                    });

                    dict.trigger("event");

                    assert.equal(1, timesHandlerCalled);

                    dict.trigger("notEvent");

                    // values were the same so no change event
                    assert.equal(1, timesHandlerCalled);

                    dict.trigger("event");

                    // now there is an actual change
                    assert.equal(2, timesHandlerCalled);
                });

                it("Can trigger multiple events", function() {
                    var dict: ListenableDictionary = new ListenableDictionary();

                    var timesHandlerCalled = 0;
                    dict.on("event", () => {
                        timesHandlerCalled++;
                    });

                    var timesHandler2Called = 0;
                    dict.on("event2", () => {
                        timesHandler2Called++;
                    });

                    dict.trigger("event notEvent2");

                    assert.equal(1, timesHandlerCalled);
                    assert.equal(0, timesHandler2Called);

                    dict.trigger("notEvent event2");

                    // values were the same so no change event
                    assert.equal(1, timesHandlerCalled);
                    assert.equal(1, timesHandler2Called);

                    dict.trigger(["event", "event2"]);

                    // now there is an actual change
                    assert.equal(2, timesHandlerCalled);
                    assert.equal(2, timesHandler2Called);
                });
            });

            describe("Firing change events", function() {
                it("Can fire change events", function() {
                    var dict: ListenableDictionary = new ListenableDictionary();

                    assert.equal(undefined, dict.get("key1"));
                    assert.equal(undefined, dict.get("key2"));

                    var timesHandlerCalled = 0;
                    dict.on("change", () => {
                        timesHandlerCalled++;
                    });

                    dict.set({
                        key1: "value1",
                        key2: "value2"
                    });

                    assert.equal(1, timesHandlerCalled);

                    dict.set({
                        key1: "value1",
                        key2: "value2"
                    });

                    // values were the same so no change event
                    assert.equal(1, timesHandlerCalled);

                    dict.set({
                        key1: "not value1",
                        key2: "not value2"
                    });

                    // now there is an actual change
                    assert.equal(2, timesHandlerCalled);
                });

                it("Can fire change events for individual properties", function() {
                    var dict: ListenableDictionary = new ListenableDictionary();

                    assert.equal(undefined, dict.get("key1"));
                    assert.equal(undefined, dict.get("key2"));

                    var timesHandlerCalled = 0;
                    dict.on("change:key1", () => {
                        timesHandlerCalled++;
                    });

                    dict.set({
                        key1: "value1",
                        key2: "value2"
                    });

                    assert.equal(1, timesHandlerCalled);

                    dict.set({
                        key1: "value1",
                        key2: "value2"
                    });

                    // values were the same so no change event
                    assert.equal(1, timesHandlerCalled);

                    dict.set({
                        key1: "not value1",
                        key2: "not value2"
                    });

                    // now there is an actual change
                    assert.equal(2, timesHandlerCalled);
                });

                it("Accepts listeners for multiple properties at once", function() {
                    var dict: ListenableDictionary = new ListenableDictionary();

                    assert.equal(undefined, dict.get("key1"));
                    assert.equal(undefined, dict.get("key2"));

                    var timesHandlerCalled = 0;
                    dict.on("change:key1 change:key2", () => {
                        timesHandlerCalled++;
                    });

                    dict.set({
                        key1: "value1",
                        key2: "value2"
                    });

                    assert.equal(1, timesHandlerCalled);

                    dict.set({
                        key1: "value1",
                        key2: "value2"
                    });

                    // values were the same so no change event
                    assert.equal(1, timesHandlerCalled);

                    dict.set({
                        key1: "not value1",
                        key2: "not value2"
                    });

                    // now there is an actual change
                    assert.equal(2, timesHandlerCalled);
                });
            });
        });

        describe("Context Node", function() {
            describe("Housekeeping", function() {
                it("Adds itself to the Context properly", function() {
                    var NAME_PROPERTY = "fred";
                    var NODE_CLASSNAME = "node";

                    var context: Context = new Context();
                    var node = new ContextModel({
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

                    var node1 = new ContextModel({
                        name: NAME_PROPERTY,
                        number: NUMBER_PROPERTY,
                        string: STRING_PROPERTY,
                        date: DATE_PROPERTY
                    }, context, NODE_CLASSNAME);

                    assert.equal(node1.getName(), NAME_PROPERTY);
                    assert.equal(node1.get("number"), NUMBER_PROPERTY);
                    assert.equal(node1.get("string"), STRING_PROPERTY);
                    assert.equal(node1.get("date"), DATE_PROPERTY);
                });

                it("Correctly parses object references", function() {
                    var context: Context = new Context();

                    var node1 = new ContextModel({
                        name: "node1",
                        prop: 3
                    }, context, "Node");

                    var node2 = new ContextModel({
                        name: "node2",
                        otherNode: "Node:node1"
                    }, context, "Node");

                    assert.equal(node1, node2.get("otherNode"));
                });

                it("Correctly parses and updates property references", function() {
                    var context: Context = new Context();

                    var node1 = new ContextModel({
                        name: "node1",
                        prop: 3
                    }, context, "Node");

                    var node2 = new ContextModel({
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
