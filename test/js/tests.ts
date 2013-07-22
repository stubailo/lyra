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

  describe("Scale", function() {
    it("Correctly identifies and applies linear scale", function() {
      var scale: Scale = Scale.parse({"type": "linear", "domain": [0,5], "range": [0, 100]}, new Context());

      assert.equal(scale.apply(0), 0);
      assert.equal(scale.apply(1), 20);
      assert.equal(scale.apply(5), 100);
    });
  });
})();

