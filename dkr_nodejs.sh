#!/bin/bash
echo $@
docker run --rm  --name mynodejs -v $(pwd):/mnt/test  -w /mnt/test \
	 3hdeng/nodejs:4.7 node $@

