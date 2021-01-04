# Import file example

The raw excel import file example is located here: `./examples/FoodMeUp_import_fr.xlsx`

Its conversion towards a json file is located here: `./examples/convertcsv.json`

# Column matching

Columns have to be matched for the example to be a success.

Look at https://github.com/FoodMeUp/tools/blob/93fda5bdee021c4ab056f0e95c4b5087a060e55d/scripts/generateImportProductsFromJson/utils/normalizer.ts#L24 
Adapt the corresponding matching code to your need
All other fields will be ignored
