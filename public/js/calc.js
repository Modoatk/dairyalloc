/**
 * Name: getFeedInfo(feed, type)
 * Desc: Retrieve information from the feed lookup database.
 * Para: feed, The feed for which information is requested.
 *       type, Type of information requested.
 * Retr: Requested information.
**/
function getFeedInfo(feed, type)
{
    var idx;
	switch(type)
	{
		case "IFN":
			idx = 1;
			break;
		case "Ne_lact":
			idx = 2;
			break;
		case "Ne_growth":
			idx = 3;
			break;
		case "Ne_maint":
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
			var feed_index = i;
	}

	if(feed_index)
		return feedData[feed_index][idx];
}

/**
 * Name: bertAge(weight, mature_weight)
 * Refr: 'Comparison of Nonlinear Models...' Brown et. al. Sci. 42:810-818
 * Para: weight, Weight for age needed.
 *       mature_weight, Breed mature weight.
 * Retr: 
**/
function bertAge(weight, mature_weight)
{
	var cy = Math.pow(weight / mature_weight,1/3);
	var k = -0.003014; // Inverse days original work: -0.0036 breeding age and weight matched to 13 months age and 275kg (0.55 MatureWt)
	var B = 0.60314974; // To match birth weight: B= 0.60314974 bw = 0.0625 * MatureWt

	return (1 / k) * Math.log((1 - cy) / B);
}

/**
 * Name: bertWeight(age, mature_weight)
 * Para: age, Age for weight needed.
 *       mature_weight, Breed mature weight.
 * Retr:
**/
function bertWeight(age, mature_weight)
{
	var k = -0.003014; // Inverse days original work: -0.0036 breeding age and weight matched to 13 months age and 275kg (0.55 MatureWt)
	var B = 0.60314974; // To match birth weight: B= 0.60314974 bw = 0.0625 * MatureWt

	return mature_weight * Math.pow((1 - B * Math.exp(k * age)),3); //[TODO]: Double check order of operations
}

/**
 * Name: avgShrunkWeightGain(time_one, time_two, mature_weight)
 * Desc:
 * Para: time_one,
 *       time_two,
 *       mature_weight, Breed mature weight.
 * Retr:
**/
function avgShrunkWeightGain(time_one, time_two, mature_weight)
{
	return 1 / (time_two - time_one) * (bertWeight(time_two, mature_weight) - bertWeight(time_one, mature_weight));
}

/**
 * Name: retainedEnergy(age_start, age_end, start_live_weight, end_live_weight, mature_weight)
 * Desc:
 * Para: age_start,
 *       age_end,
 *       start_live_weight,
 *       end_live_weight,
 *       mature_weight,
 * Retr:
**/
function retainedEnergy(age_start, age_end, start_live_weight, end_live_weight, mature_weight)
{
	if(age_start >= age_end)
		return 0;

	var mature_shrunk_body_weight = 0.96 * mature_weight;
	var start_shrunk_body_weight = 0.96 * start_live_weight;
	var shrunk_weight_gain = avgShrunkWeightGain(age_start, age_end, mature_weight); // 0.96 * (end_live_weight - start_live_weight) / (age_end - age_start)

	if(shrunk_weight_gain < 0)
	{
		// If statements benchmark much faster than greater-than/less-than switch statement
		if(age_end < 100)
			shrunk_weight_gain = 0.8;
		else if(age_end < 500)
			shrunk_weight_gain = 0.5;
		else if(age_end < 700)
			shrunk_weight_gain = 0.4;
		else if(age_end > 701)
			shrunk_weight_gain = 0.25;
	}
	return 3.238 * mature_shrunk_body_weight * Math.pow(shrunk_weight_gain,0.97) * (Math.pow((end_live_weight * 0.96 / mature_shrunk_body_weight),7/4) - Math.pow((start_shrunk_body_weight / mature_shrunk_body_weight),7/4));
}

