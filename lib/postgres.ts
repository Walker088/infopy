import postgres, { PostgresError } from 'postgres'
import { DataBase } from './types';

export function GetPgConnection(c: DataBase) {
    const connstr = `postgres://${c.user}:${c.pass}@${c.host}:${c.port}/${c.dbName}`;
    return postgres(connstr, {
        //debug: (connection, query, params, types) => {
        //    console.log(`conn: ${connection}`);
        //    console.log(`query: ${query}`);
        //    console.log(`params: ${params}`);
        //    console.log(`types: ${types}`);
        //},
        //types: {
        //    point: {
        //        to: 600,
        //        from: [600],
        //        serialize: ([lng, lat]: [string, string]) => `(${lng},${lat})`,
        //        parse: (x: string) => x.slice(1, -1).split(',').map(x => +x)
        //    }
        //}
    });
}

export const getCrawledId = async (pg: postgres.Sql<{}>) => {
    const crawled_id = await pg<{crawled_id: string}[]>`
        SELECT CONCAT('C', TO_CHAR(NEXTVAL('public.crawled_records_seq'), 'fm000000000')) crawled_id;
    `
    .then(c => c[0].crawled_id)
    .catch( (reason: PostgresError) => {
        console.log(reason);
        return reason;
    });
    return crawled_id;
};

export const insertCrawledRecord = async (pg: postgres.Sql<{}>, crawledId: string) => {
    await pg`
        INSERT INTO crawled_records (crawled_id, crawled_date, source_type, crawled_at)
        VALUES (
            ${crawledId}, CURRENT_DATE, 'T001', CURRENT_TIMESTAMP
        )
        ON CONFLICT (crawled_id) DO UPDATE 
            SET crawled_date = CURRENT_DATE, crawled_at = CURRENT_TIMESTAMP;
    `.catch( (reason: PostgresError) => {
        console.log(reason);
    });
};
