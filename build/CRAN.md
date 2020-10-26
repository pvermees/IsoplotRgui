## Setting up your own online mirror using *CRAN*

Here is a way to set up a mirror on a Linux machine using the
following ingredients:

- Ubuntu
- nginx
- crontab

This method delivers the current stable version of the
app. Alternative methods include:

1. [GitHub](git.md) provides the most up to date development version.

2. [Docker](docker.md) containers provide the most secure way to
install an **IsoplotR** mirror.

Instructions for offline use are provided in the main
[README](../README.md) file.

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
sudo -u wwwrunner sh -c "mkdir ~/R"
sudo -u wwwrunner sh -c "echo R_LIBS_USER=~/R > ~/.Renviron"
sudo -u wwwrunner Rscript -e "utils::install.packages('IsoplotRgui')"
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
ExecStart=Rscript -e IsoplotRgui::daemon(3838)
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

You can view the logs from this process at any time using:

```sh
sudo journalctl -u isoplotr
```

(more information  below).

### Expose *IsoplotR* with *nginx*

To serve this in nginx you can add the following file at
`/etc/nginx/sites-enabled/default`. If there is one present, you will
need to add our `location /isoplotr/` block to the appropriate
`server` block in yours:

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

### Set up auto-updating

To ensure that **IsoplotR** is up-to-date, it is a good idea to set up
auto-updating.

Put the following in a script `/usr/local/sbin/updateIsoplotR.sh`:

```sh
sudo -u wwwrunner Rscript -e "utils::update.packages('IsoplotR')"
sudo -u wwwrunner Rscript -e "utils::update.packages('IsoplotRgui')"
systemctl restart isoplotr
```

Ensure it is executable with:

```sh
sudo chmod a+rx /usr/local/sbin/updateIsoplotR.sh
```

One way to ensure that this script is regularly run is with
**crontab**. First enter `sudo crontab -e` at the command prompt and
then enter:

```
# Minute    Hour   Day of Month    Month            Day of Week           Command
# (0-59)   (0-23)    (1-31)    (1-12 or Jan-Dec) (0-6 or Sun-Sat)
    0        0         *             *                  0        /usr/local/sbin/updateIsoplotR.sh
```

which will automatically synchronise **IsoplotR** and **IsoplotRgui** with **GitHub** on every Sunday.

You can force an update yourself by running the script as the
`wwwrunner` user:

```sh
sudo -u wwwrunner
```

### Maintenance

#### *crontab* logs

```
grep CRON < /var/log/syslog
```

or, if you want to see the messages as they appear:

```
tail -f /var/log/syslog | grep CRON
```

Or see the **IsoplotR** update log at `/var/log/isoplotr-update.log`.
If **cron** is running the update script but no output appears it
means that there is no update available.

#### *SystemD* logs

```sh
journalctl -u isoplotr
```

and:

```sh
journalctl -u nginx
```

`journalctl` has many interesting options; for example `-r` to see
the most recent messages first, `-k` to see messages only from this
boot, or `-f` to show messages as they come in.

#### *nginx* logs

As well as `journalctl`, there are logs from **nginx** at
`var/log/nginx`.