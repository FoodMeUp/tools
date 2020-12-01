/**
 * HOW TO RUN SCRIPT:
 *
 * 1. npm install typescript node-ts uuid
 * 2. npx ts-node -T generateImportProductsFromJson/main.ts -- file.json
 */

import { config } from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';

import { EProductType, IInputData, IProductImport } from './types';
import {
  getAllergens,
  getCategory,
  getConditonningUnitFromUnits,
  getSupplyingItem,
  getUnitsFromUnitPiece,
  smartUnitsMerge,
} from './utils';

config();

// FUNCTIONS

const extractDataFromJSON = (): object[] => {
  try {
    const fileName = process.argv[2];
    const rawdata = readFileSync(`${process.cwd()}/${fileName}`);
    const data: object[] = JSON.parse(rawdata.toString());

    return data;
  } catch (e) {
    console.error(e);
    return null;
  }
};

const mapRawDataToNormalizedData = (data: object[]) =>
  data.map(
    (rawProduct): IInputData => {
      const keys = Object.keys(rawProduct);

      return {
        code: rawProduct[keys[0]],
        name: rawProduct[keys[1]],
        category: rawProduct[keys[2]],
        allergens: rawProduct[keys[3]],
        type: rawProduct[keys[4]],
        pieceName: rawProduct[keys[5]],
        pieceQuantity: rawProduct[keys[6]],
        pieceUnit: rawProduct[keys[7]],
        packagingUnitName: rawProduct[keys[8]],
        packagingQuantity: rawProduct[keys[9]],
        packagingUnit: rawProduct[keys[10]],
        supplyingItemAmount: rawProduct[keys[11]],
        supplyingItemAmountUnit: rawProduct[keys[12]],
        supplyingItemCode: rawProduct[keys[13]],
        supplyingItemSupplierName: rawProduct[keys[14]],
      };
    },
  );

const mapNormalizedDataToImportProducts = (data: IInputData[]) => {
  return data.reduce((acc, curr, index): IProductImport[] => {
    const { allergens, category, code, name, type } = curr;

    try {
      const units = getUnitsFromUnitPiece(curr);
      const packagingUnit = getConditonningUnitFromUnits(curr, units);

      return [
        ...acc,
        {
          allergens: getAllergens(allergens),
          code,
          category: getCategory(category),
          name,
          supplyingItems: [getSupplyingItem(curr, units, packagingUnit)],
          type: type.toLowerCase() !== 'divers' ? EProductType.Food : EProductType.Other,
          units: smartUnitsMerge(units, [packagingUnit]),
        },
      ];
    } catch (e) {
      console.error(`Objet numéro ${index}: ${(e as Error).message}`);
    }

    return acc;
  }, []);
};

// MAIN

const data = extractDataFromJSON();
const util = require('util');

if (data) {
  const dataToImport = mapRawDataToNormalizedData(data);
  const productsToImport = mapNormalizedDataToImportProducts(dataToImport);

  // console.log(util.inspect(productsToImport, false, null, true));

  const importStr = JSON.stringify(productsToImport);
  writeFileSync('importBulk.json', importStr);
}
