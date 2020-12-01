export interface IInputData {
  code: string;
  name: string;
  category: string;
  allergens: string;
  type: string;
  pieceName: string;
  pieceQuantity: number;
  pieceUnit: string;
  packagingUnitName: string;
  packagingQuantity: number;
  packagingUnit: string;
  supplyingItemAmount: number;
  supplyingItemAmountUnit: string;
  supplyingItemCode: string;
  supplyingItemSupplierName: string;
}

export interface ISupplier {
  id: string;
  name: string;
}

export interface ISupplyingItem {
  amount: number;
  amountUnit: string;
  code?: string;
  id: string;
  supplier: ISupplier;
  unit: string;
}

export enum EProductType {
  Food = 'food',
  Packaging = 'packaging',
  Other = 'other',
}

export enum EProductUnitType {
  PIECE = 'piece',
  VOLUME = 'volume',
  WEIGHT = 'weight',
}

export enum EProductUnitSubType {
  CL = 'cl',
  CUSTOM = 'custom',
  G = 'g',
  KG = 'kg',
  L = 'l',
  MG = 'mg',
  ML = 'ml',
  PORTION = 'portion',
  RECIPE = 'recipe',
}

export interface ISourceUnit {
  id: string;
  name: string;
  quantity?: number;
  referenceUnit?: string | ISourceUnit;
  subtype: EProductUnitSubType;
  type: EProductUnitType;
}
export interface ICategory {
  name: string;
  type: 'article' | 'recipe';
}

export interface IProductImport {
  allergens: string[];
  category: ICategory;
  code: string;
  name: string;
  supplyingItems: ISupplyingItem[];
  type: EProductType;
  units: ISourceUnit[];
}
