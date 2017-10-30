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

// CH2 Begins

// Imperative 99 bottles
function imperative99Bottles() {
  var lyrics = [];

  for (var bottles = 99; bottles > 0; bottles--) {
    lyrics.push(bottles + " bottles of beer on the wall");
    lyrics.push(bottles + " bottles of beer");
    lyrics.push("Take one down, pass it around");
  }

  if (bottles > 1) {
    lyrics.push((bottles - 1) + " bottles of beer on the wall.");
  }
  else {
    lyrics.push("No more bottles of beer on the wall!");
  }

  return lyrics;
}

function lyricSegment(n) {
  return _.chain([])
    .push(n + " bottles of beer on the wall")
    .push(n + " bottles of beer")
    .push("Take one day, pass it around")
    .tap(function(lyrics) {
      if (n > 1)
        lyrics.push((n - 1) + " bottles of beer on the wall.");
      else
        lyrics.push("No more bottles of beer on the wall!");
    })
    .value();
}

function song(start, end, lyricGen) {
  return _.reduce(_.range(start, end, -1),
      function(acc, n) {
        return acc.concat(lyricGen(n))
      }, []);
}

function generalMap(a, fun) {
  return _.map(a, fun);
}

function returnValue(v) {
  return v;
}

// when we pass this function into generalMap, we notice that map uses the value of each key has the first param, and the key itself as the second
function returnKeyValue(v,k) {
  return [k,v];
}

// when we pass this function into generalMap, we realize map's params are (value, key, collection)
function returnKeyValueCollection(v,k, coll) {
  return [k,v, _.keys(coll)];
}

// The point of a collection-centric view, advocated by underscore and functional programming in general,
// is to establish a consistent processing idiom so that we can reuse a comprehensive set of functions.
// 'It is better to have 100 functions operate on one data structure than 10 functions on 10 data structures.'

function div(x,y) { return x/y };

function allOf() {
  return _.reduceRight(arguments, function(truth, f) {
    return truth && f();
  }, true);
}

function anyOf() {
  return _.reduceRight(arguments, function(truth, f) {
    return truth || f();
  }, false);
}

function T() { return true };
function F() { return false };

function findDemo(arr, pred) {
  return _.find(arr, pred);
}

function complement(pred) {
  return function() {
    return !pred.apply(null, _.toArray(arguments));
  }
}

var people = [
  {
    name: "Rick",
    age: 30
  },
  {
    name:"Jaka",
    age:24
  }
];

var albums = [
  {title: "Sabbath Bloody Sabbath", genre: "Metal"},
  {title: "Scientist", genre: "Dub"},
  {title: "Undertow", genre: "Metal"}
]

function getAge(p) {
  return p.age;
}

function getGenre(a) {
  return a.genre;
}

// What exactly is an applicative function?  Lets first look at some examples that are not applicative.
// Not applicative because it doesn't receive a function as an argument.
function cat() {
  var head = _.first(arguments);
  if (existy(head)) {
    return head.concat.apply(head, _.rest(arguments));
  }
  else {
    return [];
  }
}

// This uses an external function in the body, but it doesn't receive it as an argument, so is also not applicative.
function construct(head, tail) {
  return cat([head], _.toArray(tail));
}

// Mapcat takes a function as an argument, and calls that function on every element in the collection.
// It concatenates all the values returned by map.
function mapCat(fun, coll) {
  return cat.apply(null, _.map(coll, fun));
}

function butLast(coll) {
  return _.toArray(coll).slice(0, -1);
}

function interpose (inter, coll) {
  return butLast(mapCat(function(e) {
    return construct(e, [inter]);
  },
  coll));
}

var zombie = {
  name:"bub",
  film: "Day of the Dead"
};

var booksArray = [
  {title: "Chton", author: "Anthony"},
  {title: "Grendel", author: "Gardner"},
  {title: "After Dark"}
];

// _.keys, _.values, and _.pluck can be used to deconstruct objects into arrays.

// record('imperative99Bottles', imperative99Bottles);
note('FUNCTIONAL PROGRAMMING EXAMPLES.');
record('lyricSegment', lyricSegment, 9);
record('song', song, 3, 1, lyricSegment);
record('generalMap (returnValue)', generalMap, {a: 1, b:2}, returnValue);
record('generalMap (returnKeyValue)', generalMap, {a: 1, b:2}, returnKeyValue);
record('generalMap (returnKeyValueCollection)', generalMap, {a: 1, b:2}, returnKeyValueCollection);

note('BUILT IN APPLICATIVE FUNCTIONS.');
record('_.reduce', _.reduce, [100, 2, 25], div);
record('_.reduceRight', _.reduceRight, [100, 2, 25], div);
record('allOf', allOf);
record('allOf', allOf, T, T);
record('allOf', allOf, T, T, F, T, T);
record('anyOf', anyOf);
record('anyOf', anyOf, T, T);
record('anyOf', anyOf, T, T, F, T, T);
record('_.find', _.find, ['a', 'b', '3', 4, 'd'], _.isNumber);
record('_.find', _.find, ['a', 1, '3', 4, 5], _.isNumber);
record('_.reject', _.reject, ['a', 'b', 3, 'd'], _.isNumber);
record('_.filter with complement', _.filter, ['a', 'b', 3, 'd'], complement(_.isNumber));
record('_.all with _.isNumber', _.all, [1, 2, 3, 4], _.isNumber);
record('_.any with _.isString', _.any, [1, 2, 3, 4], _.isString);
record('_.sortBy', _.sortBy, people, getAge);
record('_.groupBy', _.groupBy, albums, getGenre);
record('_.countBy', _.countBy, albums, getGenre);

note('BUILDING APPLCIATIVE FUNCTIONS.');
record('cat', cat, [1, 2, 3], [2, 3], [3]);
record('construct', construct, 57, [2, 3], [3]);
record('mapCat', mapCat, construct, [57, [2, 3], [3]]);
record('interpose', interpose, ", ", [1, 2, 3]);

note('DATA THINKING.');
note('_.keys, _.values, and _.pluck can be used to deconstruct objects into arrays.');
record('_.keys', _.keys, zombie);
record('_.values', _.values, zombie);
record('_.pluck', _.pluck, booksArray, 'author');
record('_.pairs', _.pairs, zombie);
record('_.object', _.object, _.pairs(zombie));
