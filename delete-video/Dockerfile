FROM node:carbon-alpine

# Create app directory
WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

# CMD [ "yarn" ]
