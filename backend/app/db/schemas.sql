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
    prioridad VARCHAR(20) NOT NULL DEFAULT 'pendiente',
        CHECK (prioridad IN ('Baja', 'Media' , 'Alta' , 'Urgente')),
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'cancelada')),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_limite DATE,
    fecha_completada TIMESTAMP,
);

CREATE INDEX idx_tareas_parcela_id ON tareas(parcela_id);
CREATE INDEX idx_tareas_estado ON tareas(estado);
CREATE INDEX idx_tareas_tipo ON tareas(tipo);

CREATE TABLE tareas_historial (
    id SERIAL PRIMARY KEY,
    tarea_id INT NOT NULL REFERENCES tareas(id) ON DELETE CASCADE,
    fecha TIMESTAMP NOT NULL DEFAULT NOW(),
    accion VARCHAR(30) NOT NULL
        CHECK (accion IN ('creacion', 'actualizacion', 'reasignacion', 'cambio_estado')),
    detalle TEXT,
    parcela_anterior_id INT REFERENCES parcelas(id),
    parcela_nueva_id INT REFERENCES parcelas(id),
    estado_anterior VARCHAR(20),
    estado_nuevo VARCHAR(20),
);

CREATE INDEX idx_tareas_historial_tarea_id ON tareas_historial(tarea_id);

