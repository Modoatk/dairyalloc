var NUM_WIZARD_STEPS = 3;

var nextButtonStrategy = null;
var wizardStep = 1;

function main(data)
{
	for(var i=0; i<data.length; i++)
	{
		for(var season in data[i])
		{
			if(season == 'type')
				continue;
			var ne_g = 0;
			var ne_m = 0;
			var ne_l = 0;
			var dmi = 0;


			for(var ration in data[i][season])
			{
				ne_g += data[i][season][ration].val * getFeedInfo(data[i][season][ration], "Ne_growth");
				ne_l += data[i][season][ration].val * getFeedInfo(data[i][season][ration], "Ne_lactation");
				ne_m += data[i][season][ration].val * getFeedInfo(data[i][season][ration], "Ne_maint");
				dmi += data[i][season][ration].val;
			}

			data[i][season].NEG = ne_g/dmi;
			data[i][season].NEL = ne_l/dmi;
			data[i][season].NEM = ne_m/dmi;

		}
		var grazingfraction = getMonthsGrazing()/12;
		var nongrazingfraction = 1 - grazingfraction;
		data[i].NEG = grazingfraction * data[i].grazing.NEG + nongrazingfraction * data[i].nongrazing.NEG
		data[i].NEM = grazingfraction * data[i].grazing.NEM + nongrazingfraction * data[i].nongrazing.NEM
		data[i].NEL = grazingfraction * data[i].grazing.NEL + nongrazingfraction * data[i].nongrazing.NEL
	}

	var sales = getHeadSold();
	var mature_weight = getMatureWeight();

	for(var animal in sales)
	{

		if(sales[animal].num_sold_beef > 0)
		{
			sales[animal].CDM_beef_growth = cumulativeDryMatterGrowth(sales[animal].weight_beef, mature_weight, data);
			//sales[animal].CDM_beef_growth_maint = cumulativeDryMatterMaint_Growth(sales[animal].weight_beef, mature_weight, data);
		}

		if(sales[animal].num_sold_dairy > 0)
		{
			sales[animal].CDM_dairy_growth = cumulativeDryMatterGrowth(sales[animal].weight_dairy, mature_weight, data);
			//sales[animal].CDM_dairy_growth_maint = cumulativeDryMatter_Maint_Growth(sales[animal].weight_dairy, mature_weight, data);
		}
	}
}

$(document).ready(function ($) {
//Tabify tabs
$('#input-tabs').tab();
nextButtonStrategy = advanceWizard;
$("#input-wizard").bwizard({nextBtnText: ''}, {backBtnText: ''});

$('#get-started').click(function (e){
  wizardStep = 1;
  $("#input-wizard").bwizard("show", 0);
});

$('#modal-primary').click(function (e){
  
  makeValidationError(wizardStep);
  if(wizardStep < NUM_WIZARD_STEPS && !runValidation(wizardStep))
  {
  	return;
  }
  
  nextButtonStrategy();
  
  wizardStep++;
  if(wizardStep < NUM_WIZARD_STEPS)
  {
    nextButtonStrategy = advanceWizard;
  }
  else
  {
    nextButtonStrategy = finishWizard;
  }
});

$('.btn-input').click(function (e){
  if(checkValFeedration())
    switchCompletion('val-feedration');
    if(nextTab())
    {
      $('#'+nextTab()).tab('show');
    }
  else createAlert(validationErrorMessages['val-feedration']);
});

$.ajax({
  url: "feed_nutrients.csv",
  type: 'GET',
  success: function (data){
    window.feedDataCSV = data;
  }          
}).done(function() {
  window.feedData = $.csv.toArrays(feedDataCSV);
});

});