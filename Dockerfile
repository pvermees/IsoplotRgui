FROM alpine:3.11.6

RUN apk add R R-dev R-doc build-base automake autoconf ttf-freefont

WORKDIR /app

RUN Rscript --vanilla -e "install.packages(c('later','jsonlite','httpuv','IsoplotR'), repos=c(CRAN='https://cran.rstudio.com'))"

COPY DESCRIPTION /app/DESCRIPTION
COPY NAMESPACE /app/NAMESPACE
COPY R /app/R
COPY inst /app/inst
COPY build/start-gui.R /app/build/start-gui.R

CMD ["Rscript", "--vanilla", "build/start-gui.R", "0.0.0.0:80"]
