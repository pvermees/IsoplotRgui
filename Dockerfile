FROM pvermees/docker-isoplotr

WORKDIR /isoplotrgui

RUN Rscript --vanilla -e \
    "install.packages('shinylight', repos='https://cran.r-project.org/')"

COPY DESCRIPTION /isoplotrgui/DESCRIPTION
COPY NAMESPACE /isoplotrgui/NAMESPACE
COPY R /isoplotrgui/R
COPY inst /isoplotrgui/inst

RUN ["R", "CMD", "INSTALL", "."]

ENV TIMEOUT 30

CMD Rscript -e "IsoplotRgui::daemon(80,'0.0.0.0',timeout=${TIMEOUT})"