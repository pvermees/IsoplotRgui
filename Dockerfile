FROM r-base:4.0.0

EXPOSE 50055

RUN apt-get update && apt-get install -y npm libcurl4-openssl-dev libxml2-dev

COPY build/install.R /app/build/install.R
WORKDIR /app
RUN Rscript build/install.R

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

RUN npm install .

COPY DESCRIPTION /app/DESCRIPTION
COPY NAMESPACE /app/NAMESPACE
COPY R/IsoplotR.R /app/R/IsoplotR.R
COPY build /app/build
COPY inst /app/inst

CMD ["Rscript", "--vanilla", "build/start-gui.R", "0.0.0.0:50055"]
