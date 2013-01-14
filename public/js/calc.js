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


// TODO(samnsparky): Retained energy not explained.
/**
 * Calculate retained energy given start and end days and live weights.
 *
 * @param ageStart {number} The start age in days of the heifer to start the
 *                          calculation.
 * @param ageEnd {number} The age in days of the heifer to end the calculation.
 * @param startLiveWeight The live weight to start the calculation.
 * @param endLiveWeight The live weight to end the calculation.
**/
function retainedEnergy(ageStart, ageEnd, startLiveWeight, endLiveWeight,
	matureWeight)
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
 * Calculate the energy requirement for .
 *
 *
 * @param {number} ageStart The age in days to start the calculation on.
 * @param {number} ageEnd The age in days to end the calculation on.
 * @param {number} startLiveWeight The weight in kg that the heifer starts at.
 * @param {number} endLiveWeight The weight in kg that the heifer ends at.
 * @return {number} Required energy // TODO(samnsparky): Need units
**/
function maintEnergyGrowth(ageStart, ageEnd, startLiveWeight, endLiveWeight,
	matureWeight)
{

}


// TODO(samnsparky): Need description
/**
 * Calculate the energy requirement for .
 *
 * @param {number} ageStart The age in days to start the calculation on.
 * @param {number} ageEnd The age in days to end the calculation on.
 * @param {number} startLiveWeight The weight in kg that the heifer starts at.
 * @param {number} endLiveWeight The weight in kg that the heifer ends at.
 * @return {number} Required energy // TODO(samnsparky): Need units
**/
function maintEnergyLactation(ageStart, ageEnd, startLiveWeight, endLiveWeight,
	matureWeight)
{

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
function cumulativeDryMatterGrowth(saleWeight, matureWeight, data)
{
    if(saleWeight >= matureWeight)
		saleWeight = 0.98 * matureWeight;

	var bullcalfWeight = 0.0625 * matureWeight;
	var bredheiferWeight = 0.55 * matureWeight;
	var openheiferWeight = (bullcalfWeight + bredheiferWeight) / 2;
	var firstcalfheiferWeight = 0.8 * matureWeight;
	var breedingAge = bertAge(0.55 * matureWeight, matureWeight);
	var calvingAge = breedingAge + 279;
	var age100kg = bertAge(100,matureWeight);
	var LiveWtGain100kg = (100 - bullcalfWeight)/age100kg;
	var calvingWeight = bertWeight(calvingAge, matureWeight);
	var nePreg = 0.65*data.dry.NEG + 0.35*data.heifer.NEG;
	var cdmCalf = 6.45/nePreg * bullcalfWeight;

	if (saleWeight <= 100)
		{
			var LiveWtGain = (saleWeight - bullcalfWeight)/bertAge(saleWeight,matureWeight)
			var CDM = (2892*LiveWtGain^(1/5)/(6775*data.openheifer.NEG))*(saleWeight^(271/200)-bullcalfWeight^(271/200));
			return cdmCalf + CDM;
		}

	var cdm100 = (2892*LiveWtGain100kg^(1/5)/(6775*data.openheifer.NEG))*(saleWeight^(271/200)-bullcalfWeight^(271/200));

	if (saleWeight < bredheiferWeight)
	{
		cdmOpenHeifer = retainedEnergy(age100kg,bertAge(saleWeight,matureWeight),100,saleWeight,matureWeight)/data.openheifer.NEG;
		CDM = cdmCalf + cdm100 + cdmOpenHeifer;
		return CDM;
	}

	if (saleWeight < calvingWeight)
	{
		cdmOpenHeifer = retainedEnergy(age100kg,breedingAge,100,bredheiferWeight,matureWeight)/data.openheifer.NEG;
		cdmBredHeifer = retainedEnergy(breedingAge,bertAge(saleWeight,matureWeight),bredheiferWeight,matureWeight)/data.bredheifer.NEG;
		return cdmCalf + cdm100 + cdmOpenHeifer + cdmBredHeifer;
	}
	var cdmOpenHeifer = retainedEnergy(age100kg,breedingAge,100,bredheiferWeight,matureWeight)/data.openheifer.NEG;
	var cdmBredHeifer = retainedEnergy(breedingAge,bertAge(saleWeight,matureWeight),bredheiferWeight,matureWeight)/data.bredheifer.NEG;
	var cdmFirstCalfHeifer = retainedEnergy(calvingAge,bertAge(saleWeight,matureWeight),calvingWeight,matureWeight)/data.firstcalfheifer.NEG;
	return cdmCalf + cdm100 + cdmOpenHeifer + cdmBredHeifer + cdmFirstCalfHeifer;

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
