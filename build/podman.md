# Setting up your own online mirror with *podman*

Podman is an alternative to docker, preferred by some linux
distros. Podman has many theoretical advantages over docker
but we have, so far, found it harder to use. The instructions
here are to be considered experimental.

Nevertheless, here is a way to set up a mirror on a Linux
machine using the following ingredients:

- Linux distribution with podman. These include:
  - Alpine Edge
  - Arch Linux
  - CentOS 7
  - Debian 11
  - Fedora 31
  - OpenSUSE Leap 15.2
- nginx
- crontab
- podman

This method containerises the installation and thereby delivers the
security of the docker version of the app. Alternative methods
include:

1. [CRAN](CRAN.md) provides the current stable version on the
Comprehensive R Archive Netword (CRAN).

2. [GitHub](git.md) provides the most up to date development version.

3. [Docker](docker.md) the same containerised solution as here,
but using docker to manage it, not podman.

Instructions for offline use are provided in the main
[README](../README.md) file.

## *podman* to run *IsoplotR*

If you want, you can set up a service account to run this service
so that it definitely does not have access to the resources of one
of your real users. This is a little bit tedious, so if you want to use
a real user, skip the next section and substitute the login name
you are using instead of `wwwrunner` in the rest of the
instructions.

### Setting up a service account

Set up a new user that you want to be running the **podman** container
called `wwwrunner`:

```sh
sudo useradd -mrU wwwrunner
```

Annoyingly, we will need to set up this user's `subuid`s and `subgid`s, which
are extra disposable user and group IDs that are associated with this new
user, as podman will want to assign these in bulk. So, open up (with sudo)
the file `/etc/subuid` with your favourite editor, perhaps like this:

```sh
sudo gedit /etc/subuid
```

You will see a file listing all the real users' subuid ranges, a bit like this:

```
smitht:100000:65536
luckmand:165536:65536
drakewd:231072:65536
```

Add a new line for the new user. For the middle value find the line
with the largest middle value and add this middle value to the same
line's last value, in this case 231072+65536=296608, so:

```
smitht:100000:65536
luckmand:165536:65536
drakewd:231072:65536
wwwrunner:296608:65536
```

Now perform the same tedious process on `/etc/subgid`, then reboot.

### Setting up a SystemD service to run IsoplotRgui with podman

Make a new file in `/etc/systemd/system/isoplotr.service` with the
following contents:

```
[Unit]
Description=isoplotr.service
Wants=network.target
After=network-online.target

[Service]
User=wwwrunner
Restart=always
ExecStartPre=-/usr/bin/podman stop isoplotr
ExecStartPre=-/usr/bin/podman rm isoplotr
ExecStartPre=-/usr/bin/podman rm --storage isoplotr
ExecStart=/usr/bin/podman run --name isoplotr -p 3838:80 docker.io/pvermees/isoplotr
ExecStop=-/usr/bin/podman stop isoplotr
Type=simple

[Install]
WantedBy=multi-user.target default.target
```

Now you can run it:

```sh
sudo systemctl enable isoplotr
sudo systemctl start isoplotr
```

If this fails run `journalctl -xe` immediately to see if there is a
clue as to why in the logs. `sudo systemctl status isoplotr` can
also help by showing which commands were run and what the
exit codes from each failing one were.

If it succeeds, you should now see **IsoplotR** running
on [http://localhost:3838]

Of course you can use other `systemctl` commands such as `stop`
and `restart` (to control whether it is running), and `disable` (to
stop it from running automatically on boot).

### *nginx* to serve *IsoplotR* on port 80

If you have a directory called `/etc/nginx/default.d` (and the
`/etc/nginx/nginx.conf` file contains a `server {...}` block
containing the line `include /etc/nginx/default.d/*.conf;`) then you
can create a file called `/etc/nginx/default.d/isoplotr.conf` with the
following contents:

```
location /isoplotr/ {
    proxy_pass http://127.0.0.1:3838/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### crontab to keep *IsoplotR* up-to-date

Put the following in a new file `/usr/local/sbin/isoplotr-update.sh`:

```sh
sudo -iu wwwrunner podman pull docker.io/pvermees/isoplotr
systemctl restart isoplotr
```

Now we're going to set that file to be executable, then set up a
**cron** job to update the Docker image at some time when you
think it is not likely to be used (as a short period of downtime
occurs when there is an update to be installed):

```sh
sudo chmod a+x /usr/local/sbin/isoplotr-update.sh
sudo crontab -e
```

Then add a line like this (to run at 03:17 local time):

```
17 3 * * * /usr/local/sbin/isoplotr-update.sh 2>&1 | /usr/bin/logger
```

You can force an update yourself, of course:

```sh
sudo /usr/local/sbin/isoplotr-update.sh
```

### Maintenance

You can view the logs from the various processes mentioned here
as follows:

Process | command for accessing logs
-----|-----
cron (including the update script) | `journalctl -eu cron`
systemD | `journalctl -e _PID=1`
IsoplotRgui | `sudo -u wwwrunner podman logs isoplotr`
nginx | `journalctl -eu nginx`
nginx detail | logs are written into the `/var/log/nginx` directory

`journalctl` has many interesting options; for example `-r` to see
the most recent messages first, `-k` to see messages only from this
boot, or `-f` to show messages as they come in. The `-e` option
we have been using scrolls to the end of the log so that you are
looking at the most recent entries immediately.

I have found that if podman refuses to work, it can be reset with:

```sh
sudo -iu wwwrunner $SHELL
rm ~/.local/share/containers/ -rf
exit
sudo /usr/local/sbin/isoplotr-update.sh
```
