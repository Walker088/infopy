import {describe, expect, test} from '@jest/globals';
import { GetCrawlerConfig } from './config';

describe('TEST config.GetCrawlerConfig', () => {
    test('GetCrawlerConfig should be a CrawlerConfig', () => {
        const c = GetCrawlerConfig();
        expect(c.database.name).toBeDefined();
        expect(c.database.host).toBeDefined();
        expect(c.database.port).toBeDefined();
        expect(c.database.user).toBeDefined();
        expect(c.database.pass).toBeDefined();
        expect(c.database.dbName).toBeDefined();
    });
});
