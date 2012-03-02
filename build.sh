cat wordlib.js swift.js im.js > im.min.js && sed -i "s/window.$ = //g" im.min.js
scp im.min.js vps:www/
