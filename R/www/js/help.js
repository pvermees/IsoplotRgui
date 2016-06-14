function help(id){
    var text = ""
    switch (id){
	case "help-tera-wasserburg":
	text = "Tick this box to plot the <sup>207</sup>Pb/<sup>206</sup>Pb- " +
	       "vs. the <sup>238</sup>U/<sup>206</sup>Pb-ratio. Untick to " +
	       "plot the <sup>207</sup>Pb/<sup>235</sup>U- vs. " +
	       "<sup>206</sup>Pb/<sup>238</sup>U-ratio (Wetherill concordia).";
	break;
	case "help-conc-age-option":
	text = "Select the option to either plot the data without calculating " +
	       "an age; to fit a concordia composition and age; or to fit a discordia " +
	       "line through the data. In the latter case, <tt>IsoplotR</tt> will " +
	       "either calculate an upper and lower intercept age (for Wetherill " +
	       "concordia), or a lower intercept age and common " +
	       "(<sup>207</sup>Pb/<sup>206</sup>Pb)<sub>o</sub>-ratio intercept " +
	       "(for Tera-Wasserburg).";
	break;
	case "help-mint":
	text = "Set the minimum age limit for the concordia diagram " + 
	       "(a number between 0 and 4568 Ma). Type <tt>auto</tt> to have " +
	       "<tt>IsoplotR</tt> automatically set a suitable value.";
	break;
	case "help-maxt":
	text = "Set the maximum age limit for the concordia diagram " + 
	       "(a number between 0 and 4568 Ma). Type <tt>auto</tt> to have " +
	       "<tt>IsoplotR</tt> automatically set a suitable value.";
	break;
	case "help-alpha":
	text = "Set the probability cutoff (&alpha;) for the error ellipses, " + 
	       "which will be drawn at a 100x(1-&alpha;)% confidence level. ";
	break;
	case "help-dcu":
	text = "When this box is ticked, the thickness of the concordia line " + 
	       "will be adjusted to show the analytical uncertainty associated " +
	       "with the <sup>235</sup>U and <sup>238</sup>U decay constants.";
	break;
	case "help-shownumbers":
	text = "Add labels to the error ellipses marking the corresponding " +
	       "aliquot (i.e., the row number in the input table)."
	break;
	case "help-U238U235":
	text = "Change the natural isotopic abundance ratio of uranium. " +
	       "Default values are taken from Hiess et al. (2012). " +
	       "To use the IUGS-recommended value of Steiger and J&auml;ger (1977), " +
	       "change this to 137.88 &plusmn; 0.";
	break;
	case "help-LambdaU238":
	text = "The default values of the <sup>238</sup>U decay constant " +
	       "and its uncertainty are taken from Jaffey et al. (1971).";
	break;
	case "help-LambdaU235":
	text = "The default values of the <sup>235</sup>U decay constant " +
	       "and its uncertainty are taken from Jaffey et al. (1971).";
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
	case "help-pchdetritals":
	text = "The single-grain ages may be shown under the KDE plot " +
	       "This can either be a number (1-25) or a single character such as " +
	       "'|','o', '*', '+', '.'. Alternatively, enter <tt>none</tt> " +
	       "to omit the plot character.";
	break;
	case "help-pch":
	text = "The single-grain ages may be shown under the KDE plot " +
	       "This can either be a number (1-25) or a single character such as " +
	       "'|', 'o', '*', '+', or '.'. Alternatively, enter <tt>none</tt> " +
	       "to omit the plot character.";
	break;
	case "help-cutoff76":
	text = "The <sup>206</sup>Pb/<sup>238</sup>U-method is more precise than " +
	       "the <sup>207</sup>Pb/<sup>206</sup>Pb-method for young ages, while " +
	       "the opposite is true for old ages. This box sets the cutoff age below "
	       "which the KDE should use the <sup>206</sup>Pb/<sup>238</sup>U-method, " +
	       "and above which it should use the <sup>207</sup>Pb/<sup>206</sup>Pb-method.";
	break;
	case "help-mindisc":
	text = "One of the great strengths of the U-Pb method is its ability to " +
	       "to detect disruptions of the isotopic clock by Pb-loss by comparing " +
	       "the degree of concordance between the <sup>206</sup>Pb/<sup>238</sup>U- " +
	       "and <sup>207</sup>Pb/<sup>235</sup>U-clocks , or between the " +
	       "<sup>206</sup>Pb/<sup>238</sup>U- and " +
	       "<sup>207</sup>Pb/<sup>206</sup>Pb-clocks. The KDE function applies " +
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
	       "<sup>207</sup>Pb/<sup>206</sup>Pb-clocks. The KDE function applies " +
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
	case "help-age-dcu":
	text = "When this box is ticked, the analytical uncertainty associated " +
	       "with the <sup>235</sup>U and <sup>238</sup>U decay constants will " +
	       "be propagated into the age calculations. This is recommended if " +
	       "each aliquot corresponds to a separate sample, but <i>not</i> if " +
	       "they belong to the same sample. In that case, the decay constant " +
	       "uncertainties will introduce correlated errors which are lost in " +
	       "output table. <tt>IsoplotR</tt>'s concordia and radial plot functions " +
	       "were designed to take into account this correlation.";
	break;
    }
    return text;
}
