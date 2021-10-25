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
10. first -> Date Modifier
11. second -> Date Modifier
12. third -> Date Modifier
13. fourth -> Date Modifier


 */

// Defines the priority of which results to show first (lower number means it takes precedence)
const PRIORITY_MAP = {
  DURATION_PRIMARY: 1,
  DURATION_SECONDARY: 2,
  TIME_PRIMARY: 3,
  TIME_SECONDARY: 4,
  DATE_PRIMARY: 5,
  DATE_SECONDARY: 6,
  RANGE_PRIMARY: 7,
  RANGE_SECONDARY: 8,
  PREPOSITION: 0,
};

export const DURATION_MODIFIER_FIXTURES: Array<ModifierPiece> = [
  '_ hour',
  '_ hours',
  '_ mins',
  '_ minutes',
  '_ min',
  '_._ hour',
  '_._ hours',
].map((value) => ({
  value,
  category: ModifierCategory.DURATION,
  type: QueryPieceType.MODIFIER,
  priority: PRIORITY_MAP.DURATION_PRIMARY,
}));

export const DURATION_MODIFIER_FIXTURES_SECONDARY: Array<ModifierPiece> = [
  '_minute',
  '_hour',
  '_hours',
  '_mins',
  '_minutes',
  '_min',
  '_minute',
  '_._hour',
  '_._hours',
  // uppercases
  '_ Hour',
  '_ Hours',
  '_ Mins',
  '_ Minutes',
  '_ Min',
  '_._ Hour',
  '_._ Hours',
  '_Minute',
  '_Hour',
  '_Hours',
  '_Mins',
  '_Minutes',
  '_Min',
  '_Minute',
  '_._Hour',
  '_._Hours',
].map((value) => ({
  value,
  category: ModifierCategory.DURATION,
  type: QueryPieceType.MODIFIER,
  priority: PRIORITY_MAP.DURATION_SECONDARY,
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
  priority: PRIORITY_MAP.TIME_PRIMARY,
}));

export const TIME_MODIFIER_FIXTURES_SECONDARY: Array<ModifierPiece> = [
  '_pm',
  '_am',
  // uppercases
  'Morning',
  'Evening',
  'Afternoon',
  'Night',
  'Noon',
  '_:_ PM',
  '_:_ AM',
  '_ PM',
  '_ AM',
  '_PM',
  '_AM',
].map((value) => ({
  value,
  category: ModifierCategory.TIME,
  type: QueryPieceType.MODIFIER,
  priority: PRIORITY_MAP.TIME_SECONDARY,
}));

export const DATE_MODIFIER_FIXTURES: Array<ModifierPiece> = [
  // Generic dates:
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
  // Specific dates:
  'tomorrow',
  'today',
  'yesterday',
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

  // TODO: add with year? "january 1, 2021" or something
].map((value) => ({
  value,
  category: ModifierCategory.DATE,
  type: QueryPieceType.MODIFIER,
  priority: PRIORITY_MAP.DATE_PRIMARY,
}));

export const DATE_MODIFIER_FIXTURES_SECONDARY: Array<ModifierPiece> = [
  // uppercases
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
  // Specific dates:
  'Tomorrow',
  'Today',
  'Yesterday',
  '_ January',
  '_ February',
  '_ March',
  '_ April',
  '_ May',
  '_ June',
  '_ July',
  '_ August',
  '_ September',
  '_ October',
  '_ November',
  '_ December',
  'January _',
  'February _',
  'March _',
  'April _',
  'May _',
  'June _',
  'July _',
  'August _',
  'September _',
  'October _',
  'November _',
  'December _',

  // TODO: add with year? "january 1, 2021" or something
].map((value) => ({
  value,
  category: ModifierCategory.DATE,
  type: QueryPieceType.MODIFIER,
  priority: PRIORITY_MAP.DATE_SECONDARY,
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
  priority: PRIORITY_MAP.RANGE_PRIMARY,
}));

export const RANGE_MODIFIER_FIXTURES_SECONDARY: Array<ModifierPiece> = [
  // uppercases
  'Week',
  'Month',
  'Year',
  'Weekend',
  '_ Day',
  '_ Days',
  '_ Week',
  '_ Weeks',
  '_ Month',
  '_ Months',
  '_ Monday',
  '_ Tuesday',
  '_ Wednesday',
  '_ Thursday',
  '_ Friday',
  '_ Saturday',
  '_ Sunday',
  '_ Mondays',
  '_ Tuesdays',
  '_ Wednesdays',
  '_ Thursdays',
  '_ Fridays',
  '_ Saturdays',
  '_ Sundays',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
].map((value) => ({
  value,
  category: ModifierCategory.RANGE,
  type: QueryPieceType.MODIFIER,
  priority: PRIORITY_MAP.RANGE_SECONDARY,
}));

export const MODIFIER_FIXTURES = [
  ...DURATION_MODIFIER_FIXTURES,
  ...DURATION_MODIFIER_FIXTURES_SECONDARY,
  ...TIME_MODIFIER_FIXTURES,
  ...TIME_MODIFIER_FIXTURES_SECONDARY,
  ...DATE_MODIFIER_FIXTURES,
  ...DATE_MODIFIER_FIXTURES_SECONDARY,
  ...RANGE_MODIFIER_FIXTURES,
  ...RANGE_MODIFIER_FIXTURES_SECONDARY,
];

export const PREPOSITION_FIXTURES: Array<PrepositionPiece> = [
  {
    value: 'for',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.DURATION],
  },
  {
    value: 'at',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.TIME],
  },
  {
    value: 'after',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.TIME],
  },
  {
    value: 'before',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.TIME, ModifierCategory.DATE],
  },
  {
    value: 'this',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [
      ModifierCategory.TIME,
      ModifierCategory.DATE,
      ModifierCategory.RANGE,
    ],
  },
  {
    value: 'on',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.DATE],
  },
  {
    value: 'next',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.RANGE, ModifierCategory.DATE],
  },
  {
    value: 'in',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.RANGE],
  },
  {
    value: 'week of',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.DATE],
  },
  {
    value: 'first',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.DATE],
  },
  {
    value: 'second',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.DATE],
  },
  {
    value: 'third',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.DATE],
  },
  {
    value: 'fourth',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.DATE],
  },
  {
    value: 'For',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.DURATION],
  },
  {
    value: 'At',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.TIME],
  },
  {
    value: 'After',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.TIME, ModifierCategory.DATE],
  },
  {
    value: 'Before',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.TIME, ModifierCategory.DATE],
  },
  {
    value: 'This',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [
      ModifierCategory.TIME,
      ModifierCategory.DATE,
      ModifierCategory.RANGE,
    ],
  },
  {
    value: 'On',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.DATE],
  },
  {
    value: 'Next',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.RANGE, ModifierCategory.DATE],
  },
  {
    value: 'In',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.RANGE],
  },
  {
    value: 'Week of',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.DATE],
  },
  {
    value: 'First',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.DATE],
  },
  {
    value: 'Second',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.DATE],
  },
  {
    value: 'Third',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.DATE],
  },
  {
    value: 'Fourth',
    type: QueryPieceType.PREPOSITION,
    priority: PRIORITY_MAP.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.DATE],
  },
];
