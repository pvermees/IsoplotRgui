selection2data <- function(input,method="U-Pb",format=1,ierr=1,d=IsoplotR::diseq(),
                           U8Th2=0,Th02i=c(0,0),Th02U48=c(0,0,1e6,0,0,0,0,0,0)){
    nc <- as.numeric(input$nc)
    values <- matrix(as.character(input$data), ncol = nc)
    if (identical(method,"U-Pb") & format==1) {
        mat <- matrix(c('Pb207U235','errPb207U235',
                        'Pb206U238','errPb206U238','rXY'),nrow=1)
    } else if (identical(method,"U-Pb") & format==2) {
        mat <- matrix(c('U238Pb206','errU238Pb206',
                        'Pb207Pb206','errPb207Pb206','rXY'),nrow=1)
    } else if (identical(method,"U-Pb") & format==3) {
        mat <- matrix(c('Pb207Pb206','errPb207Pb206',
                        'Pb206U238','errPb206U238',
                        'Pb207U235','errPb207U235','rXY','rYZ'),nrow=1)
    } else if (identical(method,"U-Pb") & format==4) {
        mat <- matrix(c('Pb207U235','errPb207U235',
                        'Pb206U238','errPb206U238',
                        'Pb204U238','errPb204U238',
                        'rXY','rXZ','rYZ'),nrow=1)
    } else if (identical(method,"U-Pb") & format==5) {
        mat <- matrix(c('U238Pb206','errU238Pb206',
                        'Pb207Pb206','errPb207Pb206',
                        'Pb204Pb206','errPb204Pb206',
                        'rXY','rXZ','rYZ'),nrow=1)
    } else if (identical(method,"U-Pb") & format==6) {
        mat <- matrix(c('Pb207U235','errPb207U235',
                        'Pb206U238','errPb206U238',
                        'Pb204U238','errPb204U238',
                        'Pb207Pb206','errPb207Pb206',
                        'Pb204Pb207','errPb204Pb207',
                        'Pb204Pb206','errPb204Pb206'),nrow=1)
    } else if (identical(method,"U-Pb") & format==7) {
        mat <- matrix(c('Pb207U235','errPb207U235',
                        'Pb206U238','errPb206U238',
                        'Pb208Th232','errPb208Th232',
                        'Th232U238','errTh232U238',
                        'rXY','rXZ','rXW',
                        'rYZ','rYW','rZW'),nrow=1)
    } else if (identical(method,"U-Pb") & format==8) {
        mat <- matrix(c('U238Pb206','errU238Pb206',
                        'Pb207Pb206','errPb207Pb206',
                        'Pb208Pb206','errPb208Pb206',
                        'Th232U238','errTh232U238',
                        'rXY','rXZ','rXW',
                        'rYZ','rYW','rZW'),nrow=1)
    } else if (identical(method,"U-Pb") & format==9) {
        mat <- matrix(c('U238Pb206','errU238Pb206',
                        'Pb204Pb206','errPb204Pb206','rXY'),nrow=1)
    } else if (identical(method,"U-Pb") & format==10) {
        mat <- matrix(c('U235Pb207','errU235Pb207',
                        'Pb204Pb207','errPb204Pb207','rXY'),nrow=1)
    } else if (identical(method,"U-Pb") & format==11) {
        mat <- matrix(c('U238Pb206','errU238Pb206',
                        'Pb208Pb206','errPb208Pb206',
                        'Th232U238','errTh232U238',
                        'rXY','rXZ','rYZ'),nrow=1)
    } else if (identical(method,"U-Pb") & format==12) {
        mat <- matrix(c('U235Pb207','errU235Pb207',
                        'Pb208Pb207','errPb208Pb207',
                        'Th232U238','errTh232U238',
                        'rXY','rXZ','rYZ'),nrow=1)
    } else if (identical(method,"Pb-Pb") & format==1) {
        mat <- matrix(c('Pb206Pb204','errPb206Pb204',
                        'Pb207Pb204','errPb207Pb204','rXY'),nrow=1)
    } else if (identical(method,"Pb-Pb") & format==2) {
        mat <- matrix(c('Pb204Pb206','errPb204Pb206',
                        'Pb207Pb206','errPb207Pb206','rXY'),nrow=1)
    } else if (identical(method,"Pb-Pb") & format==3) {
        mat <- matrix(c('Pb206Pb204','errPb206Pb204',
                        'Pb207Pb204','errPb207Pb206',
                        'Pb207Pb206','errPb207Pb206'),nrow=1)
    } else if (identical(method,"Ar-Ar") & format==1){
        mat <- matrix('',3,6)
        mat[1,1:2] <- c('J','errJ')
        mat[2,1] <- input$J
        mat[2,2] <- input$sJ
        mat[3,1:6] <- c('Ar39Ar36','errAr39Ar36',
                        'Ar40Ar36','errAr40Ar36',
                        'rXY','Ar39')
    } else if (identical(method,"Ar-Ar") & format==2) {
        mat <- matrix('',3,6)
        mat[1,1:2] <- c('J','errJ')
        mat[2,1] <- input$J
        mat[2,2] <- input$sJ
        mat[3,1:6] <- c('Ar39Ar40','errAr39Ar40',
                        'Ar36Ar40','errAr36Ar40',
                        'rxY','Ar39')
    } else if (identical(method,"Ar-Ar") & format==3) {
        mat <- matrix('',3,7)
        mat[1,1:2] <- c('J','errJ')
        mat[2,1] <- input$J
        mat[2,2] <- input$sJ
        mat[3,1:7] <- c('Ar39Ar40','errAr39Ar40',
                        'Ar36Ar40','errAr36Ar40',
                        'Ar39Ar36','errAr39Ar36','Ar39')
    } else if (identical(method,"K-Ca") & format==1){
        mat <- matrix(c('K40Ca44','errK40Ca44',
                        'Ca40Ca44','errCa40Ca44','rXY'),nrow=1)
    } else if (identical(method,"K-Ca") & format==2){
        mat <- matrix(c('K40Ca40','errK40Ca40',
                        'Ca44Ca40','errCa44Ca40','rXY'),nrow=1)
    } else if (identical(method,"K-Ca") & format==3){
        mat <- matrix(c('K40Ca44','errK40Ca44',
                        'Ca40Ca44','errCa40Ca44',
                        'K40Ca40','errK40Ca40'),nrow=1)
    } else if (identical(method,"Th-Pb") & format==1){
        mat <- matrix(c('Th232Pb204','errTh232Pb204',
                        'Pb208Pb204','errPb208Pb204','rXY'),nrow=1)
    } else if (identical(method,"Th-Pb") & format==2){
        mat <- matrix(c('Th232Pb208','errTh232Pb208',
                        'Pb204Pb208','errPb204Pb208','rXY'),nrow=1)
    } else if (identical(method,"Th-Pb") & format==3){
        mat <- matrix(c('Th232Pb204','errTh232Pb204',
                        'Pb208Pb204','errPb208Pb204',
                        'Th232Pb208','errTh232Pb208'),nrow=1)
    } else if (identical(method,"Th-U") & format==1) {
        mat <- matrix(c('U238Th232','errU238Th232',
                        'U234Th232','errU234Th232',
                        'Th230Th232','errTh230Th232',
                        'rXY','rXZ','rYZ'),nrow=1)
    } else if (identical(method,"Th-U") & format==2) {
        mat <- matrix(c('Th232U238','errTh232U238',
                        'U234U238','errU234U238',
                        'Th230U238','errTh230U238',
                        'rXY','rXZ','rYZ'),nrow=1)
    } else if (identical(method,"Th-U") & format==3) {
        mat <- matrix(c('U238Th232','errU238Th232',
                        'Th230Th232','errTh230Th232','rXY'),nrow=1)
    } else if (identical(method,"Th-U") & format==4) {
        mat <- matrix(c('Th232U238','errTh232U238',
                        'Th230U238','errTh230U238','rXY'),nrow=1)
    } else if (identical(method,"Rb-Sr") & format==1){
        mat <- matrix(c('Rb87Sr86','errRb87Sr86',
                        'Sr87Sr86','errSr87Sr86','rXY'),nrow=1)
    } else if (identical(method,"Rb-Sr") & format==2){
        mat <- matrix(c('Rb87Sr87','errRb87Sr87',
                        'Sr86Sr87','errSr86Sr87','rXY'),nrow=1)
    } else if (identical(method,"Rb-Sr") & format==3){
        mat <- matrix(c('Rbppm','errRbppm',
                        'Srppm','errSrppm',
                        'Sr87Sr86','errSr87Sr86'),nrow=1)
    } else if (identical(method,"Sm-Nd") & format==1){
        mat <- matrix(c('Sm143Nd144','errSm143Nd144',
                        'Nd143Nd144','errNd143Nd144','rXY'),nrow=1)
    } else if (identical(method,"Sm-Nd") & format==2){
        mat <- matrix(c('Sm143Nd143','errSm143Nd143',
                        'Nd144Nd143','errNd144Nd143','rXY'),nrow=1)
    } else if (identical(method,"Sm-Nd") & format==3){
        mat <- matrix(c('Smppm','errSmppm',
                        'Ndppm','errNdppm',
                        'Nd143Nd144','errNd143Nd144'),nrow=1)
    } else if (identical(method,"Re-Os") & format==1){
        mat <- matrix(c('Re187Os188','errRe187Os188',
                        'Os187Os188','errOs187Os188','rXY'),nrow=1)
    } else if (identical(method,"Re-Os") & format==2){
        mat <- matrix(c('Re187Os188','errRe187Os187',
                        'Os188Os187','errOs188Os187','rXY'),nrow=1)
    } else if (identical(method,"Re-Os") & format==3){
        mat <- matrix(c('Reppm','errReppm',
                        'Osppm','errOsppm',
                        'Os187Os188','errOs187Os188'),nrow=1)
    } else if (identical(method,"Lu-Hf") & format==1){
        mat <- matrix(c('Lu176Hf177','errLu176Hf177',
                        'Hf176Hf177','errHf176Hf177','rXY'),nrow=1)
    } else if (identical(method,"Lu-Hf") & format==2){
        mat <- matrix(c('Lu176Hf176','errLu176Hf176',
                        'Hf177Hf176','errHf177Hf176','rXY'),nrow=1)
    } else if (identical(method,"Lu-Hf") & format==3){
        mat <- matrix(c('Luppm','errLuppm',
                        'Hfppm','errHfppm',
                        'Hf176Hf177','errHf176Hf177'),nrow=1)
    } else if (identical(method,"fissiontracks")){
        mat <- matrix('',5,nc-3)
        if (format==1){
            mat[1,1:2] <-c('Zeta','errZeta')
            mat[2,1] <- input$zeta
            mat[2,2] <- input$zetaErr
            mat[3,1:2] <-c('rhoD','errRhoD')
            mat[4,1] <- input$rhoD
            mat[4,2] <- input$rhoDerr
            mat[5,1:2] <- c('Ns','Ni')
        } else if (format==2){
            mat[1,1:2] <-c('Zeta','errZeta')
            mat[2,1] <- input$zeta
            mat[2,2] <- input$zetaErr
            mat[3,1] <-'spot-size'
            mat[4,1] <- input$spotSize
            mat[5,1:2] <- c('Ns','A')
            mat[5,3:(nc-3)] <- rep(c('U','err[U]'),(nc-5)/2)
        } else if (format==3){
            mat[1,1] <-'mineral'
            mat[2,1] <- input$mineral
            mat[3,1] <-'spot-size'
            mat[4,1] <- input$spotSize
            mat[5,1:2] <- c('Ns','A')
            mat[5,3:(nc-3)] <- rep(c('U','err[U]'),(nc-5)/2)
        } else {
            stop('Invalid fission track format')
        }
    } else if (identical(method,"U-Th-He")){
        mat <- matrix(c('He','errHe','U','errU',
                        'Th','errTh','Sm','errSm'),nrow=1)
    } else if (identical(method,"detritals")){
        if (format==1){
            mat <- NULL
        } else {
            labels <- c(LETTERS,unlist(lapply(LETTERS,'paste0',LETTERS)))
            mat <- matrix(labels[1:nc],1,nc)
        }
    } else if (identical(method,"other")){
        if (format==1){
            mat <- matrix('X',nrow=1)
        } else if (format==2){
            mat <- matrix(c('X','err[X]'),nrow=1)
        } else if (format==3){
            mat <- matrix(c('f','X','err[X]'),nrow=1)
        } else if (format==4){
            mat <- matrix(c('X','err[X]','Y','err[Y]','rXY'),nrow=1)
        } else if (format==5){
            mat <- matrix(c('X/Z','err[X/Z]','Y/Z','err[Y/Z]',
                            'X/Y','err[X/Y]'),nrow=1)
        } else if (format==6){
            ns <- (nc-4)/2
            mat <- matrix(c('[X,Y]',
                            paste0('s[,X',1:ns,']'),
                            paste0('s[,Y',1:ns,']')),nrow=1)
        }
    } else {
        stop('Invalid method')
    }
    val <- matrix(values,ncol=nc)
    if (method%in%'detritals'){
        if (format==1){
            mat <- val
        } else {
            mat <- rbind(mat,val[,1:ncol(mat),drop=FALSE])
        }
    } else {
        mat <- rbind(mat,val[,1:ncol(mat),drop=FALSE])
    }
    if (identical(method,'U-Pb')){
        out <- IsoplotR::read.data(mat,method=method,format=format,ierr=ierr,d=d)
    } else if (identical(method,'Th-U')){
        out <- IsoplotR::read.data(mat,method=method,format=format,ierr=ierr,
                                   U8Th2=U8Th2,Th02i=Th02i,Th02U48=Th02U48)
    } else {
        out <- IsoplotR::read.data(mat,method=method,format=format,ierr=ierr)
    }
    out
}
