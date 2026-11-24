#!/bin/bash
#Usage: ./deploy.sh <WEB_IP>
scp -i ~/.ssh/school -r index.html css js data ubuntu@$1:/var/www/html/