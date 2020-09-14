args <- commandArgs(trailingOnly=TRUE)
install.packages('.', repos=NULL, type="source")
host <- '0.0.0.0'
port <- 8080
if (0 < length(args)) {
    address <- unlist(strsplit(args[1],':'))
    if (length(address) == 2) {
        host <- address[1]
        port <- as.numeric(address[2])
    } else {
        port <- as.numeric(args[1])
    }
}

IsoplotRgui::daemon(host=host, port=port)
