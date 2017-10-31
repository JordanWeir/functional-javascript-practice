"use strict";

// ********
// Global Utility Function
// ********

var _ = require('underscore');

var results = [];

// Utility function to better print to console.
function record(funName, fun) {
    const args = _.rest(arguments, 2);
    console.log("\n",'RECORD: Begin', funName,'with', args);
    console.log('RESULT:', fun.apply(null, args),"\n");
}

// Utility functions to test for existence, and truthiness of values
function existy(x) { return x != null };
function truthy(x) { return (x !== false) && existy(x) };

// Utility function to do something only when some condition is true according to truthy
function doWhen(cond, action) {
    if(truthy(cond))
        return action();
    else
        return undefined;
}

// To clean things up, we abstract the notion of a errors, information, and warnings.
function fail(thing) {
    // throw new Error(thing);
    console.log(['!!! CRITICAL ERROR:', thing].join(' '));
}

function warn(thing) {
    console.log(["WARNING:", thing].join(' '));
}

function note(thing) {
    console.log(["NOTE:", thing].join(' '));
}

function cat() {
    var head = _.first(arguments);
    if (existy(head)) {
       return head.concat.apply(head, _.rest(arguments));
    }
    else {
       return [];
    }
}

function construct(head, tail) {
    return cat([head], _.toArray(tail));
}

// Mapcat takes a function as an argument, and calls that function on every element in the collection.
// It concatenates all the values returned by map.
function mapCat(fun, coll) {
    return cat.apply(null, _.map(coll, fun));
}

function plucker(field) {
    return function(obj) {
        return (obj && obj[field]);
    }
}

function best(fun, coll) {
    return _.reduce(coll, function(x, y) {
        return fun(x, y) ? x : y;
    });
}

function always(value) {
    return function() {
        return value;
    }
}

function invoker (name, method) {
    return function(target /* args ... */) {
        if (!existy(target)) fail("Must provide a target");

        var targetMethod = target[name];
        var args = _.rest(arguments);

        return doWhen((existy(targetMethod) && method === targetMethod), function() {
            return targetMethod.apply(target, args);
        });
    };
}

function fnull(fun /*, defaults */) {
    var defaults = _.rest(arguments);

    return function(/* args */) {
        var args = _.map(arguments, function(e, i) {
            return existy(e) ? e : defaults[i];
        });

        return fun.apply(null, args);
    }
}

function defaults(d) {
    return function(o, k) {
        var val = fnull(_.identity, d[k]);
        return o && val(o[k]);
    }
}

function checker(/* validators */) {
    var validators = _.toArray(arguments);

    return function(obj) {
        return _.reduce(validators, function(errs, check) {
            if (check(obj))
                return errs
            else
                return _.chain(errs).push(check.message).value();
        }, []);
    };
}


function validator(message, fun) {
    var f = function(/* args */) {
        return fun.apply(fun, arguments);
    };

    f['message'] = message;
    return f;
}

function aMap(obj) {
    return _.isObject(obj);
}

function hasKeys() {
    var keys = _.toArray(arguments);

    var fun = function(obj) {
        return _.every(keys, function(k) {
            return _.has(obj, k);
        })
    }

    fun.message = cat(["Must have values for keys:"], keys).join(" ");
    return fun;
}

// ********
// Chapter 5: The essence of functional composition
// ********