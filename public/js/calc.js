/** 
 * Calculation logic for supporting dairy allocation calculation. 
 * 
 * @author Stephen Thoma 
 * @author Sam Pottinger 
 * @author Dr. Greg Thoma 
 * @license GNU GPL v3 
**/
  
// TODO(samnsparky): There are a lot of abbreviations in these functions. We 
//                   need to elaborate to ensure code longevity. 
  
  
/** 
 * Get nutriet information about a type of feed.  
 *  
 * @param feed {string} The name of the feed for which information is requested. 
 * @param type {string} Identifier for the feed attribute requested. Options 
 *                      include "INF", "neLact", "neGrowth", "neMaint", "DM", 
 *                      and "CP" 
 * @return {number} Value of attribute requested 
**/
function getFeedInfo(feed, type) 
{ 
    var idx; 
    switch(type) 
    { 
        case "IFN": 
            idx = 1; 
            break; 
        case "ne_lact": 
            idx = 2; 
            break; 
        case "ne_growth": 
            idx = 3; 
            break; 
        case "ne_maint": 
            idx = 4; 
            break; 
        case "DM": 
            idx = 5; 
            break; 
        case "CP": 
            idx = 6; 
            break; 
    } 
    for(var i=0; i<feedData.length; i++) 
    {  
        if($.inArray(feed, feedData[i]) !== -1) 
            var feedIndex = i; 
    } 
  
    if(feedIndex) 
        return feedData[feedIndex][idx]; 
} 
  
/** 
 * Calculate estimated age of a heifer given weight using von Bertalanffy model. 
 * 
 * @param weight {number} Weight for age needed. 
 * @param matureWeight {number} Breed mature weight. 
 * @return {number} Age in days. 
 * @note See 'Comparison of Nonlinear Models...' Brown et. al. Sci. 42:810-818 
**/
function bertAge(weight, matureWeight) 
{ 
    var cy = Math.pow(weight / matureWeight,1/3); 
  
    // Inverse days original work: -0.0036 breeding age and weight matched to 13 
    // months age and 275kg (0.55 MatureWt) 
    var k = -0.003014; 
  
    // To match birth weight: B= 0.60314974 bw = 0.0625 * MatureWt 
    var B = 0.60314974; 
  
    return (1 / k) * Math.log((1 - cy) / B); 
} 
  
/** 
 * Calculate estimated weight of a heifer given age using von Bertalanffy model. 
 * 
 * @param age {number} The age of the heifer. 
 * @param matureWeight {number} Breed mature weight. 
 * @return {number} Expected weight in kg. 
**/
function bertWeight(age, matureWeight) 
{ 
    // Inverse days original work: -0.0036 breeding age and weight matched to 13 
    // months age and 275kg (0.55 MatureWt) 
    var k = -0.003014; 
  
    // To match birth weight: B= 0.60314974 bw = 0.0625 * MatureWt 
    var B = 0.60314974; 
  
    return matureWeight * Math.pow((1 - B * Math.exp(k * age)),3); 
} 
  
/** 
 * Calculate average shrunk weight gain between two day stamps. 
 * 
 * @param {number} timeOne The number of days to start the estimation for. 
 * @param {number} matureWeight The mature weight for the target breed. 
 * @return {number} Expected weight gain in kg. 
**/
function avgShrunkWeightGain(timeOne, timeTwo, matureWeight) 
{ 
    return 1 / (timeTwo - timeOne) * (bertWeight(timeTwo, matureWeight) 
        - bertWeight(timeOne, matureWeight)); 
} 
  
/** 
 * Calculate retained energy given start and end days and live weights. 
 * Retained energy is a measure of the calories and nutrients consumed in the  
 * ration which are 'deposited' as flesh or body mass of the growing animal 
 * 
 * @param ageStart {number} The start age in days of the heifer to start the 
 *                          calculation. 
 * @param ageEnd {number} The age in days of the heifer to end the calculation. 
 * @param startLiveWeight The live weight to start the calculation. 
 * @param endLiveWeight The live weight to end the calculation. 
**/
function retainedEnergy(ageStart, ageEnd, startLiveWeight, endLiveWeight, matureWeight) 
{ 
    if(ageStart >= ageEnd) 
        return 0; 
  
    var matureShrunkBodyWeight = 0.96 * matureWeight; 
    var startshrunkbodyWeight = 0.96 * startLiveWeight; 
  
    // 0.96 * (endLiveWeight - startLiveWeight) / (ageEnd - ageStart) 
    var shrunkweightGain = avgShrunkWeightGain(ageStart, ageEnd, matureWeight); 
  
    if(shrunkweightGain < 0) 
    { 
        // If statements benchmark much faster than greater-than/less-than switch statement 
        // these default gains are typical from the NRC Nutrient Requirements for Dairy Cattle, 2001 edition 
        if(ageEnd < 100) 
            shrunkweightGain = 0.8; 
        else if(ageEnd < 500) 
            shrunkweightGain = 0.5; 
        else if(ageEnd < 700) 
            shrunkweightGain = 0.4; 
        else if(ageEnd > 701) 
            shrunkweightGain = 0.25; 
    } 
  
    // TODO(samnsparky): These values are not explained 
    return 3.238 * matureShrunkBodyWeight * Math.pow(shrunkweightGain,0.97) * (Math.pow((endLiveWeight * 0.96 / matureShrunkBodyWeight),7/4) - Math.pow((startshrunkbodyWeight / matureShrunkBodyWeight),7/4)); 
} 
  
  
// TODO(samnsparky): Need description. 
/** 
 * Calculates integrated Net Energy for Maintenance during growth. 
 * 
 * 
 * @param {number} ageStart The age in days to start the calculation on. 
 * @param {number} ageEnd The age in days to end the calculation on. 
 * @param {number} startLiveWeight The weight in kg that the heifer starts at. 
 * @param {number} endLiveWeight The weight in kg that the heifer ends at. 
 * @return {number} Required energy // TODO(samnsparky): Need units 
**/
function maintEnergyGrowth(startWeight, endWeight) 
{ 
 return (8/175)*(Math.pow(startWeight,7/4) - Math.pow(endWeight,7/4)); 
} 
  
  
  
