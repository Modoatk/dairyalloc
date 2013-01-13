var NUMWIZARDSTEPS = 3;

var nextButtonStrategy = null;
var wizardStep = 1;

function main(data)
{
    var monthsGrazing = getMonthsGrazing();
    var sales = getHeadSold();
    var matureWeight = getMatureWeight();

	for(var i=0; i<data.length; i++)
	{
		for(var season in data[i])
		{
			if(season == 'type')
				continue;
			var neG = 0;
			var neM = 0;
			var neL = 0;
			var dmi = 0;


			for(var ration in data[i][season])
			{
				neG += data[i][season][ration].val * getFeedInfo(data[i][season][ration], "Ne_growth");
				neL += data[i][season][ration].val * getFeedInfo(data[i][season][ration], "Ne_lactation");
				neM += data[i][season][ration].val * getFeedInfo(data[i][season][ration], "Ne_maint");
				dmi += data[i][season][ration].val;
			}

			data[i][season].NEG = neG/dmi;
			data[i][season].NEL = neL/dmi;
			data[i][season].NEM = neM/dmi;

		}
		var grazingfraction = monthsGrazing/12;
		var nongrazingfraction = 1 - grazingfraction;
		data[i].NEG = grazingfraction * data[i].grazing.NEG + nongrazingfraction * data[i].nongrazing.NEG
		data[i].NEM = grazingfraction * data[i].grazing.NEM + nongrazingfraction * data[i].nongrazing.NEM
		data[i].NEL = grazingfraction * data[i].grazing.NEL + nongrazingfraction * data[i].nongrazing.NEL
	}

	for(var animal in sales)
	{

		if(sales[animal].numSoldBeef > 0)
		{
			sales[animal].CDMBeefGrowth = cumulativeDryMatterGrowth(sales[animal].weightBeef, matureWeight, data);
			//sales[animal].CDMBeefGrowthMaint = cumulativeDryMatterMaintGrowth(sales[animal].weightBeef, matureWeight, data);
		}

		if(sales[animal].numSoldDairy > 0)
		{
			sales[animal].CDMDairyGrowth = cumulativeDryMatterGrowth(sales[animal].weightDairy, matureWeight, data);
			//sales[animal].CDMDairyGrowthMaint = cumulativeDryMatterMaintGrowth(sales[animal].weightDairy, matureWeight, data);
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
  if(wizardStep < NUMWIZARDSTEPS && !runValidation(wizardStep))
  {
  	return;
  }
  
  nextButtonStrategy();
  
  wizardStep++;
  if(wizardStep < NUMWIZARDSTEPS)
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