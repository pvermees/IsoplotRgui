rm(list=ls())

setwd('~/Documents/Programming/R/')
install.packages('IsoplotR/.',repos=NULL,type='source')
install.packages('IsoplotRgui/.',repos=NULL,type='source')
# comment out next line if you don't want to update version number:
#system('IsoplotRgui/build/version.sh')
IsoplotRgui::IsoplotR()
