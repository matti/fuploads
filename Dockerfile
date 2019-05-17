FROM node:10

RUN groupadd --system app && useradd --system --gid app app

WORKDIR /usr/src/app
COPY app/package*.json ./

RUN npm install
COPY app .
RUN mkdir uploads
RUN chown app:app uploads

USER app
ENV PORT 8080
EXPOSE 8080
CMD [ "npm", "start" ]
