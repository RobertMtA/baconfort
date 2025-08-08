#!/usr/bin/env sh

# abortar en caso de errores
set -e

# construir
cd baconfort-react
npm run build

# navegar al directorio de salida de compilación
cd dist

# si estás desplegando en un dominio personalizado
# echo "www.ejemplo.com" > CNAME

git init
git add -A
git commit -m "deploy"

# si estás desplegando en https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git main

# si estás desplegando en https://<USERNAME>.github.io/<REPO>
git push -f https://github.com/RobertMtA/baconfort.git master:gh-pages

cd -

