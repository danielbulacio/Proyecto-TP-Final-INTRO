
División: Parcela: Rodri
Detalle de parcela: Marcos
Cultivos: Tomi
Main-Docker-Tareas: Ezequiel

## ESQUEMA PARTES
[\[a\](https://excalidraw.com/#room=1e171603359db08b33fe,HzJasG4emjEsQicvmKIE9w)](https://excalidraw.com/#room=1e171603359db08b33fe,HzJasG4emjEsQicvmKIE9w)

# COMO LEVANTAR PROYECTO
1. TENER docker destop abierto
2. cd Proyecto-TP-Final-INTRO/backend/
3. Levantar los contenedores: 1era vez - docker compose up --build (demas veces) docker compose up
4. Verificar que anda : curl http://localhost:8000/health  

## Parcela:
id
cultivo_id 
clima_id
nombre
latitud
longitud

## Cultivo: (opciones predefinidas)
id
nombre_cultivo
id_parcela
tipo
temperatura_optima
dias_de_cosecha
mililitros_necesarios

## detalle parcela:
id
id_parcela
temperatura_actual
precipitacion_actual
humedad_suelo
evapotranspiracion

Tareas:
id
id_parcela
tarea
hecho
...
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
    temperatura_actual DECIMAL(5,2),
    precipitacion_actual DECIMAL(5,2),
    humedad_suelo DECIMAL(5,2),
    evapotranspiracion DECIMAL(5,2)
);

CREATE TABLE tareas (
    id SERIAL PRIMARY KEY,
    parcela_id INT NOT NULL REFERENCES parcelas,
    tarea VARCHAR(255) NOT NULL,
    hecho BOOLEAN NOT NULL DEFAULT FALSE
);

Estructuración:
Directorios:
#node_modules: contiene todas las dependencas 
~Frontend:
#public: archivos estaticos que se acceden directamente del navegador(pagina principal)
#styles: Hoja de estilo del CSS
#Pages: representa las rutas web para acceder a la/s paginas/s
~Backend
#Routes: Formas o caminos en el que el cliente ingresa sus datos
#Controllers: Resuelve e implementa la logica de negocios
#Models: capa de datos
El contolador actua de intermediario, la ruta envia los datos al controlador y el controlador los envia al modelo, y viceversa.
#Config: Son variables y ajustes que definen cómo se comporta la API en diferentes entornos
#Helpers: Funciones de utilidad que se repiten a lo largo del proyecto(su objetivo es evitar funciones duplicadas)
Carpetas: 
#.gitignore
#package.json: archivo que define todo el proyecto
#package-log.json: guarda las versiones de las dependencias instaladas(Se genera automaticamente)
#Next.config.js:(podria ir dentro de config) como se comporta o interactua el usuario con la pagina
#Index.js / app.js: Crea la aplicacion y define las rutas de interaccion con los datos
#.env: solo para definir el puerto
#.eslintrc.json: lo podriamos usar para evitar errores y mantener una misma logica en el uso de variables(osea asignacion de nombres a variables, como estructurar las funciones,etc)
#README.md: documentacion del proyecto
