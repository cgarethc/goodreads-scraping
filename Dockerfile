FROM node:latest
WORKDIR /usr/src/app
COPY lib lib
COPY populatefirestore.js .
COPY package.json .
COPY what-can-i-borrow-firebase-adminsdk-8nxq2-60dfb93da5.json .
RUN npm install
ENTRYPOINT [ "node", "populatefirestore.js", "-e"]