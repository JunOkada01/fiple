FROM node:20-alpine

WORKDIR /app

COPY ../../frontend/fiplenext/package*.json ./
RUN npm install

COPY ../../frontend/fiplenext ./

RUN npm run build

EXPOSE 3000

CMD ["npm", "run"]