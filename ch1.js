var _ = require('underscore');

var results = [];

// Utility function to better print to console.
function record(action, fun) {
  args = _.rest(arguments, 2);
  console.log("\n",'RECORD: Begin', action,'with', args);
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

function splat (fun) {
  return function(array) {
    return fun.apply(null, array);
  }
}

function unsplat(fun) {
  return function() {
    return fun.call(null, _.toArray(arguments));
  };
}

var addArrayElements = splat(function(x, y) {
  return x + y;
});

var joinElements = unsplat(function(array) { return array.join(' ') });


// Messy version of parseAge function
function parseAge (age) {
  if (!_.isString(age)) throw new Error("Expecting a string");
  var a;

  console.log("Attempting to parse an age");

  a = parseInt(age, 10);

  if (_.isNaN(a)) {
    console.log(["Could not parse age::", age].join(' '));
    a = 0;
  }

  return a;
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

// Clean parseAge leveraging new functions
function newParseAge(age) {
  if(!_.isString(age)) fail("Expecting a string");
  var a;

  note("Attempting to parse an age");
  a = parseInt(age, 10);
  
  if (_.isNaN(a)) {
    warn(["Could not parse age:", age].join(' '));
    a = 0;
  }

  return a;
}

// Messy implementation of nth, a simple function to return the item at an index.
function naiveNth(a, index) {
  return a[index];
}

var letters = ["a", "b", "c"];

// What we really want is to check if it's indexable though...
function isIndexed(data) {
  return _.isArray(data) || _.isString(data);
}

function nth(a, index) {
  if (!_.isNumber(index)) fail("Expected a number as the index");
  if (!isIndexed(a)) fail("Not supported on non-indexed type");
  if ((index < 0) || (index > a.length -1)) fail ("Index value is out of bounds");

  return a[index];
}

// Similarly, we can build a 'second' abstraction.
function second(a) {
  return nth(a, 1);
}

// Predicate usage.
// Predicates in javascript are functions that always return true or false.
// They can be very useful abstractions in a wide range of cases.
// Consider Array#sort.  This 'seems' to work logically to sort numbers.
// Consider a naiveSort function based on Array#sort.
function naiveSort(arr) {
  return arr.sort();
}

// naiveSort doesn't work in a range of cases because .sort() defaults to a string comparison.
// It can also take a function to decide which value to return.
// Predicates to the rescue
// We use a comparator function that takes a predicate function.
// Using the comparator function, we can map the results of the predicate into a standardized result set
// -1, 0, and 1.
function comparator(pred) {
  return function(x, y) {
    if (truthy(pred(x, y)))
      return -1;
    else if (truthy(pred(y, x)))
      return 1;
    else
      return 0;
  }
}

function lessOrEqual(x, y) {
  return x <= y;
}

function goodSort(arr, pred) {
  return arr.sort(comparator(pred));
}

// Data as Abstraction
// Both the comparator function before, and the CSV example to follow, are functions that translate one type of data to another.

var demoCSV = "name,age,hair\nMerble,35,red\nBob,64,blonde";

function lameCSV(str) {
  return _.reduce(str.split("\n"), function(table, row) {
    table.push(_.map(row.split(","), function(c) { return c.trim() }));
    return table;
  }, []);
};

var peopleTable = lameCSV(demoCSV);

function sortTable(table) {
  return _.rest(table).sort();
}

// These select functions use existing array processing functions to provide easy access to simple data types.
function selectNames(table) {
  return _.rest(_.map(table, _.first));
}
function selectAges(table) {
  return _.rest(_.map(table, second));
}
function selectHairColor(table) {
  return _.rest(_.map(table, function(row) {
    return nth(row, 2);
  }));
}

var mergeResults = _.zip;



record('addArrayElements', addArrayElements, [1,2]);
record('joinElements', joinElements, 1, 2);
record('parseAge', parseAge, "12");
record('parseAge', parseAge, "frob");
record('newParseAge', newParseAge, "12");
record('newParseAge', newParseAge, "frob");
record('naiveNth', naiveNth, letters, 1);
record('naiveNth', naiveNth, {}, 1);
record('nth', nth, letters, 1);
record('nth', nth, "abc", 0);
record('nth', nth, {}, 1);
record('nth', nth, letters, 4000);
record('nth', nth, letters, 'aaaaa');
record('second', second, ['a', 'b']);
record('second', second, 'fogus');
record('second', second, {});
record('naiveSort', naiveSort, [2,3,-6,-108,42]);
record('naiveSort', naiveSort, [0, -1, -2]);
record('naiveSort', naiveSort, [2, 3, -1, -6, 0, -108, 42, 10]);
note('Naive sort does a bad job because the default sort function is a string comparison!');
record('goodSort', goodSort, [2,3,-6,-108,42], lessOrEqual);
record('goodSort', goodSort, [0, -1, -2], lessOrEqual);
record('goodSort', goodSort, [2, 3, -1, -6, 0, -108, 42, 10], lessOrEqual);
record('lameCSV', lameCSV, demoCSV);
record('sortTable', sortTable, peopleTable);
record('selectNames', selectNames, peopleTable);
record('selectAges', selectAges, peopleTable);
record('selectHairColor', selectHairColor, peopleTable);
record('mergeResults', mergeResults, selectNames(peopleTable), selectAges(peopleTable));
