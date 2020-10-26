# IsoplotRgui

Graphical User Interface to the **IsoplotR** R package for radiometric
geochronology.

## Offline installation and use

You must have **R** installed on your system (see
[http://r-project.org](http://www.r-project.org)). Within **R**, there
are two ways to install **IsoplotRgui**:

1. The latest stable version is available via CRAN (the Comprehensive
R Archive Network). This version can be install from the R command
prompt:

```
install.packages('IsoplotRgui')
```

2. The latest development version is available from
**GitHub**. Installing this package requires the **remotes** package
to be installed as well. These can be installed by typing the
following code at the **R** command line prompt:

```
install.packages('remotes')

```

Then **IsoplotR** can be installed as follows:

```
remotes::install_github('pvermees/IsoplotR')
remotes::install_github('pvermees/IsoplotRgui')
```

Once all these above packages have been installed, you can run the
browser-based graphical user interface by typing:


```
IsoplotRgui::IsoplotR()
```

at the command prompt. Alternatively, the program can also be accessed
online via the **IsoplotR** website at
[http://isoplotr.london-geochron.com](http://www.ucl.ac.uk/~ucfbpve/isoplotr/),
or from your own server as discussed in the next section.

## Setting up your own online mirror

There are three ways to install **IsoplotR** online:

1. The latest stable version is available from [CRAN](build/CRAN.md).

2. The development version is available from [GitHub](build/git.md).

3. The safest and most secure solution is to install **IsoplotR** as a
[docker](build/docker.md) container.

Click on the links for further instructions.

## Further information

See [http://isoplotr.london-geochron.com](http://www.ucl.ac.uk/~ucfbpve/isoplotr/index.html)

## Author

[Pieter Vermeesch](http://www.ucl.ac.uk/~ucfbpve/index.html)

## License

This project is licensed under the GPL-3 License