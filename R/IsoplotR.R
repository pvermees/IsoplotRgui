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

getdiscfilter <- function(cd) {
    if (is.null(cd)) {
        return(NULL)
    }
    if (is.null(cd$cutoff)) {
        return(IsoplotR::discfilter(
            option = cd$option,
            before = cd$before
        ))
    }
    IsoplotR::discfilter(
        option = cd$option,
        cutoff = cd$cutoff,
        before = cd$before
    )
}

getomitter <- function(om, dat, nc) {
    if (is.null(om)) {
        return(NULL)
    }
    if (is.null(om$flags)) {
        return(om)
    }
    omitter(dat = dat, nc = nc, flags = om$flags)
}

isoplotr_env <- environment(IsoplotR::concordia)

call.isoplotr <- function(fn, params, data, s2d, settings,
        cex = NULL, york = NULL) {
    if (!is.null(s2d$diseq)) {
        s2d$params$d <- do.call(
            IsoplotR::diseq,
            s2d$diseq
        )
    }
    s2d$params$input <- data
    params$x <- do.call(selection2data, s2d$params)
    for (method.name in names(settings)) {
        method <- settings[[method.name]]
        for (clock.name in names(method)) {
            vs <- method[[clock.name]]
            do.call(IsoplotR::settings, as.list(c(method.name, clock.name, vs)))
        }
    }
    nc <- as.numeric(data$nc)
    params$cutoff.disc <- getdiscfilter(params$cutoff.disc)
    params$discordance <- getdiscfilter(params$discordance)
    params$omit <- getomitter(params$omit, data$data, nc)
    params$hide <- getomitter(params$hide, data$data, nc)
    if (!is.null(params$levels)) {
        params$levels <- selection2levels(data$data, nc)
    }
    if (!is.null(cex)) {
        par(cex)
    }
    if (!is.null(york)) {
        params$x <- IsoplotR::data2york(params$x, format = york$format)
    }
    do.call(fn, params, envir = isoplotr_env)
}

getcolour <- function(text, default) {
    # Fix this
    eval(parse(text=text))
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
    return(as.numeric(c(
        if (is.null(min) || min == "auto") 0 else min,
        if (is.null(max) || max == "auto") 4500 else max
    )))
}

concordia <- function(fn, params, data, s2d, settings, cex) {
    pd <- params$pdsettings
    nc <- as.numeric(data$nc)
    if (!is.null(s2d$diseq)) {
        s2d$params$d <- do.call(
            IsoplotR::diseq,
            s2d$diseq
        )
    }
    s2d$params$input <- data
    args <- list(
        x = do.call(selection2data, s2d$params),
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
    if (pd$ticks != "auto") {
        args$ticks <- pd$ticks
    }
    if (pd$anchor == 1) {
        args$anchor <- 1
    } else if (pd$anchor == 2) {
        args$anchor <- c(2, pd$tanchor)
    }
    par(cex)
    do.call(IsoplotR::concordia, args)
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
            isoplotr = call.isoplotr,
            concordia = concordia
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
