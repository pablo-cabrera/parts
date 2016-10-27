(function (node) {
    "use strict";

    var main = node? global: window;
    var arrayProto = Array.prototype;
    var objectProto = Object.prototype;

    var format = function (msg, args) {
        var s = 0;
        return msg.replace(/[$%](\d+|s)/g, function (m) {
            var arg;
            if (m.charAt(1) === "s") {
                arg = args[s];
                s += 1;
            } else {
                arg = args[Number(m.substr(1)) - 1];
            }

            return m.charAt(0) === "$"? dump(arg): String(arg);
        });
    };

    var now = function () { return new Date().getTime(); };

    var checkType = function (n) {
        return function (o) {
            return objectProto.toString.call(o) === "[object " + n + "]";
        };
    };

    var regExpToStringCall = function (v) {
        return RegExp.prototype.toString.call(v);
    };

    var isArray = checkType("Array");
    var isFunction = checkType("Function");
    var isDate = checkType("Date");
    var isRegExp = checkType("RegExp");

    var isObject = function (v) {
        return v !== null && (typeof v === "object" || isFunction(v));
    };

    var isBoolean = function (v) {
        return v === true || v === false;
    };

    var isNumber = function (v) {
        return typeof v === "number" && !isNaN(v);
    };

    var isString = function (v) {
        return typeof v === "string";
    };

    var myIsNaN = function (n) {
        return typeof n === "number" && isNaN(n);
    };

    var sameAs = function (a) {
        return function (b) {
            return b === a;
        };
    };

    var negate = function (f) {
        return args(function (args) {
            return !f.apply(this, args);
        });
    };

    var equals = function (a, b, sa, sb) {
        if (a === b) {
            return true;
        }

        if (!(isObject(a) && isObject(b))) {
            return false;
        }

        var ioa = indexOf(sa, sameAs(a));
        if (ioa !== undefined && ioa === indexOf(sb, sameAs(b))) {
            return true;
        }

        sa.push(a);
        sb.push(b);

        if (isArray(a) && isArray(b)) {
            return a.length === b.length && every(a, function (v, i) {
                return equals(v, b[i], sa, sb);
            });
        }

        if (isRegExp(a) && isRegExp(b)) {
            return regExpToStringCall(a) === regExpToStringCall(b);
        }

        if (isDate(a) && isDate(b)) {
            return a.getTime() === b.getTime();
        }

        return (
            every(a, function (v, p) { return equals(v, b[p], sa, sb); }) &&
            every(b, function (v, p) { return equals(a[p], v, sa, sb); }));
    };

    var constant = function (v) { return function () { return v; }; };

    var args = function (f) {
        return function () {
            return f.call(this, slice(arguments));
        };
    };

    var noArgs = function (f) {
        return function () { return f.call(this); };
    };

    var k = constant();

    var work = node?
        function (f) { setImmediate(f); }:
        function (f) { setTimeout(f, 0); };

    var hop = function (o, p) {
        return objectProto.hasOwnProperty.call(o, p);
    };

    var merge = function (a, b, list) {
        if (list) {
            forEach(list, function (p) {
                if (hop(b, p)) {
                    a[p] = b[p];
                }
            });
        } else {
            forEach(b, function (v, p) {
                a[p] = v;
            });
        }
    };

    var indexOf = function (a, f) {
        var i = null,
            l;

        if (isArray(a)) {
            for (i = 0, l = a.length; i < l; i += 1) {
                if (f(a[i], i)) {
                    return i;
                }
            }
        } else if (isString(a)) {
            return indexOf(a.split(""), f);
        } else {
            for (i in a) {
                if (hop(a, i)) {
                    if (f(a[i], i)) {
                        return i;
                    }
                }
            }
        }
    };

    var first = function (a, f) {
        var i = indexOf(a, f || constant(true));
        if (i !== undefined) {
            return a[i];
        }
    };

    var forEach = function (a, f) {
        indexOf(a, function (v, i) {
            f(v, i);
            return false;
        });
    };

    var map = function (a, f) {
        var o = [];
        forEach(a, function (v, i) { o.push(f(v, i)); });
        return o;
    };

    var slice = function () {
        var args = arrayProto.slice.call(arguments);
        return arrayProto.slice.apply(args.shift(), args);
    };

    var every = function (c, f) {
        return indexOf(c, function (v, i) { return !f(v, i); }) === undefined;
    };

    var some = function (c, f) {
        return !every(c, negate(f));
    };



    var hints = {
        "string": isString,
        "number": isNumber,
        "array": isArray,
        "date": isDate,
        "regexp": isRegExp,
        "function": isFunction,
        "object": isObject,
        "boolean": isBoolean
    };

    var overload = args(function (methods) {
        var functions = {};

        methods = map(methods, function (m) {
            return isFunction(m)?
                    {
                        hints: [],
                        method: m
                    }:
                    m;
        });

        forEach(methods, function (m) {
            var l = m.method.length;
            if (l in functions) {
                functions[l].push(m);
            } else {
                functions[l] = [m];
            }
        });

        functions.d = methods[methods.length - 1];

        return args(function (args) {
            var f;
            if (args.length in functions) {
                f = first(functions[args.length], function (f) {
                    var hit = every(f.hints, function (h, i) {
                        var a = args[i];
                        if (isFunction(h)) {
                            return a instanceof h;
                        }

                        if (h in hints) {
                            return hints[h](a);
                        }

                        if (indexOf(["mixed", "*"], h) !== -1) {
                            return true;
                        }

                        throw new TypeError("Invalid type");
                    });

                    return hit;
                });
            }

            return (f || functions.d).method.apply(this, args);
        });
    });

    var that = function (f) {
        return args(function (args) {
            args.unshift(this);
            return f.apply(this, args);
        });
    };

    var dump = (function () {

        var d = function (v, p, i, c, s) {
            var ref;
            var values;
            var counter = c;

            i = p? i + "  ": "";

            if (isObject(v)) {

                ref = indexOf(s, sameAs(v));
                if (ref !== undefined) {
                    return "<" + ref + ":ref>";
                }

                s.push(v);

                if (isDate(v)) {
                    return "<" + c + ":d: " + v.toString() + ">";
                }

                if (isRegExp(v)) {
                    return "<" + c + ":r: " + v.toString() + ">";
                }

                if (isFunction(v)) {
                    return "<" + c + ":f: " + v.toString() + ">";
                }

                if (isArray(v)) {


                    values = map(v, function (v) {
                        if (isObject(v)) {
                            counter += 1;
                        }

                        return d(v, p, i, counter, s);
                    });

                    return values.length === 0?
                        "<" + c + ":a: []>":
                        "<" + c + ":a: [" + (p? "\n" + i: "") +
                            values.join(p? ",\n" + i: ", ") +
                        (p? "\n" + i.substr(0, i.length - 2): "") + "]>";
                }

                values = map(v, function (v, k) {
                    if (isObject(v)) {
                        counter += 1;
                    }

                    return JSON.stringify(k) + ": " + d(v, p, i, counter, s);
                });

                return values.length === 0?
                    "<" + c + ":o: {}>":
                    "<" + c + ":o: {" + (p? "\n" + i: "") +
                        values.join(p? ",\n" + i: "") +
                    (p? "\n" + i.substr(0, i.length - 2): "") + "}>";
            }

            switch (true) {
            case isBoolean(v):      return "<b: " + v + ">";
            case isNumber(v):       return "<n: " + v.toString() + ">";
            case isString(v):       return "<s: " + JSON.stringify(v) + ">";
            case myIsNaN(v):        return "<nan>";
            case v === null:        return "<null>";
            case v === undefined:   return "<undefined>";
            default:                return "<unknown: " + v.toString() + ">";
            }
        };

        return function (value, pretty) {
            return d(value, arguments.length > 1? pretty: true, "", 0, []);
        };
    }());

    /**
     * Exported utilities class.
     *
     * @class parts.Parts
     * @static
     */
    var parts = {

        /**
         * Returns a function that when called returns always the same
         * starting value.
         *
         * @method constant
         * @for parts.Parts
         *
         * @param {mixed} value
         * @return {function}
         */
        constant: constant,

        /**
         * A function that does nothing and returns undefined. Useful when
         * you need a noop function.
         *
         * @method k
         * @for parts.Parts
         */
        k: k,

        /**
         * Returns a function that when called, passes the arguments
         * collection as an array to the passed function as its first
         * parameter.
         *
         * @method args
         * @for parts.Parts
         *
         * @param {function} f
         *
         * @return {function}
         */
        args: args,

        /**
         * Processes the function on the next tick.
         *
         * @method work
         * @for parts.Parts
         *
         * @param {function} f
         */
        work: work,

        /**
         * Short for object.hasOwnProperty(property).
         *
         * @method hop
         * @for parts.Parts
         *
         * @param {Object} object
         * @param {string} property
         *
         * @return {boolean}
         */
        hop: hop,

        /**
         * Copy the properties from the "source" object onto the
         * "target" object. Optionally it can be passed an array
         * containing the property-list to be copied, if ommited, all
         * own properties should be copied.
         *
         * @method merge
         * @for parts.Parts
         *
         * @param {Object} target
         * @param {Object} source
         * @param {array} [propertyList]
         */
        merge: merge,

        /**
         * Looks for the first ocurrence that satisfies the conditional
         * function of a given value within an array or an object,
         * returning its index or property.
         *
         * The conditional function will be called for each item within
         * the collection, it will receive the item as first parameter
         * and its index as the second. The function must return a
         * boolean indicating whether the condition has been met.
         *
         * @method indexOf
         * @for parts.Parts
         *
         * @param {array|object|string} collection
         * @param {function} condition
         *
         * @return {number|string}
         */
        indexOf: indexOf,

        /**
         * Returns the first ocurrence that satisfies the conditional
         * function of a given value within an array or an object.
         *
         * The conditional function will be called for each item within
         * the collection, it will receive the item as first parameter
         * and its index as the second. The function must return a
         * boolean indicating whether the condition has been met.
         *
         * If the function is ommited, it will return the first item
         * within the collection.
         *
         * @method first
         * @for parts.Parts
         *
         * @param {array|object|string} collection
         * @param {function} [condition]
         *
         * @return {mixed}
         */
        first: first,

        /**
         * Executes a function for each item within the collection
         * (array or object), passing the item itself as the first
         * parameter and it's index as the second parameter.
         *
         * @method forEach
         * @for parts.Parts
         *
         * @param {array|object|string} collection
         * @param {function} f
         */
        forEach: forEach,

        /**
         * Iterates through the items of a collection, calling the map
         * function for each of those items, passing the item itself as
         * first parameter and it's index as the second parameter. The
         * function's return will be pushed to a new array that will be
         * returned in the end.
         *
         * @method map
         * @for parts.Parts
         *
         * @param {array|object|string} collection
         * @param {function} f
         *
         * @return {array}
         */
        map: map,

        /**
         * Short for:
         * var args = Array.prototype.slice.call(arguments);
         * return Array.prototype.slice.apply(args.shift(), args);
         *
         * @method slice
         * @for parts.Parts
         *
         * @param {mixed} collection
         * @param {number} [begin=0]
         * @param {number} [end]
         *
         * @return {array}
         */
        slice: slice,

        /**
         * Kind of a method overloading. It should be called passing
         * various functions, each with a different number of declared
         * parameters.
         *
         * It will return a function that depending of the number of
         * arguments passed, will call the respective function. If there
         * is no respective function for a given number of arguments,
         * the latter function will be used as default.
         *
         * @method overload
         * @for parts.Parts
         *
         * @param {function} functions*
         *
         * @return {function}
         */
        overload: overload,

        /**
         * Returns a function that when called, it will pass the _this_
         * object as first parameter, along with the remaining
         * parameters if any.
         *
         * @method that
         * @for parts.Parts
         *
         * @param {function} thatFunction
         *
         * @return {function}
         */
        that: that,

        /**
         * Indicates whether a pair of values are equal between themselves.
         *
         * Equals may mean the following:
         *
         * - are equal using ==
         * - are arrays and have values that are equal along with themselves
         * (recursively)
         * - are objects and have properties that are equal along with
         * themselves (recursively)
         * - are Date and have the same time
         * - are RegExp and have the same toString
         *
         * @method equals
         * @for parts.Parts
         *
         * @param {mixed} a
         * @param {mixed} b
         *
         * @return {boolean}
         */
        equals: function (a, b) {
            return equals(a, b, [], []);
        },

        /**
         * Performs a check upon every item within the collection, if all of
         * them returns true, then it returns true.
         *
         * @method every
         * @for parts.Parts
         *
         * @param {array|object|string} c
         * @param {function} f
         *
         * @return {boolean}
         */
        every: every,

        /**
         * Performs a check upon every item within the collection, if one of
         * them returns true, then it returns true.
         *
         * @method every
         * @for parts.Parts
         *
         * @param {array|object|string} c
         * @param {function} f
         *
         * @return {boolean}
         */
        some: some,

        /**
         * Indicates whether a given value is an array.
         *
         * @method isArray
         * @for parts.Parts
         *
         * @param {mixed} v
         *
         * @return {boolean}
         */
        isArray: isArray,

        /**
         * Indicates whether a given value is a function.
         *
         * @method isFunction
         * @for parts.Parts
         *
         * @param {mixed} v
         *
         * @return {boolean}
         */
        isFunction: isFunction,

        /**
         * Indicates whether a given value is an object.
         *
         * @method isObject
         * @for parts.Parts
         *
         * @param {mixed} v
         *
         * @return {boolean}
         */
        isObject: isObject,

        /**
         * Indicates whether a given value is a Date instance.
         *
         * @method isDate
         * @for parts.Parts
         *
         * @param {mixed} v
         *
         * @return {boolean}
         */
        isDate: isDate,

        /**
         * Indicates whether a given value is a RegExp instance.
         *
         * @method isRegExp
         * @for parts.Parts
         *
         * @param {mixed} v
         *
         * @return {boolean}
         */
        isRegExp: isRegExp,

        /**
         * Asserts that a given value is NaN.
         *
         * Note that the value should be the actual NaN and not something that
         * converts to NaN.
         *
         * @method isNaN
         * @for parts.Parts
         *
         * @param {mixed} v
         *
         * @return {boolean}
         */
        isNaN: myIsNaN,

        /**
         * Indicates whether a given value is a boolean.
         *
         * @method isBoolean
         * @for parts.Parts
         *
         * @param {mixed} v
         *
         * @return {boolean}
         */
        isBoolean: isBoolean,

        /**
         * Indicates whether a given value is a number and is not NaN.
         *
         * @method isNumber
         * @for parts.Parts
         *
         * @param {mixed} v
         *
         * @return {boolean}
         */
        isNumber: isNumber,

        /**
         * Indicates whether a given value is a string.
         *
         * @method isString
         * @for parts.Parts
         *
         * @param {mixed} v
         *
         * @return {boolean}
         */
        isString: isString,

        /**
         * Shoft for new Date().getTime().
         *
         * @method now
         * @for parts.Parts
         *
         * @return {number}
         */
        now: now,

        /**
         * Returns a function that compares a given value with some other value.
         *
         * @method sameAs
         * @for parts.Parts
         *
         * @param {function} f
         *
         * @return {function}
         */
        sameAs: sameAs,

        /**
         * Returns a function that calls the given function passing along its
         * arguments, but negates its value.
         *
         * @method negate
         * @for parts.Parts
         *
         * @param {function} f
         *
         * @return {function}
         */
        negate: negate,

        /**
         * Object making utility.
         *
         * It is useful when you want to declare object and cant use expressions
         * in the object keys within literals.
         *
         * The function may receive a key/value upon first call it will return
         * chainable function that receives key/values at each call to populate
         * the object being built.
         *
         * When the object is ready, the build function may be called to retain
         * the built object.
         *
         * @method make
         * @for parts.Parts
         *
         * @param {string} k A key
         * @param {mixed} v A value for the given key
         * @return {function} The chainable function
         */
        make: function (k, v) {
            var o = {};
            var f = function (k, v) {
                o[k] = v;
                return f;
            };

            f.build = constant(o);

            return f;
        },

        /**
         * Returns a string representation of a given value for debugging
         * purposes.
         *
         * - __b__: Boolean value
         * - __n__: Number value
         * - __s__: String value
         * - __d__: Date object
         * - __f__: Function object
         * - __r__: Regex object
         * - __a__: Array object
         * - __nan__: `NaN` value
         * - __null__: `null` value
         * - __undefined__: `undefined` value
         * - __ref__: Reference to a previous inspected object (with its number)
         *
         * ```
         * parts.dump(true);
         * // <b: true>
         *
         * parts.dump(1);
         * // <n: 1>
         *
         * parts.dump("msg");
         * // <s: "msg">
         *
         * parts.dump(someNaN);
         * // <nan>
         *
         * parts.dump(null);
         * // <null>
         *
         * parts.dump(undefined);
         * // <undefined>
         *
         * parts.dump(new Date());
         * // <0:d: Thu Oct 27 2016 14:48:52 GMT-0200 (BRST)>
         *
         * parts.dump(function () {});
         * // <0:f: function () {}>
         *
         * parts.dump(/\d+/);
         * // <0:r: /\\d+/>
         *
         * parts.dump({});
         * // <0:o: {}>
         *
         * parts.dump({ a: 1 });
         * // <0:o: {
         * //   "a": <n: 1>
         * // }>
         *
         * parts.dump([]);
         * // <0:a: []>
         *
         * parts.dump([1]);
         * // <0:a: [
         * //   <n: 1>
         * // ]>
         *
         * var o = {};
         * o.o = o;
         * parts.dump(o);
         * // <0:o: {
         * //   "o": <0:ref>
         * // }>
         * ```
         *
         * @method dump
         * @for parts.Parts
         *
         * @param {mixed} value
         * @return {string}
         */
        dump: dump,

        /**
         * Formats a given message using the values within the placeholders
         * inside the message itself.
         *
         * There are 2 kinds of placeholders literal ones (marked by the __%__
         * sign) and the ones that dump values (marked by the __$__ sign).
         *
         * Literal placeholders will use the values as is, while the other one
         * will {{#crossLink "parts.Parts/dump"}}{{/crossLink}} every value
         * before using it within the message.
         *
         * ```
         * parts.format("The number is %s", [1]);
         * // The number is 1
         *
         * parts.format("The value is $s", [1]);
         * // The value is <n: 1>
         * ```
         *
         * Values may be reference by the order in which they appear (using `$s`
         *  or `%s`), or by its position (`%1` or `$1`).
         *
         * ```
         * parts.format("The numbers are %s, %s and %s", [1, 2, 3]);
         * // The numbers are 1, 2 and 3
         *
         * parts.format(
         *     "The 3rd number is %3, the 2nd is %2 and the 1st is %1" ,
         *     [1, 2 ,3]);
         * // The 3rd number is 3, the 2nd is 2 and the 1st is 1
         *
         * parts.format("The 2nd value is $2 and the 1st number is %1", [1, 2]);
         * // The 2nd value is <n: 2> and the 1st number is 1
         *
         * parts.format("Mixed placeholders $s, %s, $4, %3", [1, 2, 3, 4]);
         * // Mixed placeholders <n: 1>, 2, <n: 4>, 3
         * ```
         *
         * @method format
         * @for parts.Parts
         *
         * @param {string} msg
         * @param {mixed[]} values
         */
        format: format,

        /**
         * Calls the constructor function passing the array of arguments within
         * it.
         *
         * It actually creates an anonymous subclass for the function and
         * calls it after it created the object itself. Its close enough for
         * most purposes.
         *
         * @method applyNew
         * @for parts.Parts
         *
         * @param {function} type The constructor function
         * @param {mixed[]} args The arguments to be passed to the constructor
         *            function
         *
         * @return {mixed}
         */
        applyNew: function (type, args) {
            var F = function () { type.apply(this, args); };
            F.prototype = type.prototype;
            return new F();
        },

        /**
         * Calls the function and ignores any thrown error
         *
         * @method silence
         * @for parts.Parts
         *
         * @param {function} f The function block to be executed
         *
         * @return {mixed} returns the function returned value
         */
        silence: function (f) {
            try { return f(); } catch (e) {}
        }
    };

    if (node) {
        module.exports = parts;
    } else {
        main.parts = parts;
    }

}(typeof exports !== "undefined" && global.exports !== exports));
