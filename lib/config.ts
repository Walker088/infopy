import * as fs from 'fs';
import { CrawlerConfig } from './types';

export function GetCrawlerConfig() {
    const crawlerConfig = JSON.parse(
        fs.readFileSync('crawlerconfig.json', 'utf8')
    ) as CrawlerConfig;
    return crawlerConfig;
}
