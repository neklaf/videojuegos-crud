-- 1. Habilitar el soporte para claves foráneas (por defecto viene deshabilitado)
PRAGMA foreign_keys = ON;

-- 2. Crear tabla de Estudios (Padre)
CREATE TABLE IF NOT EXISTS estudios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    pais TEXT NOT NULL,
    UNIQUE(nombre)
);

-- 3. Crear tabla de Videojuegos (Hija con FK)
CREATE TABLE IF NOT EXISTS videojuegos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    fecha_lanzamiento INTEGER NOT NULL,
    estudio_id INTEGER NOT NULL,
    UNIQUE(titulo, fecha_lanzamiento, estudio_id),
    FOREIGN KEY (estudio_id) REFERENCES estudios(id) ON DELETE CASCADE
);
-- Insertar datos en "estudios"
INSERT OR IGNORE INTO estudios (nombre, pais) VALUES ('Nintendo', 'Japón');
INSERT OR IGNORE INTO estudios (nombre, pais) VALUES ('FromSoftware', 'Japón');
INSERT OR IGNORE INTO estudios (nombre, pais) VALUES ('CD Projekt Red', 'Polonia');
INSERT OR IGNORE INTO estudios (nombre, pais) VALUES ('Ubisoft', 'Francia');

-- Insertar datos en "videojuegos" asociados a los estudios
INSERT OR IGNORE INTO videojuegos (titulo, fecha_lanzamiento, estudio_id) VALUES ('The Legend of Zelda: Tears of the Kingdom', 2023, 1);
INSERT OR IGNORE INTO videojuegos (titulo, fecha_lanzamiento, estudio_id) VALUES ('Super Mario Odyssey', 2017, 1);
INSERT OR IGNORE INTO videojuegos (titulo, fecha_lanzamiento, estudio_id) VALUES ('Elden Ring', 2022, 2);
INSERT OR IGNORE INTO videojuegos (titulo, fecha_lanzamiento, estudio_id) VALUES ('Dark Souls 3', 2016, 2);
INSERT OR IGNORE INTO videojuegos (titulo, fecha_lanzamiento, estudio_id) VALUES ('Cyberpunk 2077', 2020, 3);
INSERT OR IGNORE INTO videojuegos (titulo, fecha_lanzamiento, estudio_id) VALUES ('The Witcher 3', 2015, 3);
INSERT OR IGNORE INTO videojuegos (titulo, fecha_lanzamiento, estudio_id) VALUES ('Assassin''s Creed Valhalla', 2020, 4);
