args <- commandArgs(trailingOnly=TRUE)
install.packages('.', repos=NULL, type="source")
library(IsoplotRgui)
library(shiny)
if (0 < length(args)) {
    options(shiny.port=as.numeric(args[1]))
}
IsoplotR()
