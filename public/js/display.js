var MAX_FEEDS = 15;
var MIN_FEEDS = 2;

if (!Array.prototype.filter)
{
  Array.prototype.filter = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    var res = new Array();
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
      {
        var val = this[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, this))
          res.push(val);
      }
    }

    return res;
  };
}

if (!Array.prototype.map)
{
  Array.prototype.map = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    var res = new Array(len);
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
        res[i] = fun.call(thisp, this[i], i, this);
    }

    return res;
  };
}

/**
 * Name: transString(str)
 * Desc: Replace '_' with ' ' for human readability.
 * Para: str, The string to perform the replace on.
**/
function transString(str)
{
  return str.split("_").join(" ");
}

/**
 * Name: getHeadSold()
 * Desc: Retrieves the number of head sold to beef and dairy and their
 *       respective weights.
 * Retr: Head sold and respective weights.
**/
function getHeadSold()
{

}

/**
 * Name: getFeedsUsed()
 * Desc: Retrieves the user input feeds used.
 * Retr: Array of arrays containing the selected feeds.
**/
function getFeedsUsed()
{
	var grazing_selected = [];
	var nongrazing_selected = [];

	$('#dropdown-grazingfeeds input:checked').each(function() {	
		var x = $(this).attr('id').split('-')[1];
		grazing_selected.push(x);
	});

	$('#dropdown-nongrazingfeeds input:checked').each(function() {
		var x = $(this).attr('id').split('-')[1];
		nongrazing_selected.push(x);
	});
	return [grazing_selected, nongrazing_selected];
}

/**
 * Name: retrieveUserInput()
 * Desc: Gather user entries from large input table.
 * Retr: Array containing the input values.
**/
function retrieveUserInput()
{
	var output = [];
	output.push(
		{ type: "heifer", grazing: {}, nongrazing: {} }, //0
		{ type: "bred_heifer", grazing: {}, nongrazing: {} }, //1
		{ type: "springer", grazing: {}, nongrazing: {} }, //2
		{ type: "first_calf_heifer", grazing: {}, nongrazing: {} }, //3
		{ type: "dry", grazing: {}, nongrazing: {} }, //4
		{ type: "lactating", grazing: {}, nongrazing: {} } //5
		);

	$('.tab-pane').find('.feed-in-num').children().each(function(i) {
		var active_tab = $(this).parents('.tab-pane').attr('id').split('_')[0];
		var feed_id = $(this).attr('id').split('-');
		var feed_val = $(this).attr('value');
		var idx;
		switch(active_tab)
		{
			case "heifer":
				idx = 0;
				break;
			case "bredheifer":
				idx = 1;
				break;
			case "springer":
				idx = 2;
				break;
			case "firstcalf":
				idx = 3;
				break;
			case "dry":
				idx = 4;
				break;
			case "lactating":
				idx = 5;
				break;
		}

		var new_feed = 'feed_' + i;
		output[idx][feed_id[1]][new_feed] = { name: feed_id[2], val: feed_val };
	});
	return output;
}


function checkIfInRange(targetName, params)
{
  var curVal = $(targetName).val();
  curVal = parseFloat(curVal);
  return curVal >= params[0] && curVal <= params[1];
}

function checkNumSelected(targetName, numNeededParam)
{
  var numNeeded = numNeededParam[0];
  var numSelected = $(targetName + ' input:checked').size();
  return numSelected >= numNeeded;
}

