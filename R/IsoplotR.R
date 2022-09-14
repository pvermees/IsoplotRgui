selection2levels <- function(dat, nc) {
    values <- matrix(dat, ncol = nc)
    lc <- nc - 1
    as.numeric(values[, lc])
}

omitter <- function(dat, nc, flags = c("x", "X")) {
    values <- matrix(dat, ncol = nc)
    oc <- nc
    o <- values[, oc]
    which(o %in% flags)
}

settingsiratio <- list(
    "U-Pb" = c("Pb207Pb206", "Pb208Pb206", "Pb208Pb207"),
    "Pb-Pb" = c("Pb206Pb204", "Pb207Pb204", "U238U235"),
    "Th-U" = c(),
    "Ar-Ar" = c("Ar40Ar36"),
    "Th-Pb" = c("Pb208Pb204"),
    "K-Ca" = c("Ca40Ca44"),
    "Sm-Nd" = c("Sm144Sm152", "Sm147Sm152", "Sm148Sm152",
        "Sm149Sm152", "Sm150Sm152", "Sm154Sm152", "Nd142Nd144",
        "Nd143Nd144", "Nd145Nd144", "Nd146Nd144", "Nd148Nd144",
        "Nd150Nd144"
    ),
    "Re-Os" = c("Os184Os192", "Os186Os192", "Os187Os192",
        "Os188Os192", "Os190Os192"
    ),
    "Rb-Sr" = c("Rb85Rb87", "Sr84Sr86", "Sr87Sr86", "Sr88Sr86"),
    "Lu-Hf" = c(
        "Lu176Lu175", "Hf174Hf177", "Hf176Hf177",
        "Hf178Hf177", "Hf179Hf177", "Hf180Hf177"
    ),
    "U-Th-He" = c("U238U235"),
    "detritals" = c()
)

settingslambda <- list(
    "U-Pb" = c("Th232", "U234", "Th230", "Ra226", "Pa231"),
    "Pb-Pb" = c("U238", "U235"),
    "Th-U" = c("Th230", "U234"),
    "Ar-Ar" = c("K40"),
    "Th-Pb" = c("Th232"),
    "K-Ca" = c("K40"),
    "Sm-Nd" = c("Sm147"),
    "Re-Os" = c("Re187"),
    "Rb-Sr" = c("Rb87"),
    "Lu-Hf" = c("Lu176"),
    "U-Th-He" = c("U238", "U235", "Th232", "Sm147"),
    "detritals" = c()
)

applysettings <- function(params, settings) {
    geochronometer <- params$geochronometer
    gcsettings <- params$gcsettings
    if (geochronometer == "fissiontracks") {
        if (gcsettings$format == 3) {
            v <- settings$iratio$U238U235
            IsoplotR::settings("iratio", "U238U235", v[[1]], v[[2]])
            v <- settings$iratio$U238
            IsoplotR::settings("lambda", "U238", v[[1]], v[[2]])
            v <- settings$iratio$fission
            IsoplotR::settings("lambda", "fission", v[[1]], v[[2]])
            mineral <- gcsettings$mineral
            v <- settings$etchfact[[mineral]]
            IsoplotR::settings("etchfact", mineral, v)
            v <- settings$tracklength[[mineral]]
            IsoplotR::settings("tracklength", mineral, v)
            v <- settings$mindens[[mineral]]
            IsoplotR::settings("mindens", mineral, v)
        }
        return(NULL)
    }
    mapply(function(mineral) {
        v <- settings$iratio[[mineral]]
        IsoplotR::settings("iratio", mineral, v[[1]], v[[2]])
    }, settingsiratio[[geochronometer]])
    mapply(function(mineral) {
        v <- settings$lambda[[mineral]]
        IsoplotR::settings("lambda", mineral, v[[1]], v[[2]])
    }, settingslambda[[geochronometer]])
    IsoplotR::settings("alpha", params$alpha)
}

getlimits <- function(min, max) {
    if (min == "auto" || max == "auto") {
        return(NULL)
    }
    return(as.numeric(c(min, max)))
}

coerceabletonumeric <- function(v) {
    grepl(
        "^\\s*(([0-9]+(\\.[0-9]*)?)|(\\.[0-9]+))(e[-+]?[0-9]*)?\\s*$",
        v,
        useBytes = TRUE
    )
}

maybenumeric <- function(v) {
    if (!is.null(v) && coerceabletonumeric(v)) as.numeric(v) else v
}

