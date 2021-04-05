rrpc <- function(interface) { function(ws) {
  ws$onMessage(function(binary, message) {
    df <- jsonlite::fromJSON(message);
    method <- df$method
    envelope <- list()
    envelope$jsonrpc <- "2.0"
    envelope$id <- df$id
    if (is.null(interface[[method]])) {
      envelope$error <- "no such method"
      envelope$result <- NULL
    } else {
      r <- tryCatch({
        result <- do.call(interface[[method]], df$params)
        list(result=result, error=NULL)
      }, error=function(e) {
        error <- geterrmessage();
        cat("ERROR:", error, "\n");
        list(result=NULL, error=error)
      })
      envelope$result <- r$result
      envelope$error <- r$error
    }
    ws$send(jsonlite::toJSON(envelope))
  })
}}

rrpcServer <- function(interface, host='0.0.0.0', port=NULL, appDir=NULL, root="/") {
    app <- list(onWSOpen=rrpc(interface))
    if (!is.null(appDir)) {
        paths <- list()
        paths[[root]] <- appDir
        app$staticPaths <- paths
    }
    if (is.null(port)) {
        port <- httpuv::randomPort(min=8192, max=40000, host=host)
    }
    httpuv::startServer(host=host, port=port, app=app)
}

# Finds all names in an expression
# but the result needs flattening
findNames <- function(exp) {
  # don't care about is.atomic
  if (is.name(exp)) {
    exp
  } else if (is.pairlist(exp)) {
    Map(findNames, exp)
  } else if (is.call(exp)) {
    if ("::" == exp[[1]] && is.name(exp[[2]]) && is.name(exp[[3]])) {
      paste0(exp[2], "::", exp[3])
    } else {
      Map(findNames, exp)
    }
  }
}

nameCheck <- function(exps, allowed) {
  symbls <- unlist(Map(findNames, exps))
  nams <- unique(Map(as.character, symbls))
  setdiff(nams, allowed)
}

sanitizeCommand <- function(command, callback) {
    com <- parse(text=command)
    failures <- nameCheck(com, c(
        'IsoplotR::settings', '<-', 'dat', 'selection2data', 'par', 'c',
        'rgb', 'selection2levels', 'omitter', 'IsoplotR::concordia',
        'IsoplotR::read.data', 'IsoplotR::data2york', 'IsoplotR::kde',
        'IsoplotR::cad', 'IsoplotR::mds', 'IsoplotR::isochron',
        'IsoplotR::evolution', 'IsoplotR::radialplot',
        'IsoplotR::agespectrum', 'IsoplotR::weightedmean',
        'IsoplotR::set.zeta', 'IsoplotR::helioplot', 'IsoplotR::age',
        'IsoplotR::discfilter', 'IsoplotR::diseq', 'list', 'input','-',
        'seq',':','rev','rainbow','topo.colors','terrain.colors',
        'heat.colors','cm.colors'
    ))
    if (0 < length(failures)) {
        txt <- paste(failures, collapse=", ")
        stop(paste0("non-whitelisted names used: ", txt), call.=FALSE, domain=NA)
    }
    callback(com)
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
    wrap <- function(Rcommand, callback) {
      sanitizeCommand(Rcommand, function(com) {
        setTimeLimit(elapsed=timeout)
        on.exit({
          setTimeLimit(elapsed=Inf)
        })
        callback(com)
      })
    }
    s <- rrpcServer(host=host, port=port, appDir=appDir, root="/",
        interface=list(
            run=function(data, Rcommand) {
                wrap(Rcommand, function(com) {
                    server$runner(com, data)
                })
            },
            plot=function(data, width, height, Rcommand) {
                wrap(Rcommand, function(com) {
                    server$plotter(width, height, com, data)
                })
            },
            pdf=function(data, Rcommand) {
                wrap(Rcommand, function(com) {
                    server$getPdf(com, data)
                })
            },
            csv=function(data, Rcommand) {
                wrap(Rcommand, function(com) {
                    server$getCsv(com, data, "ages")
                })
            }
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
    if (is.null(server)) {
        httpuv::stopAllServers()
    } else {
        server$stop()
    }
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
#' \donttest{daemon(3839)}
#' @export
daemon <- function(port=NULL, host='127.0.0.1', timeout=30) {
    IsoplotR(host=host, port=port, timeout=timeout)
    while (TRUE) {
        later::run_now(9999)
    }
}
