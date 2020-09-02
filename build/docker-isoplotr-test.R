rm(list=ls())

setwd('~/Documents/Programming/R/')
system('IsoplotRgui/build/docker-isoplotr.sh')
# comment out next line if you don't want to update version number:
system('docker-isoplotr/build/IsoplotRgit.sh')
install.packages('docker-isoplotr/.',repos=NULL,type='source')
IsoplotRgui::IsoplotR()
