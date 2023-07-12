import postgres from 'postgres'
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