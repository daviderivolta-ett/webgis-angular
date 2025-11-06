
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY package*.json ./
RUN npm install -g @angular/cli && npm install
COPY . .
RUN ng build

FROM nginx:alpine
COPY --from=build-stage /app/dist/omirl/browser/ /usr/share/nginx/html/
COPY startup.sh /startup.sh
EXPOSE 80

ENTRYPOINT /startup.sh
#CMD ["nginx", "-g", "daemon off;"]
