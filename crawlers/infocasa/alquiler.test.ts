import {afterAll, beforeAll, describe, test} from '@jest/globals';
import { Browser, BrowserContext, chromium, devices } from 'playwright';
import postgres from 'postgres';
import * as fs from 'fs';

import { GetCrawlerConfig } from '../../lib/config';
import { GetPgConnection } from '../../lib/postgres';
import { InfocasaAlquiler } from './alquiler';

let pg: postgres.Sql<{}>;
let crawler: InfocasaAlquiler;
let browser: Browser;
let context: BrowserContext;

const crawlerId = "TEST001";
const crawlerConfig = {
    name: "infocasa-alquiler",
    target: "https://www.infocasas.com.py/alquiler/inmuebles",
    extra: {
        IMAGE_PATH: "downloaded/image/infocasa/alquiler",
        PAGE_TIMEOUT_MS: 15000,
        START_PAGE: 1,
        END_PAGE: 2,
        MAX_RETRY_COORDINATES: 5
    }
};

describe('TEST crawlers.infocasa.alquiler', () => {
    beforeAll(async () => {
        const config = GetCrawlerConfig();
        pg = GetPgConnection(config.database);
        browser = await chromium.launch();
        //browser = await chromium.launch({ headless: false, slowMo: 50 });
        context = await browser.newContext(devices['Desktop Chrome']);

        crawler = new InfocasaAlquiler(
            crawlerId,
            crawlerConfig.target,
            `${__dirname}/${crawlerConfig.extra.IMAGE_PATH}`, 
            crawlerConfig.extra.PAGE_TIMEOUT_MS,
            crawlerConfig.extra.START_PAGE,
            crawlerConfig.extra.END_PAGE,
            crawlerConfig.extra.MAX_RETRY_COORDINATES,
            pg,
            browser
        );

        await pg`
        INSERT INTO crawled_records (crawled_id, crawled_date, source_type, crawled_at)
        VALUES (
            ${crawlerId}, CURRENT_DATE, 'T001', CURRENT_TIMESTAMP
        )
        ON CONFLICT (crawled_id) DO UPDATE 
            SET crawled_date = CURRENT_DATE, crawled_at = CURRENT_TIMESTAMP;
        `;
    });

    afterAll(async () => {
        await pg.begin(async pg => {
            await pg`
            DELETE FROM infocasa_alquiler WHERE crawled_id = ${crawlerId};
            `;
            await pg`
            DELETE FROM infocasa_alquiler_photos 
            WHERE property_id NOT IN (SELECT property_id FROM infocasa_alquiler);
            `;
            await pg`
            DELETE FROM crawled_records WHERE crawled_id = ${crawlerId};
            `;
        });
        fs.rmSync(`${__dirname}/downloaded`, { recursive: true, force: true });

        await pg.end();
        await context.close();
        await browser.close();
    });

    test('InfocasaAlquiler.Export', async () => {
        const page = await browser.newPage();
        page.setDefaultTimeout(crawler.PAGE_TIMEOUT_MS);
        await page.goto(`${crawlerConfig.target}/pagina1`);
        const property = page.locator("div.listingCard a.lc-data").first();
        // Popup handler
        const popup = page.getByRole('button', { name: 'Close' });
        if (await popup.isVisible()) {
            popup.click();
        }

        const childpagePromise = page.waitForEvent('popup');
        await property.click();
        const childpage = await childpagePromise;
        const infocasa = await crawler.getPropertyInfoFromPage(childpage);
        await crawler.Export(infocasa);
        await crawler.Export(infocasa);
    }, 150000);
});
