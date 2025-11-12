#!/bin/sh
sed -i "s|<base href=\"/\">|<base href=\"${href}\">|g" /usr/share/nginx/html/index.html
nginx -g "daemon off;"