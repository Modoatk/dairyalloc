var util = require('util');
var calc = require('./calc');

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
