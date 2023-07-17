
export type CrawlerConfig = {
    database: DataBase,
    crawlers: Array<Crawler>,
};

export type DataBase = {
    name: string,
    host: string,
    port: string,
    user: string,
    pass: string,
    dbName: string,
};

export type Crawler = {
    name:    string,
    target:  string,
    enabled: boolean,
    extra?:  Object,
};
