(function (node) {
    "use strict";

    var main;
    var gabarito;
    var parts;
    if (node) {
        main = global;
        gabarito = require("gabarito");
        parts = require("../../lib/parts");
    } else {
        main = window;
        gabarito = main.gabarito;
        parts = main.parts;
    }

    var assert = gabarito.assert;

    gabarito.add(parts.make()
    ("name", "parts-test")

    ("constant should return a function that always yeld the same value",
    function () {
        var v = {};
        var k = parts.constant(v);
        assert.isFunction(k);
        assert.areSame(v, k());
    })

    ("k should be a function that returns undefined", function () {
        assert.isFunction(parts.k);
        assert.isUndefined(parts.k());
    })

    ("args function should pass the arguments collection as an array to the " +
            "passed function as its first parameter",

    function () {
        var a = [1, 2, 3];
        var t = {};
        var f = parts.args(function (args) {
            assert.areSame(3, args.length);
            parts.forEach(args, function (v, i) {
                assert.areSame(a[i], v);
            });
            assert.areSame(t, this);
        });

        f.apply(t, a);
    })

    ("work should execute the function on the next tick", function () {
        parts.work(gabarito.going());
        gabarito.stay();
    })

    ("hop should tell if the object has a given proeprty", function () {
        var o = { a: undefined };

        assert.isTrue(parts.hop(o, "a"));
    })

    ("hop shouldn't tell that a given property is not from the object himself",
    function () {
        var F = function () {};
        F.prototype.a = undefined;
        var o = new F();

        assert.isFalse(parts.hop(o, "a"));
    })

    ("merge should copy all the properties from a source object to a target " +
            "object",
    function () {
        var s = {a: {}};
        var t = {};

        parts.merge(t, s);
        assert.areSame(t.a, s.a);
    })

    ("dummy", undefined).build());

}(typeof exports !== "undefined" && global.exports !== exports));
