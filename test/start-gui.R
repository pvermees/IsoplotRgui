args <- commandArgs(trailingOnly=TRUE)
install.packages('.', repos=NULL, type="source")
library(IsoplotRgui)
library(shiny)
if (0 < length(args)) {
    address <- unlist(strsplit(args[1],':'))
    if (length(address) == 2) {
        options(shiny.host=address[1], shiny.port=as.numeric(address[2]))
    } else {
        options(shiny.port=as.numeric(args[1]))
    }
}
IsoplotR()
