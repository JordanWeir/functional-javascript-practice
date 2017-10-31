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

// ********
// Chapter 4: Higher Order Functions
// ********


note('Underscore has a function called max that returns the highest value in an array');

var maxExample = _.max([1, 3, 5, 7]);

console.log('maxExample returned: ', maxExample);

// _.max can also return the highest value from an array of objects, if given a way to translate an object to a value
// Lets use "plucker" from the previous chapter to create a new function, getAge that returns the age field

// Using plucker from ch3 to create a function that returns the value of age from an object.
var getAge = plucker("age");
var incompletePeople = [{age:5, name:"bob"}, {age:10}, , {age:13, person:"sally"}, {person:"Jim"} ];
var completePeople = [{age:5, name:"bob"}, {age:10}, , {age:13, person:"sally"}, {person:"Jim", age:7} ];
note("Oldest person (full info per person): ", _.max(completePeople, getAge));
note("Oldest person (partial info per person): ", _.max(incompletePeople, getAge));

// Using max is limited.  What if we don't want just the highest value?
// Lets make a finder function that allows us to determine the sorting logic.

function finder(valueFun, bestFun, coll) {
    return _.reduce(coll, function(best, current) {
        var bestValue = valueFun(best);
        var currentValue = valueFun(current);

    return (bestValue === bestFun(bestValue, currentValue)) ? best : current;
    });
}

// Now we can mimic our old result by doing...
note("Oldest person wtih finder (full info per person): ", finder(getAge, Math.max, completePeople));
note("Oldest person wtih finder (partial info per person): ", finder(getAge, Math.max, incompletePeople));
warn("A bug!  It looks like the finder function glitches when an object doesn't have an age.")

// We can use finder to handle other scenarios.

console.log("Select for names beginning with b: ", finder(
        plucker('name'), 
        function(x,y) { return (x.charAt(0) === "b" ? x : y) }, 
        incompletePeople));

// Notice the parralel logic in the best value function.  
// In finder, we check if current best value is equal to the best returned from the bestFun(bestValue, currentValue).
// If it is, then we stick with out current best, and check the next value in the array.  If it isn't, we use the new currentValue and continue.
// Similarly, when selecting names that start with b, we check a condition for true, and if it is, we choose x, else y.

// Pulling that abstraction into a seperate function...

function best(fun, coll) {
    return _.reduce(coll, function(x, y) {
        return fun(x, y) ? x : y;
    });
}

// This makes the assumption that our best function will always return true or false; it assumes a predicate function is passed in.
// With that assumption, we can use best instead of finder.

// Some examples
note('Highest of 1, 2, 3, 4, 5? ', best((x, y) => x > y, [1, 2, 3, 4, 5]));
note('Lowest of 1, 2, 3, 4, 5? ', best((x, y) => x < y, [1, 2, 3, 4, 5]));
note('Oldest from incompletePeople? best((x, y) => x.age > y.age, incompletePeople) gives us an error.');
note("The problem is that best still doesn't account for the case where the parameter isn't on the object.");

// Note the difference between finder and best.  
// finder took two functions, had some not immediately intuitive logic, and returned a result.
// best takes only one function, does something much simpler, and returns a result.
// Best is more usable, more flexible, and easier to understand.
// In general, passing multiple functions as arguments may be a sign of overcomplication.
// That said, sometimes it's useful.  Observe...

function repeat(times, value) {
    return _.map(_.range(times), function() {
        return value;
    });
}

note('Using repeat(4, "testing repeating")...');
note(repeat(4, "testing repeat"));

function repeatedly(times, fun) {
    return _.map(_.range(times), fun);
}

note('Demonstrating repeatedly by generating 3 random numbers...')
note(repeatedly(3, function() {
    return Math.floor((Math.random() * 10) + 1);
}));

note('Sometimes a function returns a constant. Giving repeatedly "Zoom Zoom", we get: ');
note(repeatedly(3, () => "Zoom Zoom "));

// Because we're using map, we can use the index of the count as well...
note(repeatedly(3, (i) => "Zoom" + i));

// But we're still giving it a static value for how many times to repeat.
// Use functions, not values...

