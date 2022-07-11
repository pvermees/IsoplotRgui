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

applysettings <- function(settings) {
    for (methodname in names(settings)) {
        method <- settings[[methodname]]
        for (gc in names(method)) {
            vs <- method[[gc]]
            do.call(IsoplotR::settings, as.list(c(methodname, gc, vs)))
        }
    }
}

getpch <- function(pch) {
    if (pch == "none") {
        return(NULL)
    }
    as.numeric(pch)
}

getlimits <- function(min, max) {
    if (min == "auto" || max == "auto") {
        return(NULL)
    }
    return(as.numeric(c(min, max)))
}

gettimelimits <- function(min, max) {
    if ((is.null(min) || min == "auto")
        && (is.null(max) || max == "auto")) {
        return(NULL)
    }
    return(c(
        if (is.null(min) || min == "auto") 0 else as.numeric(min),
        if (is.null(max) || max == "auto") 4500 else as.numeric(max)
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
    applysettings(settings)
    pd <- params$pdsettings
    nc <- as.numeric(data$nc)
    args <- list(
        x = getdata(params, data, s2d),
        alpha = pd$alpha,
        type = pd$type,
        exterr = pd$exterr,
        show.numbers = pd$shownumbers,
        show.age = pd$showage,
        sigdig = pd$sigdig,
        common.Pb = params$gcsettings$commonPb,
        ellipse.fill = params$ellipsefill,
        ellipse.stroke = params$ellipsestroke,
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
    par(cex)
    do.call(IsoplotR::concordia, args)
}

radialplot <- function(fn, params, data, s2d, settings, cex) {
    applysettings(settings)
    pd <- params$pdsettings
    nc <- as.numeric(data$nc)
    args <- list(
        x = getdata(params, data, s2d),
        transformation = pd$transformation,
        pch = getpch(pd$pch),
        show.numbers = pd$shownumbers,
        k = pd$numpeaks,
        alpha = pd$alpha,
        sigdig = pd$sigdig,
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
        args$detritus <- params$gcsettings$detritus
    }
    if (params$geochronometer %in%
            c("Th-U", "Ar-Ar", "Th-Pb", "K-Ca",
            "Rb-Sr", "Sm-Nd", "Re-Os", "Lu-Hf")) {
        args$i2i <- params$gcsettings$i2i
    }
    if (params$geochronometer == "U-Pb") {
        type <- params$gcsettings$type
        args$type <- type
        if (type == 4) {
            args$cutoff.76 <- params$gcsettings$cutoff76
        }
        if (params$gcsettings$cutoffdisc != 0) {
            opt <- params$gcsettings$discoption
            cutoff <- c(
                params$gcsettings$mindisc[opt - 1],
                params$gcsettings$maxdisc[opt - 1]
            )
            IsoplotR::discfilter(
                option = opt,
                cutoff = cutoff,
                before = params$gcsettings$cutoffdisc == 1
            )
        }
    }
    if (params$geochronometer == "Pb-Pb") {
        args$common.Pb <- params$gcsettings$commonPb
    }
    par(cex)
    do.call(IsoplotR::radialplot, args)
}

evolution <- function(fn, params, data, s2d, settings, cex) {
    applysettings(settings)
    pd <- params$pdsettings
    nc <- as.numeric(data$nc)
    args <- list(
        x = getdata(params, data, s2d),
        alpha = pd$alpha,
        show.numbers = pd$shownumbers,
        sigdig = pd$sigdig,
        transform = pd$transform,
        detritus = params$gcsettings$detritus,
        exterr = pd$exterr,
        isochron = pd$isochron,
        levels = selection2levels(data$data, nc),
        omit = omitter(data$data, nc, c("x")),
        hide = omitter(data$data, nc, c("X")),
        ellipse.fill = params$ellipsefill,
        ellipse.stroke = params$ellipsestroke,
        model = pd$model,
        clabel = pd$clabel
    )
    args$tlim <- gettimelimits(pd$mint, pd$maxt)
    args$xlim <- getlimits(pd$min08, pd$max08)
    args$ylim <- getlimits(pd$min48, pd$max48)
    par(cex)
    do.call(IsoplotR::evolution, args)
}

isochron <- function(fn, params, data, s2d, settings, cex, york = NULL) {
    applysettings(settings)
    pd <- params$pdsettings
    nc <- as.numeric(data$nc)
    args <- list(
        x = getdata(params, data, s2d),
        alpha = pd$alpha,
        show.numbers = pd$shownumbers,
        sigdig = pd$sigdig,
        levels = selection2levels(data$data, nc),
        omit = omitter(data$data, nc, c("x")),
        hide = omitter(data$data, nc, c("X")),
        ellipse.fill = params$ellipsefill,
        ellipse.stroke = params$ellipsestroke,
        model = pd$model,
        clabel = pd$clabel
    )
    gc <- params$geochronometer
    if (gc %in% c("U-Pb", "Th-U", "U-Th-He", "Pb-Pb")) {
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
    }
    if (gc != "U-Th-He") {
        args$exterr <- params$pdsettings$exterr
    }
    args$xlim <- getlimits(pd$minx, pd$maxx)
    args$ylim <- getlimits(pd$miny, pd$maxy)
    if (!is.null(york)) {
        args$x <- IsoplotR::data2york(args$x, format = york$format)
    }
    par(cex)
    do.call(IsoplotR::isochron, args)
}

weightedmean <- function(fn, params, data, s2d, settings, cex) {
    applysettings(settings)
    pd <- params$pdsettings
    nc <- as.numeric(data$nc)
    args <- list(
        x = getdata(params, data, s2d),
        detect.outliers = pd$outliers,
        alpha = pd$alpha,
        sigdig = pd$sigdig,
        random.effects = pd$randomeffects,
        ranked = pd$ranked,
        levels = selection2levels(data$data, nc),
        rect.col = params$rectcol,
        outlier.col = params$outliercol,
        omit = omitter(data$data, nc, c("x")),
        hide = omitter(data$data, nc, c("X")),
        clabel = pd$clabel
    )
    args$from <- notauto(pd$mint)
    args$to <- notauto(pd$maxt)
    gc <- params$geochronometer
    if (gc %in% c(
        "Th-U", "Ar-Ar", "Th-Pb", "K-Ca", "Rb-Sr", "Sm-Nd", "Re-Os", "Lu-HF"
    )) {
        args$i2i <- params$gcsettings$i2i
    }
    if (gc == "U-Pb") {
        type <- params$gcsettings$type
        args$type <- type
        if (type == 4) {
            args$cutoff.76 <- params$gcsettings$cutoff76
        }
        if (params$gcsettings$cutoffdisc != 0) {
            opt <- params$gcsettings$discoption
            args$cutoff.disc <- IsoplotR::discfilter(
                option = opt,
                before = params$gcsettings.cutoffdisc == 1,
                cutoff = c(
                    params$gcsettings$mindisc[opt - 1],
                    params$gcsettings$maxdisc[opt - 1]
                )
            )
        }
    }
    if (gc %in% c("U-Pb", "Pb-Pb")) {
        args$common.Pb <- params$gcsettings$commonPb
    }
    if (gc == "Th-U") {
        args$detritus <- params$gcsettings$detritus
    }
    if (!(gc %in% c("other", "Th-U", "U-Th-He"))) {
        args$exterr <- params$pdsettings$exterr
    }
    par(cex)
    do.call(IsoplotR::weightedmean, args)
}

agespectrum <- function(fn, params, data, s2d, settings, cex) {
    applysettings(settings)
    pd <- params$pdsettings
    nc <- as.numeric(data$nc)
    args <- list(
        x = getdata(params, data, s2d),
        plateau = pd$plateau,
        plateau.col = params$plateaucol,
        non.plateau.col = params$nonplateaucol,
        detect.outliers = pd$outliers,
        alpha = pd$alpha,
        sigdig = pd$sigdig,
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
    par(cex)
    do.call(IsoplotR::agespectrum, args)
}

kde <- function(fn, params, data, s2d, settings, cex) {
    applysettings(settings)
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
        args$cutoff.disc <- IsoplotR::discfilter(
            option = opt,
            before = params$gcsettings.cutoffdisc == 1,
            cutoff = c(
                params$gcsettings$mindisc[opt - 1],
                params$gcsettings$maxdisc[opt - 1]
            )
        )
    }
    if (gc %in% c("U-Pb", "Pb-Pb")) {
        args$common.Pb <- params$gcsettings$commonPb
    }
    if (gc == "detritals") {
        args$samebandwidth <- pd$samebandwidth
        args$normalise <- pd$normalise
    }
    par(cex)
    do.call(IsoplotR::kde, args)
}

cad <- function(fn, params, data, s2d, settings, cex) {
    applysettings(settings)
    pd <- params$pdsettings
    nc <- as.numeric(data$nc)
    args <- list(
        x = getdata(params, data, s2d),
        verticals = pd$verticals,
        pch = getpch(pd$pch)
    )
    gc <- params$geochronometer
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
        args$cutoff.disc <- IsoplotR::discfilter(
            option = opt,
            before = params$gcsettings.cutoffdisc == 1,
            cutoff = c(
                params$gcsettings$mindisc[opt - 1],
                params$gcsettings$maxdisc[opt - 1]
            )
        )
    }
    if (gc %in% c("U-Pb", "Pb-Pb")) {
        args$common.Pb <- params$gcsettings$commonPb
    }
    if (gc == "detritals") {
        args$col <- params$colmap
        args$hide <- params$hide
    } else {
        args$hide <- omitter(data$data, nc, c("x", "X"))
    }
    par(cex)
    do.call(IsoplotR::cad, args)
}

set.zeta <- function(fn, params, data, s2d, settings) {
    applysettings(settings)
    args <- list(
        x = getdata(params, data, s2d),
        tst = as.numeric(params$data$age),
        exterr = params$pdsettings$exterr,
        sigdig = params$pdsettings$sigdig,
        update = FALSE
    )
    do.call(IsoplotR::set.zeta, args)
}

helioplot <- function(fn, params, data, s2d, settings, cex) {
    applysettings(settings)
    pd <- params$pdsettings
    nc <- as.numeric(data$nc)
    args <- list(
        x = getdata(params, data, s2d),
        alpha = pd$alpha,
        show.numbers = pd$shownumbers,
        sigdig = pd$sigdig,
        levels = selection2levels(data$data, nc),
        omit = omitter(data$data, nc, c("x")),
        hide = omitter(data$data, nc, c("X")),
        ellipse.fill = params$ellipsefill,
        ellipse.stroke = params$ellipsestroke,
        model = pd$model,
        clabel = pd$clabel
    )
    args$xlim <- getlimits(pd$minx, pd$maxx)
    args$ylim <- getlimits(pd$miny, pd$maxy)
    args$fact <- notauto(pd$fact)
    par(cex)
    do.call(IsoplotR::helioplot, args)
}

mds <- function(fn, params, data, s2d, settings, cex) {
    applysettings(settings)
    pd <- params$pdsettings
    args <- list(
        x = getdata(params, data, s2d),
        sigdig = pd$sigdig,
        classical = pd$classical,
        shepard = pd$shepard,
        nnlines = pd$nnlines,
        pch = getpch(pd$pch),
        col = params$col,
        bg = params$bg,
        hide = params$hide,
    )
    if (pd$pos %in% c(1, 2, 3, 4)) {
        args$pos <- pd$pos
    }
    if (!pd$shepard) {
        par(cex)
    }
    do.call(IsoplotR::mds, args)
}

age <- function(fn, params, data, s2d, settings) {
    applysettings(settings)
    args <- list(
        x = getdata(params, data, s2d)
    )
    gc <- params$geochronometer
    if (gc == "U-Pb" && params$pdsettings$showdisc != 0) {
        IsoplotR::discfilter(
            option = params$pdsettings$discoption,
            before = params$pdsettings$showdisc == 1
        )
    }
    if (gc == "U-TH-He") {
        args$exterr <- params$pdsettings$exterr
    }
    if (gc == "Th-U") {
        args$i2i <- params$gcsettings$i2i
        args$isochron <- FALSE
        args$detritus <- params$gcsettings$detritus
    }
    if (gc %in% c(
        "Th-U", "Ar-Ar", "Th-Pb", "K-Ca", "Rb-Sr", "Sm-Nd", "Re-Os", "Lu-Hf")
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
#' random free port will be chosen and the browser will be opened
#' to show the GUI.
#' @param timeout How long (in wall-clock time) an operation may take
#' before returning with a timeout error. Default: no limit.
#' @return server object
#' @examples
#' \donttest{IsoplotR()}
#' @export
IsoplotR <- function(host='0.0.0.0', port=NULL, timeout=Inf) {
    appDir <- system.file("www", package = "IsoplotRgui")
    if (appDir == "") {
        stop("Could not find www directory. Try re-installing `IsoplotRgui`.",
             call. = FALSE)
    }
    s <- shinylight::slServer(
        host = host,
        port = port,
        appDir = appDir,
        daemonize = !is.null(port),
        interface = list(
            concordia = concordia,
            radial = radialplot,
            evolution = evolution,
            isochron = isochron,
            regression = isochron,
            average = weightedmean,
            spectrum = agespectrum,
            KDE = kde,
            CAD = cad,
            "set-zeta" = set.zeta,
            helioplot = helioplot,
            MDS = mds,
            ages = age
        )
    )
    extraMessage <- ""
    if (is.null(port)) {
        protocol <- "http://"
        if (grepl("://", host, fixed=TRUE)) {
            protocol <- ""
        }
        port <- s$getPort()
        utils::browseURL(paste0(protocol,
          if (host == '0.0.0.0') '127.0.0.1' else host,
          ":", port))
        extraMessage <- "Call IsoplotRgui::stopIsoplotR() to stop serving IsoplotR\n"
    }
    cat(sprintf("Listening on %s:%d\n%s", host, port, extraMessage))
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
daemon <- function(port=NULL, host='127.0.0.1', timeout=30) {
    IsoplotR(host=host, port=port, timeout=timeout)
    while (TRUE) {
        later::run_now(9999)
    }
}
