import { Browser } from "playwright";
import postgres from "postgres";

export interface Crawler {
    crawlerId: string;
    target:    string;
    pg:        postgres.Sql<{}>;
    browser:   Browser;

    Crawl(): Promise<void | CrawlerErr>;
    Export(data: CrawledData): Promise<void | CrawlerErr>;
};

export interface CrawledData {};

export enum CrawlerErr {

};
