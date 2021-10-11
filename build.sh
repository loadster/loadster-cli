#!/bin/bash

##
# This simple build script makes zipped binaries for 3 platforms.
# It requires node and pkg to be installed and on the path.
##

VERSION=$(node -p "require('./package.json').version");

pkg ./js/main.js --out-path build

cd build

mkdir -p loadster-cli-$VERSION-linux-x64
mkdir -p loadster-cli-$VERSION-mac-x64
mkdir -p loadster-cli-$VERSION-windows-x64

mv main-linux loadster-cli-$VERSION-linux-x64/loadster
mv main-macos loadster-cli-$VERSION-mac-x64/loadster
mv main-win.exe loadster-cli-$VERSION-windows-x64/loadster.exe

zip -r loadster-cli-$VERSION-linux-x64.zip loadster-cli-$VERSION-linux-x64
zip -r loadster-cli-$VERSION-mac-x64.zip loadster-cli-$VERSION-mac-x64
zip -r loadster-cli-$VERSION-windows-x64.zip loadster-cli-$VERSION-windows-x64
