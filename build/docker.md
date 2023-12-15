## Setting up your own online mirror with *docker*

Here is a way to set up a mirror on a Linux machine using the
following ingredients:

- Ubuntu
- nginx
- crontab
- docker

This method containerises the installation and thereby delivers the
most secure version of the app. If you want to use a Linux
distribution that uses podman instead of docker (for example, CentOS),
you can use the slightly different [podman](podman.md)
instructions. Alternative methods include:

1. [CRAN](CRAN.md) provides the current stable version on the
Comprehensive R Archive Netword (CRAN).

2. [GitHub](git.md) provides the most up to date development version.

Instructions for offline use are provided in the main
[README](../README.md) file.

### *docker* to run *IsoplotR*

Install **docker**:

```sh
sudo apt install docker.io
```

Set up a new user that you want to be running the **docker** container
called `wwwrunner` (and add it to the `docker` group):

```sh
sudo useradd -mrUG docker wwwrunner
```

Let us write a startup script for this docker container. Put the
following lines into a file `/usr/local/sbin/isoplotr-start`:

```sh
docker pull pvermees/isoplotr
docker stop isoplotr
docker rm isoplotr
docker images -qf dangling=true pvermees/isoplotr | xargs -r docker rmi
docker run --restart unless-stopped -d --name isoplotr -p 3839:80 pvermees/isoplotr
```

(note that the absence of `set -eu` is not a mistake;
execution should continue in the presence of errors)

> Note: You can change `3839` to which ever port number you like, as long
> as you change the same number in `/etc/nginx/conf.d/isoplotr.conf`
> described below.

And begin:

```sh
sudo chmod a+x /usr/local/sbin/isoplotr-start
sudo -u wwwrunner isoplotr-start
```

You should now see **IsoplotR** running on [http://localhost:3839]

### *nginx* to serve *IsoplotR* on port 80

Ubuntu encourages you to put your configuration files in the
directory `/etc/nginx/sites-enabled`. If this directory is present
(and to be sure, you can check for a line saying `include
/etc/nginx/sites-enabled/*;` in the file `/etc/nginx/nginx.conf`) then
you need to add a file called `/etc/nginx/sites-enabled/default` with
the following contents:

```
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    include /etc/nginx/app.d/*.conf;

    root /var/www/html;

    index index.html;

    server_name _;
}
```

If you already have a file called `/etc/nginx/sites-enabled/default`,
if should already have a `server {}` block that includes the line
`listen 80 default_server;`. If so you only need to ensure that it
includes the line `include /etc/nginx/app.d/*.conf`. Some Linux
distributions include this line, but some (such as Ubuntu) do not.

Now add a file `/etc/nginx/app.d/isoplotr.conf` with the following
contents:

```
location /isoplotr/ {
    proxy_pass http://isoplotr/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

And a file called `/etc/nginx/conf.d/isoplotr.conf` with the
following contents:

```
upstream isoplotr {
  least_conn;
  server 127.0.0.1:3839;
}
```

#### Horizontal scaling

It is relatively easy to horizontally scale this solution, albeit manually.
Let's scale it to four docker containers running on ports `38001` to `38004`.

Firstly, let's change `/etc/nginx/conf.d/isoplotr.conf` to the following:

```
upstream isoplotr {
  least_conn;
  server 127.0.0.1:38001;
  server 127.0.0.1:38002;
  server 127.0.0.1:38003;
  server 127.0.0.1:38004;
}
```

Next we should change `/usr/local/sbin/isoplotr-start` to:

```sh
docker pull pvermees/isoplotr
docker stop $(docker container ls -q --filter name=isoplotr)
docker rm $(docker container ls -q -a --filter name=isoplotr)
docker images -qf dangling=true pvermees/isoplotr | xargs -r docker rmi
for p in $(seq 38001 38004)
do
docker run --restart unless-stopped -d --name isoplotr-${p} -p ${p}:80 pvermees/isoplotr
done
```

Now we can restart nginx and start isoplotr:

```
sudo systemctl restart nginx
isoplotr-start
```

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

You can force an update yourself by running the script as the `wwwrunner` user:

```sh
sudo -u wwwrunner /usr/local/sbin/isoplotr-start
```

### Maintenance

You can view the logs from the various processes mentioned here
as follows:

Process | command for accessing logs
-----|-----
cron (including the update script) | `journalctl -eu cron`
systemD | `journalctl -e _PID=1`
IsoplotRgui | `docker logs isoplotr`
docker | `journalctl -eu docker` but don't expect anything too helpful
nginx | `journalctl -eu nginx`
nginx detail | logs are written into the `/var/log/nginx` directory

`journalctl` has many interesting options; for example `-r` to see
the most recent messages first, `-k` to see messages only from this
boot, or `-f` to show messages as they come in. The `-e` option
we have been using scrolls to the end of the log so that you are
looking at the most recent entries immediately.

If you need to set a custom timeout (say, to 6.5 seconds in this
example), change the `docker run` line in `isoplotr-start` like this:

```sh
docker run --restart unless-stopped -d --name isoplotr -p 3839:80 -e TIMEOUT=6.5 pvermees/
```
