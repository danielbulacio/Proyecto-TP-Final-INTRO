CREATE TABLE parcelas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    latitud DECIMAL(9,6),
    longitud DECIMAL(9,6)
);

CREATE TABLE cultivos (
    id SERIAL PRIMARY KEY,
    nombre_cultivo VARCHAR(100) NOT NULL,
    parcela_id INT REFERENCES parcelas,
    tipo VARCHAR(50),
    temperatura_optima INT,
    dias_de_cosecha INT,
    mililitros_necesarios INT
);

CREATE TABLE detalle_parcela (
    id SERIAL PRIMARY KEY,
    parcela_id INT NOT NULL REFERENCES parcelas,
    fecha DATE NOT NULL,
    temperatura DECIMAL(5,2),
    precipitacion DECIMAL(5,2),
    humedad_suelo DECIMAL(5,2),
    evapotranspiracion DECIMAL(5,2)
);

CREATE TABLE tareas (
    id SERIAL PRIMARY KEY,
    parcela_id INT NOT NULL REFERENCES parcelas,
    tarea VARCHAR(255) NOT NULL,
    hecho BOOLEAN NOT NULL DEFAULT FALSE
);
