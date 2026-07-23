-- PARCELAS, CULTIVOS Y TAREAS SON LAS 3 ENTIDADES CON CRUDS COMPLETOS

CREATE TABLE parcelas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    latitud DECIMAL(9,6),
    longitud DECIMAL(9,6),
    hectareas DECIMAL (10,2),
    imagen VARCHAR(255)
);

CREATE TABLE cultivos (
    id SERIAL PRIMARY KEY,
    nombre_cultivo VARCHAR(100) NOT NULL,
    parcela_id INT NOT NULL REFERENCES parcelas,
    tipo VARCHAR(50),
    temperatura_optima INT,
    dias_de_cosecha INT,
    mililitros_necesarios INT
);

CREATE TABLE tareas (
    id SERIAL PRIMARY KEY,
    parcela_id INT NOT NULL REFERENCES parcelas, 
    tarea VARCHAR(255) NOT NULL,
    prioridad VARCHAR(20) CHECK (prioridad IN ('Baja', 'Media', 'Alta', 'Urgente')),
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' -- seteamos que por default la tarea esta en pendiente
        CHECK (estado IN ('pendiente', 'en_progreso', 'completada')),
    tipo VARCHAR(30) CHECK (tipo IN ('riego', 'fertilizacion', 'poda', 'control_plagas', 'cosecha', 'otro')),
    fecha_limite DATE
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



