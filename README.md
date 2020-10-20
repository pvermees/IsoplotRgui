# IsoplotRgui

Graphical User Interface to the **IsoplotR** R package for radiometric
geochronology.

## Offline installation and use

1. You must have **R** installed on your system (see [http://r-project.org](http://r-project.org)) as well as the **remotes** package. These can be installed by typing the following code at the **R** command line prompt:

```
install.packages('remotes')
```

2. The latest version of **IsoplotR** and **IsoplotRgui** can both be installed from **GitHub** with the following commands:

```
library(remotes)
install_github('pvermees/IsoplotR')
install_github('pvermees/IsoplotRgui')
```

Please note that the latest stable version of **IsoplotR** is also
available from **CRAN** at
[https://cran.r-project.org/package=IsoplotR](https://cran.r-project.org/package=IsoplotR)

3. Once all these above packages have been installed, you can run the
browser-based graphical user interface by typing:


```
library(IsoplotRgui)
IsoplotR()
```

at the command prompt. Alternatively, the program can also be accessed
online via the **IsoplotR** website at
[http://isoplotr.london-geochron.com](http://ucl.ac.uk/~ucfbpve/isoplotr),
or from your own server as discussed in the next section.

## Setting up your own online mirror

Here is a way to set up a mirror on a Linux machine using the
following ingredients:

- Ubuntu
- docker
- nginx
- crontab

For an alternative (but less secure) installation procedure using
**git** instead of **docker**, see [here](gitmirror.md).

### *docker* to run *IsoplotR*

Install **docker**:

```sh
sudo apt install docker.io
```

Set up a new user that you want to be running the **docker** container
called `wwwrunner` (and add it to the `docker` group):

```sh
sudo useradd -mrU wwwrunner
sudo adduser wwwrunner docker
```

Let us write a startup script for this docker container. Put the
following lines into a file `/usr/local/sbin/isoplotr-start`:

```sh
docker pull pvermees/isoplotr
docker stop isoplotr
docker rm isoplotr
docker images -qf dangling=true pvermees/isoplotr | xargs -r docker rmi
docker run --restart unless-stopped -d --name isoplotr -p 3838:80 pvermees/isoplotr
```

(note that the absence of `set -eu` is not a mistake;
execution should continue in the presence of errors)

And begin:

```sh
sudo chmod a+x /usr/local/sbin/isoplotr-start
sudo -u wwwrunner isoplotr-start
```

You should now see **IsoplotR** running on [http://localhost:3838]

### *nginx* to serve *IsoplotR* on port 80

We are assuming that you are not already using *nginx* for
something else. Here are the instructions in this case:

Install **nginx**:

```sh
sudo apt install nginx
```

Add the following file at `/etc/nginx/sites-enabled/default`.

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

And restart **nginx**:

```sh
sudo systemctl restart nginx
```

You should now be able to browse to [http://localhost/isoplotr].
Once you have configured your firewall you should be able
to browse to `/isoplotr` on your machine from another machine.

### crontab to keep *IsoplotR* up-to-date

Set up a **cron** job to update the Docker image at some time when you
think it is not likely to be used (as a short period of downtime
occurs when there is an update to be installed):

```sh
sudo -u wwwrunner crontab -e
```

Then add a line like this (to run at 03:17 local time):

```
17 3 * * * /usr/local/sbin/isoplotr-start | /usr/bin/logger
```

### Maintenance

You can find logs for the various processes mentioned here in the
following places:

#### crontab logs

```
grep CRON < /var/log/syslog
```

or, if you want to see the messages as they appear:

```
tail -f /var/log/syslog | grep --line-buffered CRON
```

#### nginx logs

nginx mainly logs to `journalctl`:

```sh
journalctl -u nginx
```

`journalctl` has many interesting options; for example `-r` to see
the most recent messages first, `-k` to see messages only from this
boot, or `-f` to show messages as they come in.

As well as `journalctl`, there are logs from nginx at `/var/log/nginx`.

#### docker logs

```sh
docker logs isoplotr
```

## Further information

See [http://isoplotr.london-geochron.com](http://ucl.ac.uk/~ucfbpve/isoplotr/index.html)

## Author

[Pieter Vermeesch](http://ucl.ac.uk/~ucfbpve/index.html)

## License

This project is licensed under the GPL-3 License
