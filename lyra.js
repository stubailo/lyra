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
var Scale = (function (_super) {
    __extends(Scale, _super);
    function Scale(spec, context) {
        _super.call(this, spec["name"], context, Scale.className);
    }
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

    Scale.prototype.apply = function (input) {
        throw new Error("Apply method not overridden for scale.");
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

var MarkView = (function (_super) {
    __extends(MarkView, _super);
    function MarkView(mark, element, viewContext) {
        _super.call(this, mark.name, viewContext, MarkView.className);
        this._model = mark;
        this._element = element;

        var render = $.proxy(this.render, this);
        this._model.on(Mark.EVENT_CHANGE, render);
    }
    MarkView.prototype.render = function () {
        var properties = this._model.properties;
        this.markSelection.data(this._model.source.items).enter().append("circle");

        var props = [];
        for (var key in properties) {
            this.markSelection.attr(key, function (item) {
                return properties[key](item);
            });
        }

        this.trigger(MarkView.EVENT_RENDER);
    };

    Object.defineProperty(MarkView.prototype, "element", {
        get: function () {
            return this._element;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(MarkView.prototype, "markSelection", {
        get: function () {
            return this._element.selectAll("circle");
        },
        enumerable: true,
        configurable: true
    });
    MarkView.className = "MarkView";

    MarkView.EVENT_RENDER = "render";
    return MarkView;
})(ContextNode);
var Interaction = (function () {
    function Interaction(modelContext, viewContext) {
        this._modelContext = modelContext;
        this._viewContext = viewContext;
    }
    Interaction.parseAll = function (specList, modelContext, viewContext) {
        return _.map(specList, function (spec) {
            return Interaction.parse(spec, modelContext, viewContext);
        });
    };

    Interaction.parse = function (spec, modelContext, viewContext) {
        switch (spec["type"]) {
            case Interaction.TYPE_CLICK_PRINT:
                return new ClickPrintInteraction(spec, modelContext, viewContext);
            default:
                throw new Error("Unsupported interaction type: " + spec["type"]);
        }
        return null;
    };

    Object.defineProperty(Interaction.prototype, "modelContext", {
        get: function () {
            return this._modelContext;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Interaction.prototype, "viewContext", {
        get: function () {
            return this._viewContext;
        },
        enumerable: true,
        configurable: true
    });
    Interaction.className = "Interaction";

    Interaction.TYPE_CLICK_PRINT = "clickPrint";
    return Interaction;
})();

var ClickPrintInteraction = (function (_super) {
    __extends(ClickPrintInteraction, _super);
    function ClickPrintInteraction(spec, modelContext, viewContext) {
        _super.call(this, modelContext, viewContext);

        if (spec["mark"]) {
            this._markView = this.viewContext.getNode(MarkView.className, spec["mark"]);
        } else {
            throw new Error("No mark specified in ClickPrintInteraction.");
        }

        this.addEvents();
        this._markView.on(MarkView.EVENT_RENDER, $.proxy(this.addEvents, this));
    }
    ClickPrintInteraction.prototype.addEvents = function () {
        this._markView.markSelection.on("click", $.proxy(this.onClick, this));
    };

    ClickPrintInteraction.prototype.onClick = function (d, i) {
        console.log([d, i]);
    };
    return ClickPrintInteraction;
})(Interaction);
var LyraModel = (function () {
    function LyraModel(spec) {
        this._context = new Context();

        for (var key in spec) {
            var value = spec[key];
            var context = this.context;
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
        this._viewContext = new Context();
        this._model = new LyraModel(spec);

        this._element = element;

        this._svg = d3.select(this._element).append('svg:svg').attr('width', 400).attr('height', 300).attr('style', "border: 1px solid red");

        var createMarkView = function (mark) {
            var markView = new MarkView(mark, this._svg, this._viewContext);
            this._markViews.push(markView);
        };
        createMarkView = $.proxy(createMarkView, this);

        this._markViews = [];
        _.each(this.model.marks, createMarkView);

        for (var key in spec) {
            var value = spec[key];
            switch (key) {
                case "interactions":
                    this._interactions = Interaction.parseAll(value, this.model.context, this._viewContext);
                    break;
            }
        }

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
