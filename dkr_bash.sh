#!/bin/bash
echo $@
docker run  -it --rm  --name mynodejs -v $(pwd):/mnt/test  -w /mnt/test \
	 3hdeng/nodejs:4.7 /bin/bash

