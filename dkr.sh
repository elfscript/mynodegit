#!/bin/bash
ver=4.7
if [[ "$#" == "1" ]]; then
	  ver=$1
  fi
echo $ver

docker run -it --rm  --name mynodegit \
  -v $(pwd):/mnt/work  -w /mnt/work \
  -p 5000:5000 \
  3hdeng/nodegit:$ver \
  /bin/bash


#    -v $gitRepo:/opt/$USER/repos \
#    -e "OPTION_NAME=OPTION_VALUE" \
