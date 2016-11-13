library(shiny)

debug <- TRUE

if (debug) {
    source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/ArAr.R")
    source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/age.R")
    source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/agespectrum.R")
    source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/botev.R")
    source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/cad.R")
    source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/central.R")
    source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/concordia.R")
    source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/constants.R")
    source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/discordia.R")
    source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/errorellipse.R")
    source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/fissiontracks.R")
    source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/helioplot.R")
    source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/io.R")
    source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/isochron.R")
    source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/json.R")
    source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/kde.R")
    source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/mds.R")
    source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/peakfit.R")
    source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/regression.R")
    source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/radialplot.R")
    source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/toolbox.R")
    source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/UPb.R")
    source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/UThHe.R")
    source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/weightedmean.R")
    
    settings("www/js/constants.json")
} else {
    library(shiny)
    library(IsoplotR)
}

shinyServer(function(input,output,session){

    observe({
        input$Rcommand
        input$data
    })

    selection2data <- function(method="U-Pb",format=1){
        d <- input$data
        nn <- length(d)
        nr <- as.numeric(d[1])
        nc <- as.numeric(d[2])
        if (identical(method,"U-Pb") & format==1) {
            mat <- matrix(c('Pb207Pb206','errPb207Pb206',
                            'Pb206U238','errPb206U238',
                            'Pb207U235','errPb207U235'),1,nc)
            mat <- rbind(mat,matrix(d[3:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"Ar-Ar") & format==1) {
            mat <- matrix('',3,nc)
            mat[1,1:2] <-c('J','errJ')
            mat[2,1:2] <- d[3:4]
            mat[3,] <- c('Ar39Ar40','errAr39Ar40',
                         'Ar36Ar40','errAr36Ar40',
                         'Ar39Ar36','errAr39Ar36')
            mat <- rbind(mat,matrix(d[5:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"Ar-Ar") & format==2){
            mat <- matrix('',3,nc)
            mat[1,1:2] <-c('J','errJ')
            mat[2,1:2] <- d[3:4]
            mat[3,] <- c('Ar39',
                         'Ar39Ar40','errAr39Ar40',
                         'Ar36Ar40','errAr36Ar40',
                         'Ar39Ar36','errAr39Ar36')
            mat <- rbind(mat,matrix(d[5:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"fissiontracks") & format==1){
            mat <- matrix('',5,nc)
            mat[1,1:2] <-c('Zeta','errZeta')
            mat[2,1:2] <- d[3:4]
            mat[3,1:2] <-c('rhoD','errRhoD')
            mat[4,1:2] <- d[5:6]
            mat[5,1:2] <- c('Ns','Ni')
            mat <- rbind(mat,matrix(d[7:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"fissiontracks") & format==2){
            mat <- matrix('',5,nc)
            mat[1,1:2] <-c('Zeta','errZeta')
            mat[2,1:2] <- d[3:4]
            mat[3,1] <-'spot-size'
            mat[4,1] <- d[5]
            mat[5,1:2] <- c('Ns','A')
            mat[5,3:nc] <- rep(c('U','err[U]'),(nc-1)/2)
            mat <- rbind(mat,matrix(d[6:nn],ncol=nc,byrow=TRUE))            
        } else if (identical(method,"fissiontracks") & format==3){
            mat <- matrix('',3,nc)
            mat[1,1] <-'spot-size'
            mat[2,1] <- d[3]
            mat[3,1:2] <- c('Ns','A')
            mat[3,3:nc] <- rep(c('U','err[U]'),(nc-1)/2)
            mat <- rbind(mat,matrix(d[4:nn],ncol=nc,byrow=TRUE))            
        } else if (identical(method,"U-Th-He")){
            cn <- c('He','errHe','U','errU','Th','errTh','Sm','errSm')
            mat <- matrix(cn[1:nc],1,nc)
            mat <- rbind(matrix(d[3:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"detritals") & format==1) {
            mat <- matrix(d[3:nn],ncol=nc,byrow=TRUE)
        } else if (identical(method,"detritals") & format!=1) {
            labels <- c(LETTERS,unlist(lapply(LETTERS,'paste0',LETTERS)))
            mat <- matrix(labels[1:nc],1,nc)
            mat <- rbind(mat,matrix(d[3:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"other")) {
            mat <- matrix(d[3:nn],ncol=nc,byrow=TRUE)
        }
        if (debug) out <- read.data(mat,method,format)
        else out <- IsoplotR::read.data(mat,method,format)
        out
    }

    getJavascript <- function(results){
        header <- paste0("['",paste(colnames(results),collapse="','"),"']")
        jarray <- "["
        for (i in 1:nrow(results)){
            jarray <- paste0(jarray,"[",paste(results[i,],collapse=","),"]")
            if (i<nrow(results)) jarray <- paste0(jarray,",")
        }
        jarray <- paste0(jarray,"]")
        script <- paste0("<script type='text/javascript'>",
                         "$(function(){",
                         "$('#OUTPUT').handsontable('populateFromArray', 0, 0, ",
                         jarray,
                         ");",
                         "});",
                         "var hot = $('#OUTPUT').data('handsontable');",
                         "hot.updateSettings({",
                         "colHeaders:",
                         header,
                         "});",
                         "</script>")
        HTML(script)
    }

    run <- function(Rcommand){
        if (!is.null(Rcommand))
            eval(parse(text=Rcommand))
    }
    
    observeEvent(input$PLOT, {
        output$myplot <- renderPlot({
            isolate({
                run(input$Rcommand)
            })
        })
    })

    observeEvent(input$RUN, {
        output$myscript <- renderUI({
            isolate({
                results <- run(input$Rcommand)
                getJavascript(results)
            })
        })
    })
    
    output$PDF <- downloadHandler(
        filename = 'IsoplotR.pdf',
        content = function(file) {
            pdf(file=file)
            run(input$Rcommand)
            dev.off()
        }
    )

    output$CSV <- downloadHandler(
        filename <- 'ages.csv',
        content = function(file) {
            results <- run(input$Rcommand)
            write.csv(results,file)
        }
    )
    
})
