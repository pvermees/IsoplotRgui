# Updating isoplotr

We normally build and push a version tagged `latest` (this is the
default so does not need to be specified). Because we re-use the same
tag over and over again, we cannot just use `docker build` or it will
use the old version it already knows about and claim victory without
building anything new at all. While using `docker build --no-cache`
gets round this problem for sure, it takes a lot of time rebuilding
everything. A good workaround seems to be the following...

Use this to remove any previously built image:

```sh
docker rmi --no-prune pvermees/isoplotr
```
Then we can build either the version we have checked out, or a
version we have just tagged on github.

To build a new image from local source (once in the root of the source
directory):

```sh
docker build -t pvermees/isoplotr .
```

Or to build it directly from github (the version tagged `3.4` in this
example):

```sh
docker build -t pvermees/isoplotr https://github.com/pvermees/IsoplotRgui.git#3.4
```

Then to update IsoplotR on Docker Hub:

```sh
docker push pvermees/isoplotr
```
