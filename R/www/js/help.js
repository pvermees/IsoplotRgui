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
    case "help-mint-concordia":
	text = "Set the minimum age limit for the concordia diagram " + 
	    "(a number between 0 and 4568 Ma). Type <tt>auto</tt> to have " +
	    "<tt>IsoplotR</tt> automatically set a suitable value.";
	break;
    case "help-maxt-radial":
	text = "Set the maximum age limit for the radial scale." +
	    "Type <tt>auto</tt> to have " +
	    "<tt>IsoplotR</tt> automatically set a suitable value.";
	break;
    case "help-mint-radial":
	text = "Set the minimum age limit for the radial scale. " + 
	    "Type <tt>auto</tt> to have " +
	    "<tt>IsoplotR</tt> automatically set a suitable value.";
	break;
    case "help-maxt-concordia":
	text = "Set the maximum age limit for the concordia diagram " + 
	    "(a number between 0 and 4568 Ma). Type <tt>auto</tt> to have " +
	    "<tt>IsoplotR</tt> automatically set a suitable value.";
	break;
    case "help-alpha":
	text = "Set the probability cutoff (&alpha;) for the error ellipses, " + 
	    "which will be drawn at a 100x(1-&alpha;)% confidence level. ";
	break;
    case "help-outliers":
	text = "If checked, applies Chauvenet's criterion to reject outliers " +
	    "and remove them from the weighted mean.";
	break;
    case "plateau":
	text = "If checked, <tt>IsoplotR</tt> computes the weighted mean of " +
	    "the longest succession of steps that yield values passing "
	"the Chi-square test for age homogeneity and marks the steps " +
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
	    "with the decay constants will be propagated into the age.";
	break;
    case "help-verticals":
	text = "When this box is ticked, the horizontal steps " +
	    "are connected with vertical lines";
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
    case "help-inverse":
	text = "Selecting this box plots <sup>36</sup>Ar/<sup>40</sup>Ar " +
	    "against <sup>39</sup>Ar/<sup>40</sup>Ar. Otherwise, " +
	    "<tt>IsoplotR</tt> plots <sup>40</sup>Ar/<sup>39</sup>Ar " +
	    "against <sup>36</sup>Ar/<sup>39</sup>Ar.";
	break;
    case "help-isochron-minx":
	text = "Minimum limit of the horizontal axis.";
	break;
    case "help-isochron-maxx":
	text = "Maximum limit of the horizontal axis.";
	break;
    case "help-isochron-miny":
	text = "Minimum limit of the vertical axis.";
	break;
    case "help-isochron-maxy":
	text = "Maximum limit of the vertical axis.";
	break;
    case "help-isochron-exterr":
	text = "When this box is ticked, the analytical uncertainty associated " +
	    "with the radioactive decay constant and the non-radiogenic " +
	    "isotope composition is propagated into the age.";
	break;
    case "help-Ar40Ar36":
	text = "Change the atmospheric ('excess') argon ratio. " +
	    "Default value is taken from Lee et al. (2006).";
	break;
    case "help-LambdaK40":
	text = "Default value taken from Renne et al. (2011).";
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
    case "help-U238U235":
	text = "Change the <sup>238</sup>U/<sup>235</sup>U ratio and uncertainty. " +
            "Default values are taken from Hiess et al. (2012). To use Steiger " +
	    "and Jaeger (1997), change to 137.88 &plusmn; 0";
	break;
    case "help-LambdaTh232":
	text = "The default values of the <sup>232</sup>Th decay constant " +
	    "and its uncertainty are taken from Le Roux and Glendenin (1963).";
	break;
    case "help-LambdaSm147":
	text = "The default values of the <sup>147</sup>Sm decay constant " +
	    "and its uncertainty are taken from Lugmair and Marti (1978).";
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
	text = "A numerical value giving the amount by which plotting " +
	    "symbols should be magnified relative to the default";
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
    case "help-bg":
	text = "Fill colour for the plot symbols (e.g., " +
	    "<tt>black</tt>, <tt>red</tt>, <tt>green</tt>).";
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
    case "help-FT-options":
	text = "Choose one of three fission track dating methods: " +
	    "1) 'EDM' = the External Detector Method: determines the " +
	    "sample's uranium content by proxy, using neutron-induced tracks " +
	    "recorded in a mica detector; 2) 'ICP (&zeta;)': determines " +
	    "the uranium content directly by LA-ICP-MS using a zeta calibration " +
	    "approach in which all measurements are normalised to " +
	    "age standards; 3) 'ICP (absolute)': uses LA-ICP-MS without age " +
	    "standards, assuming that the fission decay constant, etch " +
	    "efficiency factor and uranium concentrations are known with " +
	    "sufficient accuracy.";
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
