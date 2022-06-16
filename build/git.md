## Setting up your own online mirror with *git*

This method delivers the latest stable version of the app. Alternative
methods include:

1. [CRAN](CRAN.md) provides the current stable version on the
Comprehensive R Archive Netword (CRAN).

2. [Docker](docker.md) containers provide the most secure way to
install an **IsoplotR** mirror.

Instructions for offline use are provided in the main
[README](../README.md) file.

### Using the installer ###

With a Debian-based Linux distribution (such as Ubuntu) you
can use our installer to set up IsoplotR quickly and easily.

```sh
sudo apt install isoplotr.deb
```

Now please skip to the **Configuring IsoplotR** section

### By Hand ###

Here is a way to set up a mirror on a Linux machine using the
following ingredients:

- Ubuntu
- nginx
- R
- git
- crontab

You should usually use the installer method above, but if that
does not work for you for some reason, here is how to do it
manually.

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
sudo -Hu wwwrunner Rscript -e \
     "remotes::install_github(repo=c('pvermees/IsoplotR','pvermees/IsoplotRgui'),lib='~/R')"
```

### Create a systemd service for *IsoplotR*

Copy the file `isoplotr/etc/systemd/system/isoplotr@.service` into
`/etc/systemd/system/`.

Copy all the files in `isoplotr/usr/local/sbin/` into
`/usr/local/sbin/`. `isoplotrctl` is your script for interacting with the
**isoplotr** service; you can start it with:

```sh
sudo isoplotrctl start
```

Instead of `start`, you can also use the following verbs:
* `stop` to stop the service
* `enable` to ensure the service starts on boot
* `disable` so that the service does not start on boot
* `status` to see whether the service is up or down.

### Expose *IsoplotR* with *nginx*

Copy the file `isoplotr/etc/nginx/app.d/isoplotr.conf` into
`/etc/nginx/app.d/` and `isoplotr/etc/nginx/conf.d/isoplotr.conf`
into `/etc/nginx/conf.d/`. Now restart *nginx* with:

```sh
sudo systemctl nginx restart
```

and (providing that you also started the **isoplotr** service as
described above) you should see **isoplotr** appear on
[http://localhost/isoplotr/]. If not, see the **Configuring IsoplotR**
section below.

### Set up auto-updating

To ensure that **IsoplotR** is up-to-date, it is a good idea to set up
auto-updating.

Copy the file `isoplotr/etc/cron.weekly/isoplotr` into
`/etc/cron.weekly/`. This sets up the updating script to run every
week (normally Sunday morning). You can run it yourself at any
time with:

```sh
sudo /usr/local/sbin/updateIsoplotR.sh
```

## Configuring IsoplotR ##

### 502 Bad Gateway ###

If you have run:

```sh
sudo systemctl restart nginx
sudo isoplotrctl start
```

and visited [http://localhost/isoplotr/] but only got a `502 Bad
Gateway` error, nginx is probably not including the configuration
file `/etc/nginx/app.d/isoplotr.conf`. Check the file
`/etc/nginx/sites-available/default` and look for the `server` block
that contains the line `listen 80 default_server;`. If this block
does not contain the line `include /etc/nginx/app.d/*.conf;` then
you will have to add it yourself, so that the block looks something
like this:

```
server {
        listen 80 default_server;
        listen [::]:80 default_server;

        # vvv ADDED THIS LINE HERE TO ENABLE ISOPLOTR
        include /etc/nginx/app.d/*.conf;

        root /var/www/html;

        # Add index.php to the list if you are using PHP
        index index.html index.htm index.nginx-debian.html;

        server_name _;

        location / {
                # First attempt to serve request as file, then
                # as directory, then fall back to displaying a 404.
                try_files $uri $uri/ =404;
        }
}
```

Now restart nginx with `sudo systemctl restart nginx` and see if
visiting [http://localhost/isoplotr/] works now.

### Horizontal Scaling ###

The installation described (either with the installer or manually)
is fine for one user, but if many users are accessing the server
they might find that they are sometimes waiting a long time for
**IsoplotR** to respond, even when the server is only using
a fraction of its power. This is because R is single-threaded, and
so will only use one core.

You can mitigate this by running several services in parallel. The
`configureIsoplotR.sh` script will configure this for you.

To upgrade to eight parallel services, you would run:

```sh
sudo configureIsoplotR.sh 8
sudo isoplotrctl start
```

You need to restart **IsoplotR** because `configureIsoplotR.sh`
stops it.

If you find that **IsoplotR** is trying to use ports that are used
for something else on your system, you can configure the port
range it uses (it will use one port per parallel service).

To configure it to use ports 4001 to 4008, run:

```sh
sudo configureIsoplotR.sh 8 4001
sudo isoplotrctl start
```

(meaning 8 services starting with port 4001)

## Maintenance

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

If you need to set a custom timeout (say, to 6.5 seconds in this
example), change the `ExecStart` line in `isoplotr@.service` like this:

```sh
ExecStart=/usr/bin/Rscript -e "IsoplotRgui::daemon(host='127.0.0.1', port=%i, timeout=6.5)"
```