function iterateUntil(fun, check, init) {
    var ret = [];
    var result = fun(init);

    while (check(result)) {
        ret.push(result);
        result = fun(result);
    }

    return ret;
}

// Lets get all the multiples of 2 up until 1024.
note('Using iterateUntil to get all the multiples of 2 until 1024');
note(iterateUntil(
        (n) => n*2,
        (n) => n <= 1024,
        1));

// A function returning a constant is almost a design pattern in functional programming.
// This pattern is used often enough its often simply called k.
// Lets call it always for clarity.

function always(value) {
    return function() {
        return value;
    }
}

var f = always(function() {});

// This always function illustrates a couple things about closures.
// A closure will capture a single value, or reference, and repeatedly return the same value.

note('Does f() === f()?');
note(f() === f());

var g = always(function() {});

// g is created in the same way as f.  Does it === f?
note('g was generated by the same closure function that generated f.  Are they equal?');
note('does g() === f()?');
note(f() === g());

// This then shows that different instances of a closure are different.

// invoker is a function that will take a method, and return a function that invokes that method on any object.

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

var rev = invoker('reverse', Array.prototype.reverse);

note('demonstrating rev, created with the invoker function...')
note('rev can be used on a single array...')
note(rev([1, 2, 3]));

note('But rev can also be used with map on a number of arrays... for example, [[1, 2, 3], [10, 20, 30], [20, 10, 100]]');
note(_.map([[1, 2, 3], [10, 20, 30], [20, 10, 100]], rev));

note('Could we do that already?');
note([[1, 2, 3], [10, 20, 30], [20, 10, 100]].map((x) => x.reverse()));
note('Or perhaps just rev2 = (x) => x.reverse()');
var rev2 = (x) => x.reverse();
note([[1, 2, 3], [10, 20, 30], [20, 10, 100]].map(rev2));


// Generating unique strings: a case study.
// Lets say you need to generate unique strings.

note("GENERATING UNIQUE STRINGS")

function uniqueString(len) {
    return Math.random().toString(36).substr(2, len);
};

note("Here's a unique string: ")
note(uniqueString(10));

note("What if now they want it with a certain prefix?")

function uniqueString2(prefix) {
    return [prefix, uniqueString(10)];
};

note("Unique string version 2...")
note(uniqueString2("argento"));
note(uniqueString2("argento"));
note(uniqueString2("argento"));

note("The requirements changed again! Now they want a prefixed string, with an increasing suffix, starting at some known value");

function makeUniqueStringFunction(start) {
    var counter = start;

    return function(prefix) {
        return [prefix, counter++].join('');
    }
}

var uniqueString3 = makeUniqueStringFunction(0);

note("Testing the dari counter/unique string generator...");
note(uniqueString3("dari"));
note(uniqueString3("dari"));
note(uniqueString3("dari"));

// Why not an object?  It's not entirely safe.  Consider...

var generator = {
    count: 0,
    uniqueString: function(prefix) {
        return [prefix, this.count++].join('');
    }
};

note('Using a generator object instead...');
note('a couple method calls like: generator.uniqueString("bohr") give us...');
note(generator.uniqueString('Bohr'));
note(generator.uniqueString('Bohr'));
note(generator.uniqueString('Bohr'));
note("Oh no! someone is changing our mutable generator object!");

generator.count = "gotcha";
note(generator.uniqueString('Bohr'));

note("Abusing dynamic bindings on your object...");
note(generator.uniqueString.call({count: 1337}, 'bohr'));

note("None of these shenanigans can occur with captured data in a closure. Your counter variable is private, hidden from 1337 eyes.")

note("We CAN safely use an object though.  Wrap the object in a self invoking function block, and now outside forces can't alter our object.")

var omgenerator = (function(init) {
    var counter = init;

    return {
        uniqueString: function(prefix) {
            return [prefix, counter++].join('');
        }
    };
})(0);

note("The new, safe, omgenerator object is ugly, but it works.  This is sometimes needed, but can often be avoided.")

note("omgenerator demo");
note(omgenerator.uniqueString('testing'));
note(omgenerator.uniqueString('testing'));
note(omgenerator.uniqueString('testing'));

note("In general, these examples involved mutating state inside a closure.  This damages referential transparency, and testability, and is generally a bad idea.");

