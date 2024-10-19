FROM node:alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate


RUN npm run build

FROM node:alpine AS prod 

ARG NODE_ENV=prod
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

RUN npx prisma generate

COPY --from=development /usr/src/app/dist ./dist

EXPOSE 3001

CMD [ "node","dist/main.js" ]

