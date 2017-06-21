#!/bin/bash
ver=4.7
if [[ "$#" == "1" ]]; then
  ver=$1
fi
echo $ver
docker build -f Dockerfile_$ver  -t 3hdeng/nodegit:$ver . 
