# IsoplotRgui

Graphical User Interface to the **IsoplotR** R package for radiometric
geochronology.

## Offline installation and use

1. You must have **R** installed on your system (see [http://r-project.org](http://r-project.org)) as well as the **devtools** and **shiny** packages. These can be installed by typing the following code at the **R** command line prompt:


```
install.packages('devtools')
install.packages('shiny')
```

2. The latest version of **IsoplotR** and **IsoplotRgui** can both be installed from **GitHub** with the following commands:

```
library(devtools)
install_github('pvermees/IsoplotR')
install_github('pvermees/IsoplotRgui')
```

Please note that the latest stable version of **IsoplotR** is also available from **CRAN** at [https://cran.r-project.org/package=IsoplotR](https://cran.r-project.org/package=IsoplotR)

3. Once all these above packages have been installed, you can run the browser-based graphical user interface by typing:


```
library(IsoplotRgui)
IsoplotR()
```

at the command prompt. Alternatively, the program can also be accessed online via the **IsoplotR** website at [http://isoplotr.london-geochron.com](http://ucl.ac.uk/~ucfbpve/isoplotr), or from your own server as discussed in the next section.

## Setting up your own online mirror

The following instructions assume that you have access to a **Linux** server with **git** installed on it.

1. Install **R** and **shiny-server** using the instructions provided at [https://www.rstudio.com/products/shiny/download-server](https://www.rstudio.com/products/shiny/download-server)

2. Save the following code in a file called ``/srv/shiny-server/IsoplotR.sh``:

```
# i. update IsoplotR from GitHub:
sudo su - -c "R -e \"devtools::install_github('pvermees/IsoplotR',force=TRUE)\""

# ii. clone IsoplotRgui from GitHub to /tmp:
cd /tmp
git clone https://github.com/pvermees/IsoplotRgui

# iii. copy the app to the shiny-server directory:
cd IsoplotRgui/inst/shiny-examples/myapp
sudo cp -R www /srv/shiny-server/IsoplotR
sudo cp -R server.R /srv/shiny-server/IsoplotR

# iv. clean up and restart shiny-server
sudo rm -rf /tmp/IsoplotRgui
sudo systemctl restart shiny-server
```

3. Run the ``IsoplotR.sh`` script by entering the following code at the command prompt:

```
cd /srv/shiny-server
mkdir IsoplotR
chmod 755 IsoplotR.sh
./IsoplotR.sh
```

**IsoplotR** should now be available at http://localhost:3838/IsoplotR. You will need to set up port forwarding to release it over the Internet.

4. To ensure that **IsoplotR** is up-to-date, it is a good idea to set up auto-updating. One way to do this is with **crontab**. First enter ``crontab -e`` at the command prompt and then enter:

```
# Minute    Hour   Day of Month    Month            Day of Week           Command
# (0-59)   (0-23)    (1-31)    (1-12 or Jan-Dec) (0-6 or Sun-Sat)
    0        0         *             *                  0        /home/pvermees/IsoplotR.sh
```

which will automatically synchronise **IsoplotR** and **IsoplotRgui** with **GitHub** on every Sunday.

## Further information

See [http://isoplotr.london-geochron.com](http://ucl.ac.uk/~ucfbpve/isoplotr)

## Author

[Pieter Vermeesch](http://ucl.ac.uk/~ucfbpve)

## License

This project is licensed under the GPL-3 License
