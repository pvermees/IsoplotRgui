library(shiny)

source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/age.R")
source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/botev.R")
source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/cad.R")
source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/concordia.R")
source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/constants.R")
source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/discordia.R")
source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/errorellipse.R")
source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/io.R")
source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/json.R")
source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/kde.R")
source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/regression.R")
source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/toolbox.R")
source("/home/pvermees/Dropbox/Programming/R/IsoplotR/R/UPb.R")

settings("www/js/constants.json")

#library(shiny)
#library(IsoplotR)

shinyServer(function(input,output,session){

    observe({
        input$Rcommand
        input$selection
    })

    selection2data <- function(method="U-Pb",format=1){
        d <- input$selection
        nr <- as.numeric(d[1])
        nc <- as.numeric(d[2])
        nn <- length(d)
        fi <- 3
        if (identical(method,"detritals") & format==1)
            fi <- fi + nc
        # suppress NA coercion errors:
        mat <- suppressWarnings(matrix(as.numeric(d[fi:nn]),ncol=nc,byrow=TRUE))
        if (identical(method,"detritals")){
            if (format==1) {
                colnames(mat) <- d[3:(fi-1)]
            } else {
                labels <- c(LETTERS,unlist(lapply(LETTERS,'paste0',LETTERS)))
                colnames(mat) <- labels[1:ncol(mat)]
            }
        }
        #out <- IsoplotR::read.matrix(mat,method,format)
        out <- read.matrix(mat,method,format)
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
        if (!is.null())
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
            write.csv(result,file)
        }
    )
    
})
