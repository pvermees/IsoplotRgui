translate <- function(fname,odir='.',tag='id'){
    dict <- read.csv(file=paste0(fname,'.csv'),
                     header=TRUE,colClasses = "character")
    out <- list()
    for (i in 1:nrow(dict)){
        out[[dict[i,tag]]] <- list(en=dict$en[i],cn=dict$cn[i])
    }
    json <- IsoplotR:::toJSON(out)
    cat(json,file=paste0(odir,paste0(fname,'.json')))
}

odir <- '../inst/shiny-examples/myapp/www/js/'
translate(fname='dictionary_class',odir=odir,tag='class')
translate(fname='dictionary_id',odir=odir,tag='id')
translate(fname='contextual_help',odir=odir,tag='id')
