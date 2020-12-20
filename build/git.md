## Setting up your own online mirror with *git*

Here is a way to set up a mirror on a Linux machine using the
following ingredients:

- Ubuntu
- nginx
- R
- git
- crontab

This method delivers the latest stable version of the app. Alternative
methods include:

1. [CRAN](CRAN.md) provides the current stable version on the
Comprehensive R Archive Netword (CRAN).

2. [Docker](docker.md) containers provide the most secure way to
install an **IsoplotR** mirror.

Instructions for offline use are provided in the main
[README](../README.md) file.

### Install *nginx*, *R* and *git*

If these packages are not installed on your system already, then you
can add them with the following commands:

```sh
sudo apt-get install nginx git r-base r-base-dev
```

### Create a user to run *IsoplotR*

It can be advantageous to have a non-human user running the
applications such as **IsoplotR** that you are exposing over the web
so as to limit any damage should one behave badly. For our purposes we
will create one called `wwwrunner`:

```sh
sudo useradd -mr wwwrunner
```

### Set up *IsoplotRgui* for this user

The version of **IsoplotR** and **IsoplotRgui** that gets run will be
the version that our new user `wwwrunner` has installed.

Install **IsoplotR** for this user:

```sh
sudo -Hu wwwrunner sh -c "mkdir ~/R"
sudo -Hu wwwrunner sh -c "echo R_LIBS_USER=~/R > ~/.Renviron"
sudo -Hu wwwrunner Rscript -e "install.packages(pkgs='remotes',lib='~/R')"
sudo -Hu wwwrunner Rscript -e "remotes::install_github(repo=c('pvermees/IsoplotR','pvermees/IsoplotRgui'),lib='~/R')"
```

### Create a systemd service for *IsoplotR*

Copy following into a new file `/etc/systemd/system/isoplotr.service`:

```
[Unit]
Description=IsoplotR
After=network.target

[Service]
Type=simple
User=wwwrunner
ExecStart=/usr/bin/Rscript -e IsoplotRgui::daemon(3838)
Restart=always

[Install]
WantedBy=multi-user.target
```

Note we are setting `User=wwwrunner` to use our new user and we are
running it on port 3838.

Then to make **IsoplotR** start on system boot type:

```sh
sudo systemctl enable isoplotr
```

Of course you can use other `systemctl` commands such as `start`, `stop`
and `restart` (to control whether it is running), and `disable` (to stop it
from running automatically on boot).

### Expose *IsoplotR* with *nginx*

You can expose this IsoplotR to your nginx server (if that is what
you want to use) with the instructions [here](nginx.md)

### Set up auto-updating

To ensure that **IsoplotR** is up-to-date, it is a good idea to set up
auto-updating.

Put the following in a script `/usr/local/sbin/updateIsoplotR.sh`:

```sh
sudo -Hu wwwrunner Rscript -e \
     "remotes::install_github(repo=c('pvermees/IsoplotR','pvermees/IsoplotRgui'),force=TRUE,lib='~/R')"
systemctl restart isoplotr
```

Ensure it is executable with:

```sh
sudo chmod a+rx /usr/local/sbin/updateIsoplotR.sh
```

One way to ensure that this script is regularly run is with **crontab**. First enter `sudo crontab -e` at the command prompt and then enter:

```
# Minute    Hour   Day of Month    Month            Day of Week           Command
# (0-59)   (0-23)    (1-31)    (1-12 or Jan-Dec) (0-6 or Sun-Sat)
    0        0         *             *                  0        /usr/local/sbin/updateIsoplotR.sh | /usr/bin/logger
```

which will automatically synchronise **IsoplotR** and **IsoplotRgui** with **GitHub** on every Sunday.

You can force an update yourself by running the script as the `root` user:

```sh
sudo /usr/local/sbin/updateIsoplotR.sh
```

### Maintenance

You can view the logs from the various processes mentioned here
as follows:

Process | command for accessing logs
-----|-----
cron (including the update script) | `journalctl -eu cron`
systemD | `journalctl -e _PID=1`
IsoplotRgui | `journalctl -eu isoplotr`
nginx | `journalctl -eu nginx`
nginx detail | logs are written into the `/var/log/nginx` directory

`journalctl` has many interesting options; for example `-r` to see
the most recent messages first, `-k` to see messages only from this
boot, or `-f` to show messages as they come in. The `-e` option
we have been using scrolls to the end of the log so that you are
looking at the most recent entries immediately.
