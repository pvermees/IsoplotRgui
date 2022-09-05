sudo -Hu wwwrunner Rscript -e "remotes::install_github(repo=c('pvermees/IsoplotR','pvermees/IsoplotRgui'),force=TRUE,lib='~/R')"
# We use sudo here so that the user only gets asked once for the sudo password, not N times
sudo /usr/local/sbin/isoplotrctl restart
