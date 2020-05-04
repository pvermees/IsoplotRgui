rm(list=ls())

if (TRUE){ # sync?
    setwd('~/Documents/Programming/R/IsoplotRgui/devel/')
    source('db.R')
    # comment out next line if you don't want to update version number:
    system('./IsoplotRgit.sh')
    setwd('~/Documents/Programming/R')
    system(paste0('cp IsoplotR/inst/constants.json ',
                  'IsoplotRgui/inst/shiny-examples/myapp/www/js'))
    system('rm -rf IsoplotRshiny/app/*')
    system('rsync -av IsoplotR/R/* IsoplotRshiny/app/')
    system('rsync -av IsoplotRgui/R/* IsoplotRshiny/app/')
    system('rsync -av IsoplotRgui/inst/shiny-examples/myapp/* IsoplotRshiny/app/')
    system('cp IsoplotR/inst/constants.json IsoplotRshiny/app/')
    system('rm IsoplotRshiny/app/IsoplotR.R')
    system("sed -i 's/IsoplotR:://g' IsoplotRshiny/app/www/js/js2R.js")
    system("sed -i 's/IsoplotR:://g' IsoplotRshiny/app/server.R")
    system("cat IsoplotRshiny/sources.R IsoplotRshiny/app/server.R > temp;
            mv temp IsoplotRshiny/app/server.R")
    setwd('~/Documents/Programming/R/IsoplotRshiny/app')
    library(shiny)
    runApp()
} else {
    source('~/Documents/Programming/R/IsoplotRgui/R/IsoplotR.R')
    IsoplotR()
}