getpch <- function(pch) {
    p <- trimws(toupper(pch))
    if (p %in% c("NA", "NONE")) {
        return(NA)
    }
    maybenumeric(pch)
}

isnullorauto <- function(v) {
    is.null(v) || v == "auto"
}

gettimelimits <- function(min, max) {
    if (isnullorauto(min) && isnullorauto(max)) {
        return(NULL)
    }
    return(c(
        if (isnullorauto(min)) 0 else as.numeric(min),
        if (isnullorauto(max)) 4500 else as.numeric(max)
    ))
}

notauto <- function(v) {
    return(if (v == "auto") NULL else as.numeric(v))
}

naifauto <- function(v) {
    return(if (v == "auto") NA else as.numeric(v))
}

getdata <- function(params, data, s2d) {
    if (!is.null(s2d$diseq)) {
        s2d$params$d <- do.call(
            IsoplotR::diseq,
            s2d$diseq
        )
    }
    s2d$params$input <- data
    do.call(selection2data, s2d$params)
}

concordia <- function(fn, params, data, s2d, settings, cex) {
    applysettings(params, settings)
    pd <- params$pdsettings
    nc <- as.numeric(data$nc)
    args <- list(
        x = getdata(params, data, s2d),
        oerr = params$oerr,
        type = pd$type,
        exterr = pd$exterr,
        show.numbers = pd$shownumbers,
        show.age = pd$showage,
        sigdig = params$sigdig,
        common.Pb = params$gcsettings$commonPb,
        ellipse.fill = params$ellipsefill,
        ellipse.stroke = pd$ellipsestroke,
        levels = selection2levels(data$data, nc),
        omit = omitter(data$data, nc, c("x")),
        hide = omitter(data$data, nc, c("X")),
        clabel = pd$clabel
    )
    # These cannot go into the initializer list, or they will end up with NULLs
    args$tlim <- gettimelimits(pd$mint, pd$maxt)
    args$xlim <- getlimits(pd$minx, pd$maxx)
    args$ylim <- getlimits(pd$miny, pd$maxy)
    args$ticks <- notauto(pd$ticks)
    if (pd$anchor == 1) {
        args$anchor <- 1
    } else if (pd$anchor == 2) {
        args$anchor <- c(2, pd$tanchor)
    }
    graphics::par(cex = cex)
    do.call(IsoplotR::concordia, args)
}

radialplot <- function(fn, params, data, s2d, settings, cex) {
    applysettings(params, settings)
    pd <- params$pdsettings
    nc <- as.numeric(data$nc)
    args <- list(
        x = getdata(params, data, s2d),
        transformation = pd$transformation,
        pch = getpch(pd$pch),
        cex = pd$cex,
        show.numbers = pd$shownumbers,
        k = maybenumeric(pd$numpeaks),
        oerr = params$oerr,
        sigdig = params$sigdig,
        bg = params$bg,
        levels = selection2levels(data$data, nc),
        omit = omitter(data$data, nc, c("x")),
        hide = omitter(data$data, nc, c("X")),
        clabel = pd$clabel
    )
    args$from <- notauto(pd$mint)
    args$to <- notauto(pd$maxt)
    args$z0 <- notauto(pd$z0)
    if (!(params$geochronometer %in% c("other", "Th-U", "U-Th-He"))) {
        args$exterr <- pd$exterr
    }
    if (params$geochronometer == "Th-U") {
        args$Th0i <- params$gcsettings$Th0i
    }
    if (params$geochronometer %in% c(
        "Ar-Ar", "Th-Pb", "K-Ca", "Rb-Sr", "Sm-Nd", "Re-Os", "Lu-Hf"
    )) {
        args$i2i <- params$gcsettings$i2i
    }
    if (params$geochronometer == "U-Pb") {
        type <- params$gcsettings$type
        args$type <- type
        if (type == 4) {
            args$cutoff.76 <- params$gcsettings$cutoff76
        }
        if (params$gcsettings$cutoffdisc > 0) {
            opt <- params$gcsettings$discoption
            cutoff <- c(
                params$gcsettings$mindisc[opt],
                params$gcsettings$maxdisc[opt]
            )
            args$cutoff.disc <- IsoplotR::discfilter(
                 option = opt,
                 cutoff = cutoff,
                 before = params$gcsettings$cutoffdisc == 1
           )
        }
    }
    if (params$geochronometer == "Pb-Pb") {
        args$common.Pb <- params$gcsettings$commonPb
    }
    graphics::par(cex = cex)
    do.call(IsoplotR::radialplot, args)
}