/** 
 * Calculate the energy requirement for basal metabolism (maintenance) of first Calf Heifers, 
 * Mature lactating animals and dry cows (assumed pregnant). 
 * 
 * @param {number} liveWeight: The weight in kg of the animal. 
 * @param {number} matureWeight: The weight in kg of mature animals of the herd breed. 
 * @return {number} Required net energy for maintenance for lactating or dry animals Mcal (per year per animal) 
**/
function maintEnergyLactation(liveWeight, daysPreg, matureWeight) 
{ 
    var CW = 0; 
    if (DaysPreg > 190) 
    CW  = (18 + ((daysPreg - 190) * 0.665)) * (0.06275 * matureWeight /45); 
// assume that the herd population is stable over the year, so multiply by 365 days 
    return 365*0.08 * Math.pow(liveWeight - CW, 0.75);  
} 
  
  
/** 
 * Calculate the annual energy requirement for milk production by  first Calf Heifers and  
 * Mature lactating animals. 
 * 
 * @param {number} milkProduction: annual milk production (kg/year) 
 * @param {number} milkFat: Average annual milk fat content of milk sold 
 * @param {number} milkProtein: Average annual true protein content of milk sold 
 * @return {number} Required net energy for milk production for lactating animals Mcal (per year) 
**/
function CDMLactation (milkProduction, milkFat, milkProtein, replaceRate, data) 
{ 
var neLact = replaceRate*data.firstCalfHeifer.NEL + (1-replaceRate)*data.mature.NEL;  // Assuming replacement rate as weighting for energy density 
 return (milkProduction * (0.0929 * milkFat + 0.05882 * milkProtein + 0.192)/neLact); 
} 
  
// TODO(samnsparky): Need description. 
/** 
 * Calculate the cumulative growth in dry matter. 
 * 
 * @param {number} saleWeight The heifer weight in kg at sale. 
 * @param {number} matureWeight The heifer weight in kg at breed maturity. 
 * @param {array} Nested array of arrays. First nested array has header 
 *                information and the subsequent arrays contain strings 
 *                capable of being cast to floating point values. Numbers 
 *                correspond to feed nutrient information. 
 * @return {number} Resulting dry matter growth 
**/
function CDMGrowth(saleWeight, matureWeight, data) 
{ 
    if(saleWeight >= matureWeight) 
        saleWeight = 0.98 * matureWeight; 
  
    var bullCalfWeight = 0.0625 * matureWeight; 
    var bredHeiferWeight = 0.55 * matureWeight; 
    var openHeiferWeight = (bullCalfWeight + bredHeiferWeight) / 2; 
    var firstCalfHeiferWeight = 0.8 * matureWeight; 
    var breedingAge = bertAge(0.55 * matureWeight, matureWeight); 
    var calvingAge = breedingAge + 279; 
    var age100kg = bertAge(100,matureWeight); 
    var LiveWtGain100kg = (100 - bullCalfWeight)/age100kg; 
    var calvingWeight = bertWeight(calvingAge, matureWeight); 
    var nePreg = 0.65*data.dry.NEG + 0.35*data.heifer.NEG; 
    var cdmCalf = 6.45/nePreg * bullCalfWeight; 
  
    if (saleWeight <= 100) 
        { 
            var LiveWtGain = (saleWeight - bullCalfWeight)/bertAge(saleWeight,matureWeight) 
            var CDM = (2892*LiveWtGain^(1/5)/(6775*data.openHeifer.NEG))*(saleWeight^(271/200)-bullCalfWeight^(271/200)); 
            return cdmCalf + CDM; 
        } 
  
    var cdm100 = (2892*LiveWtGain100kg^(1/5)/(6775*data.openHeifer.NEG))*(saleWeight^(271/200)-bullCalfWeight^(271/200)); 
  
    if (saleWeight < bredHeiferWeight) 
    { 
        cdmOpenHeifer = retainedEnergy(age100kg,bertAge(saleWeight,matureWeight),100,saleWeight,matureWeight)/data.openHeifer.NEG; 
        CDM = cdmCalf + cdm100 + cdmOpenHeifer; 
        return CDM; 
    } 
  
    if (saleWeight < calvingWeight) 
    { 
        cdmOpenHeifer = retainedEnergy(age100kg,breedingAge,100,bredHeiferWeight,matureWeight)/data.openHeifer.NEG; 
        cdmBredHeifer = retainedEnergy(breedingAge,bertAge(saleWeight,matureWeight),bredHeiferWeight,matureWeight)/data.bredHeifer.NEG; 
        return cdmCalf + cdm100 + cdmOpenHeifer + cdmBredHeifer; 
    } 
    var cdmOpenHeifer = retainedEnergy(age100kg,breedingAge,100,bredHeiferWeight,matureWeight)/data.openHeifer.NEG; 
    var cdmBredHeifer = retainedEnergy(breedingAge,bertAge(saleWeight,matureWeight),bredHeiferWeight,matureWeight)/data.bredHeifer.NEG; 
    var cdmFirstCalfHeifer = retainedEnergy(calvingAge,bertAge(saleWeight,matureWeight),calvingWeight,matureWeight)/data.firstCalfHeifer.NEG; 
    return cdmCalf + cdm100 + cdmOpenHeifer + cdmBredHeifer + cdmFirstCalfHeifer; 
  
} 
  
