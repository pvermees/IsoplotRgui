#' Start the \code{IsoplotR} GUI
#'
#' Opens a web-browser with a Graphical User Interface (GUI) for the
#' \code{IsoplotR} package. An online version of the same interface is
#' provided at \url{http://isoplotr.london-geochron.com}
#'
#' @examples
#' #IsoplotR()
#' @export
IsoplotR <- function(){
  appDir <- system.file("shiny-examples","myapp", package = "IsoplotRgui")
  if (appDir == "") {
    stop("Could not find shinyApp directory. Try re-installing `IsoplotR`.", call. = FALSE)
  }
  shiny::runApp(appDir, display.mode = "normal")
}
