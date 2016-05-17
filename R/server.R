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
        mat <- matrix(as.numeric(d[3:nn]),ncol=nc,byrow=TRUE) # default selection
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