note("GUARDING AGAINST NON-EXISTENCE: FNULL");

// Demonstrating the problem.

var nums = [1, 2, 3, null, 5];

note('nums is...')
note(nums);
note('product of nums: ');
note(_.reduce(nums, function(total, n) { return total * n }));
note('failed because of null value in array.');

function fnull(fun /*, defaults */) {
    var defaults = _.rest(arguments);

    return function(/* args */) {
        var args = _.map(arguments, function(e, i) {
            return existy(e) ? e : defaults[i];
        });

        return fun.apply(null, args);
    }
}

// what fnull does is take a function, and a number of default arguments.  It then returns a new function.
// For every argument to the new function that exists, it uses that argument.  When they don't exist, it uses the default.
// After setting a args array to equal the adjusted arguments, it apply's the new args object to the captured function from the closure.

var safeMult = fnull(function(total, n) {
    return total * n;
}, 1, 1);

note('safeMult is defined with fnull to provide default values in case of null.');
note('Thus when we do _.reduce with safeMult with [1, 2, 3, null, 5]...');
note(_.reduce(nums, safeMult));

// If we were worried about nulls inside an object configuration...

function defaults(d) {
    return function(o, k) {
        var val = fnull(_.identity, d[k]);
        return o && val(o[k]);
    }
}

function doSomething(config) {
    var lookup = defaults({critical: 108});

    return lookup(config, 'critical');
}

note('defaults() takes an object, and returns a function where that objects values will be used if no other ones are found.')
note('Calling doSomething with proper values...');
note(doSomething({critical: 50}));
note(doSomething({critical: "Not now!"}));
note('calling doSomething with no values, or improper values, or irrelevant values')
note(doSomething({}));
note(doSomething(["criticalError", "This is an array"]));
note(doSomething({criticalError: "Key should be critical"}));
note('doSomthing returned the default 108, instead of nonsense.')



// Building an object validator.

var idealObject = {
    message: "Hi!",
    type: "display",
    from: "http://localhost:8080/node/frob"
};

// We want to easily and fluently check future objects for errors, and return sensible error messages if problems are found.
// Functional programming will allow us to do this in a piece by piece, flexible way.
// Functions returning functions is the answer, with a little help from predicate functions.

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


// A basic test of this is as follows

note('Testing the checker, with the alwaysPasses function');
var alwaysPasses = checker(always(true), always(true));
note(alwaysPasses({}));
note('No errors displayed means a pass.')

var fails = always(false);
fails.message = "a failure in life";

var alwaysFails = checker(fails);

note('Testing checker with alwaysFails');
note(alwaysFails({}));

// Adding on a message to the function is kind of weird, and it could conceivably conflict with someone elses code.
// Let's build a simple API for crafting validators.

function validator(message, fun) {
    var f = function(/* args */) {
        return fun.apply(fun, arguments);
    };

    f['message'] = message;
    return f;
}

var gonnaFail = checker(validator("ZOMG!", always(false)));

note('gonnaFail built with new validator function, which provides a nice API that returns the function and meta data together.')
note('gonnaFail result...');
note(gonnaFail({}));

// Lets seperate the testing logic from the validator itself, to keep things cleaner.  Also, let's bring it a step closer to the real.

function aMap(obj) {
    return _.isObject(obj);
}

var checkCommand = checker(validator("must be a map", aMap));
note('using checkCommand({})');
note(checkCommand({}));
note('using checkCommand(42)');
note(checkCommand(42));

// Lets say we want to check if the command object has certain keys...
// We can't directly use the validator function we created earlier.
// But as long as we stick to the contract...
// We should create a function, that returns a function, with message data attached as a property.

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

var checkCommand = checker(
    validator("must be a map", aMap),
    hasKeys('msg', 'type'));

note('After defining a checkCommand with required keys...')
note('checkCommand({}) leads to..')
note(checkCommand({}));
note('checkCommand(27) leads to..')
note(checkCommand(27));
note('checkCommand({msg: "blah"}) leads to..')
note(checkCommand({msg: "blah"}));
note('checkCommand({msg: "blah", type: "commando"}) leads to..')
note(checkCommand({msg: "blah", type: "commando"}));