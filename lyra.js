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
        var result = this.get(className + ":" + nodeName);
        if (result) {
            return result;
        } else {
            throw new Error("No " + className + " with name " + nodeName + " exists.");
        }
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
            this.trigger(DataSet.EVENT_CHANGE);
        },
        enumerable: true,
        configurable: true
    });

    DataSet._className = "DataSet";

    DataSet.EVENT_CHANGE = "change";
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

    Scale.EVENT_CHANGE = "change";
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

var IdentityScale = (function (_super) {
    __extends(IdentityScale, _super);
    function IdentityScale(spec, context) {
        _super.call(this, spec, context);
    }
    IdentityScale.prototype.apply = function (input) {
        return input;
    };
    return IdentityScale;
})(Scale);
var Mark = (function (_super) {
    __extends(Mark, _super);
    function Mark(spec, context) {
        _super.call(this, spec["name"], context, Mark.className);

        this._properties = {};
        this.parseProperties(spec["properties"]);

        this._source = context.getNode(DataSet.className, spec["source"]);
        this.addDependency(this._source);
        this._source.on(DataSet.EVENT_CHANGE, $.proxy(this.dataSetChanged, this));
        this.dataSetChanged();
    }
    Mark.parseAll = function (specList, context) {
        return _.map(specList, function (spec) {
            return Mark.parse(spec, context);
        });
    };

    Mark.parse = function (spec, context) {
        switch (spec["type"]) {
            case Mark.TYPE_SYMBOL:
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
            scale = new IdentityScale({}, new Context());
        }

        this.addDependency(scale);

        scale.on(Scale.EVENT_CHANGE, $.proxy(this.dataSetChanged, this));

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
        this.trigger(Mark.EVENT_CHANGE);
    };

    Object.defineProperty(Mark.prototype, "properties", {
        get: function () {
            return this._properties;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Mark.prototype, "source", {
        get: function () {
            return this._source;
        },
        enumerable: true,
        configurable: true
    });
    Mark.className = "Mark";

    Mark.TYPE_SYMBOL = "symbol";

    Mark.EVENT_CHANGE = "change";
    return Mark;
})(ContextNode);

var MarkView = (function () {
    function MarkView(mark, element) {
        this._model = mark;
        this._element = element;

        var render = $.proxy(this.render, this);
        this._model.on(Mark.EVENT_CHANGE, render);
    }
    MarkView.prototype.render = function () {
        var properties = this._model.properties;
        var singleMark = this._element.selectAll("circle").data(this._model.source.items).enter().append("circle");

        var props = [];
        for (var key in properties) {
            singleMark.attr(key, function (item) {
                return properties[key](item);
            });
        }
    };
    return MarkView;
})();
var LyraSVG = (function () {
    function LyraSVG(model, element) {
        this.model = model;
        this.element = element;
    }
    LyraSVG.prototype.render = function () {
        console.log("rendering in SVG not implemented...");
    };
    return LyraSVG;
})();
var LyraModel = (function () {
    function LyraModel(spec) {
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
    Object.defineProperty(LyraModel.prototype, "marks", {
        get: function () {
            return this._marks;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(LyraModel.prototype, "context", {
        get: function () {
            return this._context;
        },
        enumerable: true,
        configurable: true
    });
    return LyraModel;
})();

var Lyra = (function () {
    function Lyra(spec, element) {
        this._element = element;

        this._svg = d3.select(this._element).append('svg:svg').attr('width', 400).attr('height', 300);

        this._model = new LyraModel(spec);
        console.log(this._model);

        var createMarkView = function (mark) {
            var markView = new MarkView(mark, this._svg);
            this._markViews.push(markView);
        };
        createMarkView = $.proxy(createMarkView, this);

        this._markViews = [];
        _.each(this.model.marks, createMarkView);

        this.render();
    }
    Object.defineProperty(Lyra.prototype, "model", {
        get: function () {
            return this._model;
        },
        enumerable: true,
        configurable: true
    });

    Lyra.prototype.render = function () {
        _.each(this._markViews, function (markView) {
            markView.render();
        });
    };
    return Lyra;
})();
