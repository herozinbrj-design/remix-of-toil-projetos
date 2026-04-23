-- Criar banco de dados shadow para Prisma Migrate
CREATE DATABASE IF NOT EXISTS toil_projetos_shadow;

-- Dar permissões ao usuário
GRANT ALL PRIVILEGES ON toil_projetos_shadow.* TO 'toil'@'%';
GRANT ALL PRIVILEGES ON toil_projetos_shadow.* TO 'toil'@'localhost';

FLUSH PRIVILEGES;
