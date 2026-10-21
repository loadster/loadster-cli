#!/bin/bash

##
# This simple build script makes zipped binaries for 3 platforms.
#
# It runs @yao-pkg/pkg (a dev dependency, so run `npm ci` first) in Node single executable
# application (SEA) mode. pkg downloads the latest official Node 24.x for each target from
# nodejs.org and checks it against SHASUMS256.txt, so the binaries bundle a current, patched
# Node rather than the build machine's.
#
# The macOS binary must be re-signed after the app is injected into it. On a Mac, pkg does that
# with `codesign`. On Linux it needs `ldid` on the PATH; without it, the macOS binary keeps a
# broken signature and won't launch, so this script refuses to build.
##

set -euo pipefail

if [ "$(uname -s)" != "Darwin" ] && ! command -v ldid >/dev/null 2>&1; then
  echo "Building the macOS binary on $(uname -s) needs ldid on the PATH to sign it (or build on a Mac)." >&2
  exit 1
fi

VERSION=$(node -p "require('./package.json').version");

rm -rf build
npm run pkg

cd build

mkdir -p loadster-cli-$VERSION-linux-x64
mkdir -p loadster-cli-$VERSION-mac-x64
mkdir -p loadster-cli-$VERSION-windows-x64

mv loadster-linux loadster-cli-$VERSION-linux-x64/loadster
mv loadster-macos loadster-cli-$VERSION-mac-x64/loadster
mv loadster-win.exe loadster-cli-$VERSION-windows-x64/loadster.exe

zip -r loadster-cli-$VERSION-linux-x64.zip loadster-cli-$VERSION-linux-x64
zip -r loadster-cli-$VERSION-mac-x64.zip loadster-cli-$VERSION-mac-x64
zip -r loadster-cli-$VERSION-windows-x64.zip loadster-cli-$VERSION-windows-x64
