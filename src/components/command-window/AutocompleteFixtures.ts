import {
  ModifierPiece,
  ModifierCategory,
  QueryPieceType,
  PrepositionPiece,
} from './types';

/* ----------------- Official Modifiers Guide -----------------

1. Duration Modifier - specifies an amount time during a day 
    Ex: _ hr, _ min, _.y hour (1.5 hours)

2. Time Modifier - specifies a time ON a given day
    Ex: Morning, evening, night, noon, "xx:xx", "xx pm", all day etc

3. Date Modifier - specifies a particular day
    Ex: today, tomorrow, monday, tuesday.. month _ (april 2), _ month (2 april), "dd/mm/yyyy", "d/m"

4. Range Modifier - specifies a range of days
    Ex: week, month, year, weekend, _ days (3 days), _ weeks, _ months


----------------- Official Prepositions Guide -----------------

1. for -> Duration Modifier
2. at -> Time Modifier
3. after -> Time Modifier, Date Modifier
4. before -> Time Modifier 
5. this -> Time Modifier, Date Modifier, Range Modifier 
6. on -> Date Modifier  
7. next -> Date Modifier, Range Modifier 
8. in -> Range Modifier
9. week of -> Date Modifier 
 */

export const DURATION_MODIFIER_FIXTURES: Array<ModifierPiece> = [
  '_ hour',
  '_ hours',
  '_ mins',
  '_ minutes',
  '_ min',
  '_minute',
  '_hour',
  '_hours',
  '_mins',
  '_minutes',
  '_min',
  '_minute',
  '_._ hour',
  '_._ hours',
  '_._hour',
  '_._hours',
].map((value) => ({
  value,
  category: ModifierCategory.DURATION,
  type: QueryPieceType.MODIFIER,
}));

export const TIME_MODIFIER_FIXTURES: Array<ModifierPiece> = [
  'morning',
  'evening',
  'afternoon',
  'night',
  'noon',
  '_:_ pm',
  '_:_ am',
  '_ pm',
  '_ am',
].map((value) => ({
  value,
  category: ModifierCategory.TIME,
  type: QueryPieceType.MODIFIER,
}));

export const DATE_MODIFIER_FIXTURES: Array<ModifierPiece> = [
  'tomorrow',
  'today',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
  '_/_',
  '_/_/2021',
  '_/_/2022',
  '_ january',
  '_ february',
  '_ march',
  '_ april',
  '_ may',
  '_ june',
  '_ july',
  '_ august',
  '_ september',
  '_ october',
  '_ november',
  '_ december',
  'january _',
  'february _',
  'march _',
  'april _',
  'may _',
  'june _',
  'july _',
  'august _',
  'september _',
  'october _',
  'november _',
  'december _',
].map((value) => ({
  value,
  category: ModifierCategory.DATE,
  type: QueryPieceType.MODIFIER,
}));

export const RANGE_MODIFIER_FIXTURES: Array<ModifierPiece> = [
  'week',
  'month',
  'year',
  'weekend',
  '_ day',
  '_ days',
  '_ week',
  '_ weeks',
  '_ month',
  '_ months',
  '_ monday',
  '_ tuesday',
  '_ wednesday',
  '_ thursday',
  '_ friday',
  '_ saturday',
  '_ sunday',
  '_ mondays',
  '_ tuesdays',
  '_ wednesdays',
  '_ thursdays',
  '_ fridays',
  '_ saturdays',
  '_ sundays',
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
].map((value) => ({
  value,
  category: ModifierCategory.RANGE,
  type: QueryPieceType.MODIFIER,
}));

export const MODIFIER_FIXTURES = [
  ...DURATION_MODIFIER_FIXTURES,
  ...TIME_MODIFIER_FIXTURES,
  ...DATE_MODIFIER_FIXTURES,
  ...RANGE_MODIFIER_FIXTURES,
];

export const PREPOSITION_FIXTURES: Array<PrepositionPiece> = [
  {
    value: 'for',
    type: QueryPieceType.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.DURATION],
  },
  {
    value: 'at',
    type: QueryPieceType.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.TIME],
  },
  {
    value: 'after',
    type: QueryPieceType.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.TIME, ModifierCategory.DATE],
  },
  {
    value: 'before',
    type: QueryPieceType.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.TIME, ModifierCategory.DATE],
  },
  {
    value: 'this',
    type: QueryPieceType.PREPOSITION,
    allowedModifierCategories: [
      ModifierCategory.TIME,
      ModifierCategory.DATE,
      ModifierCategory.RANGE,
    ],
  },
  {
    value: 'on',
    type: QueryPieceType.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.DATE],
  },
  {
    value: 'next',
    type: QueryPieceType.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.RANGE, ModifierCategory.DATE],
  },
  {
    value: 'in',
    type: QueryPieceType.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.RANGE],
  },
  {
    value: 'week of',
    type: QueryPieceType.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.DATE],
  },
];
