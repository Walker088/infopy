
import { chromium, devices, Page } from 'playwright';
import axios, { AxiosResponse } from 'axios';
import * as fs from 'fs';

import { GetPgConnection } from "./lib/postgres"
import { getCrawledId, Infocasa, SaveInfoCasaItem } from './infocasa/type';
import { generateHash, stream2buffer } from './lib/imageHash';
import { GetCrawlerConfig } from './lib/config';

const config = GetCrawlerConfig();
const pg = GetPgConnection(config.database);
const infocasaRoot = "https://www.infocasas.com.py";
const infocasaImgRoot = `${__dirname}/downloaded/image/infocasa/alquiler`;

const codigoPostalPyUrl = (lat: string, lng: string): string => 
    `https://codigopostal.paraguay.gov.py/dinacopa/zona/geometry?latitud=${lat}&longitud=${lng}`;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const MAX_PAGE_NUM = 51;
const PAGE_TIMEOUT_MS = 15000;
const MAX_RETRY = 5;

const getPropertyInfoFromPage = async (page: Page): Promise<Infocasa> => {
    const property_id = page.url().split("/").slice(-1)[0];
    const property_name = await page.locator("h1.property-title").isVisible()
        ? await page.locator("h1.property-title").textContent()
        : null;
    const property_type = await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Tipo de Propiedad']/following::strong[1]").isVisible()
        ? await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Tipo de Propiedad']/following::strong[1]").textContent()
        : null;    
    const property_state = await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Estado']/following::strong[1]").isVisible()
        ?await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Estado']/following::strong[1]").textContent()
        : null;
    const country_id = "PY";
    const property_size_sqm = await page.locator("//div[contains(@class, 'show-icons')]//div[contains(@class, 'ant-space-item')]//*[text()[contains(.,'m²')]]").first().isVisible()
        ? await page.locator("//div[contains(@class, 'show-icons')]//div[contains(@class, 'ant-space-item')]//*[text()[contains(.,'m²')]]").first().textContent()
        : null;
    const edificados_sqm = await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='M² edificados']/following::strong[1]").isVisible()
        ? await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='M² edificados']/following::strong[1]").textContent()
        : null;
    const terraza_sqm = await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='M² de terraza']/following::strong[1]").isVisible()
        ? await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='M² de terraza']/following::strong[1]").textContent()
        : null;
    const terreno_sqm = await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='M² del terreno']/following::strong[1]").isVisible()
        ? await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='M² del terreno']/following::strong[1]").textContent()
        : null;
    const price = await page.locator("span.price").isVisible()
        ? await page.locator("span.price").textContent()
        : null;
    const nroom = await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Dormitorios']/following::strong[1]").isVisible()
        ? await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Dormitorios']/following::strong[1]").textContent()
        : null;
    const nbath = await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Baños']/following::strong[1]").isVisible()
        ? await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Baños']/following::strong[1]").textContent()
        : null;
    const nparking = await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Garajes']/following::strong[1]").isVisible()
        ? await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Garajes']/following::strong[1]").textContent()
        : null;
    const nplantas = await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Plantas']/following::strong[1]").isVisible()
        ? await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Plantas']/following::strong[1]").textContent()
        : null;
    const sobre = await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Sobre']/following::strong[1]").isVisible()
        ? await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Sobre']/following::strong[1]").textContent()
        : null;
    const barrio_privado = await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Barrio Privado']/following::strong[1]").isVisible()
        ? await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Barrio Privado']/following::strong[1]").textContent()
        : null;
    const gastos_comunes = await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Gastos Comunes']/following::strong[1]").isVisible()
        ? await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Gastos Comunes']/following::strong[1]").textContent()
        : null;
    const at_piso = await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Piso']/following::strong[1]").isVisible()
        ? await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Piso']/following::strong[1]").textContent()
        : null;
    const apartamentos_por_pisos = await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Apartamentos por Pisos']/following::strong[1]").isVisible()
        ? await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Apartamentos por Pisos']/following::strong[1]").textContent()
        : null;
    const cantidad_de_pisos = await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Cantidad de Pisos']/following::strong[1]").isVisible()
        ? await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Cantidad de Pisos']/following::strong[1]").textContent()
        : null;
    const acepta_mascotas = await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Acepta mascotas']/following::strong[1]").isVisible()
        ? await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Acepta mascotas']/following::strong[1]").textContent()
        : null;
    const contrato_minimo = await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Contrato Mínimo']/following::strong[1]").isVisible()
        ? await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Contrato Mínimo']/following::strong[1]").textContent()
        : null;
    const vivienda_social = await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Vivienda Social']/following::strong[1]").isVisible()
        ? await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Vivienda Social']/following::strong[1]").textContent()
        : null;
    const built_at = await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Año de Construcción']/following::strong[1]").isVisible()
        ? await page.locator("//div[contains(@class, 'technical-sheet')]//span[text()='Año de Construcción']/following::strong[1]").textContent()
        : null;
    const amenities = await page.locator("div.PY-facility-batch").first().isVisible()
        ? (await page.locator("div.PY-facility-batch span").allTextContents()).filter(s => s.length > 1)
        : null;
    const descr = await page.locator(".property-description").first().isVisible()
        ? (await page.locator(".property-description p").allTextContents()).join("\n")
        : null;
    const original_url = page.url();

    // Wait for coordinates to be fetched
    let coordinates_raw = '';
    let property_images_remote: string[] = [];
    page.on('request', (req) => {
        // If the URL doesn't include our keyword, ignore it
        if (req.url().includes('maps.googleapis.com/maps/api/streetview/metadata')) {
            const url = new URL(req.url());
            coordinates_raw = url.searchParams.get("location") || "";
        };
        if (req.url().includes("cdn2.infocasas.com.uy/repo/img/th.outside")) {
            property_images_remote.push(req.url());
        }
    });
    await page.getByRole('button', { name: 'Galería' }).click();
    let tried = 0
    while (coordinates_raw === "" && tried < MAX_RETRY) {
        await sleep(3000);
        tried += 1;
    }
    const infocasa = {
        property_id, property_name, property_type, property_state, country_id,
        property_size_sqm, edificados_sqm, terraza_sqm, terreno_sqm, price,
        nroom, nbath, nparking, nplantas, sobre,
        barrio_privado, gastos_comunes, at_piso, apartamentos_por_pisos, cantidad_de_pisos,
        acepta_mascotas, contrato_minimo, vivienda_social, built_at, amenities,
        descr, original_url, 
        coordinates_raw,
        longitud: '',
        latitud: '',
        cod_post: '',
        department_id: '',
        district_id: '',
        barrio_id: '',
        property_photos : [] as string[],
    };

    const splitted = coordinates_raw.split(",");
    if (splitted.length === 2) {
        const [latitud, longitud] = splitted;
        await axios.get(codigoPostalPyUrl(latitud, longitud))
            .then((response: AxiosResponse) => {
                const p = response?.data?.properties;
                if(p) {
                    infocasa.longitud = longitud;
                    infocasa.latitud = latitud;
                    infocasa.cod_post = p.cod_post;
                    infocasa.department_id = p.dpto;
                    infocasa.district_id = p.distrito;
                    infocasa.barrio_id = p.barloc;
                }
                console.log(`fetched coordinates ${longitud}, ${latitud}`);
            });
    }

    for (const [_, remote] of property_images_remote.entries()) {
        const folder = `${infocasaImgRoot}/${infocasa.property_id}`;
        await axios({
            method: "get",
            url: remote,
            responseType: "stream"
        }).then( async (response: AxiosResponse) => {
            const readStream = response.data;
            const buffer  = await stream2buffer(readStream);
            const checksum = await generateHash(buffer);
            const image = `${folder}/${checksum}.jpg`;

            if (!fs.existsSync(image)) {
                fs.mkdirSync(folder, { recursive: true });
                const ws = fs.createWriteStream(image);
                ws.write(buffer);
                ws.end();
            }
            infocasa.property_photos.push(image);
            console.log(`saved ${image}`);
        });
    }

    return infocasa;
};

