import {
  ModifierPiece,
  ModifierCategory,
  QueryPieceType,
  PrepositionPiece,
} from '../components/command-window/autocomplete/types';

/* ----------------- Official Modifiers Guide -----------------

1. Duration Modifier - specifies an amount time during a day 
    Ex: x hr, x min, x.y hour (1.5 hours)

2. Time Modifier - specifies a time ON a given day
    Ex: Morning, evening, night, noon, "xx:xx", "xx pm", all day etc

3. Date Modifier - specifies a particular day
    Ex: today, tomorrow, monday, tuesday.. month x (april 2), x month (2 april), "dd/mm/yyyy", "d/m"

4. Range Modifier - specifies a range of days
    Ex: week, month, year, weekend, x days (3 days), x weeks, x months



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
  'x hour',
  'x hours',
  'x mins',
  'x minutes', 
  'x min',
  'x minute', 
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
  'x:x pm',
  "x:x am",
  'x pm',
  'x am',
].map((value) => ({
  value,
  category: ModifierCategory.TIME,
  type: QueryPieceType.MODIFIER,
}));

export const DATE_MODIFIER_FIXTURES: Array<ModifierPiece> = [
  'tomorrow',
  'today',
  "monday", 
  "tuesday",
  "wednesday",
  "thursday",
  "friday", 
  "saturday", 
  "sunday",
  "x/x",
  "x/x/2021",
  "x/x/2022",
  "x january",
  "x february",
  "x march",
  "x april",
  "x may",
  "x june",
  "x july",
  "x august",
  "x september",
  "x october",
  "x november",
  "x december",
  "january x",
  "february x",
  "march x",
  "april x",
  "may x",
  "june x",
  "july x",
  "august x",
  "september x",
  "october x",
  "november x",
  "december x",
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
  'x day',
  'x days',
  'x week',
  'x weeks',
  'x month',
  'x months'
].map((value) => ({
  value,
  category: ModifierCategory.RANGE,
  type: QueryPieceType.MODIFIER,
}));



export const MODIFIER_FIXTURES = DURATION_MODIFIER_FIXTURES.concat(TIME_MODIFIER_FIXTURES).concat(DATE_MODIFIER_FIXTURES).concat(RANGE_MODIFIER_FIXTURES)



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
    allowedModifierCategories: [ModifierCategory.TIME, ModifierCategory.DATE, ModifierCategory.RANGE],
  },
  {
    value: 'on',
    type: QueryPieceType.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.DATE],
  },
  {
    value: 'next',
    type: QueryPieceType.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.TIME, ModifierCategory.RANGE],
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
