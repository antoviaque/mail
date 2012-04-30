apt-get install python-daemon
git clone https://github.com/meteor/meteor.git
apt-get install mongodb python-pymongo mongodb-clients mongodb-server
echo 8192 > /proc/sys/fs/inotify/max_user_instances
npm install nodemailer (+move to dev_bundle/lib/node_modules of local meteor install)
