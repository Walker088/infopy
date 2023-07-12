
export type CrawlerConfig = {
    database: DataBase
}

export type DataBase = {
    name: string,
    host: string,
    port: string,
    user: string,
    pass: string,
    dbName: string,
}
