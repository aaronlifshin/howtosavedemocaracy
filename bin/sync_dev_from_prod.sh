#!/bin/bash
today=$(date "+%Y%m%d")
appcfg.py download_data --url=http://howtosavedemocracy.appspot.com/_ah/remote_api --filename=/tmp/h2sd-prod-$today
appcfg.py upload_data --url=http://localhost:8082/_ah/remote_api --filename=/tmp/h2sd-prod-$today