var validationStrategies = {};
validationStrategies.step1 = [
	{
		method: checkNumSelected,
		elementName: "#dropdown-grazingfeeds",
		params: [2],
		tooltip: "Need to select %d elements"
	},
	{
		method: checkNumSelected,
		elementName: "#dropdown-nongrazingfeeds",
		params: [2],
		tooltip: "Need to select %d elements"
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

function runValidationStrategy(component)
{
	var method = component.method;
	var elementName = component.elementName;
	var params = component.params;
	return method(elementName, params);
}

function runValidation(name)
{
  var strategy = validationStrategies[
	"step" + new String(name)
  ];
  if(strategy === null || strategy === undefined)
	return false;
  
  var failed_components = strategy.filter(
  	function(component, index, targetArray)
  	{
  		return !runValidationStrategy(component);
  	}
  );

  return failed_components.length == 0;
}

function makeValidationError(name)
{
  var strategy = validationStrategies[
	"step" + new String(name)
	];
	if(strategy === null || strategy === undefined)
		return false;
	  
	for(var componentName in strategy)
	{
		var component = strategy[componentName];
		var elementName = component.elementName;

		if(runValidationStrategy(component))
		{
			$(elementName).tooltip('hide');
		}
		else
		{
			var tooltipText = component.tooltip;
			var params = component.params.slice(0);
			
			var displayText = vsprintf(tooltipText, params);
			if(elementName.split('-')[0] == '#dropdown')
			{
				$(elementName).tooltip({ 
					placement: 'bottom',
					trigger: 'manual',
					title: displayText
				}).tooltip('show');
			}
			else
			{
				$(elementName).tooltip({ 
					placement: 'right',
					trigger: 'manual',
					title: displayText
				}).tooltip('show');
			}
		}
	}
}

/**
 * Name: createTableRows()
 * Desc: Form the rows containing chosen feeds to be displayed in the large input table.
 * Retr: Array of created rows.
**/
function createTableRows()
{
	var created_rows = [];

	var feeds_used = getFeedsUsed();
	var grazing_feeds = feeds_used[0];
	var nongrazing_feeds = feeds_used[1];

	//Set longest to the period with more feeds used
	var longest;
	if(grazing_feeds.length >= nongrazing_feeds.length)
		longest = grazing_feeds.length;
	else longest = nongrazing_feeds.length;

	var grazing_cells;
	var nongrazing_cells;
	for (var i=0; i<longest; i++){
		if(i<grazing_feeds.length)
		{
			var ghuman_feed = transString(grazing_feeds[i]);
			grazing_cells = '<td id="'+grazing_feeds[i]+'">'+ghuman_feed+
								'</td><td class="feed-in-num"><input id="input-grazing-'+
								grazing_feeds[i]+'" type="text" class="feed-in feed-in-num" /></td>';

		}
		else grazing_cells = '<td id="grazing_spacer'+i+'" colspan=2></td>';

		if(i<nongrazing_feeds.length)
		{
			var nhuman_feed = transString(nongrazing_feeds[i]);
			nongrazing_cells = '<td id="'+nongrazing_feeds[i]+'">'+nhuman_feed+
								'</td><td class="feed-in-num"><input id="input-nongrazing-'+
								nongrazing_feeds[i]+'" type="text" class="feed-in feed-in-num" /></td>';
		}
		else nongrazing_cells = '<td id="nongrazing_spacer'+i+'" colspan=2></td>';

		var row = grazing_cells + nongrazing_cells;
		created_rows.push(row);
	}
	created_rows = created_rows.reverse();
	return created_rows;
}

/**
 * Name: appendTableRows()
 * Desc: Add rows to the large input table.
**/
function appendTableRows()
{
	var rows = createTableRows();
	for (var i=0; i<rows.length; i++)
	{
		$('.input-table').each(function(idx) {
			$(this).after('<tr class="input-table-tr'+i+'">'+rows[i]+'</tr>');
		});
	}
}

/**
 * Name: rmAllTableRows()
 * Desc: Delete all rows that could have been added.
**/
function rmAllTableRows()
{
	for (var i=0; i<MAX_FEEDS; i++)
	{
		$('.input-table-tr' + i).each(function(idx) {
			$(this).remove();
		});
	}
}

/**
 * Name: checkValFeedration()
 * Desc: Check validity of feedration values input by user.
 * Retr: True if allowable and false otherwise.
**/
function checkValFeedration()
{
	var input_feeds = 0;
	var float_regex = /^((\d+(\.\d *)?)|((\d*\.)?\d+))$/;

	var feeds = getFeedsUsed();
	var num_feeds = feeds[0].length + feeds[1].length;

	var active_tab = $('.tab-pane.active').attr('id');
	$('#'+active_tab).find('.feed-in-num').children().each(function() {
		var feed_val = $(this).attr('value');
		if(feed_val.match(float_regex))
			input_feeds += 1;
	});

	return input_feeds === num_feeds;
}

/**
 * Name: checkReady()
 * Desc: Determines whether all data is entered and the calculation can be performed.
 * Retr: True if calculation can be performed and false otherwise.
**/
function checkReady()
{
	return true;
}

// Listing of error messages for validation routines
var validationErrorMessages = {
	"gen-table" : "<strong>Error:</strong> Please select at least <strong>"+MIN_FEEDS+
	"</strong> and as many as <strong>"+MAX_FEEDS+"</strong> feeds from the dropdown menus!",
	"num-grazingmonths" : "<strong>Error:</strong> Please enter a number from 0 to 12 "+
	"for the number of months spent grazing!",
	"val-feedration" : "<strong>Error:</strong> Please ensure <strong>all fields</strong> have been been completed!"
};

function advanceWizard()
{
  $("#input-wizard").bwizard("next");
}

function finishWizard()
{
  $("#input-modal").modal('hide');
  genPopulatedTable();
}

/**
 * Name: switchCompletion(type)
 * Desc: Actions to be taken to visually cue that data input has been accepted
 *       if prerequisite actions have already been completed.
 * Para: type, Defines which actions to take based on the form that was completed.
**/
function switchCompletion(type){
	if(type == "gen-table")
		$('#input-table-hide').removeClass('hide');

	else if(type == "num-grazingmonths")
		$('#btn-grazingmonths').addClass('btn-success').removeClass('btn-warning').html('Saved!');

	else if(type == "val-feedration")
		$('.tab-warning.active').addClass('tab-success').removeClass('tab-warning');
}

function nextTab()
{
	var tabs = ['heifer_tab', 'bredheifer_tab', 'springer_tab', 'firstcalf_tab', 'dry_tab', 'lactating_tab'];
	var active_tab = $('.tab-pane.active').attr('id');
	return  tabs[tabs.indexOf(active_tab) + 1];
}

function genPopulatedTable()
{
	$('#main-hero').removeClass('logo');
	$('#welcome-hide').addClass('hide');
	rmAllTableRows();
	appendTableRows();
	switchCompletion('gen-table');
}

/**
 * Name: populateOutputTable(data)
 * Desc: Insert calculated values into the output table.
 * Para: data, The values to be inserted.
**/
function populateOutputTable(data)
{

}

