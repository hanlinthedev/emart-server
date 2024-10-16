FROM node:lts-alpine as build

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

RUN npm install  --silent && mv node_modules ../

COPY . .

RUN npx prisma generate

RUN chown -R node /usr/src/app

USER node

RUN npm run build

FROM node:lts-alpine as production 

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

RUN npm install --production --omit=dev --silent && mv node_modules ../

COPY --from=build /usr/src/app/node_modules ./node_modules

RUN npx prisma generate

EXPOSE 3001

CMD [ "node","dist/main.js" ]