evolution <- function(fn, params, data, s2d, settings, cex) {
    applysettings(params, settings)
    pd <- params$pdsettings
    nc <- as.numeric(data$nc)
    args <- list(
        x = getdata(params, data, s2d),
        oerr = params$oerr,
        Th0i = params$gcsettings$Th0i,
        sigdig = params$sigdig,
        show.numbers = pd$shownumbers,
        transform = pd$transform,
        detritus = params$gcsettings$detritus,
        exterr = pd$exterr,
        isochron = pd$isochron,
        levels = selection2levels(data$data, nc),
        omit = omitter(data$data, nc, c("x")),
        hide = omitter(data$data, nc, c("X")),
        ellipse.fill = params$ellipsefill,
        ellipse.stroke = pd$ellipsestroke,
        model = pd$model,
        clabel = pd$clabel
    )
    if (pd$transform) args$xlim <- gettimelimits(pd$mint, pd$maxt)
    else args$xlim <- getlimits(pd$min08, pd$max08)
    args$ylim <- getlimits(pd$min48, pd$max48)
    graphics::par(cex = cex)
    do.call(IsoplotR::evolution, args)
}

setregression <- function(params, data, s2d, settings) {
    applysettings(params, settings)
    pd <- params$pdsettings
    nc <- as.numeric(data$nc)
    args <- list(
        x = getdata(params, data, s2d),
        oerr = params$oerr,
        sigdig = params$sigdig,
        show.numbers = pd$shownumbers,
        levels = selection2levels(data$data, nc),
        omit = omitter(data$data, nc, c("x")),
        hide = omitter(data$data, nc, c("X")),
        ellipse.fill = params$ellipsefill,
        ellipse.stroke = pd$ellipsestroke,
        model = pd$model,
        clabel = pd$clabel
    )
    args$xlim <- getlimits(pd$minx, pd$maxx)
    args$ylim <- getlimits(pd$miny, pd$maxy)
    args
}

regression <- function(fn, params, data, s2d, settings, cex, york) {
    args <- setregression(params, data, s2d, settings)
    args$x <- IsoplotR::data2york(args$x, format = york$format)
    graphics::par(cex = cex)
    do.call(IsoplotR::isochron, args)
}

isochron <- function(fn, params, data, s2d, settings, cex, york = NULL) {
    args <- setregression(params, data, s2d, settings)
    applysettings(params, settings)
    gc <- params$geochronometer
    if (!(gc %in% c("U-Pb", "Th-U", "U-Th-He"))) {
        args$inverse <- params$gcsettings$inverse
    }
    if (gc == "Pb-Pb") {
        args$growth <- params$pdsettings$growth
    }
    if (gc == "U-Pb") {
        args$type <- params$pdsettings$UPbtype;
        if (params$gcsettings$format > 3) {
            args$joint <- params$pdsettings$joint
        }
        anchor <- params$pdsettings$anchor
        if (anchor == 1) {
            args$anchor <- 1
        } else if (anchor == 2) {
            args$anchor <- c(2, params$pdsettings$tanchor)
        }
    }
    if (gc == "Th-U") {
        args$type <- params$pdsettings$ThUtype
        args$y0option <- params$pdsettings$y0option
    }
    if (gc != "U-Th-He") {
        args$exterr <- params$pdsettings$exterr
    }
    graphics::par(cex = cex)
    do.call(IsoplotR::isochron, args)
}

addalpha <- function(colour, alpha) {
    chs <- grDevices::col2rgb(colour)
    grDevices::rgb(chs[1,], chs[2,], chs[3,], 255 * alpha, maxColorValue = 255)
}

