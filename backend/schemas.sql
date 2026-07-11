CREATE TABLE cultivos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    variedad VARCHAR(100) NOT NULL,
    temperatura_optima DECIMAL(5,2) NOT NULL,
    temperatura_maxima DECIMAL(5,2) NOT NULL,
    dias_cosecha INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    mililitros_requeridos DECIMAL(10,2) NOT NULL
);


CREATE TABLE parcelas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    latitud DECIMAL(9,6),
    longitud DECIMAL(9,6)
);


CREATE TABLE parcelas_cultivos (
    parcela_id INT NOT NULL REFERENCES parcelas(id) ON DELETE CASCADE,
    cultivo_id INT NOT NULL REFERENCES cultivos(id) ON DELETE CASCADE,
    PRIMARY KEY (parcela_id, cultivo_id)
);

CREATE TABLE tareas (
    id SERIAL PRIMARY KEY,
    parcela_id INT NOT NULL REFERENCES parcelas,
    tarea VARCHAR(255) NOT NULL,
    hecho BOOLEAN NOT NULL DEFAULT FALSE
);