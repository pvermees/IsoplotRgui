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

You can expose this IsoplotR to your nginx server (if that is what
you want to use) with the instructions [here](nginx.md)

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
