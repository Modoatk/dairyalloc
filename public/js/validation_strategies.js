
// Wizard
var validationStrategies = {};
validationStrategies.step1 = [
	{
		method: checkNumSelected,
		elementName: "#dropdown-grazingfeeds",
		params: [2],
		tooltip: "Select at least %d feeds"
	},
	{
		method: checkNumSelected,
		elementName: "#dropdown-nongrazingfeeds",
		params: [2],
		tooltip: "Select at least %d feeds"
	}
];

validationStrategies.step2 = [
  	{		
		method: checkIfInRange,
		elementName: "#wt-mature",
		params: [400, 700],
		tooltip: "Must be between %d and %d"
  	},
  	{
		method: checkIfInRange,
		elementName: "#num-calves-beef",
		params: [0, 10000],
		tooltip: "Must be between %d and %d"
  	},
  	{
		method: checkIfInRange,
		elementName: "#num-calves-dairy",
		params: [0, 10000],
		tooltip: "Must be between %d and %d"
  	}
];
validationStrategies.step3 = [
  	{
		method: checkIfInRange,
		elementName: "#wt-milk",
		params: [0, 300000000],
		tooltip: "Must be between %d and %d"
  	},
  	{
		method: checkIfInRange,
		elementName: "#pr-prot",
		params: [0, 10],
		tooltip: "Must be between %d and %d"
  	},
  	{
		method: checkIfInRange,
		elementName: "#pr-fat",
		params: [0, 10],
		tooltip: "Must be between %d and %d"
  	}
];

// Large input table
function IntegerFieldValidator(elem)
{
	this.elem = elem;

	this.validate = function()
	{
		if(/^\d+$/.test($(elem).val()))
		{
			$(elem).tooltip('hide');
			return true;
		}
		else
		{
			$(elem).tooltip({ 
				placement: 'right',
				trigger: 'manual',
				title: "Must be an integer (non-decimal number)."
			}).tooltip('show');
			return false;
		}
	}
}


function FloatFieldValidator(elem)
{
	this.elem = elem;

	this.validate = function()
	{
		if(/^\d+(\.\d*)?$/.test($(elem).val()))
		{
			$(elem).tooltip('hide');
			return true;
		}
		else
		{
			$(elem).tooltip({ 
				placement: 'right',
				trigger: 'manual',
				title: "Must be a decimal number."
			}).tooltip('show');
			return false;
		}
	}
}