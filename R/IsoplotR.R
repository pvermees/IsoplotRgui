serverR <- source('inst/shiny-examples/myapp/server.R')

# for some reason I have to save the function from server.R
serverFn <- server

rrpc <- function(methods) { function(ws) {
    ws$onMessage(function(binary, message) {
        df <- jsonlite::fromJSON(message);
        method <- df$method;
        envelope <- list()
        envelope$jsonrpc <- "2.0"
        envelope$id <- df$id
        if (is.null(methods[[method]])) {
            envelope$error <- "no such method"
            envelope$result <- NULL
        } else {
            envelope$result <- methods[[method]](df$params)
        }
        ws$send(jsonlite::toJSON(envelope))
    })
}}

#' Start the \code{IsoplotR} GUI
#'
#' Opens a web-browser with a Graphical User Interface (GUI) for the
#' \code{IsoplotR} package. An online version of the same interface is
#' provided at \url{http://isoplotr.london-geochron.com}
#'
#' @examples
#' #IsoplotR()
#' @export
IsoplotR <- function(host='0.0.0.0', port=8080) {
    appDir <- system.file("shiny-examples", "myapp", "www",
            package = "IsoplotRgui")
    if (appDir == "") {
        stop("Could not find shinyApp directory. Try re-installing `IsoplotRgui`.", call. = FALSE)
    }
    s <- httpuv::startServer(host=host, port=port,
        app=list(
            staticPaths = list("/" = appDir),
            onWSOpen = rrpc(list(
                run=function(p) {
                    serverFn(p)$runner()
                },
                plot=function(p) {
                    serverFn(p)$plotter()
                },
                pdf=function(p) {
                    serverFn(p)$getPdf()
                },
                csv=function(p) {
                    serverFn(p)$getCsv("ages")
                }
            ))
        )
    )
    cat(sprintf("Listening on %s:%d\n", host, port))
    while (TRUE) {
        later::run_now(9999)
    }
}
