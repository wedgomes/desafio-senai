# Etapa 1: Usar uma imagem base leve e oficial do Node.js
FROM node:18-alpine

# Etapa 2: Definir o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Etapa 3: Copiar os arquivos de dependências e instalá-las
# Esta ordem otimiza o cache do Docker.
COPY package*.json ./
RUN npm install

# Etapa 4: Copiar o restante do código da aplicação
COPY . .

# Etapa 5: Gerar o Prisma Client (passo CRUCIAL)
# O Prisma precisa gerar um cliente específico para o ambiente do contêiner (Linux)
RUN npx prisma generate

# Etapa 6: Fazer o build de produção da aplicação NestJS
RUN npm run build

# Etapa 7: Expor a porta que a nossa API usa
EXPOSE 3001

# Etapa 8: Definir o comando para iniciar a aplicação em modo de produção
CMD [ "npm", "run", "start:prod" ]