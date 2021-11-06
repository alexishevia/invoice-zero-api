FROM node:14-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY ./nodeapi .

# Env variables
ENV PORT=8080
ENV PERSISTENCE_TYPE="file"
ENV PERSISTENCE_FILEPATH="/invoice-zero-api.mdjson"
ENV AUTH_TYPE="basic"
ENV AUTH_USERNAME=""
ENV AUTH_PASSWORD=""

# App will run on port 8080
EXPOSE $PORT

CMD [ "node", "bin/www.mjs" ]
