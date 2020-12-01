import { v4 as uuidv4 } from 'uuid';
import {
  EProductUnitSubType,
  EProductUnitType,
  ICategory,
  IInputData,
  ISourceUnit,
  ISupplier,
  ISupplyingItem,
} from '../types';

// ALLERGENS

const allergensInfos = [
  {
    name: 'milk',
    id: '6b650b0f-fb4f-558a-96c7-7b3f6828d346',
  },
  {
    name: 'nuts',
    id: '3925c726-249c-5da6-b77a-44ec18993053',
  },
  {
    name: 'gluten',
    id: '5c76a9dd-c035-5a5c-9336-34ce279c92ee',
  },
  {
    name: 'soya',
    id: '5e837797-5ef8-58e6-8f79-2a99c56c6c7f',
  },
  {
    name: 'crustaceans',
    id: 'c69395fe-4b86-5856-86db-f964a3b38c6e',
  },
  {
    name: 'celery',
    id: '7d41fa82-a12c-5822-b47b-03ab51b18d29',
  },
  {
    name: 'lupin',
    id: 'b70c5d1e-f938-5ac8-9429-5e182c2ad3ba',
  },
  {
    name: 'peanuts',
    id: 'f7fdb049-3eca-5382-8dd2-02b1e4c2e53f',
  },
  {
    name: 'sesam',
    id: '4c0b616c-2e7c-5862-a01a-20dc0a928c58',
  },
  {
    name: 'eggs',
    id: '61067d5f-52f5-5de6-8092-c31f7fcbfa30',
  },
  {
    name: 'mustard',
    id: '0b74dbc5-308b-57f7-ab65-e36de42bb00c',
  },
  {
    name: 'molluscs',
    id: '4d269e28-7cfa-5871-95c3-ab1206d8afd1',
  },
  {
    name: 'sulphites',
    id: 'd783951e-6bba-5df5-adfc-241ed065f149',
  },
  {
    name: 'fish',
    id: 'c90de0fc-0137-5ef9-b0db-1e1762c2d07a',
  },
];

export const getAllergens = (allergensRaw: string) => {
  if (!allergensRaw || allergensRaw === '') {
    return null;
  }

  const parsedAllergens = allergensRaw.replace(/\s/g, '').split(',');

  return parsedAllergens.reduce<string[]>((acc, curr): string[] => {
    const allergen = allergensInfos.find((allergenInfo) => allergenInfo.name === curr.toLowerCase());

    return allergen ? [...acc, allergen.id] : acc;
  }, []);
};

// CATEGORIES

const categoriesReferences: ICategory[] = [];

export const getCategory = (categoryRaw: string): ICategory => {
  if (categoryRaw && categoryRaw !== '') {
    const exisitingCategory = categoriesReferences.find(
      (existingCategory) => existingCategory.name.toLowerCase() === categoryRaw.toLowerCase(),
    );

    if (exisitingCategory) {
      return exisitingCategory;
    }

    const category: ICategory = { name: categoryRaw, type: 'article' };

    categoriesReferences.push(category);

    return category;
  }

  return undefined;
};

// UNITS

const getSolidUnits = (): ISourceUnit[] => [
  {
    id: uuidv4(),
    name: 'g',
    subtype: EProductUnitSubType.G,
    type: EProductUnitType.WEIGHT,
  },
  {
    id: uuidv4(),
    name: 'kg',
    subtype: EProductUnitSubType.KG,
    type: EProductUnitType.WEIGHT,
  },
];

const getLiquidUnits = (): ISourceUnit[] => [
  ...getSolidUnits(),
  {
    id: uuidv4(),
    name: 'cL',
    subtype: EProductUnitSubType.CL,
    type: EProductUnitType.VOLUME,
  },
  {
    id: uuidv4(),
    name: 'L',
    subtype: EProductUnitSubType.L,
    type: EProductUnitType.VOLUME,
  },
];

const getStandardUnits = (): ISourceUnit[] => [
  ...getLiquidUnits(),
  {
    id: uuidv4(),
    name: 'mg',
    subtype: EProductUnitSubType.MG,
    type: EProductUnitType.WEIGHT,
  },
  {
    id: uuidv4(),
    name: 'mL',
    subtype: EProductUnitSubType.ML,
    type: EProductUnitType.VOLUME,
  },
];

export const getBasicUnitsFromType = (type: string): ISourceUnit[] => {
  switch (type.toLowerCase()) {
    case 'liquide':
      return getLiquidUnits();
    case 'solide':
      return getSolidUnits();
  }

  return [];
};