weightedmean <- function(fn, params, data, s2d, settings, cex) {
    applysettings(params, settings)
    pd <- params$pdsettings
    nc <- as.numeric(data$nc)
    args <- list(
        x = getdata(params, data, s2d),
        detect.outliers = pd$outliers,
        oerr = params$oerr,
        sigdig = params$sigdig,
        random.effects = pd$randomeffects,
        ranked = pd$ranked,
        levels = selection2levels(data$data, nc),
        rect.col = addalpha(params$bg, pd$rect_alpha),
        outlier.col = addalpha(pd$outliercol, pd$rect_alpha),
        omit = omitter(data$data, nc, c("x")),
        hide = omitter(data$data, nc, c("X")),
        clabel = pd$clabel
    )
    args$from <- notauto(pd$mint)
    args$to <- notauto(pd$maxt)
    gc <- params$geochronometer
    if (gc %in% c(
        "Ar-Ar", "Th-Pb", "K-Ca", "Rb-Sr", "Sm-Nd", "Re-Os", "Lu-HF"
    )) {
        args$i2i <- params$gcsettings$i2i
    }
    if (gc == "U-Pb") {
        type <- params$gcsettings$type
        args$type <- type
        if (type == 4) {
            args$cutoff.76 <- params$gcsettings$cutoff76
        }
        if (params$gcsettings$cutoffdisc > 0) {
            opt <- params$gcsettings$discoption
            args$cutoff.disc <- IsoplotR::discfilter(
                 option = opt,
                 before = params$gcsettings$cutoffdisc == 1,
                 cutoff = c(params$gcsettings$mindisc[opt],
                            params$gcsettings$maxdisc[opt]
                 )
            )
        }
    }
    if (gc %in% c("U-Pb", "Pb-Pb")) {
        args$common.Pb <- params$gcsettings$commonPb
    }
    if (gc == "Th-U") {
        args$Th0i <- params$gcsettings$Th0i
    }
    if (!(gc %in% c("other", "Th-U", "U-Th-He"))) {
        args$exterr <- params$pdsettings$exterr
    }
    graphics::par(cex = cex)
    do.call(IsoplotR::weightedmean, args)
}

agespectrum <- function(fn, params, data, s2d, settings, cex) {
    applysettings(params, settings)
    pd <- params$pdsettings
    nc <- as.numeric(data$nc)
    args <- list(
        x = getdata(params, data, s2d),
        plateau = pd$plateau,
        plateau.col = addalpha(params$bg, pd$nonplateau_alpha),
        non.plateau.col = addalpha(pd$nonplateaucol, pd$nonplateau_alpha),
        detect.outliers = pd$outliers,
        oerr = params$oerr,
        sigdig = params$sigdig,
        random.effects = pd$randomeffects,
        levels = selection2levels(data$data, nc),
        omit = omitter(data$data, nc, c("x")),
        hide = omitter(data$data, nc, c("X")),
        clabel = pd$clabel
    )
    gc <- params$geochronometer
    if (gc == "Ar-Ar") {
        args$i2i <- params$gcsettings$i2i
        args$exterr <- pd$exterr
    }
    graphics::par(cex = cex)
    do.call(IsoplotR::agespectrum, args)
}

kde <- function(fn, params, data, s2d, settings, cex) {
    applysettings(params, settings)
    pd <- params$pdsettings
    nc <- as.numeric(data$nc)
    gc <- params$geochronometer
    args <- list(
        x = getdata(params, data, s2d),
        hide =
            if (gc == "detritals") params$gcsettings$hide
            else omitter(data$data, nc, c("x", "X")),
        rug = if (gc == "detritals") pd$rugdetritals else pd$rug,
        log = pd$log,
        binwidth = naifauto(pd$binwidth),
        from = naifauto(pd$minx),
        to = naifauto(pd$maxx),
        bw = naifauto(pd$bandwidth),
        show.hist = pd$showhist,
        adaptive = pd$adaptive
    )
    if (gc == "Th-U") {
        args$detritus <- params$gcsettings$detritus
    }
    if (gc %in% c(
        "Th-U", "Ar-Ar", "Th-Pb", "K-Ca", "Rb-Sr", "Sm-Nd", "Re-Os", "Lu-Hf")
    ) {
        args$i2i <- params$gcsettings$i2i
    }
    if (gc == "U-Pb") {
        type <- params$gcsettings$type
        args$type <- type
        if (type == 4) {
            args$cutoff.76 <- params$gcsettings$cutoff76
        }
        if (params$gcsettings$cutoffdisc>0){
            opt <- params$gcsettings$discoption
            args$cutoff.disc <- IsoplotR::discfilter(
                 option = opt,
                 before = params$gcsettings$cutoffdisc == 1,
                 cutoff = c(params$gcsettings$mindisc[opt],
                            params$gcsettings$maxdisc[opt])
            )
        }
    }
    if (gc %in% c("U-Pb", "Pb-Pb")) {
        args$common.Pb <- params$gcsettings$commonPb
    }
    if (gc == "detritals") {
        args$samebandwidth <- pd$samebandwidth
        args$normalise <- pd$normalise
    }
    graphics::par(cex = cex)
    do.call(IsoplotR::kde, args)
}

