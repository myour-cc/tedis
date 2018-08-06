#!/usr/bin/env sh

set -e

npm run doc:build

cd doc/.vuepress/dist

echo 'tedis.myour.tech' > CNAME

git init
git add -A
git commit -m 'deploy'

git push -f https://github.com/dasoncheng/tedis.git master:gh-pages

cd ..

rm -rf dist

cd -