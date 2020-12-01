import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import {
  EProductUnitSubType,
  EProductUnitType,
  IAllergen,
  ICategory,
  IInputData,
  ISourceUnit,
  ISupplier,
  ISupplyingItem,
} from '../types';

config();

export const getAllergens = (allergensRaw: string, allergensConfig: IAllergen[]) => {
  if (!allergensRaw || allergensRaw === '') {
    return [];
  }

  const parsedAllergens = allergensRaw.replace(/\s/g, '').split(',');

  return parsedAllergens.reduce<string[]>((acc, curr): string[] => {
    const allergen = allergensConfig.find((allergenInfo) => allergenInfo.name.toLowerCase() === curr.toLowerCase());

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
    quantity: packagingQuantity,
    name: packagingUnitName !== '' ? packagingUnitName : "Unité d'achat",
    type: EProductUnitType.PIECE,
    subtype: EProductUnitSubType.CUSTOM,
    referenceUnit: units.find((unit) => unit.type === EProductUnitType.PIECE)?.id,
  };
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
