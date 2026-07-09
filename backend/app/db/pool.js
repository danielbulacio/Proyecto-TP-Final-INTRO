import { Pool } from "pg";

//por ahora no se agregan las env variables, se hace de manera directa, pero se va a cambiar en el futuro
export const db = new Pool({
    user: "postgres",
    password: "password",
    host: "db",
    port: 5003,
    database: "postgres"
})