cad <- function(fn, params, data, s2d, settings, cex) {
    applysettings(params, settings)
    pd <- params$pdsettings
    nc <- as.numeric(data$nc)
    args <- list(
        x = getdata(params, data, s2d),
        verticals = pd$verticals,
        pch = getpch(pd$pch),
        cex = pd$cex
    )
    gc <- params$geochronometer
    if (gc == "Th-U") {
        args$Th0i <- params$gcsettings$Th0i
    }
    if (gc %in% c(
        "Ar-Ar", "Th-Pb", "K-Ca", "Rb-Sr", "Sm-Nd", "Re-Os", "Lu-Hf")
    ) {
        args$i2i <- params$gcsettings$i2i
    }
    if (gc == "U-Pb") {
        type <- params$gcsettings$type
        args$type <- type
        if (type == 4) {
            args$cutoff.76 <- params$gcsettings$cutoff76
        }
        if (params$gcsettings$cutoffdisc>0){
            opt <- params$gcsettings$discoption
            args$cutoff.disc <- IsoplotR::discfilter(
                 option = opt,
                 before = params$gcsettings$cutoffdisc == 1,
                 cutoff = c(params$gcsettings$mindisc[opt],
                            params$gcsettings$maxdisc[opt])
            )
        }
    }
    if (gc %in% c("U-Pb", "Pb-Pb")) {
        args$common.Pb <- params$gcsettings$commonPb
    }
    if (gc == "detritals") {
        args$col <- pd$colmap
        args$hide <- params$hide
    } else {
        args$hide <- omitter(data$data, nc, c("x", "X"))
    }
    graphics::par(cex = cex)
    do.call(IsoplotR::cad, args)
}

setzeta <- function(fn, params, data, s2d, settings) {
    applysettings(params, settings)
    args <- list(
        x = getdata(params, data, s2d),
        tst = as.numeric(c(data$age, data$ageErr)),
        exterr = params$pdsettings$exterr,
        oerr = params$oerr,
        sigdig = params$sigdig,
        update = FALSE
    )
    matrix(do.call(IsoplotR::set.zeta, args))
}

helioplot <- function(fn, params, data, s2d, settings, cex) {
    applysettings(params, settings)
    pd <- params$pdsettings
    nc <- as.numeric(data$nc)
    args <- list(
        x = getdata(params, data, s2d),
        logratio = pd$logratio,
        show.numbers = pd$shownumbers,
        sigdig = params$sigdig,
        levels = selection2levels(data$data, nc),
        omit = omitter(data$data, nc, c("x")),
        hide = omitter(data$data, nc, c("X")),
        ellipse.fill = params$ellipsefill,
        ellipse.stroke = pd$ellipsestroke,
        model = pd$model,
        clabel = pd$clabel
    )
    args$xlim <- getlimits(pd$minx, pd$maxx)
    args$ylim <- getlimits(pd$miny, pd$maxy)
    args$fact <- notauto(pd$fact)
    graphics::par(cex = cex)
    do.call(IsoplotR::helioplot, args)
}

mds <- function(fn, params, data, s2d, settings, cex) {
    applysettings(params, settings)
    pd <- params$pdsettings
    shepard <- !pd$classical && pd$shepard
    args <- list(
        x = getdata(params, data, s2d),
        sigdig = pd$sigdig,
        classical = pd$classical,
        shepard = shepard,
        nnlines = pd$nnlines,
        pch = getpch(pd$pch),
        col = pd$col,
        bg = pd$bg,
        hide = params$hide
    )
    if (!shepard) {
        args$cex <- pd$cex
    }
    if (pd$pos %in% c(1, 2, 3, 4)) {
        args$pos <- pd$pos
    }
    graphics::par(cex = cex)
    do.call(IsoplotR::mds, args)
}

