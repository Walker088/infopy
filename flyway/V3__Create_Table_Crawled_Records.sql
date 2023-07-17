CREATE EXTENSION IF NOT EXISTS postgis;

-- Create table types of data sources
CREATE TABLE IF NOT EXISTS public.crawled_types (
    type_id character varying(4) NOT NULL,
    type_name character varying(40) NOT NULL,
    src text NOT NULL,
    PRIMARY KEY (type_id)
);
COMMENT ON COLUMN public.crawled_types.type_id IS 'Format: T01 to T99';

-- Sequence for types
CREATE SEQUENCE IF NOT EXISTS public.types_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 99
    CACHE 1;
ALTER SEQUENCE public.types_seq OWNER TO postgres;

INSERT INTO public.crawled_types (
    type_id,
    type_name,
    src
)
VALUES
(
    CONCAT('T00', nextval('types_seq')),
    'infocasa-alquiler',
    'https://www.infocasas.com.py/alquiler'
),
(
    CONCAT('T00', nextval('types_seq')),
    'infocasa-venta',
    'https://www.infocasas.com.py/venta'
);

-- Table for crawled records
CREATE TABLE IF NOT EXISTS public.crawled_records (
    crawled_id character varying(10) NOT NULL,
    crawled_date date NOT NULL,
    source_type character varying(4) NOT NULL,
    crawled_at timestamp with time zone NOT NULL,
    PRIMARY KEY (crawled_id),
    FOREIGN KEY (source_type) REFERENCES crawled_types (type_id)
);
-- Sequence for suspicious patients
CREATE SEQUENCE IF NOT EXISTS public.crawled_records_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 999999999
    CACHE 1;
ALTER SEQUENCE public.crawled_records_seq OWNER TO postgres;
COMMENT ON COLUMN public.crawled_records.crawled_id IS 'Format: C000000001 to C999999999';
COMMENT ON COLUMN public.crawled_records.crawled_date IS 'Day of a record be crawled. Format: YYYY/MM/DD';
COMMENT ON COLUMN public.crawled_records.source_type IS 'The data source type, relates to table types';

-- Table of source infocasa
CREATE TABLE IF NOT EXISTS public.infocasa_alquiler_photos (
    property_id TEXT PRIMARY KEY,
    property_photos TEXT
);

-- Table of source infocasa
CREATE TABLE IF NOT EXISTS public.infocasa_alquiler (
    crawled_id character varying(10) NOT NULL,
    property_id TEXT NOT NULL,
    property_name TEXT NOT NULL,
    property_type TEXT,
    property_state TEXT,
    country_id character varying(4),
    department_id character varying(4),
    district_id character varying(4),
    barrio_id character varying(4),
    coordinates_raw TEXT,
    coordinates geometry(point, 4326),
    property_size_sqm TEXT,
    edificados_sqm TEXT,
    terraza_sqm TEXT,
    terreno_sqm TEXT,
    price TEXT,
    nroom TEXT,
    nbath TEXT,
    nparking TEXT,
    nplantas TEXT,
    sobre TEXT,
    barrio_privado TEXT,
    gastos_comunes TEXT,
    at_piso TEXT,
    apartamentos_por_pisos TEXT,
    cantidad_de_pisos TEXT,
    acepta_mascotas TEXT,
    contrato_minimo TEXT,
    vivienda_social TEXT,
    built_at TEXT,
    amenities TEXT[],
    descr TEXT,
    original_url TEXT,
    content_checksum TEXT,
    PRIMARY KEY (crawled_id, property_id),
    FOREIGN KEY (crawled_id) REFERENCES crawled_records (crawled_id),
    FOREIGN KEY (property_id) REFERENCES infocasa_alquiler_photos (property_id)
);
COMMENT ON COLUMN public.infocasa_alquiler.crawled_id IS 'Relates to public.crawled_records.crawled_id';
COMMENT ON COLUMN public.infocasa_alquiler.property_id IS 'Crawled from infocasa';
COMMENT ON COLUMN public.infocasa_alquiler.department_id IS 'Relates to table property_rdepartment';
COMMENT ON COLUMN public.infocasa_alquiler.district_id IS 'Relates to table property_district';
COMMENT ON COLUMN public.infocasa_alquiler.nroom IS 'Number of rooms in a property';
COMMENT ON COLUMN public.infocasa_alquiler.nbath IS 'Number of bathrooms in a property';
COMMENT ON COLUMN public.infocasa_alquiler.content_checksum IS 'SHA1 hash value of the parsed record';
