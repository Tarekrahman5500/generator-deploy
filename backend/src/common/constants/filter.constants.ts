/* --------------------------------
 * CATEGORY → FIELD MAP (lowercase)
 * -------------------------------- */
/* eslint-disable @typescript-eslint/naming-convention */
export const CATEGORY_FIELDS: Record<string, string[]> = {
  'generator sets': [
    'Model',
    'Phases',
    'Engine Brand',
    'Alternator Brand',
    'Controller Type',
    'PRIME POWER (PRP) KVA DG SET',
    'STANDBY POWER POWER (LTP) KVA DG SET',
    'Frequency (HZ)',
    'Voltage (V) VAC',
  ],
  'marine generators': [
    'model',
    'engine brand',
    'alternator brand',
    'prime power kva',
    'standby power kva',
    'speed',
    'voltage',
    'frequency',
    'cooling system',
  ],

  'air compressors': [
    'model',
    'compressor type',
    'drive type',
    'working pressure bar',
    'flow rate (m3/min)',
    'motor power (kw)',
    'tank size (l)',
    'aftercooler (y/n)',
    'dryer (y/n)',
    'noise level db(a)',
  ],

  'light towers': [
    'model',
    'light type',
    'power source',
    'lumen output',
    'mast height (m)',
    'genset output (kva)',
    'fuel tank (l)',
    'autonomy (h)',
    'trailer (y/n)',
    'noise level db(a)',
  ],

  'distribution panels': [
    'model',
    'rated current (a)',
    'voltage',
    'phase',
    'frequency',
    'ip rating',
    'outlet count',
    'outlet type',
    'metering (y/n)',
    'application',
  ],

  'ups systems': [
    'model',
    'energy (kwh)',
    'power (kw)',
    'battery chemistry',
    'inverter included (y/n)',
    'grid type',
    'cooling',
    'cycle life',
    'ip rating',
    'application',
  ],

  'battery energy storage (bess)': [
    'model',
    'ups topology',
    'power (kva)',
    'power (kw)',
    'phase',
    'input voltage',
    'output voltage',
    'battery type',
    'runtime (min)',
    'form factor',
  ],

  'solar panels': [
    'model',
    'power (wp)',
    'cell type',
    'module type',
    'efficiency (%)',
    'vmp (v)',
    'imp (a)',
    'voc (v)',
    'isc (a)',
    'dimensions (mm)',
  ],

  inverters: [
    'model',
    'inverter type',
    'ac power (kw)',
    'phase',
    'mppt count',
    'max pv voltage (v)',
    'battery compatible (y/n)',
    'communication',
    'ip rating',
    'warranty (yrs)',
  ],

  forklifts: [
    'model',
    'power type',
    'capacity (kg)',
    'lift height (mm)',
    'mast type',
    'battery (v/ah)',
    'charger included (y/n)',
    'tyre type',
    'aisle width (mm)',
    'application',
  ],

  'agricultural systems': [
    'model',
    'system type',
    'power source',
    'power (kw)',
    'flow rate',
    'head (m)',
    'voltage',
    'fuel tank (l) / pv size (kwp)',
    'autonomy (h)',
    'application',
  ],

  'containers & canopies': [
    'model',
    'enclosure type',
    'length (mm)',
    'width (mm)',
    'height (mm)',
    'soundproof (y/n)',
    'noise level db(a)',
    'ip rating',
    'corrosion protection',
    'application',
  ],
};

/* --------------------------------
 * FIELD TYPES (all as string)
 * -------------------------------- */
export const FIELD_TYPE: Record<string, 'string'> = {};

Object.values(CATEGORY_FIELDS).forEach((fields) => {
  fields.forEach((f) => {
    FIELD_TYPE[f.toLowerCase()] = 'string';
  });
});

export const OrderableFields = {
  'generator sets': ['PRIME POWER (PRP) KW DG SET'],
  'marine generators': ['PRIME POWER KVA'],

  'air compressors': ['FLOW RATE (M3/MIN)'],

  'light towers': ['LUMEN OUTPUT'],

  'distribution panels': ['RATED CURRENT (A)'],

  'ups systems': ['ENERGY (KWH)'],

  'battery energy storage (bess)': ['POWER (KVA)'],

  'solar panels': ['POWER (WP)'],

  inverters: ['AC POWER (KW)'],

  forklifts: ['CAPACITY (KG)'],

  'agricultural systems': ['POWER (KW)'],

  'containers & canopies': ['ENCLOSURE TYPE'],
};
