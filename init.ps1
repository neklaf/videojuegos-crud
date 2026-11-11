# Iniciar el proyecto Node.js
npm init -y

# Instalar dependencias principales
npm install express knex sqlite3 cors

# Instalar dependencias de desarrollo
npm install --save-dev jest supertest

# Importar el archivo SQL en la base de datos SQLite
Get-Content -Raw -Path "sql\videojuegos.sql" | sqlite3 videojuegos.db