/**
 * Name: maintEnergyGrowth(age_start, age_end, start_live_weight, end_live_weight, mature_weight)
 * Desc: 
 * Para: age_start,
 *       age_end,
 *       start_live_weight,
 *       end_live_weight,
 *       mature_weight,
 * Retr:
**/
function maintEnergyGrowth(age_start, age_end, start_live_weight, end_live_weight, mature_weight)
{

}

/**
 * Name: maintEnergyLactation(age_start, age_end, start_live_weight, end_live_weight, mature_weight)
 * Desc: 
 * Para: age_start,
 *       age_end,
 *       start_live_weight,
 *       end_live_weight,
 *       mature_weight,
 * Retr:
**/
function maintEnergyLactation(age_start, age_end, start_live_weight, end_live_weight, mature_weight)
{

}
function cumulativeDryMatterGrowth(sale_weight, mature_weight, data)
{
    if(sale_weight >= mature_weight)
		sale_weight = 0.98 * mature_weight;

	var bullcalf_weight = 0.0625 * mature_weight;
	var bredheifer_weight = 0.55 * mature_weight;
	var openheifer_weight = (bullcalf_weight + bredheifer_weight) / 2;
	var firstcalfheifer_weight = 0.8 * mature_weight;
	var breeding_age = bertAge(0.55 * mature_weight, mature_weight);
	var calving_age = breeding_age + 279;
	var age_100kg = bertAge(100,mature_weight);
	var LiveWtGain100kg = (100 - bullcalf_weight)/age_100kg;
	var calving_weight = bertWeight(calving_age, mature_weight);
	var NE_preg = 0.65*data.dry.NEG + 0.35*data.heifer.NEG;
	var CDM_calf = 6.45/NE_preg * bullcalf_weight;

	if (sale_weight <= 100)
		{
			var LiveWtGain = (sale_weight - bullcalf_weight)/bertAge(sale_weight,mature_weight)
			var CDM = (2892*LiveWtGain^(1/5)/(6775*data.openheifer.NEG))*(sale_weight^(271/200)-bullcalf_weight^(271/200));
			return CDM_calf + CDM;
		}

	var CDM_100 = (2892*LiveWtGain100kg^(1/5)/(6775*data.openheifer.NEG))*(sale_weight^(271/200)-bullcalf_weight^(271/200));

	if (sale_weight < bredheifer_weight)
	{
		CDM_OpenHeifer = retainedEnergy(age_100kg,bertAge(sale_weight,mature_weight),100,sale_weight,mature_weight)/data.openheifer.NEG;
		CDM = CDM_calf + CDM_100 + CDM_OpenHeifer;
		return CDM;
	}

	if (sale_weight < calving_weight)
	{
		CDM_OpenHeifer = retainedEnergy(age_100kg,breeding_age,100,bredheifer_weight,mature_weight)/data.openheifer.NEG;
		CDM_BredHeifer = retainedEnergy(breeding_age,bertAge(sale_weight,mature_weight),bredheifer_weight,mature_weight)/data.bredheifer.NEG;
		return CDM_calf + CDM_100 + CDM_OpenHeifer + CDM_BredHeifer;
	}
	var CDM_OpenHeifer = retainedEnergy(age_100kg,breeding_age,100,bredheifer_weight,mature_weight)/data.openheifer.NEG;
	var CDM_BredHeifer = retainedEnergy(breeding_age,bertAge(sale_weight,mature_weight),bredheifer_weight,mature_weight)/data.bredheifer.NEG;
	var CDM_FirstCalfHeifer = retainedEnergy(calving_age,bertAge(sale_weight,mature_weight),calving_weight,mature_weight)/data.firstcalfheifer.NEG;
	return CDM_calf + CDM_100 + CDM_OpenHeifer + CDM_BredHeifer + CDM_FirstCalfHeifer;

}


// Check if running node.js
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
