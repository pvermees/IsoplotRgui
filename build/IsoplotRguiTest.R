rm(list=ls())
setwd('~/git')
install.packages('shinylight/.',repos=NULL,type='source',force=TRUE)
install.packages('IsoplotR/.',repos=NULL,type='source',force=TRUE)
install.packages('IsoplotRgui/.',repos=NULL,type='source',force=TRUE)
cat(as.character(packageVersion('IsoplotRgui')),
    file='IsoplotRgui/inst/www/version.txt')
IsoplotRgui::IsoplotR(timeout=30)
