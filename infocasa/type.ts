import postgres, { PostgresError } from "postgres";

export type Infocasa = {
    property_id: string | null,
    property_name: string | null,
    property_type: string | null,
    property_state: string | null,
    country_id: string | null,
    property_size_sqm: string | null,
    edificados_sqm: string | null,
    terraza_sqm: string | null,
    terreno_sqm: string | null,
    price: string | null,
    nroom: string | null,
    nbath: string | null,
    nparking: string | null,
    nplantas: string | null,
    sobre: string | null,
    barrio_privado: string | null,
    gastos_comunes: string | null,
    at_piso: string | null,
    apartamentos_por_pisos: string | null,
    cantidad_de_pisos: string | null,
    acepta_mascotas: string | null, 
    contrato_minimo: string | null, 
    vivienda_social: string | null, 
    built_at: string | null, 
    amenities: string[] | null,
    descr: string | null, 
    original_url: string | null, 

    coordinates_raw: string,
    longitud: string | null,
    latitud: string | null,
    cod_post?: string,
    department_id?: string,
    district_id?: string,
    barrio_id?: string,

    property_photos: string[],
}

interface crawled_records_seq {
    crawled_id: string
}

export const getCrawledId = async (pg: postgres.Sql<{}>) => {
    const crawled_id = await pg<crawled_records_seq[]>`
        SELECT CONCAT('C', TO_CHAR(NEXTVAL('public.crawled_records_seq'), 'fm000000000')) crawled_id;
    `
    .then(c => c[0].crawled_id);
    return crawled_id;
};

export const SaveInfoCasaItem = async (pg: postgres.Sql<{}>, p: Infocasa, crawled_id: string) => {
    await pg.begin(async pg => {
        await pg`
            INSERT INTO crawled_records (crawled_id, crawled_date, source_type, crawled_at)
            VALUES (
                ${crawled_id}, CURRENT_DATE, 'T001', CURRENT_TIMESTAMP
            )
            ON CONFLICT (crawled_id) DO UPDATE 
                SET crawled_date = CURRENT_DATE, crawled_at = CURRENT_TIMESTAMP;
        `.catch( (reason: PostgresError) => {
            console.log(reason);
        });

        const geom = p.longitud && p.latitud ? `ST_GeomFromText('POINT(${p.longitud} ${p.latitud})', 4326)` : "NULL";
        await pg`
            INSERT INTO infocasa_alquiler (
                crawled_id, property_id, property_name,
                property_type, property_state, country_id,
                department_id, district_id, barrio_id,
                coordinates_raw, 
                coordinates, 
                property_size_sqm, edificados_sqm, terraza_sqm, 
                terreno_sqm, price, nroom, 
                nbath, nparking, nplantas, 
                sobre, barrio_privado, gastos_comunes,
                at_piso, apartamentos_por_pisos, cantidad_de_pisos, acepta_mascotas,
                contrato_minimo, vivienda_social, built_at,
                amenities, descr, original_url, property_photos
            )
            VALUES (
                ${crawled_id}, ${p.property_id}, ${p.property_name},
                ${p.property_type}, ${p.property_state}, ${p.country_id},
                ${p.department_id || ""}, ${p.district_id || ""}, ${p.barrio_id || ""}, 
                ${p.coordinates_raw},
                ${pg.unsafe(geom)},
                ${p.property_size_sqm}, ${p.edificados_sqm}, ${p.terraza_sqm},
                ${p.terreno_sqm}, ${p.price}, ${p.nroom},
                ${p.nbath}, ${p.nparking}, ${p.nplantas},
                ${p.sobre}, ${p.barrio_privado}, ${p.gastos_comunes},
                ${p.at_piso}, ${p.apartamentos_por_pisos}, ${p.cantidad_de_pisos}, ${p.acepta_mascotas}, 
                ${p.contrato_minimo}, ${p.vivienda_social}, ${p.built_at},
                ${p.amenities}, ${p.descr}, ${p.original_url}, ${p.property_photos}
            ) ON CONFLICT (crawled_id, property_id) DO NOTHING;
        `.catch( (reason: PostgresError) => {
            console.log(reason);
        });
    });
}
