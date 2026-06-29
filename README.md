# Proyecto-TP-Final-INTRO
División:
Main-Parcela: Rodri
Interact-Clima: Marcos
Interact-Cultivo: Tomi
Main-Docker-Tareas: Ezequiel

a

MySQL:
Schemas:Parcela-Tareas
Seeds: Clima-Cultivo

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

Parcela:
id
cultivo_id 
clima_id
nombre
latitud
longitud

Cultivo:(Se podria poner algun valor default en los dias de cosecha dependiendo de tipo de cultivo)
id
nombre
id_parcela
variedad
temperatura_optima
dias_de_cosecha
mililitros

Clima:
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

