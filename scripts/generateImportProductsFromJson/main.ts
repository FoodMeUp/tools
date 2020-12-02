import { config } from 'dotenv';
import got from 'got';
import { writeFileSync } from 'fs';
import { extractDataFromJSON, mapNormalizedDataToImportProducts, mapRawDataToNormalizedData } from './utils/normalizer';
import { IAllergen } from './types';
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

config();

const argv = yargs(hideBin(process.argv)).argv;

(async () => {
  try {
    const response = await got(`${process.env.API_URL}/config?include=allergens`, {
      headers: {
        language: 'en_US',
      },
      https: {
        rejectUnauthorized: false,
      },
    }).json();
    const data = extractDataFromJSON(argv.source);

    const allergensConfig: IAllergen[] = (response as { allergens: IAllergen[] }).allergens;

    if (data) {
      const dataToImport = mapRawDataToNormalizedData(data);
      const productsToImport = mapNormalizedDataToImportProducts(dataToImport, allergensConfig);

      const importStr = JSON.stringify(productsToImport);
      writeFileSync(`dist/${argv.destination || 'importBulk.json'}`, importStr);
    }
  } catch (error) {
    console.log(error);
  }
})();
