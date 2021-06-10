import {
  ModifierPiece,
  ModifierCategory,
  QueryPieceType,
  PrepositionPiece,
} from '../components/command-window/autocomplete/types';

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
  "week",
  "weekend",
].map((value) => ({
  value,
  category: ModifierCategory.DATE,
  type: QueryPieceType.MODIFIER,
}));

export const TIME_MODIFIER_FIXTURES: Array<ModifierPiece> = [
  'morning',
  'evening',
  'afternoon',
].map((value) => ({
  value,
  category: ModifierCategory.TIME,
  type: QueryPieceType.MODIFIER,
}));

export const TEST_DURATION_MODIFIER_FIXTURES: Array<ModifierPiece> = [
  '1 hr',
  '2 hrs',
].map((value) => ({
  value,
  category: ModifierCategory.DURATION,
  type: QueryPieceType.MODIFIER,
}));

export const PREPOSITION_FIXTURES: Array<PrepositionPiece> = [
  {
    value: 'after',
    type: QueryPieceType.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.TIME, ModifierCategory.DATE],
  },
  {
    value: 'before',
    type: QueryPieceType.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.TIME],
  },
  {
    value: 'at',
    type: QueryPieceType.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.TIME],
  },
  {
    value: 'on',
    type: QueryPieceType.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.DATE],
  },
  {
    value: 'this',
    type: QueryPieceType.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.TIME, ModifierCategory.DATE],
  },
  {
    value: 'next',
    type: QueryPieceType.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.TIME, ModifierCategory.DATE],
  },
  {
    value: 'for',
    type: QueryPieceType.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.DURATION],
  },
  {
    value: 'in',
    type: QueryPieceType.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.DATE],
  },

];
