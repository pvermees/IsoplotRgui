# IsoplotRgui

Graphical User Interface to the **IsoplotR** R package for radiometric
geochronology.

## Prerequisites

You must have **R** installed on your system (see
[http://r-project.org](http://r-project.org)) as well as the
**devtools** and **shiny** packages. These can be installed by typing
the following code at the R command line prompt:


```
install.packages('devtools')
install.packages('shiny')
```

## Installation

The latest version of IsoplotR and IsoplotRgui can both be installed
from **GitHub** with the following commands:

```
library(devtools)
install_github('pvermees/IsoplotR')
install_github('pvermees/IsoplotRgui')
```

Please note that the latest stable version of IsoplotR is also
available from **CRAN** at
[https://cran.r-project.org/package=IsoplotR](https://cran.r-project.org/package=IsoplotR)

## Running IsoplotRgui

Once all these above packages have been installed, you can run the
browser-based graphical user interface by typing:


```
library(IsoplotRgui)
IsoplotR()
```

at the command prompt. Alternatively, the program can also be accessed
online via the IsoplotR website at
[http://isoplotr.london-geochron.com](http://ucl.ac.uk/~ucfbpve/isoplotr)

## Further information

See [http://isoplotr.london-geochron.com](http://ucl.ac.uk/~ucfbpve/isoplotr)

## Author

[Pieter Vermeesch](http://ucl.ac.uk/~ucfbpve)

## License

This project is licensed under the GPL-3 License
