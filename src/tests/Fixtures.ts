import {
  ModifierPiece,
  ModifierCategory,
  QueryPieceType,
  PrepositionPiece,
} from '../components/command-window/autocomplete/types';

export const DATE_MODIFIER_FIXTURES: Array<ModifierPiece> = [
  'tomorrow',
  'today',
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
    value: 'on',
    type: QueryPieceType.PREPOSITION,
    allowedModifierCategories: [ModifierCategory.DATE],
  },
];