(async () => {
    const browser = await chromium.launch({ headless: false, slowMo: 50 });
    //const browser = await chromium.launch();
    const context = await browser.newContext(devices['Desktop Chrome']);
    await context.route('**.png', route => route.abort());

    const crawled_id = await getCrawledId(pg);
    console.log(crawled_id);

    for (let pageNum = 1; pageNum < MAX_PAGE_NUM; pageNum++) {
        const page = await browser.newPage();
        page.setDefaultTimeout(PAGE_TIMEOUT_MS);
        try {
            await page.goto(`${infocasaRoot}/alquiler/inmuebles/pagina${pageNum}`);
            const properties = await page.locator("div.listingCard a.lc-data").all();

            // Popup handler
            const popup = page.getByRole('button', { name: 'Close' });
            if (await popup.isVisible()) {
                popup.click();
            }
            
            for (const ele of properties) {
                try {
                    const childpagePromise = page.waitForEvent('popup');
                    await ele.click();
                    const childpage = await childpagePromise;
                    const infocasa = await getPropertyInfoFromPage(childpage);
                    SaveInfoCasaItem(pg, infocasa, crawled_id);
                    childpage.close();
                    console.log(`downloaded item ${infocasa.property_id}`);
                } catch (error) {
                    console.log(error);
                }

                // Popup handler
                const popup = page.getByRole('button', { name: 'Close' });
                if (await popup.isVisible()) {
                    popup.click();
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            page.close();
        }
    }

    await context.close();
    await browser.close();
    await pg.end();
})();