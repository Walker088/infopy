import {afterAll, beforeAll, describe, expect, test} from '@jest/globals';
import { GetCrawlerConfig } from './config';
import { GetPgConnection } from "./postgres";
import postgres from 'postgres';

let pg: postgres.Sql<{}>;

describe('TEST postgres.GetPgConnection', () => {
    beforeAll(() => {
        const config = GetCrawlerConfig();
        pg = GetPgConnection(config.database);
    });

    afterAll(async () => {
        await pg.end();
    });

    test('GetPgConnection.query SELECT 1 should be 1', async () => {
        const resultSet = await pg`SELECT 1 one`;
        const one = resultSet[0].one;
        expect(one).toBe(1);
        pg.end();
    });
});

