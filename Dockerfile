FROM node:22-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiar todo o código
COPY . .

# Gerar cliente Prisma e buildar o frontend
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

ENV PORT=3000

# Volume para persistir uploads entre deploys
VOLUME ["/app/public/uploads"]

# Rodar migrações, atualizar permissões e iniciar o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx prisma/seed-permissions.ts && npx tsx server/index.ts"]
