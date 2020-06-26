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

On a Linux machine:

Copy following into a new file `/etc/systemd/system/isoplotr.service`, edited
as appropriate:

```
[Unit]
Description=IsoplotR
After=network.target

[Service]
Type=simple
User=myuser
ExecStart=Rscript --vanilla -e "IsoplotRgui::IsoplotR(port=3838)"
Restart=always

[Install]
WantedBy=multi-user.target
```

Change the word on the right of `User=` to your login name. It can be
the name of any user on your system who has installed the `IsoplotRgui`
package; the version they have installed is the one that will be used.

Also (if you like) on the `ExecStart=` line, change the number to the
right of `port=` to be the port you would like to run **IsoplotR** on.

Then to make IsoplotR start on system boot type:

```sh
sudo systemctl enable isoplotr
```

Of course you can use other `systemctl` commands such as `start`, `stop`,
`restart` (to control whether it is running) and `disable` (to stop it from
running automatically on boot).

You can view the logs from this process at any time using:

```sh
sudo journalctl -u isoplotr
```

4. To ensure that **IsoplotR** is up-to-date, it is a good idea to set up auto-updating.

Put the following in a script `updateIsoplotR.sh`:

```sh
Rscript -e "devtools::install_github('pvermees/IsoplotR',force=TRUE)"
Rscript -e "devtools::install_github('pvermees/IsoplotRgui',force=TRUE)"
sudo systemctl restart isoplotr
```

Ensure it is executable with `chmod +x updateIsoplotR.sh`.

One way to do this is with **crontab**. First enter ``crontab -e`` at the command prompt and then enter:

```
# Minute    Hour   Day of Month    Month            Day of Week           Command
# (0-59)   (0-23)    (1-31)    (1-12 or Jan-Dec) (0-6 or Sun-Sat)
    0        0         *             *                  0        /path/to/updateIsoplotR.sh
```

which will automatically synchronise **IsoplotR** and **IsoplotRgui** with **GitHub** on every Sunday.

## Further information

See [http://isoplotr.london-geochron.com](http://ucl.ac.uk/~ucfbpve/isoplotr)

## Author

[Pieter Vermeesch](http://ucl.ac.uk/~ucfbpve)

## License

This project is licensed under the GPL-3 License
