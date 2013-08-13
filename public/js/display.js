/**
 * Presenter logic for the Dairy Allocation Calculator project.
 *
 * @author Stephen Thoma
 * @author Sam Pottinger
 * @author Dr. Greg Thoma
 * @license GNU GPL v3
**/

var MAX_FEEDS = 15;
var MIN_FEEDS = 2;
var LARGE_INPUT_TABLE_INTEGER_FIELD_CLASSES = ['.grazing-month', '.nongrazing-month', '.sold'];
var LARGE_INPUT_TABLE_FLOAT_FIELD_CLASSES = ['.feed-in', '.weight'];
var largeInputTableValidators = [];


// Add standard filter method to Array if not provided by runtime
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


// Add standard map method to Array if not provided by runtime.
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
 * Replace a string's underscores with spaces.
 *
 * @param {string} str, The string to perform the replace on.
 * @return {string}, The transformed string.
**/
function transString(str)
{
	return str.split("_").join(" ");
}


function ensureAndGetKey(target, key)
{
	if(!target.hasOwnProperty(key))
		target[key] = {};
	return target[key];
}


/**
 * Retrieves the number of head sold and their respective weights.
 *
 * @return {array}, Head sold and respective weights.
**/
function getHeadSold()
{
	output = {}
	types = [
		{
			typeName: 'beef',
			weightSetterStrategy: function(animalInfo, value)
			{animalInfo.weight_beef = value;},
			soldSetterStrategy: function(animalInfo, value)
			{animalInfo.sold_beef = value;}
		},
		{
			typeName: 'dairy',
			weightSetterStrategy: function(animalInfo, value)
			{animalInfo.weight_dairy = value;},
			soldSetterStrategy: function(animalInfo, value)
			{animalInfo.sold_dairy = value;}
		}
	];

	for(i in types)
	{
		var typeName = types[i].typeName;
		var weightSetterStrategy = types[i].weightSetterStrategy;
		var soldSetterStrategy = types[i].soldSetterStrategy;

		$('.tab-pane').find('.weight-'+typeName).each(function(j, elem) {
			var animalName = $(elem).parents('.tab-pane').attr('id').split('_')[0];
			var animalInfo = ensureAndGetKey(output, animalName);
			var val = parseFloat($(elem).val());
			weightSetterStrategy(animalInfo, val);
		});

		$('.tab-pane').find('.sold-'+typeName).each(function(j, elem) {
			var animalName = $(elem).parents('.tab-pane').attr('id').split('_')[0];
			var animalInfo = ensureAndGetKey(output, animalName);
			var val = parseInt($(elem).val());
			soldSetterStrategy(animalInfo, val);
		});
	}

	return output;
}

/**
 * Retrieve input number of months spent grazing for each animal type.
 *
 * @return {object} Number of months spent grazing for each animal type.
**/
function getMonthsGrazing()
{
	var output = {}
	$('.tab-pane').find('.grazing-month').each(function(i) {
		var active_tab = $(this).parents('.tab-pane').attr('id').split('_')[0];
		var months = $(this).val();
		output[active_tab] = months;
	});
	return output;
}

/**
 * Retrieves the user input feeds used.
 *
 * @return {array} Array of arrays containing the selected feeds.
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
 * Gather user entries from large input table.
 *
 * @return {array} Array containing the input values.
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


/*
 * Determine if a given target's value is within its predetermined range.
 *
 * @return {boolean} True if acceptable, false otherwise.
*/
function checkIfInRange(targetName, params)
{
	var curVal = $(targetName).val();
  	curVal = parseFloat(curVal);
  	return curVal >= params[0] && curVal <= params[1];
}


/*
 * Determine if number checkboxes is within target is within acceptable range.
 *
 * @return {boolean} True if acceptable, false otherwise.
*/
function checkNumSelected(targetName, numNeededParam)
{
  	var numNeeded = numNeededParam[0];
  	var numSelected = $(targetName + ' input:checked').size();
  	return numSelected >= numNeeded;
}


/*
 * Evaluate a component's validation strategy.
 *
 * @param {string} component, The component whose strategy will be run.
 * @return {boolean} True if validated successfully, and false otherwise.
*/
function runWizardValidationStrategy(component)
{
	var method = component.method;
	var elementName = component.elementName;
	var params = component.params;
	return method(elementName, params);
}

/*
 * Perform a validation for a given wizard step.
 *
 * @param {string} name, The name of the step to use.
 * @return {boolean} True if validated successfully, and false otherwise.
*/
function runWizardValidation(name)
{
	var strategy = validationStrategies[
	"step" + new String(name)
	];
	if(strategy === null || strategy === undefined)
	return false;

	var failed_components = strategy.filter(
		function(component, index, targetArray)
		{
			return !runWizardValidationStrategy(component);
		}
	);

	return failed_components.length == 0;
}


/*
 * Create a validation tooltip error for a given wizard step.
 *
 * @param {string} name, The name of the step to use.
*/
function makeWizardValidationError(name)
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

		if(runWizardValidationStrategy(component))
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
 * Load the feeds to be used from storage and populate form fields.
