FROM node:latest
WORKDIR /usr/src/app
COPY lib lib
COPY populatefirestore.js .
COPY alltheawards.sh .
COPY oneaward.sh .
COPY package.json .
COPY what-can-i-borrow-firebase-adminsdk-8nxq2-60dfb93da5.json .
RUN npm install
CMD ["populatefirestore.js", "-a", "https://www.goodreads.com/award/show/2129-london-book-festival", "-i", "london-book-festival", "-n", "London Book Festival",  "-t" ,"Award"]