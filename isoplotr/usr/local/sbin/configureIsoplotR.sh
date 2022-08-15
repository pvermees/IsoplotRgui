#! /bin/sh
set -eu
name=isoplotr
max_processes=99
scfile=/usr/local/sbin/${name}ctl
nxfile=/etc/nginx/conf.d/${name}.conf
if [ -z "${1-}" ]
then
scriptname=$(basename $0)
echo 'Usage:'
echo "${scriptname} 6"
echo "sets ${name} to use 6 processes"
echo "${scriptname} 5 3901"
echo "sets ${name} to use 5 processes on port numbers 3901 to 3906"
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

# Stop and disable any old instances we no longer need
for p in $(seq ${start} ${end})
do
 if [ "(" "${p}" -lt "${newstart}" ")" -o "(" "${newend}" -lt "${p}" ")" ]
 then
  systemctl stop ${name}@${p}
  systemctl disable ${name}@${p}
 fi
done

# Fix start and end variables in ctl script
sed -e 's/^start=\(.*\)$/start='${newstart}/ -e 's/^end=\(.*\)$/end='${newend}/ -i ${scfile}

# Write out nginx file
echo "upstream ${name} {" > ${nxfile}
echo '  least_conn;' >> ${nxfile}
for p in $(seq ${newstart} ${newend})
do
echo "  server 127.0.0.1:${p};" >> ${nxfile}
done
echo '}' >> ${nxfile}

# Start and enable new instances
${scfile} start
${scfile} enable
systemctl try-restart nginx