// TODO(samnsparky): Need description. 
/** 
 * Calculate the cumulative feed consumption required for basal metabolism (maintenance) during growth  
 * in kg dry matter of the ration; calculation sums the contribution from each animal class based on  
 * the specific ration consumed. 
 * 
 * @param {number} saleWeight The heifer weight in kg at sale. 
 * @param {number} matureWeight The heifer weight in kg at breed maturity. 
 * @param {array} Nested array of arrays. First nested array has header 
 *                information and the subsequent arrays contain strings 
 *                capable of being cast to floating point values. Numbers 
 *                correspond to feed nutrient information. 
 * @return {number} Calculated dry matter feed intake required for basal metabolism during animal growth 
**/
  
  
function CDM_Maint_Growth(saleWeight, matureWeight, data) 
{ 
    if(saleWeight >= matureWeight) 
        saleWeight = 0.98 * matureWeight; 
  
    var bullCalfWeight = 0.0625 * matureWeight; 
    var bredHeiferWeight = 0.55 * matureWeight; 
    var openHeiferWeight = (bullCalfWeight + bredHeiferWeight) / 2; 
    var firstCalfHeiferWeight = 0.8 * matureWeight; 
    var CDM = 0; 
      
  
    if (saleWeight <= bredHeiferWeight) 
    { 
        return maintEnergyGrowth(bullCalfWeight, saleWeight)/data.heifer.NEM; 
    } 
    if (saleWeight <= firstCalfHeiferWeight) 
    { 
        CDM = maintEnergyGrowth(bullCalfWeight, bredHeiferWeight)/data.heifer.NEM; 
        CDM += maintEnergyGrowth(bredHeiferWeight, saleWeight)/data.bredHeifer.NEM; 
        return CDM; 
    } 
  
  
    if (saleWeight <= matureWeight) 
    { 
        CDM = maintEnergyGrowth(bullCalfWeight, bredHeiferWeight)/data.heifer.NEM; 
        CDM += maintEnergyGrowth(bredHeiferWeight, firstCalfHeiferWeight)/data.bredHeifer.NEM; 
        CDM += maintEnergyGrowth(firstCalfHeiferWeight, saleWeight)/data.firstCalfHeifer.NEM; 
        return CDM; 
    } 
  
} 
  
function CDM_Maint_Lac(animal, matureWeight, data) 
{ 
      
    var firstCalfHeiferWeight = 0.82 * matureWeight; 
  
    if (animal = 'firstCalfHeifer') 
    { 
        return maintEnergyLactation(firstCalfHeiferWeight, 0, matureWeight)/data.firstCalfHeifer.NEL; 
    } 
    else if (animal = 'mature') 
    { 
        return maintEnergyLactation(matureWeight, 0, matureWeight)/data.mature.NEL; 
    } 
    else if (animal = 'dry') 
    { 
    	// Assuming animals dry last 60 days of 279 day pregnancy - average DaysPreg = 249
        return maintEnergyLactation(matureWeight, 249 , matureWeight)/data.dry.NEL;
    } 
  
} 
  
  
// Check if running node.js 
// Run unit tests for calculation routines 
if(typeof window == 'undefined') 
{ 
    exports.bertAge = bertAge; 
    exports.bertWeight = bertWeight; 
    exports.avgShrunkWeightGain = avgShrunkWeightGain; 
    exports.retainedEnergy = retainedEnergy; 
    exports.maintEnergyGrowth = maintEnergyGrowth; 
    exports.maintEnergyLactation = maintEnergyLactation; 
    exports.cumulativeDryMatterGrowth = cumulativeDryMatterGrowth; 
} 