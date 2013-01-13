import string

x = ["alfalfa_hay", "alfalfa_silage", "almond_hulls", "amino_plus", "apple_pomace", "bakery_by-product", "barley", "barley_silage", "barley_straw", "beet_pulp", "bermudagrass_hay", "bermudagrass_silage", "blood_meal", "candy", "canola_meal", "carrots", "chips", "citrus_pulp", "corn", "corn_dust", "corn_gluten_feed", "corn_gluten_feed,_wet", "corn_gluten_meal", "corn_screenings", "corn_silage", "corn_steep_liquor", "corn_stover", "corn,_hm", "corn,_hominy", "cotton_gin_trash", "cottonseed", "cottonseed_hulls", "cottonseed_meal", "ddg,_dry", "ddg,_sol", "ddg,_wet", "fat", "filter_cake", "fish_meal", "flaxseed", "forage_mix", "grain_mix", "grain_screenings", "grape_pomace", "grass_hay", "grass_haylage", "grass_silage", "grass/legume,_fresh", "hfp", "linseed_meal", "lol_surepro", "meat_&_bone_meal", "megalac", "mill_run_+_fat", "molasses", "oat_hay", "oat_hulls", "oat_silage", "oat_straw", "oats", "onion", "pasture", "peanut_hay", "pea_silage", "pmr", "potatoes", "pro-lak", "protein_mix", "pulp_big_mix", "red_top_w_fat", "rice", "rice_bran", "rumensin_mix", "rye_haylage", "ryegrass_silage", "smartamine", "sorghum_grain", "sorghum_silage", "soy_hulls", "soybean_meal", "soybean,_extruded", "soybean,_raw", "soybean,_roasted", "soychlor", "soypass", "sudangrass_hay", "sudangrass_silage", "sugar", "sugar_cane_silage", "sunflower_meal", "sunflowers", "supplement", "sweet_corn_wasteage", "timothy_hay", "tomato_silage", "triticale_hay", "triticale_silage", "urea", "wheat", "wheat_bran", "wheat_hay", "wheat_midds", "wheat_mill_run", "wheat_silage", "wheat_straw", "whey", "yeast"]
z = ""
for f in x:
	y = f.split('_')
	for w in y:
		z += " "
		z += w
	z = string.capwords(z)
	print '<li><input id="nongrazinginput-'+f+'" type="checkbox" /><label for="nongrazinginput-'+f+'">'+z+'</label></li>'
	z = ""
