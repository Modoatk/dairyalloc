/**
 * Unit testing logic for calc.js.
 *
 * Logic to run a list of tests on mathematical functions where each test checks
 * the return value for equality against a known value using a list of
 * predefined parameters.
 *
 * @author Stephen Thoma
 * @author Sam Pottinger
 * @author Dr. Greg Thoma
 * @license GNU GPL 3
**/

var util = require('util');
var calc = require('./calc');

// Unit testing suite definitions
var suiteDefns = 
[
  {name: "testBertAge", method: calc.bertAge, tests:
   [
     {params:[5, 10], expected_val: 355.951102, tolerance:0.00001},
     {params:[7, 15], expected_val: 328.129754, tolerance:0.00001}
   ]
  },
  {name: "testBertWeight", method: calc.bertWeight, tests:
   [
     {params:[5,10], expected_val: 0.66859931, tolerance:0.00001},
     {params:[51, 95], expected_val: 10.6904233, tolerance:0.00001}
   ]
  },
  {name: "testAvgShrunkWeightGain", method: calc.avgShrunkWeightGain, tests:
   [
     {params:[20,30,10], expected_val: 0.00981868, tolerance:0.0000001},
     {params:[5,40,90], expected_val: 0.08720814, tolerance:0.0000001}
    ]
  },
  {name: "testRetainedEnergy", method: calc.retainedEnergy, tests:
   [
     {params:[20,30,10,20,10], expected_val: 0.82872596, tolerance:0.0000001},
     {params:[30,90,10,12,500], expected_val: 0.35342484, tolerance:0.0000001}
   ]
  }
]

/**
 * Test a single unit testing suite.
 *
 * Test a single unit testing suite where each test checks return values given
 * a set of parameters, using floating point equality with a tollerance. Values
 * are based on suite definitions.
 *
 * @param {object} The definition of the testing suite to run. Should have
 *                 name {string}, method {function}, and tests {list of object}
 *                 attribute. Furthermore, tests' elements should have params
 *                 {array of number}, expected_value {number}, and tollerance
 *                 {number}.
**/
function testCalculation(suiteDefn)
{
  var name = suiteDefn.name;
  var method = suiteDefn.method;
  var tests = suiteDefn.tests;
  for(var i in tests)
  {
    var test = tests[i];
    var params = test.params;
    var expected = test.expected_val;
    var tolerance = test.tolerance;
    
    var result = method.apply(this, params);
 
    if(Math.abs(result - expected) > tolerance)
    {
      var errMsg = util.format(
        "Test %s failed (expected %d but got %d).",
        name,
        expected,
        result
      );
      console.log(errMsg);
    }
  }
}
 
/**
 * Run all tests in suiteDefns.
**/
function runTests()
{
  console.log("Running tests...");
  for(var i in suiteDefns)
  {
    var suite = suiteDefns[i];
    testCalculation(suite);
  }
  console.log("Tests complete.");
}
 
runTests();
