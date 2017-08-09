#!/bin/baSh
fname=$1
git log $fname | grep "^commit" | cut -f2 -d" " | while read hash; do
   echo -n "$hash -- "
   git show $hash:<file_path_off_of_git_root_without_leading_slash> | wc -c
done
