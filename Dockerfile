FROM node:16-alpine  AS builder
WORKDIR /code/frontend
COPY ./frontend .
RUN npm install --legacy-peer-deps && npm run build

FROM node:16-alpine  AS server
WORKDIR /code/backend
COPY --from=builder /code/frontend/build ./build
COPY ./backend .
RUN npm install

EXPOSE 4000

CMD ["npm", "run", "dev"]