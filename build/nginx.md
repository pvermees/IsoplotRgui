# nginx

## install nginx

On Ubuntu you can use `apt install nginx`, on CentOS you can use
`yum install nginx`. Other distributions may use other commands.

## Configure nginx

### On Ubuntu or other distributions using sites-enabled

Some distributions, such as Ubuntu, encourage you to put your configuration
files in `/etc/nginx/sites-enabled/default`. If there is one present, you will
need to add our `location /isoplotr/` block to the appropriate
server` block in yours:

To serve this in nginx you can add the following file at
`/etc/nginx/sites-enabled`. If this directory is present (and to be sure,
you can check for a line saying `include /etc/nginx/sites-enabled/*;`
in the file `/etc/nginx/nginx.conf`) then you need to add a file called
`/etc/nginx/sites-enabled/default` with the following contents:

```
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;

    index index.html;

    server_name _;

    location /isoplotr/ {
        proxy_pass http://127.0.0.1:3838/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

If you already have a file called `/etc/nginx/sites-enabled/default`,
you will need to copy just the `location {...}` block into the
appropriate `server` block in the existing file.

### On CentOS or other distributions using default.d

Some distributions such as CentOS install nginx with a different
default configuration. If you have a directory called
`/etc/nginx/default.d` (and the `/etc/nginx/nginx.conf` file
contains a `server {...}` block containing the line
`include /etc/nginx/default.d/*.conf;`) then you can add a file
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

## Restart nginx

If you need to start isoplotr now, call:

```sh
sudo systemctl start isoplotr
```

You can restart nginx to take the changes to its configuration we
made above with:

```sh
sudo systemctl restart nginx
```

and **IsoplotR** will be available on `http://localhost/isoplotr`

You should now be able to browse to [http://localhost/isoplotr].
Once you have configured your firewall you should be able
to browse to `/isoplotr` on your machine from another machine.

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
