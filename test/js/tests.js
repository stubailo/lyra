var ContextNode = (function () {
    function ContextNode(name, context, className) {
        this._name = name;
        this._context = context;
        this._dispatch = _.clone(Backbone.Events);
        this._context.set(className + ":" + name, this);
        this._dependencies = [];
    }
    ContextNode.prototype.trigger = function (eventName) {
        this._dispatch.trigger(eventName);
    };

    ContextNode.prototype.on = function (eventName, callback) {
        this._dispatch.on(eventName, callback);
    };

    Object.defineProperty(ContextNode.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(ContextNode.prototype, "context", {
        get: function () {
            return this._context;
        },
        enumerable: true,
        configurable: true
    });

    ContextNode.prototype.addDependency = function (node) {
        this._dependencies.push(node);
    };
    return ContextNode;
})();
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Context = (function (_super) {
    __extends(Context, _super);
    function Context() {
        _super.apply(this, arguments);
    }
    Context.prototype.getNode = function (className, nodeName) {
        return this.get(className + ":" + nodeName);
    };
    return Context;
})(Backbone.Model);
var Property = (function (_super) {
    __extends(Property, _super);
    function Property(name, context, _spec) {
        _super.call(this, name, context, Property.className);

        this.spec = _spec;
    }
    Object.defineProperty(Property.prototype, "spec", {
        get: function () {
            return this._spec;
        },
        set: function (newSpec) {
            if (newSpec !== this.spec) {
                this._spec = newSpec;
            }
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(Property.prototype, "val", {
        get: function () {
            return _.clone(this._val);
        },
        set: function (newVal) {
            this._val = _.clone(newVal);
            this.trigger("change");
        },
        enumerable: true,
        configurable: true
    });

    return Property;
})(ContextNode);
var DataSet = (function (_super) {
    __extends(DataSet, _super);
    function DataSet(name, context) {
        _super.call(this, name, context, DataSet.className);
    }
    Object.defineProperty(DataSet, "className", {
        get: function () {
            return DataSet._className;
        },
        enumerable: true,
        configurable: true
    });

    DataSet.parseAll = function (specList, context) {
        return _.map(specList, function (spec) {
            return DataSet.parse(spec, context);
        });
    };

    DataSet.parse = function (spec, context) {
        var dataSet = new DataSet(spec["name"], context);
        dataSet.items = spec["items"];
        return dataSet;
    };

    Object.defineProperty(DataSet.prototype, "items", {
        get: function () {
            return _.clone(this._items);
        },
        set: function (items) {
            this._items = _.clone(items);
            this.trigger("change");
        },
        enumerable: true,
        configurable: true
    });

    DataSet._className = "DataSet";
    return DataSet;
})(ContextNode);
var Transform = (function () {
    function Transform() {
    }
    Transform.prototype.apply = function (input, output) {
        throw new Error("The apply method of this transform was not overridden.");
    };

    Transform.parse = function (spec) {
        switch (spec["type"]) {
            case "max":
                return new MaxDataSetTransform(spec);
                break;
            default:
                throw new Error("Invalid Transform type: " + spec["type"]);
        }
    };
    return Transform;
})();

var MaxDataSetTransform = (function (_super) {
    __extends(MaxDataSetTransform, _super);
    function MaxDataSetTransform(spec) {
        _super.call(this);
        if (!(typeof (spec["parameter"]) == 'string')) {
            throw new Error("Missing parameter to maximize for max transform.");
        }

        this._parameterToMax = spec["parameter"];
    }
    MaxDataSetTransform.prototype.apply = function (input, output) {
        var outputValue = 0;
        var parameterToMax = this._parameterToMax;
        var maxItem = _.max(input.items, function (item) {
            return item[parameterToMax];
        });

        outputValue = maxItem[this._parameterToMax];

        output.val = outputValue;
    };
    return MaxDataSetTransform;
})(Transform);
var Scale = (function (_super) {
    __extends(Scale, _super);
    function Scale(spec, context) {
        _super.call(this, spec["name"], context, Scale.className);
    }
    Scale.prototype.apply = function (input) {
        throw new Error("Apply method not overridden for scale.");
    };

    Object.defineProperty(Scale, "className", {
        get: function () {
            return Scale._className;
        },
        enumerable: true,
        configurable: true
    });

    Scale.parseAll = function (specList, context) {
        return _.map(specList, function (spec) {
            return Scale.parse(spec, context);
        });
    };

    Scale.parse = function (spec, context) {
        var newScale;

        switch (spec["type"]) {
            case "linear":
                newScale = new LinearScale(spec, context);
                break;
            default:
                throw new Error("Invalid Scale type: " + spec["type"]);
        }

        return newScale;
    };
    Scale._className = "Scale";
    return Scale;
})(ContextNode);

var LinearScale = (function (_super) {
    __extends(LinearScale, _super);
    function LinearScale(spec, context) {
        _super.call(this, spec, context);

        this._scale = d3.scale.linear().domain(spec["domain"]).range(spec["range"]);
    }
    LinearScale.prototype.apply = function (input) {
        return this._scale(input);
    };
    return LinearScale;
})(Scale);
var Mark = (function (_super) {
    __extends(Mark, _super);
    function Mark(spec, context) {
        _super.call(this, spec["name"], context, Mark.className);

        this._properties = {};
        this.parseProperties(spec["properties"]);

        this._source = context.getNode(DataSet.className, spec["source"]);
        this.addDependency(this._source);
        this._source.on("change", $.proxy(this.dataSetChanged, this));
        this.dataSetChanged();
    }
    Mark.parseAll = function (specList, context) {
        return _.map(specList, function (spec) {
            return Mark.parse(spec, context);
        });
    };

    Mark.parse = function (spec, context) {
        switch (spec["type"]) {
            case "symbol":
                return new Mark(spec, context);
                break;
            default:
                throw new Error("Unsupported mark type: " + spec["type"]);
        }
    };

    Mark.prototype.parseProperty = function (name, spec) {
        if (this._properties[name]) {
            throw new Error("Duplicate property in mark specification: " + name);
        }

        var scale;

        if (spec["scale"]) {
            scale = this.context.getNode(Scale.className, spec["scale"]);
        } else {
            scale = { apply: function (x) {
                    return x;
                }, on: function () {
                } };
        }

        this.addDependency(scale);

        scale.on("change", $.proxy(this.dataSetChanged, this));

        if (typeof (spec["value"]) === "string") {
            this._properties[name] = function (dataItem) {
                return scale.apply(dataItem[spec["value"]]);
            };
        } else {
            this._properties[name] = function (dataItem) {
                return scale.apply(spec["value"]);
            };
        }
    };

    Mark.prototype.parseProperties = function (properties) {
        for (var key in properties) {
            this.parseProperty(key, properties[key]);
        }
    };

    Mark.prototype.dataSetChanged = function () {
        this.render();
    };

    Mark.prototype.render = function () {
        SymbolMark.render(null, this._properties, this._source);
    };
    Mark.className = "Mark";
    return Mark;
})(ContextNode);

var SymbolMark = (function () {
    function SymbolMark() {
    }
    SymbolMark.render = function (drawArea, properties, source) {
        _.each(source.items, function (item) {
            console.log(["x", properties["x"](item), "y", properties["y"](item), "size", properties["size"](item)]);
        });
    };
    return SymbolMark;
})();
var Lyra = (function () {
    function Lyra(spec) {
        this._context = new Context();

        for (var key in spec) {
            var value = spec[key];
            var context = this._context;
            switch (key) {
                case "data":
                    this._dataSets = DataSet.parseAll(value, context);
                    break;
                case "scales":
                    this._scales = Scale.parseAll(value, context);
                    break;
                case "marks":
                    this._marks = Mark.parseAll(value, context);
                    break;
                default:
                    throw new Error("Unsupported Lyra spec section: " + key);
            }
        }
    }
    Object.defineProperty(Lyra.prototype, "context", {
        get: function () {
            return this._context;
        },
        enumerable: true,
        configurable: true
    });
    return Lyra;
})();
(function () {
    var assert = chai.assert;
    describe("Dependencies", function () {
        it('Underscore', function () {
            assert.ok(_);
        });

        it('Backbone', function () {
            assert.ok(Backbone);
        });

        it('d3', function () {
            assert.ok(d3);
        });

        it('Q', function () {
            assert.ok(Q);
        });
    });

    describe("Property", function () {
        var context = new Context();
        it('Can be constructed', function () {
            var value = new Property(context);
        });
    });

    describe("Transform", function () {
        it("Correctly identifies and runs max data set transform", function () {
            var transform = Transform.parse({ "type": "max", "parameter": "x" });
            var dataSet = DataSet.parse({
                name: "test",
                items: [{ "x": 1 }, { "x": 3 }]
            });
            var maxProperty = new Property();

            transform.apply(dataSet, maxProperty);

            assert.equal(maxProperty.val, 3);
        });
    });

    describe("Scale", function () {
        it("Correctly identifies and applies linear scale", function () {
            var scale = Scale.parse({ "type": "linear", "domain": [0, 5], "range": [0, 100] });

            assert.equal(scale.apply(0), 0);
            assert.equal(scale.apply(1), 20);
            assert.equal(scale.apply(5), 100);
        });
    });
})();
