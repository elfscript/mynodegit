#!/bin/bash
echo $@
docker run  -it --rm  --name mynodegit -v $(pwd):/mnt/test  -w /mnt/test \
	 3hdeng/nodegit:4.8 /bin/bash

