shiny::shinyServer(function(input,output,session){

    selection2data <- function(method="U-Pb",format=1){
        d <- input$data
        nn <- length(d)
        nr <- as.numeric(d[1])
        nc <- as.numeric(d[2])
        if (identical(method,"U-Pb") & format==1) {
            mat <- matrix(c('Pb207U235','errPb207U235',
                            'Pb206U238','errPb206U238','rho'),1,nc)
            mat <- rbind(mat,matrix(d[3:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"U-Pb") & format==2) {
            mat <- matrix(c('U238Pb206','errU238Pb206',
                            'Pb207Pb206','errPb207Pb206','rho'),1,nc)
            mat <- rbind(mat,matrix(d[3:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"U-Pb") & format==3) {
            mat <- matrix(c('Pb207Pb206','errPb207Pb206',
                            'Pb206U238','errPb206U238',
                            'Pb207U235','errPb207U235','rhoXY','rhoYZ'),1,nc)
            mat <- rbind(mat,matrix(d[3:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"Pb-Pb") & format==1) {
            mat <- matrix(c('Pb206Pb204','errPb206Pb204',
                            'Pb207Pb204','errPb207Pb204','rho'),1,nc)
            mat <- rbind(mat,matrix(d[3:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"Pb-Pb") & format==2) {
            mat <- matrix(c('Pb204Pb206','errPb204Pb206',
                            'Pb207Pb206','errPb207Pb206','rho'),1,nc)
            mat <- rbind(mat,matrix(d[3:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"Pb-Pb") & format==3) {
            mat <- matrix(c('Pb206Pb204','errPb206Pb204',
                            'Pb207Pb204','errPb207Pb206',
                            'Pb207Pb206','errPb207Pb206'),1,nc)
            mat <- rbind(mat,matrix(d[3:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"Ar-Ar") & format==1){
            mat <- matrix('',3,nc)
            mat[1,1:2] <-c('J','errJ')
            mat[2,1:2] <- d[3:4]
            mat[3,] <- c('Ar39Ar36','errAr39Ar36',
                         'Ar40Ar36','errAr40Ar36',
                         'rho','Ar39')
            mat <- rbind(mat,matrix(d[5:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"Ar-Ar") & format==2) {
            mat <- matrix('',3,nc)
            mat[1,1:2] <-c('J','errJ')
            mat[2,1:2] <- d[3:4]
            mat[3,] <- c('Ar39Ar40','errAr39Ar40',
                         'Ar36Ar40','errAr36Ar40',
                         'rho','Ar39')
            mat <- rbind(mat,matrix(d[5:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"Ar-Ar") & format==3) {
            mat <- matrix('',3,nc)
            mat[1,1:2] <-c('J','errJ')
            mat[2,1:2] <- d[3:4]
            mat[3,] <- c('Ar39Ar40','errAr39Ar40',
                         'Ar36Ar40','errAr36Ar40',
                         'Ar39Ar36','errAr39Ar36',
                         'Ar39')
            mat <- rbind(mat,matrix(d[5:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"Th-U") & format==1) {
            mat <- matrix(c('U238Th232','errU238Th232',
                            'U234Th232','errU234Th232',
                            'Th230Th232','errTh230Th232',
                            'rhoXY','rhoXZ','rhoYZ'),1,nc)
            mat <- rbind(mat,matrix(d[3:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"Th-U") & format==2) {
            mat <- matrix(c('Th232U238','errTh232U238',
                            'U234U238','errU234U238',
                            'Th230U238','errTh230U238',
                            'rhoXY','rhoXZ','rhoYZ'),1,nc)
            mat <- rbind(mat,matrix(d[3:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"Rb-Sr") & format==1){
            mat <- matrix(c('Rb87Sr86','errRb87Sr86',
                            'Sr87Sr86','errSr87Sr86','rho'),1,nc)
            mat <- rbind(mat,matrix(d[3:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"Rb-Sr") & format==2){
            mat <- matrix(c('Rbppm','errRbppm','Srppm','errSrppm',
                            'Sr87Sr86','errSr87Sr86'),1,nc)
            mat <- rbind(mat,matrix(d[3:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"Sm-Nd") & format==1){
            mat <- matrix(c('Sm143Nd144','errSm143Nd144',
                            'Nd143Nd144','errNd143Nd144','rho'),1,nc)
            mat <- rbind(mat,matrix(d[3:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"Sm-Nd") & format==2){
            mat <- matrix(c('Smppm','errSmppm','Ndppm','errNdppm',
                            'Nd143Nd144','errNd143Nd144'),1,nc)
            mat <- rbind(mat,matrix(d[3:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"Re-Os") & format==1){
            mat <- matrix(c('Re187Os188','errRe187Os188',
                            'Os187Os188','errOs187Os188','rho'),1,nc)
            mat <- rbind(mat,matrix(d[3:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"Re-Os") & format==2){
            mat <- matrix(c('Reppm','errReppm','Osppm','errOsppm',
                            'Os187Os188','errOs187Os188'),1,nc)
            mat <- rbind(mat,matrix(d[3:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"Lu-Hf") & format==1){
            mat <- matrix(c('Lu176Hf177','errLu176Hf177',
                            'Hf176Hf177','errHf176Hf177','rho'),1,nc)
            mat <- rbind(mat,matrix(d[3:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"Lu-Hf") & format==2){
            mat <- matrix(c('Luppm','errLuppm','Hfppm','errHfppm',
                            'Hf176Hf177','errHf176Hf177'),1,nc)
            mat <- rbind(mat,matrix(d[3:nn],ncol=nc,byrow=TRUE))
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
            mat <- rbind(mat,matrix(d[3:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"detritals") & format==1) {
            mat <- matrix(d[3:nn],ncol=nc,byrow=TRUE)
        } else if (identical(method,"detritals") & format!=1) {
            labels <- c(LETTERS,unlist(lapply(LETTERS,'paste0',LETTERS)))
            mat <- matrix(labels[1:nc],1,nc)
            mat <- rbind(mat,matrix(d[3:nn],ncol=nc,byrow=TRUE))
        } else if (identical(method,"other")) {
            mat <- matrix(d[3:nn],ncol=nc,byrow=TRUE)
        }
        IsoplotR::read.data(mat,method,format)
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
