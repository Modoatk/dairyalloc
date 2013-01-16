/** 
 * Facade for calculator logic (calc.js). 
 * 
 * @author Stephen Thoma 
 * @author Sam Pottinger 
 * @author Dr. Greg Thoma 
 * @license GNU GPL v3 
**/
  
var NUMWIZARDSTEPS = 3; 
  
var nextButtonStrategy = null; 
var wizardStep = 1; 
  
  
// TODO(samnsparky): Finish spec for this. 
/** 
 * Run dairy allocation calculation. 
 * 
**/
function main() 
{ 
    var farm = retrieveUserInput();             //WHEN IS FEED.CSV READ - IT IS USED BY getFeedInfo() 
    var monthsGrazing = getMonthsGrazing(); 
    var sales = getHeadSold();         
    var matureWeight = getMatureWeight(); 
    var milkProduction = getMilkProduction(); 
    var milkFat = getMilkFat(); 
    var milkProtein = $('#pr-prot').val();
  
  
    for(var i=0; i<farm.length; i++) // loop through the six animal types 
    { 
     //loop for grazing and non-grazing seasons, by animal class 
        for(var season in farm[i]) 
        { 
            if(season == 'type') 
                continue; 
            var neG = 0; 
            var neM = 0; 
            var neL = 0; 
            var dmi = 0; 
  
// for each season, calculate the sumproduct of the quantity of feed and its specific energy content 
            for(var ration in farm[i][season])  
            { 
                neG += farm[i][season][ration].val * getFeedInfo(farm[i][season][ration].name, 'Ne_growth'); 
                neL += farm[i][season][ration].val * getFeedInfo(farm[i][season][ration].name, 'Ne_lactation'); 
                neM += farm[i][season][ration].val * getFeedInfo(farm[i][season][ration].name, 'Ne_maint'); 
                dmi += farm[i][season][ration].val; 
            } 
/* calculate the season's ration weighted energy content for 
* NEG - net energy content available in the ration for growth 
* NEL - net energy content available in the ration for lactation 
* NEM - net energy content available in the ration for maintenance (basal metabolism functions) 
*/
            farm[i][season].NEG = neG/dmi; 
            farm[i][season].NEL = neL/dmi; 
            farm[i][season].NEM = neM/dmi; 
  
        } 
/* calculate the annual season and ration weighted net energy contents for each animal class 
* these values will be used in the CDM series of functions to calculate the amount of feed consumed 
*  by each animal class for each of the activities (growth, maintenance, or lactation) that are included 
* in this analysis 
*/
        var grazingfraction = monthsGrazing/12; 
        var nongrazingfraction = 1 - grazingfraction; 
        farm[i].NEG = grazingfraction * farm[i].grazing.NEG + nongrazingfraction * farm[i].nongrazing.NEG 
        farm[i].NEM = grazingfraction * farm[i].grazing.NEM + nongrazingfraction * farm[i].nongrazing.NEM 
        farm[i].NEL = grazingfraction * farm[i].grazing.NEL + nongrazingfraction * farm[i].nongrazing.NEL 
    } 
  
//following variables will contain the total feed consumed for growth and maintenance of all animals sold to beef and dairy 
         sales.CDMBeefGrowth = 0; 
         sales.CDMDairyGrowth =0; 
         sales.CDMBeefGrowthMaint = 0; 
         sales.CDMDairyGrowthMaint = 0; 
  
    for(var animal in sales) 
    { 
  
        if(sales[animal].numSoldBeef > 0) // keep track of CDM at both animal and sector (beef or dairy) level 
        { 
            sales[animal].CDMBeefGrowth = CDMGrowth(sales[animal].weightBeef, matureWeight, farm); 
            sales[animal].CDMBeefGrowthMaint = CDM_Maint_Growth(sales[animal].weightBeef, matureWeight, farm); 
            sales.CDMBeefGrowth +=sales[animal].CDMBeefGrowth; 
            sales.CDMDairyGrowth +=sales[animal].CDMBeefGrowthMaint ; 
        } 
  
        if(sales[animal].numSoldDairy > 0) 
        { 
            sales[animal].CDMDairyGrowth = CDMGrowth(sales[animal].weightDairy, matureWeight, farm); 
            sales[animal].CDMDairyGrowthMaint = CDM_Maint_Growth(sales[animal].weightDairy, matureWeight, farm); 
            sales.CDMBeefGrowthMaint += sales[animal].CDMDairyGrowth; 
            sales.CDMDairyGrowthMaint += sales[animal].CDMDairyGrowthMaint; 
        } 
    } 
  
 //ASSUME 35% REPLACEMENT RATE OF MATURE COWS BY FIRST CALF HEIFERS, THUS MAINTAINING A CONSTANT HERD SIZE 
 //CAN MODIFY LATER TO INCLUDE REPLACEMENT RATE AS INPUT VARIABLE 
    sales.CDMMilk = CDMLactation (milkProduction, milkFat, milkProtein, 0.35, farm); 
    sales.CDMMilkMaint =0; 
    for (i=3; i<6;i++) 
        {  
            sales.CDMMilkMaint += CDM_Maint_Lac(farm[i], matureWeight, farm); 
        } 
      
  
  
  
  
  
} 
  
  
// Prepare JS logic for wizard steps / tabls 
$(document).ready(function ($) { 
//Tabify tabs 
$('#input-tabs').tab(); 
nextButtonStrategy = advanceWizard; 
$("#input-wizard").bwizard({nextBtnText: ''}, {backBtnText: ''}); 
  
$('#get-started').click(function (e){ 
  wizardStep = 1; 
  $("#input-wizard").bwizard("show", 0); 
}); 
  
  
// Manage strategies to move through the wizard dialog. 
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

$('.grazing-month').keyup(function() {
	monthsGrazingAutoComplete();
});
  
  
// Request feed nutrients farm 
$.ajax({ 
  url: "feed_nutrients.csv", 
  type: 'GET', 
  success: function (farm){ 
    window.feedfarmCSV = farm; 
  }           
}).done(function() { 
  window.feedfarm = $.csv.toArrays(feedfarmCSV); 
}); 
  
});