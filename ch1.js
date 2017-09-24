var _ = require('underscore');

var results = [];

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

function record(action, result) {
  console.log('RECORD: Did', action,'and got:', result);
}

var addArrayElements = splat(function(x, y) {
  return x + y;
});

var joinElements = unsplat(function(array) { return array.join(' ') });




record('addArrayElements', addArrayElements([1,2,3]));
record('joinElements', joinElements(1, 2));
