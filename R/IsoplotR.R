serverR <- source('inst/shiny-examples/myapp/server.R')

# for some reason I have to save the function from server.R
serverFn <- server

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
            onWSOpen = function(ws) {
                cat("WebSocket connection opened\n")
                ws$onMessage(function(binary, message) {
                    df <- jsonlite::fromJSON(message)
                    fns <- serverFn(df)
                    if (df$action == "run") {
                        reply <- fns$runner()
                    } else if (df$action == "plot") {
                        reply <- fns$plotter()
                    } else if (df$action == "pdf") {
                        reply <- fns$getPdf()
                    } else if (df$action == "csv") {
                        reply <- fns$getCsv("ages")
                    }
                    ws$send(jsonlite::toJSON(reply))
                })
                ws$onClose(function() {
                    cat("WebSocket connection closed\n")
                })
            }
        )
    )
    cat(sprintf("Listening on %s:%d\n", host, port))
    while (TRUE) {
        later::run_now(9999)
    }
}
