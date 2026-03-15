import sql from "mssql";
import dotenv from "dotenv";

debugger
dotenv.config();
debugger;

const config = {
    connectionString: process.env.CONNECTION_STRING,
    options: {
        encrypt: true,
        trustServerCertificate: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool;

export async function getConnection() {
    try {
        debugger
        if (!pool) {
            pool = await sql.connect(config);
        }

        return pool;
    } catch (err) {
        console.error("Erro ao conectar no SQL Server:", err);
        throw err;
    }
}