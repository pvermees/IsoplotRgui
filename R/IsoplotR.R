
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
            error <- NULL
            envelope$result <- tryCatch(
                do.call(interface[[method]], df$params),
                error=function(e) {
                    error <<- geterrmessage();
                    cat("ERROR:", error, "\n");
                    NULL
                }
            )
            envelope$error <- error;
        }
        ws$send(jsonlite::toJSON(envelope))
    })
}}

rrpcServer <- function(interface, host='0.0.0.0', port=8080, appDir=NULL, root="/") {
    app <- list(onWSOpen=rrpc(interface))
    if (!is.null(appDir)) {
        paths <- list()
        paths[[root]] <- appDir
        app$staticPaths <- paths
    }
    httpuv::startServer(host=host, port=port, app=app)
}


# Calls callback for each name found in expression 'exp'

findNames <- function(exp, callback) {
  # don't care about is.atomic
  if (is.name(exp)) {
    callback(exp)
  } else if (is.pairlist(exp)) {
    lapply(exp, function(e) { findNames(e, callback) })
  } else if (is.call(exp)) {
    if ("::" == exp[[1]] && is.name(exp[[2]]) && is.name(exp[[3]])) {
      callback(paste0(exp[2], "::", exp[3]))
    } else {
      lapply(exp, function(e) { findNames(e, callback) })
    }
  }
}

nameCheck <- function(exps, allowed) {
  failures <- list()
  lapply(exps,function(exp) {
    findNames(exp, function(n) {
      text <- as.character(n)
      if (!(text %in% allowed)) {
        failures[text] <<- TRUE
      }
    })
  })
  names(failures)
}

sanitizeCommand <- function(command, callback) {
    com <- parse(text=command)
    failures <- nameCheck(com, list(
        'IsoplotR::settings', '<-', 'dat', 'selection2data', 'par', 'c',
        'rgb', 'selection2levels', 'omitter', 'IsoplotR::concordia',
        'IsoplotR::read.data', 'IsoplotR::data2york', 'IsoplotR::kde',
        'IsoplotR::cad', 'IsoplotR::mds', 'IsoplotR::isochron',
        'IsoplotR::evolution', 'IsoplotR::radialplot',
        'IsoplotR::agespectrum', 'IsoplotR::weightedmean',
        'IsoplotR::set.zeta', 'IsoplotR::helioplot', 'IsoplotR::age'
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
#' provided at \url{http://isoplotr.london-geochron.com}
#' @param host IP address of the virtual server
#' @param port internet port of the virtual server
#' @examples
#' #IsoplotR()
#' @export
IsoplotR <- function(host='0.0.0.0', port=8080) {
    appDir <- system.file("www", package = "IsoplotRgui")
    if (appDir == "") {
        stop("Could not find www directory. Try re-installing `IsoplotRgui`.",
             call. = FALSE)
    }
    s <- rrpcServer(host=host, port=port, appDir=appDir, root="/",
        interface=list(
            run=function(data, Rcommand) {
                sanitizeCommand(Rcommand, function(com) {
                    server(data)$runner(com)
                })
            },
            plot=function(data, width, height, Rcommand) {
                sanitizeCommand(Rcommand, function(com) {
                    server(data)$plotter(width, height, com)
                })
            },
            pdf=function(data, Rcommand) {
                sanitizeCommand(Rcommand, function(com) {
                    server(data)$getPdf(com)
                })
            },
            csv=function(data, Rcommand) {
                sanitizeCommand(Rcommand, function(com) {
                    server(data)$getCsv(com, "ages")
                })
            }
        )
    )
    cat(sprintf("Listening on %s:%d\n", host, port))
    while (TRUE) {
        later::run_now(9999)
    }
}
