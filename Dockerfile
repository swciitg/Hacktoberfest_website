FROM node:16-alpine  AS builder
WORKDIR /code
COPY . .
WORKDIR /code/frontend
RUN npm install --legacy-peer-deps && npm run build
RUN ls -lah
RUN mv /code/frontend/build /code/backend/
WORKDIR /code/backend
RUN npm install --legacy-peer-deps

EXPOSE 4000

CMD ["npm", "run", "dev"]