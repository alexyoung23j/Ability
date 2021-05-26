import { QueryPieceType } from '../../types';
import { ModifierCategory, ModifierPiece } from './TreeNode';

export const ALL_MODIFIER_CATEGORIES = [
  ModifierCategory.TIME,
  ModifierCategory.DURATION,
  ModifierCategory.DATE,
];

export const DATE_MODIFIERS = ['tomorrow', 'today'];

const DATE_PIECES: Array<ModifierPiece> = [
  {
    value: 'tomorrow',
    category: ModifierCategory.DATE,
    type: QueryPieceType.MODIFIER,
  },
  {
    value: 'tomorrow',
    category: ModifierCategory.DATE,
    type: QueryPieceType.MODIFIER,
  },
];

const PREPOSITIONS = ['on', 'next'];

const prepositionToModifierCategories = {
  on: ModifierCategory.DATE,
  next: ModifierCategory.DATE,
  //   at: ModifierCategory.HOUR,
  for: ModifierCategory.DURATION,
};

// DATE: [days, week]
// TIME: [hour]
//

// at <TIME>
// after <TIME> / <DATE>
// for <DURATION>
// next <DATE> /
// on
// this
// in (after from now)
//

// duration --> range

// on Sunday
//

// at Sunday - NOT ALLOWED
// at 3 pm
// at noon
// at afternoon (ew)
//
