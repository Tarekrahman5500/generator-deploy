export enum VoltageUnit {
  V = 'V',
  MV = 'MV',
  MVV = 'mV',
}

export enum PowerSource {
  GASOLINE = 'Gasoline',
  ELECTRIC = 'Electric',
}

export enum PumpType {
  RECIPROCATING = 'Reciprocating',
  SCREW = 'Screw',
}

export enum Topology {
  ONLINE = 'Online',
  LINE_INTERACTIVE = 'Line-interactive',
}

export enum BatteryType {
  LITHIUM_ION = 'Lithium-ion',
  VRLA = 'VRLA',
}

export enum MastTypeTower {
  MANUAL = 'Manual',
  HYDRAULIC = 'Hydraulic',
}

export enum TrailerType {
  TWO_WHEEL = 'Two-wheel',
  FOUR_WHEEL = 'Four-wheel',
  COMPACT_TRAILER = 'Compact trailer',
  HEAVY_DUTY_TRAILER = 'Heavy-duty trailer',
  OFF_ROAD_TRAILER = 'Off-road trailer',
}

export enum PowerSourceTower {
  DIESEL = 'Diesel',
  ELECTRIC = 'Electric',
  SOLAR = 'Solar',
}

export enum BreakerType {
  MCB = 'MCB',
  MCCB = 'MCCB',
  ACB = 'ACB',
  VCB = 'VCB',
  OCB = 'OCB',
  SF6 = 'SF6',
  RCCB = 'RCCB',
  RCBO = 'RCBO',
  ELCB = 'ELCB',
  MPCB = 'MPCB',
}

export enum SwitchType {
  ISOLATOR = 'Isolator',
  MCB_MAIN = 'MCB Main Switch',
  MCCB = 'MCCB',
  RCCB_MAIN = 'RCCB Main Switch',
  RCBO_MAIN = 'RCBO Main Switch',
  ACB_MAIN = 'ACB Main Switch',
}

export enum IpRating {
  IP20 = 'IP20',
  IP30 = 'IP30',
  IP40 = 'IP40',
  IP42 = 'IP42',
  IP44 = 'IP44',
  IP54 = 'IP54',
  IP55 = 'IP55',
  IP65 = 'IP65',
  IP66 = 'IP66',
  IP67 = 'IP67',
}

export enum SwitchingType {
  SOFT_LOAD = 'Soft Load Transition',
  DELAYED = 'Delayed Transition',
  OPEN = 'Open Transition',
  CLOSED = 'Closed Transition',
  BYPASS = 'Bypass-Isolation',
  MANUAL = 'Manual Transfer',
}

export enum MastTypeForklift {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  TRIPLEX = 'TRIPLEX',
  QUADRUPLEX = 'QUADRUPLEX',
}

export enum PowerSourceForklift {
  ELECTRIC = 'ELECTRIC',
  DIESEL = 'DIESEL',
  LPG = 'LPG',
  CNG = 'CNG',
  PETROL = 'PETROL',
  DUAL_FUEL = 'DUAL_FUEL',
  LI_ION = 'LI_ION',
  HYDROGEN_FUEL_CELL = 'HYDROGEN_FUEL_CELL',
}

export enum TireType {
  PNEUMATIC = 'PNEUMATIC',
  CUSHION = 'CUSHION',
  SOLID = 'SOLID',
  NON_MARKING = 'NON-MARKING',
  FOAM_FILLED = 'FOAM_FILLED',
}

export enum Categories {
  DIESEL_GENERATOR = 'Diesel Generator',
  COMPRESSOR = 'Compressor',
  FORKLIFT = 'Forklift',
  TOWER_LIGHT = 'Tower Light',
  UPS = 'UPS',
  AUTOMATIC_TRANSFER_SWITCH = 'Automatic Transfer Switch',
  DISTRIBUTOR_PANEL = 'Distributor Panel',
}
