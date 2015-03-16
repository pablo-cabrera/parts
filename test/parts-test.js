(function (node) {
    "use strict";

    var
        main = node? global: window,
        YUITest = main.YUITest || require("yuitest"),
        root = node? process.cwd() + "/": "../",
        Assert = YUITest.Assert,
        parts = node? require(root + "/lib/parts"): main.parts;

    var test = new YUITest.TestCase({

        name: "parts-test",

        "args function should pass the arguments collection as an array to the passed function as its first parameter": function () {
            var a = [1, 2, 3];
            var t = {};
            var f = parts.args(function (args) {
                Assert.areSame(3, args.length);
                parts.forEach(args, function (v, i) {
                    Assert.areSame(a[i], v);
                });
                Assert.areSame(t, this);
            });

            f.apply(t, a);
        },

        dummy: undefined

    });

    YUITest.TestRunner.add(test);
}(typeof exports !== "undefined" && global.exports !== exports));
