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


// ********
// Chapter 3: Variable Scope and Closures
// ********

// The variable scope section of this chapter is just a review of things all javascript devs know.

// Closures
// A closure 'captures' a set of values in the initial function, and returns a function that uses those values in
// their captured, 'fixed' state.

// This not-very-useful closure returns a new function, which reports on the value of captured.
// This demonstrates that the 'captured' value is indeed visible to the function returned
function whatWasTheLocal() {
  var captured = "Oh Hai";

  return function() {
    return "The local was: " + captured;
  };
}

var reportLocal = whatWasTheLocal();

// Closures get more interesting when you pass them configuration variables.
function createScaleFunction(factor) {
  return function(v) {
    return _.map(v, function(n) {
      return (n * factor);
    });
  };
}

var scale10 = createScaleFunction(10);
var scale2 = createScaleFunction(2);

// Here is a function that captures a function, and returns a function that calculates 
// the average of a collection to function is applied to
function averageDamp(fun) {
  return function(arr) {
    var sum = _.reduce(arr, function(acc, n) {
      return acc + fun(n);
    }, 0);
    var count = arr.length;
    return sum / count;
  }
}

var averageIden = averageDamp(_.identity);
var averageDoubled = averageDamp((n) => n*2);
var averageMinus5 = averageDamp((n) => n - 5);

// Chapter then discusses Shadowing.
// This is an antipattern where a variable inside a function has the same variable as one a level higher.
// Something to beware of, and generally avoid.

var shadowed = 0;
function argshadow(shadowed) {
  return ["Value is", shadowed].join(" ");
}

// argshadow(5) returns: Value is 5
// argshadow() returns: Value is

function captureShadow(closureShadow) {
  return function(closureShadow) {
    return closureShadow + 1;
  }
}

var shadowInClosure = captureShadow(70);

console.log("shadowInClosure(5) returns:", shadowInClosure(5));
// Note that the configuration we captured in the closure was overwritten by the interior value.


// Some example Closure use cases
function complement(pred) {
  return function() {
    return !pred.apply(null, _.toArray(arguments));
  }
}

var isEven = function(n) { return (n%2) === 0 }

var isOdd = complement(isEven);

isOdd(2);

// In the case of showObject and showO, the variable o is referenced inside and outside.  Changes to o will change the enclosed value.
function showObject(obj) {
  return function() {
    return obj;
  }
}

var o = {a: 42};
var showO = showObject(o);

showO();

// Capturing variables as private data
// We construct the pingpong object inside a anonymous function, limiting the scope.
// The captured variable private, because it exists only inside the anonymous function, is invisible to the rest of the program.
// The only way to access it is through the inc and dev methods on the pingpong object.
// Note that the anonymous function is a self-invoked function as well.
var pingpong = (function() {
  var secret = 0;

  return {
    inc: function(n) {
      return secret += n;
    },
    dec: function(n) {
      return secret -= n;
    }
  };
})();

// Closures as an abstraction.
// plucker will take a key into an associative structure, and return a function that returns the value at a key

function plucker(field) {
  return function(obj) {
    return (obj && obj[field]);
  }
}

var best = {title: "Infinite Jest", author: "DFW" };

var getTitle = plucker('title');

getTitle(best);

var books = [
  {title: "Chthon"},
  {stars: 5},
  {title: "Botchan"}
];

var third = plucker(2);

third(books);

// Simple Closure example
record("whatWasTheLocal", whatWasTheLocal);
record("reportLocal", reportLocal);
record("createScaleFunction", createScaleFunction);
note("scale10 = createScaleFunction(10)");
record("scale10", scale10, [1, 2, 3]);
note("scale2 = createScaleFunction(2)");
record("scale2", scale2, [5, 15, 50]);
// Capture functions in a closure
note("You can also capture a function in a closure.  averageDamp creates new functions, capturing a function, then applying it to elements in an array, finally calculating an average");
note("averageIden, averageDoubled, and averageMinus5 all come from the averageDamp function");
record("averageIden", averageIden, [2, 4, 6]);
record("averageDoubled", averageDoubled, [1, 5, 20]);
record("averageMinus5", averageMinus5, [10, 20, 30]);
// Shadowed variables are bad
note("Shadows are bad.  We have a global, shadowed, set to 0. argshadow takes a parameter named shadow, and returns a string with its value.  Observe...");
record("argshadow", argshadow, 105);
record("argshadow", argshadow);
note("Shadows get more confusing when closures are involved");
record("captureShadow", captureShadow);
note("shadowInClosure = captureShadow(70)");
record("shadowInClosure", shadowInClosure, 5);
note("Note that the value it was called with overrode the value it was instantiated with.  Shadows make things more confusing then they need to be")
// Clorusre use cases
note("Some Closure use cases");
record("complement", complement);
record("isEven", isEven, 4);
record("isEven", isEven, 1);
note("isOdd = complement(isEven)");;
record("isOdd", isOdd, 5);
record("isOdd", isOdd, 137);
record("isOdd", isOdd, 14);
// Properties of enclosed values.  Mutable, or immutable?
note("Does changing the behavior of isEven after isOdd is defined change the isOdd function?");
note("set isEven to be always false");
isEven = function() {return false;}
record("isEven", isEven, 1);
record("isEven", isEven, 2);
record("isEven", isEven, 3);
record("isOdd", isOdd, 1);
record("isOdd", isOdd, 2);
record("isOdd", isOdd, 3);
note('In the case of the captured function, later changes to isEven didn\'t effect isOdd, even though isOdd = complement(isEven).');
note('Does this always hold true?');
note('Using showObject with an object passed in directly');
var showA = showObject({a: 42})
record('showA', showA);
note('What if we use showObject with a variable referencing an object instead?');
var b = {a: 42};
note("b = {a: 42}");
var showB = showObject(b);
note("showB = showObject(b)");
record("showB", showB);
note('What if I add a property to object b?');
b.newProperty = "Orange";
record('showB', showB);
note('The results of showB are altered when changes to the object outside the function happen.');
note('In the case of the complement function earlier, changes outside didn\'t effect the closure.');
note('In the case of this object, changes to the object did change the closure.');
note('Managing hidden data with closures');
note('the pingpong object wraps private data in a self-invoking anonymous function, and returns an object with methods to manipulate this enclosed private data');
note('The only way to access that data is now through the methods on the returned object.')
record('pingpong.inc', pingpong.inc, 5 );
record('pingpong.dec', pingpong.dec, 7 );
note('Closures are often used as an abstraction');
record("plucker", plucker);
note("getTitle = plucker('title')")
note("third = plucker(2)")
record("getTitle", getTitle, best);
record("third", third, books);
note("Because plucker either returns the obj[field] value - which is truthy - or false, it can be used as a predicate with filter")
record("_.filter with books, getTitle", _.filter, books, getTitle);




