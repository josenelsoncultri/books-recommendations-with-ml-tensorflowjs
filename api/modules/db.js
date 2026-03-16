import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT),

    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },

    options: {
        instanceName: process.env.DB_INSTANCE,
        encrypt: false,
        trustServerCertificate: true
    }
};

let poolPromise;

export function getConnection() {

    if (!poolPromise) {

        poolPromise = new sql.ConnectionPool(config)
            .connect()
            .then(pool => {
                console.log("Conectado ao SQL Server");
                return pool;
            })
            .catch(err => {
                poolPromise = null;
                console.error("Erro ao conectar no SQL Server:", err);
                throw err;
            });

    }

    return poolPromise;
}