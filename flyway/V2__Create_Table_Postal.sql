-- Source: https://www.datos.gov.py/dataset/nuevo-c%C3%B3digo-postal-del-paraguay

CREATE TABLE IF NOT EXISTS public.ref_departments (
    country_id VARCHAR(2), -- ISO_3166-1_Alpha-2
    department_id VARCHAR(3),
    department_name TEXT,
    PRIMARY KEY (country_id, department_id)
);

CREATE TABLE IF NOT EXISTS public.ref_districts (
    country_id VARCHAR(2),
    department_id VARCHAR(3),
    district_id VARCHAR(4),
    district_name TEXT,
    PRIMARY KEY (country_id, department_id, district_id)
);

CREATE TABLE IF NOT EXISTS public.ref_neighborhoods (
    country_id VARCHAR(2),
    department_id VARCHAR(3),
    district_id VARCHAR(4),
    postal_cod VARCHAR(10),
    neighborhood_id VARCHAR(6),
    neighborhood_name TEXT,
    area VARCHAR(2),
    zona_id INT4,
    geom geometry(polygon, 4326),
    PRIMARY KEY (country_id, department_id, district_id, neighborhood_id, postal_cod)
);
