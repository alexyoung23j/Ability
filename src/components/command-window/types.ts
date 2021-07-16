import { ContentState } from 'draft-js';



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
  RANGE = 'RANGE'
}

export const ALL_MODIFIER_CATEGORIES = [
  ModifierCategory.TIME,
  ModifierCategory.DURATION,
  ModifierCategory.DATE,
  ModifierCategory.RANGE
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
