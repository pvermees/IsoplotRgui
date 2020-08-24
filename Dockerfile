FROM r-base:4.0.0

RUN apt-get update && apt-get install -y npm libcurl4-openssl-dev libxml2-dev

COPY build/install.R /app/build/install.R
WORKDIR /app
RUN Rscript build/install.R

COPY DESCRIPTION /app/DESCRIPTION
COPY NAMESPACE /app/NAMESPACE
COPY R/IsoplotR.R /app/R/IsoplotR.R
COPY inst /app/inst
COPY build/start-gui.R /app/build/start-gui.R

EXPOSE 3838

CMD ["Rscript", "--vanilla", "build/start-gui.R", "0.0.0.0:3838"]