age <- function(fn, params, data, s2d, settings) {
    applysettings(params, settings)
    args <- list(
        x = getdata(params, data, s2d),
        oerr = params$oerr,
        sigdig = params$sigdig
    )
    gc <- params$geochronometer
    if (gc == "U-Pb" && params$pdsettings$showdisc != 0) {
        args$discordance <- IsoplotR::discfilter(
             option = params$pdsettings$discoption,
             before = params$pdsettings$showdisc == 1
        )
    }
    if (gc != "U-Th-He") {
        args$exterr <- params$pdsettings$exterr
    }
    if (gc == "Th-U") {
        args$isochron <- FALSE
        args$Th0i <- params$gcsettings$Th0i
    }
    if (gc %in% c(
        "Ar-Ar", "Th-Pb", "K-Ca", "Rb-Sr", "Sm-Nd", "Re-Os", "Lu-Hf")
    ) {
        args$i2i <- params$gcsettings$i2i
        args$isochron <- FALSE
        args$projerr <- params$gcsettings$projerr
    }
    if (gc == "Pb-Pb") {
        args$projerr <- params$gcsettings$projerr
        args$isochron <- FALSE
    }
    if (gc %in% c("U-Pb", "Pb-Pb")) {
        args$common.Pb <- params$gcsettings$commonPb
    }
    do.call(IsoplotR::age, args)
}

#' Start the \code{IsoplotR} GUI
#'
#' Opens a web-browser with a Graphical User Interface (GUI) for the
#' \code{IsoplotR} package. An online version of the same interface is
#' provided at \url{https://www.ucl.ac.uk/~ucfbpve/isoplotr/}
#' @param host IP address of the virtual server, default is 0.0.0.0
#' @param port Internet port of the virtual server. If not defined, a
#'     random free port will be chosen and the browser will be opened
#'     to show the GUI.
#' @param timeout How long (in wall-clock time) an operation may take
#'     before returning with a timeout error. Default: no limit.
#' @param daemonize logical. If \code{TRUE}, runs as daemon.
#' @return server object
#' @examples
#' \donttest{IsoplotR()}
#' @export
IsoplotR <- function(
    host = "0.0.0.0",
    port = NULL,
    timeout = Inf,
    daemonize = !is.null(port)
) {
    appdir <- system.file("www", package = "IsoplotRgui")
    if (appdir == "") {
        stop("Could not find www directory. Try re-installing `IsoplotRgui`.",
             call. = FALSE)
    }
    s <- shinylight::slServer(
        host = host,
        port = port,
        appDir = appdir,
        daemonize = daemonize,
        interface = list(
            concordia = concordia,
            radial = radialplot,
            evolution = evolution,
            isochron = isochron,
            regression = regression,
            average = weightedmean,
            spectrum = agespectrum,
            KDE = kde,
            CAD = cad,
            "set-zeta" = setzeta,
            helioplot = helioplot,
            MDS = mds,
            ages = age
        )
    )
    extramessage <- NULL
    if (is.null(port)) {
        protocol <- "http://"
        if (grepl("://", host, fixed=TRUE)) {
            protocol <- ""
        }
        port <- s$getPort()
        utils::browseURL(paste0(protocol,
          if (host == "0.0.0.0") "127.0.0.1" else host,
          ":", port))
        extramessage <- (
            "Call IsoplotRgui::stopIsoplotR() to stop serving IsoplotR"
        )
    }
    message("Listening on ", host, ":", port)
    if (!is.null(extramessage)) {
        message(extramessage)
    }
    invisible(s)
}

#' Stop an \code{IsoplotR} GUI
#'
#' @param server The server (returned by
#'     \code{IsoplotRgui::IsoplotR()}) to stop. If not supplied all
#'     servers will be stopped.
#' @examples
#' \donttest{
#' s <- IsoplotR()
#' stopIsoplotR(s)
#' }
#' @export
stopIsoplotR <- function(server=NULL) {
    shinylight::slStop(server)
}

#' Start the \code{IsoplotR} GUI without exiting
#'
#' Opens a web-browser with a Graphical User Interface (GUI) for the
#' \code{IsoplotR} package. This function is intended to be used from
#' Rscript so that Rscript does not terminate and the server stays up.
#' @param host IP address of the virtual server
#' @param port Internet port of the virtual server. If not defined, a
#' random free port will be chosen and the browser will be opened
#' to show the GUI.
#' @param timeout How long (in elapsed time) an operation may take
#' before returning with a timeout error. Default: 30 seconds.
#' @return This function does not return.
#' @examples
#' # this function runs indefinitely unless interrupted by the user.
#' \dontrun{daemon(3839)}
#' @export
daemon <- function(port = NULL, host = "127.0.0.1", timeout = 30) {
    IsoplotR(host = host, port = port, timeout = timeout, daemonize = TRUE)
}
