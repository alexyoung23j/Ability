import { ContentState } from 'draft-js';
import { DateTime } from 'luxon';

export type PieceCategory = ModifierCategory;

export enum QueryPieceType {
  PREPOSITION = 'PREPOSITION',
  MODIFIER = 'MODIFIER',
}

export interface Piece {
  value: string;
  type: QueryPieceType;
}

export interface QueryFragment {
  value: string;
  type: QueryPieceType;
}

export interface ModifierPiece extends Piece {
  value: string;
  category: ModifierCategory;
}

export interface ModifierQueryFragment {
  value: string;
  type: QueryPieceType.MODIFIER;
}
export interface PrepositionQueryFragment {
  value: string;
  type: QueryPieceType.PREPOSITION;
}

export const enum CommandCategory {
  COMMAND = 'COMMAND',
}

export const enum ModifierCategory {
  TIME = 'TIME',
  DURATION = 'DURATION',
  DATE = 'DATE',
  RANGE = 'RANGE',
}

export const ALL_MODIFIER_CATEGORIES = [
  ModifierCategory.TIME,
  ModifierCategory.DURATION,
  ModifierCategory.DATE,
  ModifierCategory.RANGE,
];

export type CategoryFilters = Array<ModifierCategory>;

export interface PrepositionPiece extends Piece {
  value: string;
  allowedModifierCategories: CategoryFilters;
}

export function isPrepositionPiece(piece: Piece): piece is PrepositionPiece {
  return piece.type === QueryPieceType.PREPOSITION;
}

export function isModifierPiece(
  piece: Piece | ModifierPiece
): piece is ModifierPiece {
  return 'category' in piece && piece.type === QueryPieceType.MODIFIER;
}

export interface textSnippet {
  content: ContentState;
  id: string;
  title: string;
}

export interface QueryTransformEngineProps {
  queryPieces: Array<Piece>;
}

export interface ModifierGroup {
  prepositionPiece: PrepositionPiece; // TODO: I think im handling the types wrong but this caused a problem in the extractModifierGroups function if we forced it to be a PrepositionPiece type
  modifierPiece: ModifierPiece;
}

export interface CalendarIndexFilter {
  range: Array<Array<DateTime>> | null; // Each subarray is a contiguous chunk of datetimes
  startTime: DateTime | null;
  endTime: DateTime | null;
  duration: number | null;
}

export interface Calendar {
  name: string;
  color: string;
  googleAccount?: string;
  selectedForDisplay?: boolean;
}
