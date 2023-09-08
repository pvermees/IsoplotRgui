selection2data <- function(input,method="U-Pb",format=1,ierr=1,d=IsoplotR::diseq(),
                           U8Th2=0,Th02i=c(0,0),Th02U48=c(0,0,1e6,0,0,0,0,0,0)){
    nc <- as.numeric(input$nc)
    values <- matrix(as.character(input$data), ncol = nc)
    mat <- matrix("", 1, nc) # header
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
    } else if (identical(method,"U-Pb") & format==7) {
        mat[1,1:14] <- c('Pb207U235','errPb207U235',
                         'Pb206U238','errPb206U238',
                         'Pb208Th232','errPb208Th232',
                         'Th232U238','errTh232U238',
                         'rhoXY','rhoXZ','rhoXW',
                         'rhoYZ','rhoYW','rhoZW')
    } else if (identical(method,"U-Pb") & format==8) {
        mat[1,1:14] <- c('U238Pb206','errU238Pb206',
                            'Pb207Pb206','errPb207Pb206',
                            'Pb208Pb206','errPb208Pb206',
                            'Th232U238','errTh232U238',
                            'rhoXY','rhoXZ','rhoXW',
                            'rhoYZ','rhoYW','rhoZW')
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
        mat[2,1] <- input$J
        mat[2,2] <- input$sJ
        mat[3,1:6] <- c('Ar39Ar36','errAr39Ar36',
                        'Ar40Ar36','errAr40Ar36',
                        'rho','Ar39')
    } else if (identical(method,"Ar-Ar") & format==2) {
        mat <- matrix('',3,nc)
        mat[1,1:2] <- c('J','errJ')
        mat[2,1] <- input$J
        mat[2,2] <- input$sJ
        mat[3,1:6] <- c('Ar39Ar40','errAr39Ar40',
                        'Ar36Ar40','errAr36Ar40',
                        'rho','Ar39')
    } else if (identical(method,"Ar-Ar") & format==3) {
        mat <- matrix('',3,nc)
        mat[1,1:2] <- c('J','errJ')
        mat[2,1] <- input$J
        mat[2,2] <- input$sJ
        mat[3,1:7] <- c('Ar39Ar40','errAr39Ar40',
                        'Ar36Ar40','errAr36Ar40',
                        'Ar39Ar36','errAr39Ar36','Ar39')
    } else if (identical(method,"K-Ca") & format==1){
        mat[1,1:5] <- c('K40Ca44','errK40Ca44',
                        'Ca40Ca44','errCa40Ca44','rho')
    } else if (identical(method,"K-Ca") & format==2){
        mat[1,1:5] <- c('K40Ca40','errK40Ca40',
                        'Ca44Ca40','errCa44Ca40','rho')
    } else if (identical(method,"K-Ca") & format==3){
        mat[1,1:6] <- c('K40Ca44','errK40Ca44',
                        'Ca40Ca44','errCa40Ca44',
                        'K40Ca40','errK40Ca40')
    } else if (identical(method,"Th-Pb") & format==1){
        mat[1,1:5] <- c('Th232Pb204','errTh232Pb204',
                        'Pb208Pb204','errPb208Pb204','rho')
    } else if (identical(method,"Th-Pb") & format==2){
        mat[1,1:5] <- c('Th232Pb208','errTh232Pb208',
                        'Pb204Pb208','errPb204Pb208','rho')
    } else if (identical(method,"Th-Pb") & format==3){
        mat[1,1:6] <- c('Th232Pb204','errTh232Pb204',
                        'Pb208Pb204','errPb208Pb204',
                        'Th232Pb208','errTh232Pb208')
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
        mat[1,1:5] <- c('Rb87Sr87','errRb87Sr87',
                        'Sr86Sr87','errSr86Sr87','rho')
    } else if (identical(method,"Rb-Sr") & format==3){
        mat[1,1:6] <- c('Rbppm','errRbppm',
                        'Srppm','errSrppm',
                        'Sr87Sr86','errSr87Sr86')
    } else if (identical(method,"Sm-Nd") & format==1){
        mat[1,1:5] <- c('Sm143Nd144','errSm143Nd144',
                        'Nd143Nd144','errNd143Nd144','rho')
    } else if (identical(method,"Sm-Nd") & format==2){
        mat[1,1:5] <- c('Sm143Nd143','errSm143Nd143',
                        'Nd144Nd143','errNd144Nd143','rho')
    } else if (identical(method,"Sm-Nd") & format==3){
        mat[1,1:6] <- c('Smppm','errSmppm',
                        'Ndppm','errNdppm',
                        'Nd143Nd144','errNd143Nd144')
    } else if (identical(method,"Re-Os") & format==1){
        mat[1,1:5] <- c('Re187Os188','errRe187Os188',
                        'Os187Os188','errOs187Os188','rho')
    } else if (identical(method,"Re-Os") & format==2){
        mat[1,1:5] <- c('Re187Os188','errRe187Os187',
                        'Os188Os187','errOs188Os187','rho')
    } else if (identical(method,"Re-Os") & format==3){
        mat[1,1:6] <- c('Reppm','errReppm',
                        'Osppm','errOsppm',
                        'Os187Os188','errOs187Os188')
    } else if (identical(method,"Lu-Hf") & format==1){
        mat[1,1:5] <- c('Lu176Hf177','errLu176Hf177',
                        'Hf176Hf177','errHf176Hf177','rho')
    } else if (identical(method,"Lu-Hf") & format==2){
        mat[1,1:5] <- c('Lu176Hf176','errLu176Hf176',
                        'Hf177Hf176','errHf177Hf176','rho')
    } else if (identical(method,"Lu-Hf") & format==3){
        mat[1,1:6] <- c('Luppm','errLuppm',
                        'Hfppm','errHfppm',
                        'Hf176Hf177','errHf176Hf177')
    } else if (identical(method,"fissiontracks")){
        mat <- matrix('',5,nc)
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
            mat[5,3:nc] <- rep(c('U','err[U]'),(nc-1)/2)
        } else if (format==3){
            mat[1,1] <-'mineral'
            mat[2,1] <- input$mineral
            mat[3,1] <-'spot-size'
            mat[4,1] <- input$spotSize
            mat[5,1:2] <- c('Ns','A')
            mat[5,3:nc] <- rep(c('U','err[U]'),(nc-1)/2)
        } else {
            stop('Invalid fission track format')
        }
    } else if (identical(method,"U-Th-He")){
        mat[1,1:8] <- c('He','errHe','U','errU',
                        'Th','errTh','Sm','errSm')
    } else if (identical(method,"detritals")){
        if (format==1){
            mat <- NULL
        } else {
            labels <- c(LETTERS,unlist(lapply(LETTERS,'paste0',LETTERS)))
            mat <- matrix(labels[1:nc],1,nc)
        }
    } else if (identical(method,"other")){
        if (format==1){
            mat[1,1] <- c('X')
        } else if (format==2){
            mat[1,1:2] <- c('X','err[X]')
        } else if (format==3){
            mat[1,1:3] <- c('f','X','err[X]')
        } else if (format==4){
            mat[1,1:5] <- c('X','err[X]','Y','err[Y]','rho')
        } else if (format==5){
            mat[1,1:6] <- c('X/Z','err[X/Z]','Y/Z','err[Y/Z]','X/Y','err[X/Y]')
        } else if (format==6){
            ns <- (nc-3)/2
            mat[1:(nc-2)] <- c('[X,Y]',
                               paste0('s[,X',1:ns,']'),
                               paste0('s[,Y',1:ns,']'))
        }
    } else {
        stop('Invalid method')
    }
    mat <- rbind(mat,values)
    if (identical(method,"other") & format==1){ # remove the last column
        mat <- subset(mat,select=-nc)
    } else if (!identical(method,"detritals")){ # remove the last two columns
        mat <- subset(mat,select=-c(nc-1,nc))
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
