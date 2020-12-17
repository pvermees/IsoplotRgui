## Setting up your own online mirror using *CRAN* on CentOS

For Ubuntu instructions, go [here](CRAN.md)

### Install *R* and *nginx*, if required

If these packages are not installed on your system already, then you
can add them with the following commands:

On CentOS 8 you can use, instead:

```sh
sudo dnf -y install epel-release dnf-plugins-core
sudo dnf config-manager --set-enabled powertools
sudo dnf -y install R
sudo dnf -y install nginx
```

If you get an 'unknown repo' error when trying to enable `powertools`,
you may have better luck with `sudo dnf config-manager --set-enabled PowerTools`
or `sudo dnf config-manager --set-enabled codeready-builder-for-rhel-8-x86_64-rpms`
(if you are using RedHat 8) or
`sudo dnf config-manager --set-enabled codeready-builder-for-rhel-8-x86_64-rpms`
(if you are using RedHad on AWS).

On CentOS 7 you can use:

```sh
sudo yum -y install epel-release
sudo yum -y install R
sudo yum -y install nginx
```

### Create a user to run *IsoplotR*

See the [Ubuntu](CRAN.md) instructions.

### Set up *IsoplotRgui* for this user

See the [Ubuntu](CRAN.md) instructions.

### Create a systemd service for *IsoplotR*

See the [Ubuntu](CRAN.md) instructions.

### Expose *IsoplotR* with *nginx*

Some distributions such as CentOS install nginx with a different
default configuration. If you have a directory called
`/etc/nginx/default.d` (and the `/etc/nginx/nginx.conf` file
contains a `server {...}` block containing the line
`include /etc/nginx/default.d/*.conf;`) then you can create a file
called `/etc/nginx/default.d/isoplotr.conf` with the following
contents:

```
location /isoplotr/ {
    proxy_pass http://127.0.0.1:3838/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### Restart nginx

See the [Ubuntu](CRAN.md) instructions.

### Set up auto-updating

See the [Ubuntu](CRAN.md) instructions.

### Maintenance

See the [Ubuntu](CRAN.md) instructions.

## Troubleshooting

If nginx serves up a '404' page telling you that it cannot find a
page at `localhost/isoplotr`, you may have one of the following
issues:

### IsoplotRgui issues

Please ensure that IsoplotRgui is actually running. After attempting
to start it with `sudo systemctl start isoplotr` systemctl does not
necessarily report if this attempt failed. Read the logs to try to
debug it:

```sh
journalctl -eu isoplotr
```

### SELinux issues

If nginx tells you that it cannot find any page at `localhost/isoplotr/`
and you have a distribution (such as CentOS) based on SELinux,
you may have a permissions issue.

Check the SELinux audit log:

```sh
sudo cat /var/log/audit/audit.log | grep nginx
```

If you see results like:

```
35528 comm="nginx" dest=3838 ...
```

It means that you are having an SELinux permissions issue, which you can try
to solve like this:

```sh
sudo setsebool -P httpd_can_network_connect 1
```

And try browsing to `http://localhost/isoplotr` again.
