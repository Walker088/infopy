
import { chromium, devices } from 'playwright';

import { getCrawledId, insertCrawledRecord, GetPgConnection } from "./lib/postgres"
import { InfocasaAlquiler } from './crawlers/infocasa/alquiler';
import { GetCrawlerConfig } from './lib/config';

const config = GetCrawlerConfig();
const pg = GetPgConnection(config.database);


(async () => {
    const browser = await chromium.launch({ headless: false, slowMo: 50 });
    //const browser = await chromium.launch();
    const context = await browser.newContext(devices['Desktop Chrome']);
    await context.route('**.png', route => route.abort());

    const crawled_id = await getCrawledId(pg);
    if (typeof crawled_id !== "string") {
        console.log(`[ERROR] crawled_id should be a string, got ${crawled_id}`);
        return;
    }
    insertCrawledRecord(pg, crawled_id);
    for (const c of config.crawlers) {
        if (!c.enabled) {
            continue;
        }
        if (c.name === "infocasa-alquiler") {
            let crawler: InfocasaAlquiler;
            if (c?.extra) {
                const params: {
                    IMAGE_PATH?: string,
                    PAGE_TIMEOUT_MS?: number,
                    START_PAGE?: number,
                    END_PAGE?: number,
                    MAX_RETRY_COORDINATES?: number,
                } = c.extra;
                crawler = new InfocasaAlquiler(
                    crawled_id, c.target, 
                    `${__dirname}/${params.IMAGE_PATH}`, 
                    params.PAGE_TIMEOUT_MS || 15000,
                    params.START_PAGE || 1,
                    params.END_PAGE || 2,
                    params.MAX_RETRY_COORDINATES || 5,
                    pg, browser
                );
                await crawler.Crawl();
            }
        }
    }

    await context.close();
    await browser.close();
    await pg.end();
})();