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

    gabarito.test("parts").

    clause(
    "args should return a function that when called, passes all the " +
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
    }).

    clause("constant should return a function that always yeld the same value",
    function () {
        var v = {};
        var k = parts.constant(v);
        assert.isFunction(k);
        assert.areSame(v, k());
    }).

    clause("first should iterate through an array and return the value " +
            "of the first ocurrence found",
    function () {
        var arr = [1, 2, 3];

        assert.areSame(2, parts.first(arr, parts.sameAs(2)));
    }).

    clause("first should iterate through an object and return the value " +
            "of the first ocurrence found",
    function () {
        var obj = {
            a: 1,
            b: 2,
            c: 3
        };

        assert.areSame(2, parts.first(obj, parts.sameAs(2)));
    }).

    clause(
    "forEach should iterate through the values of an array passing the " +
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
    }).

    clause("hop should tell if an object owns a property", function () {
        var o = { a: null };

        assert.isTrue(parts.hop(o, "a"));
    }).

    clause("hop should yield false if the property is from the prototype chain",
    function () {
        var F = function () {};
        F.prototype.a = null;
        var o = new F();

        assert.isFalse(parts.hop(o, "a"));
    }).

    clause("how should yield false if the object doensn't have the property",
    function () {
        var o = {};

        assert.isFalse(parts.hop(o, "a"));
    }).

    clause("k should be a function that returns undefined", function () {
        assert.isFunction(parts.k);
        assert.isUndefined(parts.k());
    }).

    clause(
    "args function should pass the arguments collection as an array to the " +
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
    }).

    clause("work should execute the function on the next tick", function (ctx) {
        parts.work(ctx.going());
        ctx.stay();
    }).

    clause("hop should tell if the object has a given proeprty", function () {
        var o = { a: undefined };

        assert.isTrue(parts.hop(o, "a"));
    }).

    clause(
    "hop shouldn't tell that a given property is not from the object himself",
    function () {
        var F = function () {};
        F.prototype.a = undefined;
        var o = new F();

        assert.isFalse(parts.hop(o, "a"));
    }).

    clause(
    "indexOf should iterate through all the indexes of an array looking " +
            "for an occurrence",

    function () {
        var arr = [1, 2, 3];
        var iterations = [];
        parts.indexOf(arr, function (v, k) {
            iterations.push({
                v: v,
                k: k
            });

            return false;
        });

        assert.areSame(iterations.length, 3);

        parts.forEach(iterations, function (v, k) {
            assert.areSame(v.v, arr[k]);
            assert.areSame(v.k, k);
        });
    }).

    clause(
    "indexOf should iterate through all the indexes of an object looking " +
            "for an occurrence",

    function () {
        var obj = {
            a: 1,
            b: 2,
            c: 3
        };

        var iterations = {};

        parts.indexOf(obj, function (v, k) {
            iterations[k] = v;
            return false;
        });

        assert.areEqual(obj, iterations);
    }).

    clause("indexOf should return undefined in case no occurrence is found",
    function () {
        var arr = [];
        var index = parts.indexOf(arr, parts.constant(false));

        assert.isUndefined(index);
    }).

    clause(
    "indexOf should return the index of the first occurrence within the " +
            "array when found",
    function () {
        var arr = [1, 2, 3];

        var index = parts.indexOf(arr, function (v) {
            return v > 1;
        });

        assert.areSame(index, 1);
    }).

    clause(
    "indexOf should return the index of the first occurrence within the " +
            "object when found",
    function () {
        var obj = {
            a: 1,
            b: 2,
            c: 3
        };

        var index = parts.indexOf(obj, function (v) {
            return v === 2;
        });

        assert.areSame(index, "b");
    }).

    clause(
    "merge should copy all the properties from a source object to a target " +
            "object",
    function () {
        var s = {a: {}};
        var t = {};

        parts.merge(t, s);
        assert.areSame(t.a, s.a);
    }).

    clause("format should replace the placeholder with the value", function () {
        assert.that(parts.format("The number is %s", [1])).
            isEqualTo("The number is 1");
    }).

    clause("format should replace the placeholder with the dumped value",
    function () {
        assert.that(parts.format("The value is $s", [1])).
            isEqualTo("The value is <n: 1>");
    }).

    clause("format should replace the placeholders with the values",
    function () {
        assert.that(parts.format("The numbers are %s, %s and %s", [1, 2, 3])).
           isEqualTo("The numbers are 1, 2 and 3");
    }).

    clause(
    "format should replace the placeholders with the values given their " +
    "positions",
    function () {
        assert.that(parts.format(
               "The 3rd number is %3, the 2nd is %2 and the 1st is %1",
               [1, 2, 3])).
           isEqualTo("The 3rd number is 3, the 2nd is 2 and the 1st is 1");
    }).

    clause(
    "format should replace the placeholder with the given value given its " +
    "position and replace the placeholder with the dumped value given its " +
    "position",
    function () {
        assert.that(parts.format(
                "The 2nd value is $2 and the 1st number is %1",
                [1, 2])).
            isEqualTo("The 2nd value is <n: 2> and the 1st number is 1");
    }).

    clause("format should accept mixed placeholder configurations",
    function () {
        assert.that(parts.format(
               "Mixed placeholders $s, %s, $4, %3", [1, 2, 3, 4])).
           isEqualTo("Mixed placeholders <n: 1>, 2, <n: 4>, 3");
    }).

    clause("dump should return [] for an empty array", function () {
        assert.that(parts.dump([])).isEqualTo("<0:a: []>");
    }).

    clause("dump should dump all the items within the array", function () {
        var d = new Date();

        var a = [
           true,
           1,
           "msg",
           null,
           undefined,
           1 / "a",
           d,
           parts.k,
           {},
           []
        ];

        var expected =
            "<0:a: [\n" +
            "  " + parts.dump(a[0]) + ",\n" +
            "  " + parts.dump(a[1]) + ",\n" +
            "  " + parts.dump(a[2]) + ",\n" +
            "  " + parts.dump(a[3]) + ",\n" +
            "  " + parts.dump(a[4]) + ",\n" +
            "  " + parts.dump(a[5]) + ",\n" +
            "  <1:d: " + d.toString() + ">,\n" +
            "  <2:f: " + parts.k.toString() + ">,\n" +
            "  <3:o: {}>,\n" +
            "  <4:a: []>\n" +
            "]>";

        assert.that(parts.dump(a)).isEqualTo(expected);
    }).

    clause("dump should indicate circular references within the array",
    function () {
        var a = [];
        a.push(a);

        var expected =
            "<0:a: [\n" +
            "  <0:ref>\n" +
            "]>";

        assert.that(parts.dump(a)).isEqualTo(expected);
    }).

    clause("dump should return {} for an empty object", function () {
        assert.that(parts.dump({})).isEqualTo("<0:o: {}>");
    }).

    clause("dump should dump all the items within the array", function () {
        var d = new Date();

        var o = {
            b: true,
            n: 1,
            s: "msg",
            nil: null,
            undef: undefined,
            nan: 1 / "a",
            d: d,
            f: parts.k,
            o: {},
            a: []
        };

        var expectedDumps = [
            "  \"b\": " + parts.dump(o.b) + ",",
            "  \"n\": " + parts.dump(o.n) + ",",
            "  \"s\": " + parts.dump(o.s) + ",",
            "  \"nil\": " + parts.dump(o.nil) + ",",
            "  \"undef\": " + parts.dump(o.undef) + ",",
            "  \"nan\": " + parts.dump(o.nan) + ","
        ];

        var oDump = parts.dump(o);

        var lines = oDump.split("\n");
        assert.that(lines.shift()).isEqualTo("<0:o: {");
        assert.that(lines.pop()).isEqualTo("}>");
        assert.that(lines.length).isEqualTo(10);

        // adds comma to the last line so every line has a comma at the end
        lines[9] += ",";

        parts.forEach(expectedDumps, function (msg) {
            assert.areNotSame(parts.indexOf(lines, parts.sameAs(msg)),
               undefined);
        });

        var dateLine = parts.first(lines, function (l) {
            return l.substr(0, 4) === "  \"d";
        });

        assert.that(dateLine).
            isEqualTo(
                "  \"d\": " + parts.dump(d).replace("0", dateLine.charAt(8)) +
                ",");

        var functionLine = parts.first(lines, function (l) {
            return l.substr(0, 4) === "  \"f";
        });

        assert.that(functionLine).
            isEqualTo(
                "  \"f\": " +
                parts.dump(parts.k).replace("0", functionLine.charAt(8)) +
                ",");

        var objectLine = parts.first(lines, function (l) {
            return l.substr(0, 4) === "  \"o";
        });

        assert.that(objectLine).
            isEqualTo(
                "  \"o\": " +
                parts.dump(o.o).replace("0", objectLine.charAt(8)) +
                ",");

        var arrayLine = parts.first(lines, function (l) {
            return l.substr(0, 4) === "  \"a";
        });

        assert.that(arrayLine).
            isEqualTo(
                "  \"a\": " +
                parts.dump(o.a).replace("0", arrayLine.charAt(8)) +
                ",");

    }).

    clause("dump should indicate circular references within the object",
    function () {
        var o = {};
        o.o = o;

        var expected =
            "<0:o: {\n" +
            "  \"o\": <0:ref>\n" +
            "}>";

        assert.that(parts.dump(o)).isEqualTo(expected);
    }).

    clause("dump should indent nested arrays with 2 spaces", function () {
        var a = [];
        var a2 = [a, 2];
        var a3 = [a2, 3];
        a.push(a3, 1);

        var expected =
            "<0:a: [\n" +
            "  <1:a: [\n" +
            "    <2:a: [\n" +
            "      <0:ref>,\n" +
            "      <n: 1>\n" +
            "    ]>,\n" +
            "    <n: 2>\n" +
            "  ]>,\n" +
            "  <n: 3>\n" +
            "]>";

        assert.that(parts.dump(a3)).isEqualTo(expected);
    }).

    clause("dump should indent nested objects with 2 spaces", function () {
        var o = {};
        var o2 = {
            o: o,
            n: 2
        };

        var o3 = {
            o: o2,
            n: 3
        };

        o.o = o3;
        o.n = 1;

        var expected =
            "<0:o: {\n" +
            "  \"o\": <1:o: {\n" +
            "    \"o\": <2:o: {\n" +
            "      \"o\": <0:ref>,\n" +
            "      \"n\": <n: 1>\n" +
            "    }>,\n" +
            "    \"n\": <n: 2>\n" +
            "  }>,\n" +
            "  \"n\": <n: 3>\n" +
            "}>";

        assert.that(parts.dump(o3)).isEqualTo(expected);
    }).

    clause("dump should indent nested objects and/or arrays with 2 spaces",
    function () {
        var o = {};
        var a2 = [o, 2];

        var o3 = {
            a: a2,
            n: 3
        };

        o.o = o3;
        o.n = 1;

        var expected =
            "<0:o: {\n" +
            "  \"a\": <1:a: [\n" +
            "    <2:o: {\n" +
            "      \"o\": <0:ref>,\n" +
            "      \"n\": <n: 1>\n" +
            "    }>,\n" +
            "    <n: 2>\n" +
            "  ]>,\n" +
            "  \"n\": <n: 3>\n" +
            "}>";

        assert.that(parts.dump(o3)).isEqualTo(expected);
    }).

    clause("dump should return <0:r: /\\d+/> for the given regex", function () {
        assert.that(parts.dump(/\d+/)).isEqualTo("<0:r: /\\d+/>");
    }).

    clause(
    "dump should return \"<0:f: \" + fn.toString() + \">\" for a given " +
    "function",
    function () {
        var fn = function (a, b) { return a + b; };
        assert.that(parts.dump(fn)).
           isEqualTo("<0:f: " + fn.toString() + ">");
    }).

    clause(
    "dump should return \"<0:d: \" + date.toString() + \">\" for a given date",
    function () {
        var d = new Date();
        assert.that(parts.dump(d)).isEqualTo("<0:d: " + d.toString() + ">");
    }).

    clause("dump should return <null> for a null value", function () {
        assert.that(parts.dump(null)).isEqualTo("<null>");
    }).

    clause("dump should return <undefined> for a undefined value", function () {
        assert.that(parts.dump(undefined)).isEqualTo("<undefined>");
    }).

    clause("dump should return <nan> for a NaN value", function () {
        var someNaN = 1 / "a";
        assert.that(parts.dump(someNaN)).isEqualTo("<nan>");
    }).

    clause("dump should return <s: \"msg\"> for the string msg", function () {
        assert.that(parts.dump("msg")).isEqualTo("<s: \"msg\">");
    }).

    clause("dump should return <n: 1> for the number 1", function () {
        assert.that(parts.dump(1)).isEqualTo("<n: 1>");
    }).

    clause("dump should return <b: true> for a true boolean", function () {
        assert.that(parts.dump(true)).isEqualTo("<b: true>");
    }).

    clause(
    "applyNew should use the function as a constructor and use the array as " +
    "arguments",
    function () {
        var f = gabarito.spy(function () {
            this.n = 4;
        });

        var o = parts.applyNew(f, [1, 2, 3]);

        assert.that(o).isInstanceOf(f);
        assert.that(o.n).isEqualTo(4);

        f.
            verify().
            args(1, 2, 3);
    }).

    clause("silence should execute the given function", function () {
        var f = gabarito.spy();
        parts.silence(f);
        f.verify();
    }).

    clause("silence should return the value returned by the function itself",
    function () {
        var f = gabarito.spy(parts.constant(parts.k));
        var r = parts.silence(f);
        assert.that(r).sameAs(parts.k);
        f.verify();
    }).

    clause("silence should return undefined if the function throws",
    function () {
        var r = parts.silence(function () { throw new Error(); });
        assert.that(r).isUndefined();
    }).

    clause("silence should not throw even if the function throws", function () {
        parts.silence(function () { throw new Error(); });
    });

}(typeof exports !== "undefined" && global.exports !== exports));
