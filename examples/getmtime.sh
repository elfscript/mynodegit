#!/bin/baSh
cd $1
git ls-tree -r --name-only HEAD | while read filename; 
   do echo "$(git log -1 --format="%ad" -- $filename) $filename" 
done
