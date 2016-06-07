library(shiny)
library(IsoplotR)

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
            if (format==1) colnames(mat) <- d[3:(fi-1)]
            else colnames(mat) <- LETTERS[1:ncol(mat)]
        }
        out <- IsoplotR::read.matrix(mat,method,format)
        out
    }

    getPlot <- function(){
        eval(parse(text=input$Rcommand))
    }
    
    observeEvent(input$PLOT, {
        output$myplot <- renderPlot({
            getPlot()
        })
    })

    output$PDF <- downloadHandler(
        filename = 'IsoplotR.pdf',
        content = function(file) {
            pdf(file=file)
            getPlot()
            dev.off()
        }
    )

});
