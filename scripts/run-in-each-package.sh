#!/bin/sh

for d in ./packages/*/ ; do
  # Exit if the subshell command failed.
  (cd "$d" && $1) || exit;
done
