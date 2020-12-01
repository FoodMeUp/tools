/**
 * HOW TO RUN SCRIPT:
 *
 * 1. npm install typescript node-ts uuid
 * 2. npx ts-node -T generateImportProductsFromJson/main.ts -- file.json
 */

import { config } from 'dotenv';
import { writeFileSync } from 'fs';
import { extractDataFromJSON, mapNormalizedDataToImportProducts, mapRawDataToNormalizedData } from './utils/normalizer';
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

config();

const argv = yargs(hideBin(process.argv)).argv;

const data = extractDataFromJSON(argv.source);

if (data) {
  const dataToImport = mapRawDataToNormalizedData(data);
  const productsToImport = mapNormalizedDataToImportProducts(dataToImport);

  const importStr = JSON.stringify(productsToImport);
  writeFileSync(`dist/${argv.destination || 'importBulk.json'}`, importStr);
}
