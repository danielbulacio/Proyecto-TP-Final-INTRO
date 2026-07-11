import { Pool } from "pg";

export const db = new Pool({
    user: "postgres",
    password: "password",
    host: "db",
    port: 5003,
    database: "postgres"
})

