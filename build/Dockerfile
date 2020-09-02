FROM alpine:3.11.6

RUN apk add R R-dev R-doc build-base automake autoconf ttf-freefont

RUN Rscript --vanilla -e "install.packages(c('MASS','later','jsonlite','httpuv'), repos='https://cran.rstudio.com/')"

COPY . /app
WORKDIR /app

COPY DESCRIPTION /app/DESCRIPTION
COPY NAMESPACE /app/NAMESPACE
COPY R /app/R
COPY inst /app/inst
COPY build/start-gui.R /app/build/start-gui.R

CMD ["Rscript", "--vanilla", "build/start-gui.R", "0.0.0.0:80"]
