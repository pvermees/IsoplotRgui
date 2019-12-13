translate <- function(fname,odir='.'){
    dict <- IsoplotR:::fromJSON(file=fname)
    out <- list()
    for (i in 1:length(dict)){
        entry <- dict[[i]]
        out[[entry$id]] <- list(en=entry$en,cn=entry$cn)
    }
    json <- IsoplotR:::toJSON(out)
    cat(json,file=paste0(odir,fname))
}

odir <- '../inst/shiny-examples/myapp/www/js/'
translate(fname='dictionary.json',odir=odir)
translate(fname='contextual-help.json',odir=odir)
