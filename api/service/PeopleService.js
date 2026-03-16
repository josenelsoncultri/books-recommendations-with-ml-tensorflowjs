import { getConnection } from "../modules/db.js";

export class PeopleService {
    async getPeopleAsync() {
        try {
            const pool = await getConnection();
            const result = await pool
                .request()
                .query("SELECT * FROM [Pessoas]");

            return result.recordset;
        } catch (err) {
            console.error("Erro ao buscar pessoas:", err);
            throw err;
        }
    }
}