**/
function populateFeeds(feedData)
{
	var feeds = new Array;
	for (var feed in feedData)
	{
		status = feedData[feed][1];
		feedName = feedData[feed][0];
 		if (status == 1)
  			feeds.push(feedName);
	}

	for (var feedNum in feeds)
	{
		var feed = feeds[feedNum];
		var human_feed = transString(feed);
		var grazingfeed_format = '<div><input id="grazinginput-'+feed+'" type="checkbox"/><label for="grazinginput-'+feed+'">'+human_feed+'</label></div>';
		var nongrazingfeed_format = '<div><input id="nongrazinginput-'+feed+'" type="checkbox"/><label for="nongrazinginput-'+feed+'">'+human_feed+'</label></div>';

		$('#dropdown-grazingfeeds').each(function(idx) {
			$(this).append(grazingfeed_format);
		});

		$('#dropdown-nongrazingfeeds').each(function(idx) {
			$(this).append(nongrazingfeed_format);
		});
	}
}

/**
 * Form input feed table rows based on feeds chosen.
 *
 * @return {array} An array of created rows.
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


function prepareLargeInputTableValidators()
{
	for(i in LARGE_INPUT_TABLE_INTEGER_FIELD_CLASSES)
	{
		var curClassName = LARGE_INPUT_TABLE_INTEGER_FIELD_CLASSES[i];
		$(curClassName).each(
			function(j, elem)
			{
				largeInputTableValidators.push(new IntegerFieldValidator(elem));
			}
		);
	}

	for(i in LARGE_INPUT_TABLE_FLOAT_FIELD_CLASSES)
	{
		var curClassName = LARGE_INPUT_TABLE_FLOAT_FIELD_CLASSES[i];
		$(curClassName).each(
			function(j, elem)
			{
				largeInputTableValidators.push(new FloatFieldValidator(elem));
			}
		);
	}
}


/**
 * Add rows to the input table.
**/
function appendTableRows(rows)
{
	var appendRows = rows;
	prepareLargeInputTableValidators();
	for (var i=0; i<rows.length; i++)
	{
		$('.input-table').each(function(idx) {
			$(this).after('<tr class="input-table-tr'+i+'">'+appendRows[i]+'</tr>');
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
 * Check validity of feedration values input by user.
 *
 * @return {boolean} True if allowable and false otherwise.
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
 * Determines whether all data is entered and the calculation can be performed.
 *
 * @return {boolean} True if calculation can be performed and false otherwise.
**/
function checkReady()
{
	return true;
}


/**
 * Move the input wizard to the next step.
**/
function advanceWizard()
{
  $("#input-wizard").bwizard("next");
}


/**
 * Hide the modal and create the large input table.
**/
function finishWizard()
{
  $("#input-modal").modal('hide');
  genPopulatedTable();
}


/**
 * Switch the completion status of page elements. 
 *
 *  Actions to be taken to visually cue that data input has been accepted
 *  if prerequisite actions have already been completed.
 * @param {string} type, Defines which actions to take based on the form that was completed.
**/
function switchCompletion(type){
	if(type == "gen-table")
		$('#input-table-hide').removeClass('hide');

	else if(type == "num-grazingmonths")
		$('#btn-grazingmonths').addClass('btn-success').removeClass('btn-warning').html('Saved!');

	else if(type == "val-feedration")
		$('.tab-warning.active').addClass('tab-success').removeClass('tab-warning');
}


/**
 * Determine which tab follows the currently active one.
 *
 * @return {string} The id of the next tab
**/
function nextTab()
{
	var tabs = ['heifer_tab', 'bredheifer_tab', 'springer_tab', 'firstcalf_tab', 'dry_tab', 'lactating_tab'];
	var active_tab = $('.tab-pane.active').attr('id');
	return  tabs[tabs.indexOf(active_tab) + 1];
}

/**
 * Populate corresponding grazing field with remaining months in a year.
 *
 * @param {string} type, The type of grazing input.
**/
function monthsGrazingAutoComplete(type)
{
	var other;
	if(type == '.grazing-month')
		other = '.nongrazing-month';
	else other = '.grazing-month';

	numMonths = $('.tab-pane.active').find(type).val();
	if(numMonths > 0 && numMonths <= 12)
	{
		numOtherMonths = 12 - numMonths;
		$('.tab-pane.active').find(other).val(numOtherMonths);
	}
}


/**
 * Create the large input table with proper rows
**/
function genPopulatedTable()
{
	$('#main-hero').removeClass('logo');
	$('#welcome-hide').addClass('hide');
	rmAllTableRows();
	var rows = createTableRows();
	appendTableRows(rows);
	switchCompletion('gen-table');
}


/**
 * Insert calculated values into the output table.
 *
 * @param {array}, The values to be inserted.
**/
function populateOutputTable(data)
{

}
		
// Large input table tooltip definitions.
$('#heifer_info').tooltip({placement: 'right', trigger: 'hover',
						   title: 'Heifers refer to female animals which will be bred as replacements for culled mature cows. Also refered to as Open Heifers.'});
$('#bredheifer_info').tooltip({placement: 'right', trigger: 'hover',
						   title: 'Animals which have been bred, typically at approximately 13 -14 months of age.'});
$('#springer_info').tooltip({placement: 'right', trigger: 'hover',
						   title: 'This animal class may not be commonly used; it is a subset of Bred Heifers which may receive a different diet during the final 3 to 4 weeks of pregnancy.'});
$('#firstcalf_info').tooltip({placement: 'right', trigger: 'hover',
						   title: 'These are primaparous animals, in their first lactation.'});
$('#dry_info').tooltip({placement: 'right', trigger: 'hover',
						   title: 'These are animals in their second or later pregnancy, typically in the last 60 days of pregnancy prior to returning to the milking herd.'});
$('#lactating_info').tooltip({placement: 'right', trigger: 'hover',
						   title: 'These are multiparous lactating animals; they are included as a separate class because frequently the ration for multiparous animals is different than for primaparous animals.'});