const getReferenceUnit = (units: ISourceUnit[], pieceUnit: string) => {
  const hasExistingReferenceUnit = units.find((unit) => unit.name.toLowerCase() === pieceUnit.toLowerCase());

  if (hasExistingReferenceUnit) {
    return hasExistingReferenceUnit;
  }

  const hasExistingStandardsReferenceUnit = getStandardUnits().find(
    (unit) => unit.name.toLowerCase() === pieceUnit.toLowerCase(),
  );

  if (hasExistingStandardsReferenceUnit) {
    return hasExistingStandardsReferenceUnit;
  }

  throw new Error('Il manque une unité de réference standard: mg, g, kg, mL, cL, L');
};

export const getUnitsFromUnitPiece = (data: IInputData): ISourceUnit[] => {
  const { type, pieceName, pieceUnit, pieceQuantity } = data;

  const units = getBasicUnitsFromType(type);

  return [
    ...units,
    {
      name: pieceName !== '' ? pieceName : 'Pièce',
      id: uuidv4(),
      quantity: pieceQuantity,
      subtype: EProductUnitSubType.CUSTOM,
      type: EProductUnitType.PIECE,
      referenceUnit: type.toLowerCase() !== 'divers' ? getReferenceUnit(units, pieceUnit).id : undefined,
    },
  ];
};

export const getConditonningUnitFromUnits = (data: IInputData, units: ISourceUnit[]): ISourceUnit => {
  const { packagingQuantity, packagingUnit, packagingUnitName } = data;

  if (packagingQuantity === 1 && packagingUnit.toLowerCase() === EProductUnitType.PIECE) {
    return units.find((unit) => unit.type === EProductUnitType.PIECE);
  }

  return {
    id: uuidv4(),
    name: packagingUnitName !== '' ? packagingUnitName : "Unité d'achat",
    type: EProductUnitType.PIECE,
    subtype: EProductUnitSubType.CUSTOM,
    referenceUnit: units.find((unit) => unit.type === EProductUnitType.PIECE)?.id,
  };
};

export const smartUnitsMerge = (unitsA: ISourceUnit[], unitsB: ISourceUnit[]): ISourceUnit[] => {
  const units = unitsA;

  unitsB.forEach((unitB) => {
    if (!units.find((unit) => unitB.id === unit.id)) {
      units.push(unitB);
    }
  });

  return units;
};

// SUPPLYING ITEMS

const suppliersReferences: ISupplier[] = [];

const getSupplier = (supplierName: string): ISupplier => {
  if (!supplierName || supplierName === '') {
    throw new Error('Un nom de supplier doit être saisit');
  }

  const exisitingSupplier = suppliersReferences.find(
    (exisitingSupplier) => exisitingSupplier.name.toLowerCase() === supplierName.toLowerCase(),
  );

  if (exisitingSupplier) {
    return exisitingSupplier;
  }

  const supplier: ISupplier = { name: supplierName, id: uuidv4() };

  suppliersReferences.push(supplier);

  return supplier;
};

const getAmountUnit = (amountUnitName: string, units: ISourceUnit[], packagingUnit: ISourceUnit): ISourceUnit => {
  const unitName = amountUnitName.toLowerCase();

  if (unitName === "unité d'achat") {
    return packagingUnit;
  }

  if (unitName === 'piece') {
    const piecesUnits = units.filter((unit) => unit.type === EProductUnitType.PIECE);

    // For 1 piece in packaging units we reuse the piece unit directly so a new piece unit is not created
    if (piecesUnits.length === 1) {
      return piecesUnits[0];
    }

    // When we have 2 unit pieces it means we have more than 1 piece contained in packagingUnit so we get the original piece and not the conditonning piece
    return piecesUnits.find((unit) => unit.type === EProductUnitType.PIECE && unit.id !== packagingUnit.id);
  }

  const amountUnit = units.find((unit) => unit.name === unitName);

  if (!amountUnit) {
    throw new Error("Aucune unité existante n'a été trouvé pour l'unité de facturation");
  }

  return amountUnit;
};

export const getSupplyingItem = (
  data: IInputData,
  units: ISourceUnit[],
  packagingUnit: ISourceUnit,
): ISupplyingItem => {
  const { supplyingItemSupplierName, supplyingItemCode, supplyingItemAmount, supplyingItemAmountUnit } = data;

  return {
    amountUnit: getAmountUnit(supplyingItemAmountUnit, units, packagingUnit).id,
    amount: supplyingItemAmount,
    code: supplyingItemCode,
    id: uuidv4(),
    supplier: getSupplier(supplyingItemSupplierName),
    unit: packagingUnit.id,
  };
};
