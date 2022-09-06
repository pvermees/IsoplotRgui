FROM r-base:4.2.1

WORKDIR /isoplotrgui

RUN ["Rscript",  "-e", \
    "install.packages(c('IsoplotR','shinylight'), \
    repos='https://cran.rstudio.com')"]

COPY DESCRIPTION /isoplotrgui/DESCRIPTION
COPY NAMESPACE /isoplotrgui/NAMESPACE
COPY R /isoplotrgui/R
COPY inst /isoplotrgui/inst

RUN ["R", "CMD", "INSTALL", "."]

ENV TIMEOUT 30

CMD Rscript -e "IsoplotRgui::daemon(80,'0.0.0.0',timeout=${TIMEOUT})"
