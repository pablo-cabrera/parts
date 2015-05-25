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

    ("args should return a function that when called, passes all the " +
            "arguments to the given function as an array and maintains the " +
            "this value and returns the returned value from the inner function",
    function () {
        var myArgs = [{}, {}, {}];
        var myThis = {};
        var myReturn = {};

        var f = parts.args(function (args) {
            assert.areSame(myThis, this);

            assert.isArray(args);
            assert.areSame(3, args.length);
            parts.forEach(args, function (a, i) {
                assert.areSame(a, myArgs[i]);
            });

            return myReturn;
        });

        assert.areSame(f.apply(myThis, myArgs), myReturn);
    })

    ("constant should return a function that always yeld the same value",
    function () {
        var v = {};
        var k = parts.constant(v);
        assert.isFunction(k);
        assert.areSame(v, k());
    })

    ("first should iterate through an array and return the value " +
            "of the first ocurrence found",
    function () {
        var arr = [1, 2, 3];

        assert.areSame(2, parts.first(arr, parts.sameAs(2)));
    })

    ("first should iterate through an object and return the value " +
            "of the first ocurrence found",
    function () {
        var obj = {
            a: 1,
            b: 2,
            c: 3
        };

        assert.areSame(2, parts.first(obj, parts.sameAs(2)));
    })

    ("forEach should iterate through the values of an array passing the " +
            "value and the index",
    function () {
        var arr = [1, 2, 3];
        var iterations = [];

        parts.forEach(arr, function (v, i) {
            iterations.push({
                value: v,
                index: i
            });
        });

        assert.areSame(3, iterations.length);

        var i0 = iterations[0];
        assert.areSame(i0.value, arr[i0.index]);

        var i1 = iterations[1];
        assert.areSame(i1.value, arr[i1.index]);

        var i2 = iterations[2];
        assert.areSame(i2.value, arr[i2.index]);

        assert.areSame(6, i0.value + i1.value + i2.value);
    })

    ("hop should tell if an object owns a property", function () {
        var o = { a: null };

        assert.isTrue(parts.hop(o, "a"));
    })

    ("hop should yield false if the property is from the prototype chain",
    function () {
        var F = function () {};
        F.prototype.a = null;
        var o = new F();

        assert.isFalse(parts.hop(o, "a"));
    })

    ("how should yield false if the object doensn't have the property",
    function () {
        var o = {};

        assert.isFalse(parts.hop(o, "a"));
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
