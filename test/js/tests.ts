/// <reference path="../../defs/chai.d.ts" />
/// <reference path="../../defs/chai-assert.d.ts" />
/// <reference path="../../defs/mocha.d.ts" />

/// <reference path="../../src/main.ts" />

(function(){
  var assert = chai.assert;
  describe("Dependencies", function() {
    it('Underscore', function() {
      assert.ok(_);
    });

    it('Backbone', function() {
      assert.ok(Backbone);
    });

    it('d3', function() {
      assert.ok(d3);
    });

    it('Q', function() {
      assert.ok(Q);
    });
  });

  describe("Property", function() {
    var context = new Backbone.Model();
    it('Can be constructed', function() {
      var value = new Property(context)
    });
  });

  describe("Transform", function() {
    it("Correctly identifies and runs max data set transform", function() {
      var transform: MaxDataSetTransform = Transform.parse({"type": "max", "parameter": "x"});
      var dataSet: DataSet = DataSet.parse({
        name: "test",
        items: [{"x": 1}, {"x": 3}]
      });
      var maxProperty: Property = new Property();

      transform.apply(dataSet, maxProperty);

      assert.equal(maxProperty.val, 3);
    });
  });

  describe("Scale", function() {
    it("Correctly identifies and applies linear scale", function() {
      var scale: Scale = Scale.parse({"type": "linear", "domain": [0,5], "range": [0, 100]});

      assert.equal(scale.apply(0), 0);
      assert.equal(scale.apply(1), 20);
      assert.equal(scale.apply(5), 100);
    });
  });
})();

