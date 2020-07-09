# IsoplotRgui

Graphical User Interface to the **IsoplotR** R package for radiometric
geochronology.

## Offline installation and use

1. You must have **R** installed on your system (see [http://r-project.org](http://r-project.org)) as well as the **devtools** and **shiny** packages. These can be installed by typing the following code at the **R** command line prompt:


```
install.packages('devtools')
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

Here is a way to set up a mirror on a Linux machine.

### Create a user to run IsoplotR

It can be advantageous to have a non-human user running the applications
such as IsoplotR that you are exposing over the web so as to limit any damage
should one behave badly. For our purposes we will create one called
`wwwrunner`:

```sh
sudo useradd -mr wwwrunner
```

### Set up IsoplotRgui for this user

The version of IsoplotR and IsoplotRgui that gets run will be the
version that our new user `wwwrunner` has installed. Begin with a
file that installs the latest version of `IsoplotR` and `IsoplotRgui`.

Copy the following script into a new file at `/usr/local/sbin/update_isoplotr`:

Now we will prepare for running this script:

```sh
chmod +x /usr/local/sbin/update_isoplotr
sudo -u wwwrunner sh -c "mkdir ~/R"
sudo -u wwwrunner sh -c "echo R_LIBS_USER=~/R > ~/.Renviron"
sudo -u wwwrunner Rscript -e "install.packages('devtools')"
sudo -u wwwrunner Rscript -e "devtools::install_github('pvermees/isoplotr')"
sudo -u wwwrunner Rscript -e "devtools::install_github('pvermees/isoplotrgui')"
```

### Create a systemd service for IsoplotR

Copy following into a new file `/etc/systemd/system/isoplotr.service`:

```
[Unit]
Description=IsoplotR
After=network.target

[Service]
Type=simple
User=wwwrunner
ExecStart=Rscript -e "IsoplotRgui::IsoplotR(port=3838)"
Restart=always

[Install]
WantedBy=multi-user.target
```

Note we are setting `User=wwwrunner` to use our new user and running
it on port 3838.

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

### Expose IsoplotR with nginx

To serve this in nginx you can add the following file at `/etc/nginx/sites-enabled/default`.
If there is one present, you will need to add our `location /isoplotr/` block to the
appropriate `server` block in yours:

```
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;

    index index.html

    server_name _;

    location /isoplotr/ {
        proxy_pass http://127.0.0.1:3838/;
		proxy_http_version 1.1;
		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection "upgrade";
    }
}
```

Now you can start this all up with:

```sh
sudo systemctl start isoplotr
sudo systemctl restart nginx
```

and **IsoplotR** will be available on `http://localhost/isoplotr`

4. To ensure that **IsoplotR** is up-to-date, it is a good idea to set up auto-updating.

Put the following in a script `updateIsoplotR.sh`:

```sh
Rscript -e "devtools::install_github('pvermees/IsoplotR',force=TRUE)"
Rscript -e "devtools::install_github('pvermees/IsoplotRgui',force=TRUE)"
sudo systemctl restart isoplotr
```

Ensure it is executable with `chmod +x updateIsoplotR.sh`.

One way to do this is with **crontab**. First enter ``crontab -u wwwrunner -e`` at the command prompt and then enter:

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
