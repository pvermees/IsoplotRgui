shiny::shinyServer(function(input,output,session){

    selection2data <- function(method="U-Pb",format=1){
        d <- input$data
        nn <- length(d)
        nr <- as.numeric(d[1])
        nc <- as.numeric(d[2])
        mat <- matrix('',1,nc) # header
        bi <- 3 # index of the first isotope measurement
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
            bi <- 5
            mat <- matrix('',3,nc)
            mat[1,1:2] <- c('J','errJ')
            mat[2,1:2] <- d[3:4]
            mat[3,1:6] <- c('Ar39Ar36','errAr39Ar36',
                            'Ar40Ar36','errAr40Ar36',
                            'rho','Ar39')
        } else if (identical(method,"Ar-Ar") & format==2) {
            bi <- 5
            mat <- matrix('',3,nc)
            mat[1,1:2] <- c('J','errJ')
            mat[2,1:2] <- d[3:4]
            mat[3,1:6] <- c('Ar39Ar40','errAr39Ar40',
                            'Ar36Ar40','errAr36Ar40',
                            'rho','Ar39')
        } else if (identical(method,"Ar-Ar") & format==3) {
            bi <- 5
            mat <- matrix('',3,nc)
            mat[1,1:2] <- c('J','errJ')
            mat[2,1:2] <- d[3:4]
            mat[3,1:7] <- c('Ar39Ar40','errAr39Ar40',
                            'Ar36Ar40','errAr36Ar40',
                            'Ar39Ar36','errAr39Ar36','Ar39')
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
            bi <- 7
            mat <- matrix('',5,nc)
            mat[1,1:2] <-c('Zeta','errZeta')
            mat[2,1:2] <- d[3:4]
            mat[3,1:2] <-c('rhoD','errRhoD')
            mat[4,1:2] <- d[5:6]
            mat[5,1:2] <- c('Ns','Ni')
        } else if (identical(method,"fissiontracks") & format==2){
            bi <- 6
            mat <- matrix('',5,nc)
            mat[1,1:2] <-c('Zeta','errZeta')
            mat[2,1:2] <- d[3:4]
            mat[3,1] <-'spot-size'
            mat[4,1] <- d[5]
            mat[5,1:2] <- c('Ns','A')
            mat[5,3:nc] <- rep(c('U','err[U]'),(nc-1)/2)
        } else if (identical(method,"fissiontracks") & format==3){
            bi <- 4
            mat <- matrix('',3,nc)
            mat[1,1] <-'spot-size'
            mat[2,1] <- d[3]
            mat[3,1:2] <- c('Ns','A')
            mat[3,3:nc] <- rep(c('U','err[U]'),(nc-1)/2)
        } else if (identical(method,"U-Th-He")){
            mat[1,1:8] <- c('He','errHe','U','errU',
                            'Th','errTh','Sm','errSm')
        } else if (identical(method,"detritals") & format==1) {
            mat <- NULL
        } else if (identical(method,"detritals") & format!=1) {
            labels <- c(LETTERS,unlist(lapply(LETTERS,'paste0',LETTERS)))
            mat <- matrix(labels[1:nc],1,nc)
        } else if (identical(method,"other")) {
            mat <- NULL
        }
        mat <- rbind(mat,matrix(d[bi:nn],ncol=nc,byrow=TRUE))
        IsoplotR::read.data(mat,method,format)
    }

    selection2levels <- function(method="U-Pb",format=1){
        d <- input$data
        nn <- length(d)
        nr <- as.numeric(d[1])
        nc <- as.numeric(d[2])
        bi <- 3 # index of the first isotopic data column
        ci <- 6 # index of the optional levels column
        if (identical(method,"U-Pb") & format %in% c(1,2)) {
            ci <- 6
        } else if (identical(method,"U-Pb") & (format==3)) {
            ci <- 9
        } else if (identical(method,"U-Pb") & (format %in% c(4,5))) {
            ci <- 10
        } else if (identical(method,"U-Pb") & (format==6)) {
            ci <- 13
        } else if (identical(method,"Pb-Pb") & (format %in% c(1,2))) {
            ci <- 6
        } else if (identical(method,"Pb-Pb") & (format==3)) {
            ci <- 7
        } else if (identical(method,"Ar-Ar") & (format %in% c(1,2))) {
            bi <- 5
            ci <- 7
        } else if (identical(method,"Ar-Ar") & (format==3)) {
            bi <- 5
            ci <- 8
        } else if (identical(method,"Th-U") & (format %in% c(1,2))) {
            ci <- 10
        } else if (identical(method,"Th-U") & (format %in% c(3,4))) {
            ci <- 6
        } else if (identical(method,"Rb-Sr") & (format==1)) {
            ci <- 6
        } else if (identical(method,"Rb-Sr") & (format==2)) {
            ci <- 7
        } else if (identical(method,"Sm-Nd") & (format==1)) {
            ci <- 6
        } else if (identical(method,"Sm-Nd") & (format==2)) {
            ci <- 7
        } else if (identical(method,"Re-Os") & (format==1)) {
            ci <- 6
        } else if (identical(method,"Re-Os") & (format==2)) {
            ci <- 7
        } else if (identical(method,"Lu-Hf") & (format==1)) {
            ci <- 6
        } else if (identical(method,"Lu-Hf") & (format==2)) {
            ci <- 7
        } else if (identical(method,"fissiontracks") & (format==1)) {
            bi <- 7
            ci <- 3
        } else if (identical(method,"fissiontracks") & (format==2)) {
            bi <- 6
            ci <- NA
        } else if (identical(method,"fissiontracks") & (format==3)) {
            bi <- 4
            ci <- NA
        } else if (identical(method,"U-Th-He")) {
            ci <- 9
        } else if (identical(method,"detritals") & (format==1)) {
            mat <- NULL
            ci <- NA
        } else if (identical(method,"detritals") & (format!=1)) {
            ci <- NA
        } else if (identical(method,"other")) {
            ci <- 3
        }
        mat <- matrix(d[bi:nn],ncol=nc,byrow=TRUE)
        out <- as.numeric(mat[,ci])
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

    wrap.it <- function(x,len){
        sapply(x, function(y){paste(strwrap(y,len), collapse = "\n")},
               USE.NAMES = FALSE)
    }

    run <- function(Rcommand){
        tryCatch({
            eval(parse(text=Rcommand))
        }, error = function(e){
            errormessage <- wrap.it(e,40)['message']
            plot(c(0, 1),c(0,1),ann=F,bty ='n',type='n',xaxt='n',yaxt='n')
            text(0.5,1,errormessage,cex=1.5,pos=1)
        })

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
    
})
