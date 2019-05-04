function help(id){
    var text = ""
    switch (id){
    case "help-ierr":
	text = "Choose one of the following four options:<ol>" +
	    "<li>absolute uncertainties at 1&sigma;</li>" +
	    "<li>absolute uncertainties at 2&sigma;</li>" +
	    "<li>relative uncertainties (in %) at 1&sigma;</li>" +
	    "<li>relative uncertainties (in %) at 2&sigma;</li>" +
	    "</ol>";
	break;
    case "help-tera-wasserburg":
	text = "Tick this box to plot the <sup>207</sup>Pb/<sup>206</sup>Pb- " +
	    "vs. the <sup>238</sup>U/<sup>206</sup>Pb-ratio. Untick to " +
	    "plot the <sup>207</sup>Pb/<sup>235</sup>U- vs. " +
	    "<sup>206</sup>Pb/<sup>238</sup>U-ratio (Wetherill concordia).";
	break;
    case "help-conc-age-option":
	text = "Select the option to either <ul> " +
	    "<li>plot the data without calculating an age</i> " +
	    "<li>fit a concordia composition and age</li> " +
	    "<li>fit a discordia line through the data using the " +
	    "maximum likelihood algorithm of Ludwig (1998), which " +
	    "assumes that the scatter of the data is solely due to the " +
	    "analytical uncertainties. In this case, <tt>IsoplotR</tt> will " +
	    "either calculate an upper and lower intercept age (for Wetherill " +
	    "concordia), or a lower intercept age and common " +
	    "(<sup>207</sup>Pb/<sup>206</sup>Pb)<sub>o</sub>-ratio intercept " +
	    "(for Tera-Wasserburg). If MSWD>0, then the analytical uncertainties " +
	    "are augmented by a <i>factor</i> &radic;MSWD.</li>" +
	    "<li>fit a discordia line ignoring the analytical uncertainties</li>" +
	    "<li>fit a discordia line using a modified maximum likelihood " +
	    "algorithm that includes accounts for any overdispersion by adding a " +
	    "geological (co)variance <i>term</i>.</li></ul>";
	break;
    case "help-mint-concordia":
	text = "Set the minimum age limit for the concordia diagram " + 
	    "(a number between 0 and 4568 Ma). Type <tt>auto</tt> to have " +
	    "<tt>IsoplotR</tt> automatically set a suitable value.";
	break;
    case "help-maxt-concordia":
	text = "Set the maximum age limit for the concordia diagram " + 
	    "(a number between 0 and 4568 Ma). Type <tt>auto</tt> to have " +
	    "<tt>IsoplotR</tt> automatically set a suitable value.";
	break;
    case "help-common-Pb-option":
	text = "apply a common lead correction with one of three methods:" +
	    "<ol><li>infer the initial Pb-composition from the Stacey & Kramers " +
	    "two stage isotope evolution model</li>" +
	    "<li>use the isochron intercept as the initial Pb-composition</li>" +
	    "<li>use a nominal initial Pb-composition</li></ol>";
	break;
    case "help-anchor-option":
	text = "Select an option to either <ol> " +
	    "<li>Fit the discordia line without external constraints</li>" +
	    "<li>Anchor the discordia line to a particular age</li>" +
	    "<li>Anchor the discordia line to a particular common Pb composition</li></ol>";
	break;
    case "help-tanchor":
	text = "Anchor the discordia line fit to a specific concordia age.";
	break;
    case "help-mint-average":
	text = "Set the minimum age limit for the y-axis of the " + 
	    "weighted mean plot. Type <tt>auto</tt> to have " +
	    "<tt>IsoplotR</tt> automatically set a suitable value.";
	break;
    case "help-maxt-average":
	text = "Set the maximum age limit for the y-axis of the " +
	    "weighted mean plot. Type <tt>auto</tt> to have " +
	    "<tt>IsoplotR</tt> automatically set a suitable value.";
	break;
    case "help-ranked":
	text = "Arrange the measurements in order of increasing value?";
	break;
    case "help-mint-radial":
	text = "Set the minimum age limit for the radial scale. " + 
	    "Type <tt>auto</tt> to have " +
	    "<tt>IsoplotR</tt> automatically set a suitable value.";
	break;
    case "help-maxt-radial":
	text = "Set the maximum age limit for the radial scale." +
	    "Type <tt>auto</tt> to have " +
	    "<tt>IsoplotR</tt> automatically set a suitable value.";
	break;
    case "help-transform-evolution":
	text = "Ticking this box plots <sup>234</sup>U/<sup>238</sup>U vs. age. " +
	    "Unticking it plots <sup>234</sup>U/<sup>238</sup>U vs. " +
	    "<sup>230</sup>Th/<sup>238</sup>U.";
	break;
    case "help-mint-evolution":
	text = "Set the minimum Th-U age limit for the evolution diagram. " + 
	    "Type <tt>auto</tt> to have " +
	    "<tt>IsoplotR</tt> automatically set a suitable value.";
	break;
    case "help-maxt-evolution":
	text = "Set the maximum Th-U age limit for the evolution diagram. " + 
	    "Type <tt>auto</tt> to have " +
	    "<tt>IsoplotR</tt> automatically set a suitable value.";
	break;
    case "help-min08":
	text = "Set the minimum <sup>230</sup>Th/<sup>238</sup>U ratio " +
	    "limit for the evolution diagram. Type <tt>auto</tt> to have " +
	    "<tt>IsoplotR</tt> automatically set a suitable value.";
	break;
    case "help-max08":
	text = "Set the maximum <sup>230</sup>Th/<sup>238</sup>U ratio " +
	    "limit for the evolution diagram. Type <tt>auto</tt> to have " +
	    "<tt>IsoplotR</tt> automatically set a suitable value.";
	break;
    case "help-min48":
	text = "Set the minimum <sup>234</sup>U/<sup>238</sup>U ratio " +
	    "limit for the evolution diagram. Type <tt>auto</tt> to have " +
	    "<tt>IsoplotR</tt> automatically set a suitable value.";
	break;
    case "help-max48":
	text = "Set the maximum <sup>234</sup>U/<sup>238</sup>U ratio " +
	    "limit for the evolution diagram. Type <tt>auto</tt> to have " +
	    "<tt>IsoplotR</tt> automatically set a suitable value.";
	break;
    case "help-isochron-evolution":
	text = "Fit an isochron through the data using the algorithm " +
	    "of Ludwig and Titterington (1994)?";
	break;
    case "help-detritus":
	text = "Choose one of four ways of dealing with detrital " +
	    "<sup>230</sup>Th (and <sup>234</sup>U):" +
	    "<ol><li>Do not apply a detrital <sup>230</sup>Th correction</li>" +
	    "<li>Obtain the detrital component by isochron regression</li>" +
	    "<li>Specify an assumed initial <sup>230</sup>Th/<sup>232</sup>Th-ratio</li>" +
	    "<li>Provide the measured <sup>230</sup>Th-<sup>232</sup>Th-" +
	    "<sup>234</sup>U-<sup>238</sup>U composition of the detritus</li>";
	    "</ol>";
	break;
    case "help-Th02-ThU":
	text = "Specify the assumed initial <sup>230</sup>Th/" +
	    "<sup>232</sup>Th activity ratio of the detritus and its standard error.";
	break;
    case "help-Th0U8-ThU":
	text = "Specify the measured present day <sup>230</sup>Th/" +
	    "<sup>238</sup>U activity ratio of the detritus and its standard error.";
	break;
    case "help-Th2U8-ThU":
	text = "Specify the measured present day <sup>232</sup>Th/" +
	    "<sup>238</sup> activity ratio of the detritus and its standard error.";
	break;
    case "help-U48-ThU":
	text = "Specify the measured present day <sup>234</sup>U/" +
	    "<sup>238</sup>U activity ratio of the detritus and its standard error.";
	break;
    case "help-U48-UPb":
	text = "Specify the assumed initial <sup>234</sup>U/" +
	    "<sup>238</sup>U activity ratio of the sample. " +
	    "1.15 is the canonical value for modern sea water.";
	break;
    case "help-Th0U8-UPb":
	text = "Specify the assumed initial <sup>230</sup>Th/" +
	    "<sup>238</sup>U activity ratio of the sample. " +
	    "Set to 1 for secular equilibrium.";
	break;
    case "help-Ra6U8-UPb":
	text = "Specify the assumed initial <sup>226</sup>Ra/" +
	    "<sup>238</sup>U activity ratio of the sample. " +
	    "Set to 1 for secular equilibrium.";
	break;
    case "help-Pa1U5-UPb":
	text = "Specify the assumed initial <sup>231</sup>Pa/" +
	    "<sup>235</sup>U activity ratio of the sample. " +
	    "Set to 1 for secular equilibrium.";
	break;
    case "help-diseq":
	text = "Apply a secular disequilibrium correction to the U-Pb data, based on the " +
	    "initial <sup>234</sup>U/<sup>238</sup>U, <sup>230</sup>Th/<sup>238</sup>U, " +
	    "<sup>226</sup>Ra/<sup>238</sup>U and <sup>231</sup>Pa/<sup>235</sup>U activity " +
	    "ratios of the sample.";
	break;
    case "help-rXY-detritus":
	text = "Specify the error correlation between the measured " +
	    "present day <sup>230</sup>Th/<sup>238</sup>U and " +
	    "<sup>232</sup>Th/<sup>238</sup>U-ratios of the detritus.";
	break;
    case "help-rXZ-detritus":
	text = "Specify the error correlation between the measured " +
	    "present day <sup>230</sup>Th/<sup>238</sup>U and " +
	    "<sup>234</sup>U/<sup>238</sup>U-ratios of the detritus.";
	break;
    case "help-rYZ-detritus":
	text = "Specify the error correlation between the measured " +
	    "present day <sup>232</sup>Th/<sup>238</sup>U and " +
	    "<sup>234</sup>U/<sup>238</sup>U-ratios of the detritus.";
	break;
    case "help-alpha":
	text = "Set the probability cutoff (&alpha;) for error ellipses, " + 
	    "and 100(1-&alpha;)% confidence intervals. ";
	break;
    case "help-outliers":
	text = "If checked, applies a generalised Chauvenet Criterion to " +
	    "reject outliers and remove them from the weighted mean.";
	break;
    case "help-randomeffects":
	text = "<ul><li>If checked, computes the weighted mean using a random " +
	    "effects model with two sources of uncertainty: the analytical " +
	    "uncertainty and an overdispersion term.</li>" +
	    "<li>Otherwise calculates the ordinary weighted mean, attributing any " +
	    "excess scatter to an underestimation of the analytical uncertainties." +
	    "The latter approach is the one taken by <tt>Isoplot</tt></li></ul>.";
	break;
    case "help-plateau":
	text = "If checked, <tt>IsoplotR</tt> computes the weighted mean of " +
	    "the longest succession of steps that pass the generalised " +
	    "Chauvenet Criterion for outliers, and marks the steps " +
	    "belonging to this plateau in a different colour.";
	break;
    case "help-sigdig":
	text = "The number of significant digits to which the numerical output should " +
	    "be rounded. For example, if this number is 2, then 1.23456 &plusmn; " +
	    "0.01234 is rounded to 1.234 &plusmn; 0.012.";
	break;
    case "help-exterr-UPb":
	text = "When this box is ticked, the thickness of the concordia line " + 
	    "will be adjusted to show the analytical uncertainty associated " +
	    "with the <sup>235</sup>U and <sup>238</sup>U decay constants.";
	break;
    case "help-exterr":
	text = "When this box is ticked, the analytical uncertainty associated " +
	    "with decay constants, calibration factors, etc. will be propagated into the age.";
	break;
    case "help-verticals":
	text = "When this box is ticked, the horizontal steps " +
	    "are connected with vertical lines";
	break;
    case "help-shownumbers":
	text = "Add labels to the data points or error ellipses marking " +
	    "the corresponding aliquot (i.e., the row number in the input table)."
	break;
    case "help-U238U235":
	text = "The natural isotopic abundance ratio of uranium and it standard error." +
	    "Default values are taken from Hiess et al. (2012). " +
	    "To use the IUGS-recommended value of Steiger and J&auml;ger (1977), " +
	    "change this to 137.88 &plusmn; 0.";
	break;
    case "help-Pb207Pb206":
	text = "Specify the initial <sup>207</sup>Pb/<sup>206</sup>Pb-ratio " +
	    "to be used in a nominal common Pb correction or anchored discordia " +
	    "line regression. The default value corresponds to the troilite " +
	    "composition of Stacey and Kramers (1975).";
	break;
    case "help-Pb206Pb204":
	text = "Specify the initial <sup>206</sup>Pb/<sup>204</sup>Pb-ratio " +
	    "to be used in a nominal common Pb correction. The default value " +
	    "corresponds to the troilite composition of Stacey and Kramers (1975).";
	break;
    case "help-Pb207Pb204":
	text = "Specify the initial <sup>207</sup>Pb/<sup>204</sup>Pb-ratio " +
	    "to be used in a nominal common Pb correction. The default value " +
	    "corresponds to the troilite composition of Stacey and Kramers (1975).";
	break;
    case "help-LambdaU238":
	text = "The default values of the <sup>238</sup>U decay constant " +
	    "and its standard error are taken from Jaffey et al. (1971).";
	break;
    case "help-LambdaU235":
	text = "The default values of the <sup>235</sup>U decay constant " +
	    "and its standard error are taken from Jaffey et al. (1971).";
	break;
    case "help-LambdaTh230":
	text = "The default value of the <sup>230</sup>Th decay constant " +
	    "is taken from Cheng et al. (2013). Its standard error excludes " +
	    "all covariant sources of analytical uncertainty with <sup>234</sup>U.";
	break;
    case "help-LambdaU234":
	text = "The default value of the <sup>234</sup>U decay constant " +
	    "is taken from Cheng et al. (2013). Its standard error excludes " +
	    "all covariant sources of analytical uncertainty with <sup>230</sup>Th.";
	break;
    case "help-PbPb-inverse":
	text = "Selecting this box plots <sup>207</sup>Pb/<sup>206</sup>Pb " +
	    "against <sup>204</sup>Pb/<sup>206</sup>Pb. Otherwise, " +
	    "<tt>IsoplotR</tt> plots <sup>207</sup>Pb/<sup>204</sup>Pb " +
	    "against <sup>206</sup>Pb/<sup>204</sup>Pb.";
	break;
    case "help-ArAr-inverse":
	text = "Selecting this box plots <sup>36</sup>Ar/<sup>40</sup>Ar " +
	    "against <sup>39</sup>Ar/<sup>40</sup>Ar. Otherwise, " +
	    "<tt>IsoplotR</tt> plots <sup>40</sup>Ar/<sup>39</sup>Ar " +
	    "against <sup>36</sup>Ar/<sup>39</sup>Ar.";
	break;
    case "help-KCa-inverse":
	text = "Selecting this box plots <sup>44</sup>Ca/<sup>40</sup>Ca " +
	    "against <sup>40</sup>K/<sup>40</sup>Ca. Otherwise, " +
	    "<tt>IsoplotR</tt> plots <sup>40</sup>Ca/<sup>44</sup>Ca " +
	    "against <sup>40</sup>K/<sup>44</sup>Ca.";
	break;
    case "help-RbSr-inverse":
	text = "Selecting this box plots <sup>86</sup>Sr/<sup>87</sup>Sr " +
	    "against <sup>87</sup>Rb/<sup>87</sup>Sr. Otherwise, " +
	    "<tt>IsoplotR</tt> plots <sup>87</sup>Sr/<sup>86</sup>Sr " +
	    "against <sup>87</sup>Rb/<sup>86</sup>Sr.";
	break;
    case "help-SmNd-inverse":
	text = "Selecting this box plots <sup>144</sup>Nd/<sup>143</sup>Nd " +
	    "against <sup>147</sup>Sm/<sup>143</sup>Nd. Otherwise, " +
	    "<tt>IsoplotR</tt> plots <sup>143</sup>Nd/<sup>144</sup>Nd " +
	    "against <sup>147</sup>Sm/<sup>144</sup>Nd.";
	break;
    case "help-LuHf-inverse":
	text = "Selecting this box plots <sup>177</sup>Hf/<sup>176</sup>Hf " +
	    "against <sup>176</sup>Lu/<sup>176</sup>Hf. Otherwise, " +
	    "<tt>IsoplotR</tt> plots <sup>176</sup>Hf/<sup>177</sup>Hf " +
	    "against <sup>176</sup>Lu/<sup>177</sup>Hf.";
	break;
    case "help-ReOs-inverse":
	text = "Selecting this box plots <sup>188</sup>Os/<sup>187</sup>Os " +
	    "against <sup>187</sup>Re/<sup>187</sup>Os. Otherwise, " +
	    "<tt>IsoplotR</tt> plots <sup>187</sup>Os/<sup>188</sup>Os " +
	    "against <sup>187</sup>Re/<sup>188</sup>Os.";
	break;
    case "help-isochron-minx":
    case "help-minx-concordia":
	text = "Minimum limit of the horizontal axis. " +
	    "Type <tt>auto</tt> to have <tt>IsoplotR</tt> " +
	    "automatically set a suitable value.";
	break;
    case "help-isochron-maxx":
    case "help-maxx-concordia":
	text = "Maximum limit of the horizontal axis." +
	    "Type <tt>auto</tt> to have <tt>IsoplotR</tt> " +
	    "automatically set a suitable value.";
	break;
    case "help-isochron-miny":
    case "help-miny-concordia":
	text = "Minimum limit of the vertical axis." +
	    "Type <tt>auto</tt> to have <tt>IsoplotR</tt> " +
	    "automatically set a suitable value.";
	break;
    case "help-isochron-maxy":
    case "help-maxy-concordia":
	text = "Maximum limit of the vertical axis." +
	    "Type <tt>auto</tt> to have <tt>IsoplotR</tt> " +
	    "automatically set a suitable value.";
	break;
    case "help-isochron-exterr":
	text = "When this box is ticked, the analytical uncertainty associated " +
	    "with the radioactive decay constant and the non-radiogenic " +
	    "isotope composition is propagated into the age.";
	break;
    case "help-PbPb-growth":
	text = "When this box is ticked, <tt>IsoplotR</tt> adds " +
	    "Stacey & Kramer (1975)'s two-stage Pb growth curve to the plot. " +
	    "This shows the evolution of the Pb isotopic composition for a " +
	    "hypothesised Earth reservoir with a fixed U/Pb ratio.";
	break;
    case "help-Ar40Ar36":
	text = "The default values for the atmospheric ('excess') argon ratio " +
	    "and its standard error are taken from Lee et al. (2006).";
	break;
    case "help-LambdaK40":
	text = "The default values for the decay constant of <sup>40</sup>K " +
	    "and its standard error are taken from Renne et al. (2011).";
	break;
    case "help-Ca40Ca44":
	text = ratioMessage("<sup>40</sup>Ca/<sup>44</sup>Ca","Moore and Machlan (1972)");
	break;
    case "help-Re185Re187":
	text = ratioMessage("<sup>185</sup>Re/<sup>187</sup>Re","Gramlich et al. (1973)");
	break;
    case "help-Os184Os192":
	text = ratioMessage("<sup>184</sup>Os/<sup>192</sup>Os","Voelkening et al. (1991)");
	break;
    case "help-Os186Os192":
	text = ratioMessage("<sup>186</sup>Os/<sup>192</sup>Os","Voelkening et al. (1991)");
	break;
    case "help-Os187Os192":
	text = "Change the initial <sup>187</sup>Os/<sup>192</sup>Os ratio " +
	    "and its standard error. This value is only used to calculate ages " +
	    "if the isochron option has been switched off. The default ratio is " +
	    "taken from Voelkening et al. (1991).";
	break;
    case "help-Os188Os192":
	text = ratioMessage("<sup>188</sup>Os/<sup>192</sup>Os","Voelkening et al. (1991)");
	break;
    case "help-Os189Os192":
	text = ratioMessage("<sup>189</sup>Os/<sup>192</sup>Os","Voelkening et al. (1991)");
	break;
    case "help-Os190Os192":
	text = ratioMessage("<sup>190</sup>Os/<sup>192</sup>Os","Voelkening et al. (1991)");
	break;
    case "help-LambdaRe187":
	text = "The default values of the <sup>187</sup>Re decay constant " +
	    "and its standard error are taken from Selby et al. (2007).";
	break;
    case "help-Sm144Sm152":
	text = ratioMessage("<sup>144</sup>Sm/<sup>152</sup>Sm","Chang et al. (2002)");
	break;
    case "help-Sm147Sm152":
	text = ratioMessage("<sup>147</sup>Sm/<sup>152</sup>Sm","Chang et al. (2002)");
	break;
    case "help-Sm148Sm152":
	text = ratioMessage("<sup>148</sup>Sm/<sup>152</sup>Sm","Chang et al. (2002)");
	break;
    case "help-Sm149Sm152":
	text = ratioMessage("<sup>149</sup>Sm/<sup>152</sup>Sm","Chang et al. (2002)");
	break;
    case "help-Sm150Sm152":
	text = ratioMessage("<sup>150</sup>Sm/<sup>152</sup>Sm","Chang et al. (2002)");
	break;
    case "help-Sm154Sm152":
	text = ratioMessage("<sup>154</sup>Sm/<sup>152</sup>Sm","Chang et al. (2002)");
	break;
    case "help-Nd142Nd144":
	text = ratioMessage("<sup>142</sup>Sm/<sup>144</sup>Nd","Zhao et al. (2005)");
	break;
    case "help-Nd143Nd144":
	text = ratioMessage("<sup>143</sup>Sm/<sup>144</sup>Nd","Zhao et al. (2005)");
	break;
    case "help-Nd145Nd144":
	text = ratioMessage("<sup>145</sup>Sm/<sup>144</sup>Nd","Zhao et al. (2005)");
	break;
    case "help-Nd146Nd144":
	text = ratioMessage("<sup>146</sup>Sm/<sup>144</sup>Nd","Zhao et al. (2005)");
	break;
    case "help-Nd148Nd144":
	text = ratioMessage("<sup>148</sup>Sm/<sup>144</sup>Nd","Zhao et al. (2005)");
	break;
    case "help-Nd150Nd144":
	text = ratioMessage("<sup>150</sup>Sm/<sup>144</sup>Nd","Zhao et al. (2005)");
	break;
    case "help-Rb85Rb87":
	text = ratioMessage("<sup>85</sup>Rb/<sup>87</sup>Rb","Catanzaro et al. (1969)");
	break;
    case "help-Sr84Sr86":
	text = ratioMessage("<sup>84</sup>Sr/<sup>86</sup>Sr","Moore et al. (1982)");
	break;
    case "help-Sr87Sr86":
	text = ratioMessage("<sup>87</sup>Sr/<sup>86</sup>Sr","Compston et al. (1971)");
	break;
    case "help-Sr88Sr86":
	text = ratioMessage("<sup>88</sup>Sr/<sup>86</sup>Sr","Moore et al. (1982)");
	break;
    case "help-Lu176Lu175":
	text = ratioMessage("<sup>176</sup>Lu/<sup>175</sup>Lu","De Laeter and Bukilich (2006)");
	break;
    case "help-Hf174Hf177":
	text = ratioMessage("<sup>174</sup>Hf/<sup>177</sup>Hf","Patchett (1983)");
	break;
    case "help-Hf176Hf177":
	text = ratioMessage("<sup>176</sup>Hf/<sup>177</sup>Hf","Patchett (1983)");
	break;
    case "help-Hf178Hf177":
	text = ratioMessage("<sup>178</sup>Hf/<sup>177</sup>Hf","Patchett (1983)");
	break;
    case "help-Hf179Hf177":
	text = ratioMessage("<sup>179</sup>Hf/<sup>177</sup>Hf","Patchett (1983)");
	break;
    case "help-Hf180Hf177":
	text = ratioMessage("<sup>180</sup>Hf/<sup>177</sup>Hf","Patchett (1983)");
	break;
    case "help-LambdaLu176":
	text = ratioMessage("","");
	text = "The default values of the <sup>176</sup>Lu decay constant " +
	    "and its standard error are taken from S&ouml;derlund et al. (2004).";
	break;
    case "help-show_p":
	text = "Show the p-value for concordance for each aliquot to the output " +
	    "table. Note: it would be unwise to use the p-value value as a " +
	    "concordance filter. Doing so would 'punish' high precision measurements, " +
	    "which are more likely to fail the Chi-square test than low precision " +
	    "measurements. The latter would therefore be 'rewarded' by such a criterion.";
	break;
    case "help-ReOs-i2i":
	text = "Ticking this box uses the y-intercept of an isochron fit " +
	    "through all the Re-Os data as an initial " +
	    "<sup>187</sup>Os/<sup>188</sup>Os-ratio for the age calculations. " +
	    "Unticking it uses the ratio of the " +
	    "<sup>187</sup>Os/<sup>192</sup>Os- and " +
	    "<sup>188</sup>Os/<sup>192</sup>Os-ratios above.";
	break;
    case "help-SmNd-i2i":
	text = "Ticking this box uses the y-intercept of an isochron fit " +
	    "through all the Sm-Nd data as an initial " +
	    "<sup>143</sup>Nd/<sup>144</sup>Nd-ratio for the age calculations. " +
	    "Unticking it uses the ratio given above.";
	break;
    case "help-RbSr-i2i":
	text = "Ticking this box uses the y-intercept of an isochron fit " +
	    "through all the Rb-Sr data as an initial " +
	    "<sup>87</sup>Sr/<sup>86</sup>Sr-ratio for the age calculations. " +
	    "Unticking it uses the ratio given above.";
	break;
    case "help-LuHf-i2i":
	text = "Ticking this box uses the y-intercept of an isochron fit " +
	    "through all the Lu-Hf data as an initial " +
	    "<sup>176</sup>Hf/<sup>177</sup>Hf-ratio for the age calculations. " +
	    "Unticking it uses the ratio given above.";
	break;
    case "help-ArAr-i2i":
	text = "Ticking this box uses the y-intercept of an isochron fit " +
	    "through all the Ar data as an initial " +
	    "<sup>40</sup>Ar/<sup>36</sup>Ar-ratio for the age calculations. " +
	    "Unticking it uses the atmospheric ratio specified above.";
	break;
    case "help-KCa-i2i":
	text = "Ticking this box uses the y-intercept of an isochron fit " +
	    "through all the K-Ca data as an initial " +
	    "<sup>40</sup>Ca/<sup>44</sup>Ca-ratio for the age calculations. " +
	    "Unticking it uses the <sup>40</sup>Ca/<sup>44</sup>Ca-ratio above.";
	break;
    case "help-ThU-i2i":
	text = "Ticking this box uses and isochron fit " +
	    "to estimate the initial <sup>230</sup>Th-component.";
	break;
    case "help-minx":
	text = "Minimum age constraint of the KDE. " +
            "Setting this to <tt>auto</tt> automatically sets this " +
            "value to include the smallest value in the dataset.";
	break;
    case "help-maxx":
	text = "Maximum age constraint of the KDE. " +
            "Setting this to <tt>auto</tt> automatically sets this " +
            "value to include the smallest value in the dataset.";
	break;
    case "help-bandwidth":
	text = "The bandwidth of the KDE affects the smoothness of the " +
            "density estimate. On linear scales, this value has units of age " +
	    "(in Ma). On a log-scale, the bandwidth is a fractional value. " +
            "For example, in the latter case, a value of 0.1 indicates " +
            "a kernel bandwidth that is 10% of the age. Setting the bandwidth " +
	    "to <tt>auto</tt> automatically selects a value based on the " +
            "algorithm of Botev et al. (2010).";
	break;
    case "help-binwidth":
	text = "On linear scales, the histogram binwidth has units of age " +
	    "(in Ma). On a log-scale, the binwidth is a fractional value. " +
            "For example, in the latter case, a value of 0.1 indicates " +
            "a histogram binwidth that is 10% of the age. Setting the binwidth " +
	    "to <tt>auto</tt> automatically sets the number of bins " +
            "according to to Sturges' Rule, i.e. N=log<sub>2</sub>(n)+1, " +
            "where n is the number of ages and N is the number of bins.";
	break;
    case "help-binwidth":
	text = "On linear scales, the histogram binwidth has units of age " +
	    "(in Ma). On a log-scale, the binwidth is a fractional value. " +
            "For example, in the latter case, a value of 0.1 indicates " +
            "a histogram binwidth that is 10% of the age. Setting the binwidth " +
	    "to <tt>auto</tt> automatically sets the number of bins " +
            "according to to Sturges' Rule, i.e. N=log<sub>2</sub>(n)+1, " +
            "where n is the number of ages and N is the number of bins.";
	break;
    case "help-pch":
	text = "The single-grain ages may be shown under the KDE plot " +
	    "This can either be a number (1-25) or a single character such as " +
	    "'|', 'o', '*', '+', or '.'. Alternatively, enter <tt>none</tt> " +
	    "to omit the plot character.";
	break;
    case "help-radial-pch":
	text = "The plot character can either be a number (1-25) or a " +
	    "single character such as '|', 'o', '*', '+', or '.'.";
	break;
    case "help-pchdetritals":
	text = "The single-grain ages may be shown under the KDE plot " +
	    "This can either be a number (1-25) or a single character such as " +
	    "'|','o', '*', '+', '.'. Alternatively, enter <tt>none</tt> " +
	    "to omit the plot character.";
	break;
    case "help-pch-cad":
	text = "The beginning of each CAD step may be marked by a plot character. " +
	    "This can either be a number (1-25) or a single character such as " +
	    "'o', '*', or '+'. Alternatively, enter <tt>none</tt> " +
	    "to omit the plot character.";
	break;
    case "help-cutoff76":
	text = "The <sup>206</sup>Pb/<sup>238</sup>U-method is more precise than " +
	    "the <sup>207</sup>Pb/<sup>206</sup>Pb-method for young ages, while " +
	    "the opposite is true for old ages. This box sets the cutoff age below " +
	    "which the <sup>206</sup>Pb/<sup>238</sup>U-method, and above which " +
	    "the <sup>207</sup>Pb/<sup>206</sup>Pb-method should be used.";
	break;
    case "help-mindisc":
	text = "One of the great strengths of the U-Pb method is its ability to " +
	    "to detect disruptions of the isotopic clock by Pb-loss by comparing " +
	    "the degree of concordance between the <sup>206</sup>Pb/<sup>238</sup>U- " +
	    "and <sup>207</sup>Pb/<sup>235</sup>U-clocks , or between the " +
	    "<sup>206</sup>Pb/<sup>238</sup>U- and " +
	    "<sup>207</sup>Pb/<sup>206</sup>Pb-clocks. <tt>IsoplotR</tt> applies " +
	    "a discordance filter to the U-Pb data in which, by default, the former " +
	    "ages are allowed to be up to 15% younger than the latter. " +
	    "Different values can be set in this box." ;
	break;
    case "help-maxdisc":
	text = "One of the great strengths of the U-Pb method is its ability to " +
	    "to detect disruptions of the isotopic clock by Pb-loss by comparing " +
	    "the degree of concordance between the <sup>206</sup>Pb/<sup>238</sup>U- " +
	    "and <sup>207</sup>Pb/<sup>235</sup>U-clocks , or between the " +
	    "<sup>206</sup>Pb/<sup>238</sup>U- and " +
	    "<sup>207</sup>Pb/<sup>206</sup>Pb-clocks.  <tt>IsoplotR</tt> applies " +
	    "a discordance filter to the U-Pb data in which, by default, the former " +
	    "ages are allowed to be up to 5% older (reverse discordance) than the " +
	    "latter. Different values can be set in this box." ;
	break;
    case "help-log":
	text = "Kernel Density Estimates are constructed by arranging all the ages " +
	    "along the x-axis and stacking a Gaussian bell curve on top of each of " +
	    "these, the standard deviation of which referred to as the 'bandwidth'. " +
	    "These Gaussian 'kernels' are free to take on any value between " +
	    "-&#x221e; and +&#x221e;. As a result, KDEs may have tails that. " +
	    "range into physically impossible negative values. One effective way " +
	    "to avoid this problem is to apply a log-transformation to the data " +
	    "before constructing the KDE. Simply tick this box to do so.";
	break;
    case "help-showhist":
	text = "Ticking this box adds a histogram to the KDE, whose area equals " +
	    "that of the KDE itself, and adds a y-axis with the bin counts. ";
	break;
    case "help-adaptive":
	text = "Adaptive KDEs allow the bandwidth of the kernels to vary along the " +
	    "time axis, so that the 'resolution' of the density estimate is high " +
	    "(and the bandwidth small) in densely sampled areas, and the resolution " +
	    "is low (large bandwidth) in sparsely sampled areas. <tt>IsoplotR</tt> " +
	    "uses a simple algorithm developed by Abramson (1984) to modify the " +
	    "bandwidth proportionally to the square root of a non-adaptive 'pilot' KDE."
	break;
    case "help-samebandwidth":
	text = "To facilitate the visual comparison of multiple KDEs, it is useful to " +
	    "use a common bandwidth. This can either be inforced by forcing the " +
	    "the bandwidth using the appropriate text box or, if the bandwidth is set " +
	    "to <tt>auto</tt>, by ticking this box here. In that case, <tt>IsoplotR</tt>" +
	    "will use the median of all the automatically calculated bandwidths, " +
	    "obtained using the Botev et al. (2010) algorithm.";
	break;
    case "help-normalise":
	text = "When this box is ticked, the area under each of the KDEs (and histograms) " +
	    "will be normalised to a common value. Otherwise, the KDE will use the " +
	    "entire range of y-values available.";
	break;
    case "help-headers-on":
	text = "The names of the detrital samples can be specified on the first row of " +
	    "the input table. Otherwise, the corresponding plots will be labeled with " +
	    "the column headers of the table, i.e. the letters <tt>A</tt>, <tt>B</tt>, " +
	    "... <tt>ZZ</tt>";
	break;
    case "help-hide-detritals":
	text = "A comma-separated list of sample names or column numbers " +
	    "that should be omitted from the plot. Examples: " +
	    "<tt>1,2,15</tt> or <tt>'N1','N2','T8'</tt>";
	break;
    case "help-age-exterr":
	text = "When this box is ticked, the analytical uncertainty associated " +
	    "with the <sup>235</sup>U and <sup>238</sup>U decay constants will " +
	    "be propagated into the age calculations. This is recommended if " +
	    "each aliquot corresponds to a separate sample, but <i>not</i> if " +
	    "they belong to the same sample. In that case, the decay constant " +
	    "uncertainties will introduce correlated errors which are lost in " +
	    "output table. <tt>IsoplotR</tt>'s concordia and radial plot functions " +
	    "were designed to take into account this correlation.";
	break;
    case "help-zeta-exterr":
	text = "When this box is ticked, the analytical uncertainty associated " +
	    "with the standard age and dosimeter glass will be propagated into the " +
	    "&zeta;-calibration factor.";
	break;
    case "help-U238U235":
	text = "Change the <sup>238</sup>U/<sup>235</sup>U ratio and its standard error. " +
            "Default values are taken from Hiess et al. (2012). To use Steiger " +
	    "and Jaeger (1997), change to 137.88 &plusmn; 0";
	break;
    case "help-LambdaTh232":
	text = "The default values of the <sup>232</sup>Th decay constant " +
	    "and its standard error are taken from Le Roux and Glendenin (1963).";
	break;
    case "help-LambdaSm147":
	text = "The default values of the <sup>147</sup>Sm decay constant " +
	    "and its standard error are taken from Lugmair and Marti (1978).";
	break;
    case "help-LambdaRb87":
	text = "The default values of the <sup>87</sup>Rb decay constant " +
	    "and its standard error are taken from Villa et al. (2015). To " +
	    "use the old IUGS recommended values of Steiger and Jaeger (1977), " +
	    "change to 0.000013972 &plusmn; 0.";
	break;
    case "help-logratio":
	text = "Ticking this box plots the U-Th-He data on a bivariate " +
	    "log[Th/He] vs. log[U/He] diagram. Unticking this box produces " +
	    "a U-Th-He ternary diagram.";
	break;
    case "help-showcentralcomp":
	text = "Ticking this box plots the geometric mean ('central') U-Th-He " +
	    "composition and its standard error as a white ellipse.";
	break;
    case "help-minx-helioplot":
	text = "Minimum log[U/He] limit. Setting this to <tt>auto</tt> " +
	    "automatically sets this value to fit all the data.";
	break;
    case "help-maxx-helioplot":
	text = "Maximum log[U/He] limit. Setting this to <tt>auto</tt> " +
	    "automatically sets this value to fit all the data.";
	break;
    case "help-miny-helioplot":
	text = "Minimum log[Th/He] limit. Setting this to <tt>auto</tt> " +
	    "automatically sets this value to fit all the data.";
	break;
    case "help-maxy-helioplot":
	text = "Maximum log[Th/He] limit. Setting this to <tt>auto</tt> " +
	    "automatically sets this value to fit all the data.";
	break;
    case "help-fact":
	text = "Three element vector of scaling factors for the He-Th-U ternary " +
	    "diagram. For example, entering <tt>c(100,10,5)</tt> will multiply the " +
	    "He abundance with 100, the Th abundance with 10 and the He abundance " +
	    "with 5 before re-normalising and plotting on the ternary diagram. " +
	    "The purpose of the re-normalisation is to 'zoom into' the data. " +
	    "Entering <tt>auto</tt> automatically selects scaling factors that place the " +
	    "geometric mean composition of the data at the barycentre of the diagram.";
	break;
    case "help-classical":
	text = "This box controls whether to use classical (Torgerson/Gower) " +
	    "or non-metric MDS. The latter is recommended except if it leads to " +
	    "degenerate configurations, which may be the case for small datasets.";
	break;
    case "help-shepard":
	text = "Ticking this box replaces the MDS configuration with a 'Shepard plot', " +
	    "in which the goodness-of-fit of a (non-metric) MDS configuration is " +
	    "evaluated by plotting the fitted distances/disparities against the " +
	    "Kolmogorov-Smirnov dissimilarities. The title of this plot shows " +
	    "Kruskal's 'stress' parameter. As a rule of thumb, stress values of " +
	    "0, 0.025, 0.05, 0.1 and 0.2 indicate 'perfect', 'excellent', 'good', "+
	    "'fair' and 'poor' fits, respectively.";
	break;
    case "help-nnlines":
	text = "To help identify groups of samples on the MDS configuration whilst " +
	    "simultaneously assessing the goodness-of-fit, it is sometimes useful " +
	    "to add 'nearest neighbour lines', in which each sample is connected " +
	    "to its closest neighbour in Kolmogorov-Smirnov space with a solid " +
            "line, and to its second-closest neighbour with a dashed line. " +
            "If the nearest neighbour lines cause too much clutter, it is " +
            "better to omit them.";
	break;
    case "help-ticks":
	text = "The disparity transformation used by the (non-metric) MDS algorithm " +
	    "produces normalised values with no physical meaning. The " +
	    "axes of the MDS configuration can therefore safely be removed, " +
	    "which improves the ink-to-information ratio (sensu <i>Tufte</t>) " +
	    "of the graphical output.";
	break;
    case "help-cex":
	text = "The factor by which text labels and plotting symbols " +
	    "should be magnified relative to the default (which is 1)";
	break;
    case "help-pos":
	text = "A position specifier for the labels. Values " +
	    "of 1, 2, 3 and 4 indicate positions below, " +
	    "to the left of, above and to the right of the " +
	    "MDS coordinates, respectively.";
	break;
    case "help-col":
	text = "Outline colour for the plot symbols (e.g., " +
	    "<tt>black</tt>, <tt>red</tt>, <tt>green</tt>).";
	break;
    case "help-ellipse-col1":
	text = "Fill colour for the error ellipses. Examples:<p></p>" +
	    "<tt>'white'</tt>, <tt>'red'</tt>, <tt>'blue'</tt>...<br>" +
	    "<tt>'#FF000080'</tt>, <tt>'#808080'</tt>, ...<br>" +
	    "<tt>rgb(0,1,0,0.5)</tt>, <tt>rgb(0.5,1,0.5)</tt>, ...<p></p>" +
	    "(please note the apostrophes!)";
	break;
    case "help-ellipse-col2":
	text = 	"Second ellipse colour to be used to build a graded " +
	    "colour scale to display the optional input column labeled '(C)'. " +
	    "Examples:<p></p>" +
	    "<tt>'white'</tt>, <tt>'red'</tt>, <tt>'blue'</tt> ... <br>" +
	    "<tt>'#FF000080'</tt>, <tt>'#808080'</tt>, ...<br>" +
	    "<tt>rgb(0,1,0,0.5)</tt>, <tt>rgb(0.5,1,0.5)</tt>, ...<p></p>" +
	    "(please note the apostrophes!)<p></p>" +
	    "If '(C)' is empty, then only one colour is used.";
	break;
    case "help-bg1":
	text = "Fill colour for the plot symbols. Examples:<p></p>" +
	    "<tt>'white'</tt>, <tt>'red'</tt>, <tt>'blue'</tt>...<br>" +
	    "<tt>'#FF000080'</tt>, <tt>'#808080'</tt>, ...<br>" +
	    "<tt>rgb(0,1,0,0.5)</tt>, <tt>rgb(0.5,1,0.5)</tt>, ...<p></p>" +
	    "(please note the apostrophes!)";
	break;
    case "help-bg2":
	text = 	"Second fill colour to be used to build a graded " +
	    "colour scale to display the optional input column labeled '(C)'. " +
	    "Examples:<p></p>" +
	    "<tt>'white'</tt>, <tt>'red'</tt>, <tt>'blue'</tt> ... <br>" +
	    "<tt>'#FF000080'</tt>, <tt>'#808080'</tt>, ...<br>" +
	    "<tt>rgb(0,1,0,0.5)</tt>, <tt>rgb(0.5,1,0.5)</tt>, ...<p></p>" +
	    "(please note the apostrophes!)<p></p>" +
	    "If '(C)' is empty, then only one colour is used.";
	break;
    case "help-bg3":
	text = 	"Fill colour used to mark the outliers. Examples:<p></p>" +
	    "<tt>'white'</tt>, <tt>'red'</tt>, <tt>'blue'</tt> ... <br>" +
	    "<tt>'#FF000080'</tt>, <tt>'#808080'</tt>, ...<br>" +
	    "<tt>rgb(0,1,0,0.5)</tt>, <tt>rgb(0.5,1,0.5)</tt>, ...<p></p>" +
	    "(please note the apostrophes!)";
	break;
    case "help-bg3-plateau":
	text = 	"Fill colour used to mark the age plateau. Examples:<p></p>" +
	    "<tt>'white'</tt>, <tt>'red'</tt>, <tt>'blue'</tt> ... <br>" +
	    "<tt>'#FF000080'</tt>, <tt>'#808080'</tt>, ...<br>" +
	    "<tt>rgb(0,1,0,0.5)</tt>, <tt>rgb(0.5,1,0.5)</tt>, ...<p></p>" +
	    "(please note the apostrophes!)";
	break;
    case "help-bg":
	text = "Fill colour for the plot symbols (e.g., " +
	    "<tt>black</tt>, <tt>red</tt>, <tt>green</tt>).";
	break;
    case "help-concordia-ticks":
	text = "Comma-separated list of custom age ticks for the concordia line.";
	break;
    case "help-clabel":
	text = "Text label for the (optional) colour scale";
	break;
    case "help-t0":
	text = "Set the central value of the radial scale. " + 
	    "Type <tt>auto</tt> to have " +
	    "<tt>IsoplotR</tt> automatically set a suitable value.";
	break;
    case "help-transformation":
	text = "The radial scale of a radial plot displays transformed " +
	    "values. For fission track data using the external detector method " +
	    "the <tt>arcsin</tt> transformation is recommended. For other data " +
	    "the <tt>logarithmic</tt> transformation is usually the most " +
	    "appropriate one, although a <tt>linear</tt> options is also " +
	    "available.";
	break;
    case "help-mineral-option":
	text = "Selecting a mineral (apatite or zircon) loads a set of suggested " +
	    "values for the density, track length and efficiency factor. It is, " +
	    "of course, possible to change these if necessary.";
	break;
    case "help-LambdaFission":
	text = "The default value for the fission decay constant is the " +
	    "consensus value of Holden and Hoffman (2000). ";
	break;
    case "help-etchfact":
	text = "The efficiency factor corrects the bias caused by the " +
	    "etching process. The default value for apatite is based on " +
	    "the mean of 3 measurements by Iwano & Danhara (1998) and " +
	    "1 measurement by Jonckheere (2003).";
	break;
    case "help-tracklength":
	text = "The initial track length is needed to convert the surface " +
	    "density (tracks per unit area) into a volume density " +
	    "(tracks per unit volume).";
	break;
    case "help-mindens":
	text = "The mineral density is needed to convert the uranium " +
	    "concentration from ppm to atoms per unit volume.";
	break;
    case "help-UPb-formats":
	text = "Choose one of six input formats:<ol>" +
	    "<li><tt>7/5 err[7/5] 6/8 err[6/8] rho</tt><br>" +
	    "where <tt>rho</tt> is the error correlation between " +
	    "<tt>7/5</tt> and <tt>6/8</tt></li>" +
	    "<li><tt>8/6 err[8/6] 7/6 err[7/6] (rho)</tt><br>" +
	    "where the error correlation is optional</li>" +
	    "<li><tt>7/6 err[7/6] 6/8 err[6/8] 7/5 err[7/5]</tt><br>" +
	    "in which the error correlations are calculated from the " +
	    "redundancies between the three sets of uncertainties.</li>" +
	    "<li><tt>X=7/5 err[7/5] Y=6/8 err[6/8] Z=4/8 err[4/8] " +
	    "rho[X,Y] rho[X,Z] rho[Y,Z]</tt></li>" +
	    "<li><tt>X=8/6 err[8/6] Y=7/6 err[7/6] Z=4/6 err[4/6] " +
	    "rho[X,Y] rho[X,Z] rho[Y,Z]</tt></li>" +
	    "<li><tt>7/5 err[7/5] 6/8 err[6/8] 4/8 err[4/8]" +
	    "7/6 err[7/6] 4/7 err[4/7] 4/6 err[4/6]</tt><br>" +
	    "in which the error correlations are calculated from the " +
	    "redundancies between the six sets of uncertainties.</li></ol>";
	break;
    case "help-PbPb-formats":
	text = "Choose one of three input formats:<ol>" +
	    "<li><tt>6/4 err[6/4] 7/4 err[7/4] rho</tt><br>" +
	    "where <tt>rho</tt> is the error correlation between " +
	    "<tt>6/4</tt> and <tt>7/4</tt>.</li>" +
	    "<li><tt>4/6 err[4/6] 7/6 err[7/6] (rho)</tt><br>" +
	    "where the error correlation is optional.</li>" +
	    "<li><tt>6/4 err[6/4] 7/4 err[7/4] 7/6 err[7/6]</tt><br>" +
	    "in which the error correlations are calculated from the " +
	    "redundancies between the three sets of uncertainties.</li></ol>";
	break;
    case "help-ThU-formats":
	text = "Choose one of four input formats:<ol>" +
	    "<li><tt>X=8/2 err[8/2] Y=4/2 err[4/2] Z=0/2 err[0/2] " +
	    "rho[X,Y] rho[X,Z] rho[Y,Z]</tt></li>" +
	    "<li><tt>X=2/8 err[2/8] Y=4/8 err[4/8] Z=0/8 err[0/8] " +
	    "rho[X,Y] rho[X,Z] rho[Y,Z]</tt></li>" +
	    "<li> <tt>8/2 err[8/2] 0/2 err[0/2] (rho)</tt><br>" +
	    "where the error correlation is optional</li>" +
	    "<li><tt>2/8 err[2/8] 0/8 err[0/8] (rho)</tt><br>" +
	    "where the error correlation is optional</li></ol>";
	break;
    case "help-KCa-formats":
	text = "Choose one of three input formats:<ol>" +
	    "<li><tt>X err[X] Y err[Y] rho</tt><br>" +
	    "where <tt>X</tt> is the <sup>40</sup>K/<sup>44</sup>Ca ratio, " +
	    "<tt>Y</tt> is the <sup>40</sup>Ca/<sup>44</sup>Ca ratio, and " +
	    "<tt>err[X], err[Y]</tt> and <tt>rho</tt> are the "+
	    "uncertainties and error correlations, respectively.</li>" +
	    "<li><tt>X err[X] Y err[Y] rho</tt><br>" +
	    "where <tt>X</tt> is the <sup>40</sup>K/<sup>40</sup>Ca ratio, " +
	    "<tt>Y</tt> is the <sup>44</sup>Ca/<sup>40</sup>Ca ratio, and " +
	    "<tt>err[X], err[Y]</tt> and <tt>rho</tt> are the "+
	    "uncertainties and error correlations, respectively.</li>" +
	    "<li><tt>X err[X] Y err[Y] Z err[Z]</tt><br>" +
	    "where <tt>X, err[X], Y,</tt> and <tt>err[Y]</tt>" +
	    " are defined as in option 1, " +
	    "<tt>Z</tt> is the <sup>40</sup>K/<sup>40</sup>Ca ratio, and " +
	    "<tt>err[Z]</tt> is its uncertainty. Here the redundancy between " +
	    "three ratio uncertainties allows the covariance to be determined implicitly." +
	    "</li></ol>";
	break;
    case "help-ArAr-formats":
	text = "Choose one of three input formats:<ol>" +
	    "<li><tt>39/36 err[39/36] 40/36 err[40/36] rho (39)</tt><br>" +
	    "where <tt>rho</tt> is the error correlation between " +
	    "<tt>39/36</tt> and <tt>40/36</tt> and (39) is the " +
	    "(optional) amount of <sup>39</sup>Ar.</li>" +
	    "<li><tt>39/40 err[39/40] 36/40 err[36/40] (rho) (39)</tt><br>" +
	    "where the error correlation is optional.</li>" +
	    "<li><tt>39/40 err[39/40] 36/40 err[36/40] 39/36 err[39/36] (39)</tt><br>" +
	    "in which the error correlations are calculated from the" +
	    "redundancies between the three sets of uncertainties.</li></ol>";
	break;
    case "help-RbSr-formats":
	text = "Choose one of three input formats:<ol>" +
	    "<li><tt>X=Rb87/Sr86 err[X] Y=Sr87/Sr86 err[Y] (rho)</tt><br>" +
	    "where <tt>rho</tt> is the (optional) error correlation between " +
	    "<tt>Rb87/Sr86</tt> and <tt>Sr87/Sr86</tt></li>" +
	    "<li><tt>X=Rb87/Sr87 err[X] Y=Sr86/Sr87 err[Y] (rho)</tt><br>" +
	    "where <tt>rho</tt> is the (optional) error correlation between " +
	    "<tt>Rb86/Sr87</tt> and <tt>Sr86/Sr87</tt></li>" +
	    "<li><tt>Rb err[Rb] Sr err[Sr] 87/86 err[87/86]</tt><br>" +
	    "where <tt>Rb</tt> and <tt>Sr</tt> are in ppm.</li></ol>";
	break;
    case "help-LuHf-formats":
	text = "Choose one of three input formats:<ol>" +
	    "<li><tt>X=Lu176/Hf177 err[X] Y=Hf176/Hf177 err[Y] (rho)</tt><br>" +
	    "where <tt>rho</tt> is the (optional) error correlation between " +
	    "<tt>Lu176/Hf177</tt> and <tt>Hf176/Hf177</tt></li>" +
	    "<li><tt>X=Lu176/Hf176 err[X] Y=Hf177/Hf176 err[Y] (rho)</tt><br>" +
	    "where <tt>rho</tt> is the (optional) error correlation between " +
	    "<tt>Lu177/Hf176</tt> and <tt>Hf177/Hf176</tt></li>" +
	    "<li><tt>Lu err[Lu] Hf err[Hf] 176/177 err[176/177]</tt><br>" +
	    "where <tt>Lu</tt> and <tt>Hf</tt> are in ppm.</li></ol>";
	break;
    case "help-ReOs-formats":
	text = "Choose one of three input formats:<ol>" +
	    "<li><tt>X=Re187/Os188 err[X] Y=Os187/Os188 err[Y] (rho)</tt><br>" +
	    "where <tt>rho</tt> is the (optional) error correlation between " +
	    "<tt>Re187/Os188</tt> and <tt>Os187/Os188</tt></li>" +
	    "<li><tt>X=Re187/Os187 err[X] Y=Os188/Os187 err[Y] (rho)</tt><br>" +
	    "where <tt>rho</tt> is the (optional) error correlation between " +
	    "<tt>Re187/Os187</tt> and <tt>Os188/Os187</tt></li>" +
	    "<li><tt>Re err[Re] Os err[Os] 187/188 err[187/188]</tt><br>" +
	    "where <tt>Re</tt> and <tt>Os</tt> are in ppm.</li></ol>";
	break;
    case "help-SmNd-formats":
	text = "Choose one of three input formats:<ol>" +
	    "<li><tt>X=Sm147/Nd144 err[X] Y=Nd143/Nd144 err[Y] (rho)</tt><br>" +
	    "where <tt>rho</tt> is the (optional) error correlation between " +
	    "<tt>Sm147/Nd144</tt> and <tt>Nd143/Nd144</tt></li>" +
	    "<li><tt>X=Sm147/Nd143 err[X] Y=Nd144/Nd143 err[Y] (rho)</tt><br>" +
	    "where <tt>rho</tt> is the (optional) error correlation between " +
	    "<tt>Sm147/Nd143</tt> and <tt>Nd144/Nd143</tt></li>" +
	    "<li><tt>Sm err[Sm] Nd err[Nd] 143/144 err[143/144]</tt><br>" +
	    "where <tt>Sm</tt> and <tt>Nd</tt> are in ppm.</li></ol>";
	break;
    case "help-FT-formats":
	text = "Choose one of three fission track dating methods:<ol>" +
	    "<li>'EDM' = the External Detector Method: determines the " +
	    "sample's uranium content by proxy, using neutron-induced tracks " +
	    "recorded in a mica detector; </li>" +
	    "<li>'ICP (&zeta;)': determines " +
	    "the uranium content directly by LA-ICP-MS using a zeta calibration " +
	    "approach in which all measurements are normalised to " +
	    "age standards; </li>" +
	    "<li>'ICP (absolute)': uses LA-ICP-MS without age " +
	    "standards, assuming that the fission decay constant, etch " +
	    "efficiency factor and uranium concentrations are known with " +
	    "sufficient accuracy.</li></ol>";
	break;
    case "help-ThU-isochron-types":
	text = "Choose one of four input formats:<ol>" +
	    "<li><sup>230</sup>Th/<sup>232</sup>Th vs. " +
	    "<sup>238</sup>U/<sup>232</sup>Th (Rosholt type 2a)</li>" +
	    "<li><sup>230</sup>Th/<sup>238</sup>U vs. " +
	    "<sup>232</sup>Th/<sup>238</sup>U (Osmond type 2a)</li>" +
	    "<li><sup>234</sup>U/<sup>232</sup>Th vs. " +
	    "<sup>238</sup>U/<sup>232</sup>Th (Rosholt type 2b)</li>" +
	    "<li><sup>234</sup>U/<sup>238</sup>U vs. " +
	    "<sup>232</sup>Th/<sup>238</sup>U (Osmond type 2b)</li></ol>";
	break;
    case "help-regression-format":
	text = "Choose one of two input formats:<ol>" +
	    "<li><tt>X, err[X], Y, err[Y], rho</tt><br> where <tt>X</tt> and " +
	    "<tt>Y</tt> are two sets of measurements, <tt>err[X]</tt> and " +
	    "<tt>err[Y]</tt>are their respective uncertainties " +
	    "and <tt>rho</tt> the error correlation.</li>" +
	    "<li><tt>X/Z, err[X/Z], Y/Z, err[Y/Z], X/Y, err[X/Y]</tt><br>" +
	    "in which the redundancy between the three error estimates " +
	    "allows the correlation coefficient between <tt>X/Z</tt> and " +
	    "<tt>Y/Z</tt> to be computed.</li></ol>";
	break;
    case "help-helioplot-models":
	text = "Choose one of the following statistical models:<ol>" +
	    "<li>Weighted mean: This model assumes that the scatter between " +
	    "the data points is solely caused by the analytical uncertainty. " +
	    "If the assumption is correct, then the MSWD value should be " +
	    "approximately equal to one. There are three strategies to deal " +
	    " with the case where MSWD>1. The first of these is to assume that " +
	    "the analytical uncertainties have been underestimated by a <i>factor</i> " +
	    "&radic;MSWD. Alternative approaches are described below. </li>" +
	    "<li>Unweighted mean: A second way to deal with over- or underdispersed " +
	    "datasets is to simply ignore the analytical uncertainties.</li>" +
	    "<li>Weighted mean with overdispersion: Instead of attributing any " +
	    "overdispersion (MSWD > 1) to underestimated analytical uncertainties " +
	    "(model 1), one could also attribute it to the presence of geological " +
	    "uncertainty, which manifests itself as an added (co)variance <i>term</i>." +
	    "</li></ol>";
	break;
    case "help-isochron-models":
	text = "Choose one of three regression models:<ol>" +
	    "<li>Maximum Likelihood regression, using either the modified error weighted " +
	    "least squares algorithm of York et al. (2004) for 2-dimensional data, " +
	    "or the Maximum Likelihood formulation of Ludwig and Titterington (1994) " +
	    "for 3-dimensional data. These algorithms take into account the " +
	    "analytical uncertainties and error correlations, under the assumption " +
	    "that the scatter between the data points is solely caused " +
	    "by the analytical uncertainty. " +
	    "If the assumption is correct, then the MSWD value should be " +
	    "approximately equal to one. There are three " +
	    "strategies to deal with the case where MSWD>1. " +
	    "The first of these is to assume that " +
	    "the analytical uncertainties have been underestimated by a <i>factor</i> " +
	    "&radic;MSWD. Alternative approaches are described below. </li>" +
	    "<li>Ordinary least squares regression: A second way to deal with " +
	    "over- or underdispersed datasets is to simply ignore the " +
	    "analytical uncertainties.</li>" +
	    "<li>Maximum likelihood regression with overdispersion: " +
	    "Instead of attributing any overdispersion (MSWD > 1) to " +
	    "underestimated analytical uncertainties " +
	    "(model 1), one can also attribute it to the presence of geological " +
	    "uncertainty, which manifests itself as an added (co)variance <i>term</i>." +
	    "</li></ol>";
	break;
    case "help-UPb-age-type":
	text = "Choose one of five options:<ol>" +
	    "<li>Plot the <sup>207</sup>Pb/<sup>235</sup>U-ages</li>" +
	    "<li>Plot the <sup>206</sup>Pb/<sup>238</sup>U-ages</li>" +
	    "<li>Plot the <sup>207</sup>Pb/<sup>206</sup>Pb-ages</li>" +
	    "<li>Plot young grains as <sup>206</sup>Pb/<sup>238</sup>U " +
	    "and old grains as <sup>207</sup>Pb/<sup>206</sup>Pb</li>" +
	    "<li>Plot the single-grain concordia ages.</li></ol>";
	break;
    case "help-mixtures":
	text = "Peak fitting using the algorithms of Galbraith and Green (1990). " +
	    "Assumes that the data are underlain by a true age distribution " +
	    "consisting of a finite number (1-5) of discrete age peaks. " +
	    "'auto'-setting uses the Bayes Information Criterion (BIC) to " +
	    "pick a parsimonous number of components. Note that the number of " +
	    "peaks tends to increase with sample size! The 'minimum'-setting" +
	    "assumes that the true age distribution is a truncated Normal with " +
	    "a discrete component at its lowest, truncated end."
	break;
}
    return text;
}

function ratioMessage(ratio,reference){
    var msg = "The default values for the natural " + ratio +
	" ratio and its standard error are taken from " + reference + "."
    return msg;
}
