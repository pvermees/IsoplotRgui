#! /bin/sh
set -eu
scfile=/usr/local/sbin/isoplotrctl
nxfile=/etc/nginx/conf.d/isoplotr.conf
max_processes=99
if [ -z "${1-}" ]
then
echo 'Usage:'
echo 'configureIsoplotR.sh 6'
echo 'sets IsoplotR to use 6 processes'
echo 'configureIsoplotR.sh 5 3901'
echo 'sets IsoplotR to use 5 processes on port numbers 3901 to 3906'
exit
elif [ ${max_processes} -lt "$1" ]
then
echo "Probably shouldn't use more than ${max_processes} processes"
exit
elif [ "$1" -lt 1 ]
then
echo "Need to specify at least one process"
exit
fi
newcount="$1"
start=$(sed -ne 's/^start=\(.*\)$/\1/p' ${scfile})
end=$(sed -ne 's/^end=\(.*\)$/\1/p' ${scfile})
count=$(expr ${end} - ${start} + 1)
if [ -z "${2-}" ]
then
newstart=${start}
elif [ "(" "$2" -lt 1024 ")" -o "(" 65535 -lt "$2" ")" ]
then
echo 'The second parameter needs to be a port number (between 4096 and 65535)'
exit
else
newstart="$2"
fi
newend=$(expr ${newstart} + ${newcount} - 1)
${scfile} stop
sed -e 's/^start=\(.*\)$/start='${newstart}/ -e 's/^end=\(.*\)$/end='${newend}/ -i ${scfile}
echo 'upstream isoplotr {' > ${nxfile}
echo '  least_conn;' >> ${nxfile}
for p in $(seq ${newstart} ${newend})
do
echo "  server 127.0.0.1:${p};" >> ${nxfile}
done
echo '}' >> ${nxfile}
systemctl try-restart nginx
