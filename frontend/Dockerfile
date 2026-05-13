FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Bu bir development Dockerfile'ıdır. Production için build alınması gerekir.
CMD ["npm", "run", "dev"]
