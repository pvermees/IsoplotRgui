server <- function(input,output,session){

    selection2data <- function(method="U-Pb",format=1,ierr=1,
                               U48=1,Th0U8=1,Ra6U8=1,Pa1U5=1,
                               Th02=c(0,0),Th02U48=c(0,0,1e6,0,0,0,0,0,0)){
        d <- input$data
        nn <- length(d)
        nr <- as.numeric(d[1])
        nc <- as.numeric(d[2])
        mat <- matrix('',1,nc) # header
        bi <- getbi(method=method,format=format)
        if (identical(method,"U-Pb") & format==1) {
            mat[1,1:5] <- c('Pb207U235','errPb207U235',
                            'Pb206U238','errPb206U238','rho')
        } else if (identical(method,"U-Pb") & format==2) {
            mat[1,1:5] <- c('U238Pb206','errU238Pb206',
                            'Pb207Pb206','errPb207Pb206','rho')
        } else if (identical(method,"U-Pb") & format==3) {
            mat[1,1:8] <- c('Pb207Pb206','errPb207Pb206',
                            'Pb206U238','errPb206U238',
                            'Pb207U235','errPb207U235','rhoXY','rhoYZ')
        } else if (identical(method,"U-Pb") & format==4) {
            mat[1,1:9] <- c('Pb207U235','errPb207U235',
                            'Pb206U238','errPb206U238',
                            'Pb204U238','errPb204U238',
                            'rhoXY','rhoXZ','rhoYZ')
        } else if (identical(method,"U-Pb") & format==5) {
            mat[1,1:9] <- c('U238Pb206','errU238Pb206',
                            'Pb207Pb206','errPb207Pb206',
                            'Pb204Pb206','errPb204Pb206',
                            'rhoXY','rhoXZ','rhoYZ')
        } else if (identical(method,"U-Pb") & format==6) {
            mat[1,1:12] <- c('Pb207U235','errPb207U235',
                             'Pb206U238','errPb206U238',
                             'Pb204U238','errPb204U238',
                             'Pb207Pb206','errPb207Pb206',
                             'Pb204Pb207','errPb204Pb207',
                             'Pb204Pb206','errPb204Pb206')
        } else if (identical(method,"Pb-Pb") & format==1) {
            mat[1,1:5] <- c('Pb206Pb204','errPb206Pb204',
                            'Pb207Pb204','errPb207Pb204','rho')
        } else if (identical(method,"Pb-Pb") & format==2) {
            mat[1,1:5] <- c('Pb204Pb206','errPb204Pb206',
                            'Pb207Pb206','errPb207Pb206','rho')
        } else if (identical(method,"Pb-Pb") & format==3) {
            mat[1,1:6] <- c('Pb206Pb204','errPb206Pb204',
                            'Pb207Pb204','errPb207Pb206',
                            'Pb207Pb206','errPb207Pb206')
        } else if (identical(method,"Ar-Ar") & format==1){
            mat <- matrix('',3,nc)
            mat[1,1:2] <- c('J','errJ')
            mat[2,1:2] <- d[3:4]
            mat[3,1:6] <- c('Ar39Ar36','errAr39Ar36',
                            'Ar40Ar36','errAr40Ar36',
                            'rho','Ar39')
        } else if (identical(method,"Ar-Ar") & format==2) {
            mat <- matrix('',3,nc)
            mat[1,1:2] <- c('J','errJ')
            mat[2,1:2] <- d[3:4]
            mat[3,1:6] <- c('Ar39Ar40','errAr39Ar40',
                            'Ar36Ar40','errAr36Ar40',
                            'rho','Ar39')
        } else if (identical(method,"Ar-Ar") & format==3) {
            mat <- matrix('',3,nc)
            mat[1,1:2] <- c('J','errJ')
            mat[2,1:2] <- d[3:4]
            mat[3,1:7] <- c('Ar39Ar40','errAr39Ar40',
                            'Ar36Ar40','errAr36Ar40',
                            'Ar39Ar36','errAr39Ar36','Ar39')
        } else if (identical(method,"K-Ca") & format==1){
            mat[1,1:5] <- c('K40Ca44','errK40Ca44',
                            'Ca40Ca44','errCa40Ca44','rho')
        } else if (identical(method,"K-Ca") & format==2){
            mat[1,1:6] <- c('K40Ca44','errK40Ca44',
                            'Ca40Ca44','errCa40Ca44',
                            'K40Ca40','errK40Ca40')
        } else if (identical(method,"Th-U") & format==1) {
            mat[1,1:9] <- c('U238Th232','errU238Th232',
                            'U234Th232','errU234Th232',
                            'Th230Th232','errTh230Th232',
                            'rhoXY','rhoXZ','rhoYZ')
        } else if (identical(method,"Th-U") & format==2) {
            mat[1,1:9] <- c('Th232U238','errTh232U238',
                            'U234U238','errU234U238',
                            'Th230U238','errTh230U238',
                            'rhoXY','rhoXZ','rhoYZ')
        } else if (identical(method,"Th-U") & format==3) {
            mat[1,1:5] <- c('U238Th232','errU238Th232',
                            'Th230Th232','errTh230Th232','rho')
        } else if (identical(method,"Th-U") & format==4) {
            mat[1,1:5] <- c('Th232U238','errTh232U238',
                            'Th230U238','errTh230U238','rho')
        } else if (identical(method,"Rb-Sr") & format==1){
            mat[1,1:5] <- c('Rb87Sr86','errRb87Sr86',
                            'Sr87Sr86','errSr87Sr86','rho')
        } else if (identical(method,"Rb-Sr") & format==2){
            mat[1,1:6] <- c('Rbppm','errRbppm',
                            'Srppm','errSrppm',
                            'Sr87Sr86','errSr87Sr86')
        } else if (identical(method,"Sm-Nd") & format==1){
            mat[1,1:5] <- c('Sm143Nd144','errSm143Nd144',
                            'Nd143Nd144','errNd143Nd144','rho')
        } else if (identical(method,"Sm-Nd") & format==2){
            mat[1,1:6] <- c('Smppm','errSmppm',
                            'Ndppm','errNdppm',
                            'Nd143Nd144','errNd143Nd144')
        } else if (identical(method,"Re-Os") & format==1){
            mat[1,1:5] <- c('Re187Os188','errRe187Os188',
                            'Os187Os188','errOs187Os188','rho')
        } else if (identical(method,"Re-Os") & format==2){
            mat[1,1:6] <- c('Reppm','errReppm',
                            'Osppm','errOsppm',
                            'Os187Os188','errOs187Os188')
        } else if (identical(method,"Lu-Hf") & format==1){
            mat[1,1:5] <- c('Lu176Hf177','errLu176Hf177',
                            'Hf176Hf177','errHf176Hf177','rho')
        } else if (identical(method,"Lu-Hf") & format==2){
            mat[1,1:6] <- c('Luppm','errLuppm',
                            'Hfppm','errHfppm',
                            'Hf176Hf177','errHf176Hf177')
        } else if (identical(method,"fissiontracks") & format==1){
            mat <- matrix('',5,nc)
            mat[1,1:2] <-c('Zeta','errZeta')
            mat[2,1:2] <- d[3:4]
            mat[3,1:2] <-c('rhoD','errRhoD')
            mat[4,1:2] <- d[5:6]
            mat[5,1:2] <- c('Ns','Ni')
        } else if (identical(method,"fissiontracks") & format==2){
            mat <- matrix('',5,nc)
            mat[1,1:2] <-c('Zeta','errZeta')
            mat[2,1:2] <- d[3:4]
            mat[3,1] <-'spot-size'
            mat[4,1] <- d[5]
            mat[5,1:2] <- c('Ns','A')
            mat[5,3:nc] <- rep(c('U','err[U]'),(nc-1)/2)
        } else if (identical(method,"fissiontracks") & format==3){
            mat <- matrix('',3,nc)
            mat[1,1] <-'spot-size'
            mat[2,1] <- d[3]
            mat[3,1:2] <- c('Ns','A')
            mat[3,3:nc] <- rep(c('U','err[U]'),(nc-1)/2)
        } else if (identical(method,"U-Th-He")){
            mat[1,1:8] <- c('He','errHe','U','errU',
                            'Th','errTh','Sm','errSm')
        } else if (identical(method,"detritals") & format==1){
            mat <- NULL
        } else if (identical(method,"detritals") & format!=1){
            labels <- c(LETTERS,unlist(lapply(LETTERS,'paste0',LETTERS)))
            mat <- matrix(labels[1:nc],1,nc)
        } else if (identical(method,"other")){
            mat <- NULL
        }
        mat <- rbind(mat,matrix(d[bi:nn],ncol=nc,byrow=TRUE))
        if (!identical(method,"detritals")){
            mat <- subset(mat,select=-nc) # the last column may contain letters
        }
        if (identical(method,'U-Pb')){
            out <- IsoplotR::read.data(mat,method=method,format=format,ierr=ierr,
                                       U48=U48,Th0U8=Th0U8,Ra6U8=Ra6U8,Pa1U5=Pa1U5)
        } else if (identical(method,'Th-U')){
            out <- IsoplotR::read.data(mat,method=method,format=format,
                                       ierr=ierr,Th02=Th02,Th02U48=Th02U48)
        } else {
            out <- IsoplotR::read.data(mat,method=method,format=format,ierr=ierr)
        }
        out
    }

    # return index of the first isotope measurement
    getbi <- function(method="U-Pb",format=1){
        out <- 3
        if (identical(method,"Ar-Ar") & format<2){
            out <- 5
        } else if (identical(method,"Ar-Ar") & format>1) {
            out <- 5
        } else if (identical(method,"fissiontracks") & format==1){
            out <- 7
        } else if (identical(method,"fissiontracks") & format==2){
            out <- 6
        } else if (identical(method,"fissiontracks") & format==3){
            out <- 4
        }
        out
    }

    selection2levels <- function(method="U-Pb",format=1){
        d <- input$data
        nn <- length(d)
        bi <- getbi(method=method,format=format)
        nc <- as.numeric(d[2])
        lc <- nc-1 # penultimate column
        li <- seq(from=bi+lc-1,to=nn-1,by=nc)
        as.numeric(d[li])
    }

    selection2omit <- function(method="U-Pb",format=1){
        d <- input$data
        nn <- length(d)
        bi <- getbi(method=method,format=format)
        nc <- as.numeric(d[2])
        oc <- nc
        oi <- seq(from=bi+oc-1,to=nn,by=nc)
        d[oi]
    }

    omitter <- function(flags=c('x','X'),method="U-Pb",format=1){
        o <- selection2omit(method=method,format=format)
        which(o%in%flags)
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
                         "$('#OUTPUT').handsontable('populateFromArray',0,0,",
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
        tryCatch({
            eval(parse(text=Rcommand))
        }, error = function(e){
            width <- 70
            message1 <- e$message
            message2 <- paste0("If this message does not make sense to you, then please save a ",
                               "reproducible example as a .json file (using the 'Save' button ",
                               "below) and email it to p.vermeesch@ucl.ac.uk. The problem will ",
                               "be addressed asap.")
            errormessage <- paste0("Error message:\n\n",wrap(message1,width),
                                   "\n\n",wrap(message2,width),"\n\n-PV")
            plot(c(0, 1),c(0,1),ann=F,bty ='n',type='n',xaxt='n',yaxt='n')
            text(0.5,0,errormessage,cex=1.5,pos=3)
        })

    }

    wrap <- function(tekst,width){
        out <- tekst
        spaces <- which(strsplit(tekst, "")[[1]]==" ")
        toreplace <- seq(from=width,to=nchar(tekst),by=width)
        for (i in 1:length(toreplace)){
            j <- which.min(abs(spaces-toreplace[i]))
            substr(out,spaces[j],spaces[j]) <- '\n'
        }
        out
    }

    observeEvent(input$PLOTTER, {
        output$myplot <- renderPlot({
            isolate({
                run(input$Rcommand)
            })
        })
    })

    observeEvent(input$RUNNER, {
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

}

shinyApp(ui = htmlTemplate("www/index.html"), server)
