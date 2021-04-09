rm(list=ls())

setwd('~/Documents/Programming/R/')
install.packages('IsoplotR/.',repos=NULL,type='source')
install.packages('IsoplotRgui/.',repos=NULL,type='source')
cat(as.character(packageVersion('IsoplotRgui')),
    file='IsoplotRgui/inst/www/version.txt')
IsoplotRgui::IsoplotR(timeout=30)
