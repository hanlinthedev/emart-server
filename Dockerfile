FROM node:lts-alpine AS development

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

RUN npm install  --silent 

COPY . .

RUN npx prisma generate

RUN chown -R node /usr/src/app

USER node

RUN npm run build

FROM node:lts-alpine AS production 

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

RUN npm install --production --omit=dev --silent 

COPY . .

RUN npx prisma generate

COPY --from=development /usr/src/app/dist ./dist

EXPOSE 3001

CMD [ "node","dist/main.js" ]

