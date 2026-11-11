#!/bin/bash

npm init -y
npm install express knex sqlite3 cors
npm install --save-dev jest supertest
/usr/bin/sqlite3 videojuegos.db < sql/videojuegos.sql