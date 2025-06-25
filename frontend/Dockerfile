# Usamos a mesma base para consistência
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Comando para criar o build otimizado de produção do Next.js
RUN npm run build

# A porta padrão do Next.js
EXPOSE 3000

# Comando para iniciar o servidor de produção do Next.js
CMD [ "npm", "start" ]