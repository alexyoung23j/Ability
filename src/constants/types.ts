import { ContentState } from 'draft-js';
import { DateTime } from 'luxon';
import { StringLiteralLike } from 'typescript';

export type PieceCategory = ModifierCategory;

export enum QueryPieceType {
  PREPOSITION = 'PREPOSITION',
  MODIFIER = 'MODIFIER',
}

export interface Piece {
  value: string;
  type: QueryPieceType;
  priority?: number;
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

export interface QueryTransformEngineProps {
  queryPieces: Array<Piece>;
}

export interface ModifierGroup {
  prepositionPiece: PrepositionPiece | null; // TODO: I think im handling the types wrong but this caused a problem in the extractModifierGroups function if we forced it to be a PrepositionPiece type
  modifierPiece: ModifierPiece;
}

export interface CalendarIndexFilter {
  // Mondays --> [[Monday], [Monday], ...]
  // Next week --> [[Monday, Tuesday, Wednesday, ...]]
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

export interface RegisteredAccount {
  calendars: Array<Calendar>;
  accountEmail: string;
}

export interface TextSnippetPackage {
  textSnippetPieces: Array<string | TextObject>; // The first text snippet will always come before the first text object. If you want to "start" with a text
  name: string;
  id: string;
}

export type TextObject = DateTextObject | DurationTextObject;

export interface DateTextObject {
  settings: {
    abbreviateTimes: boolean;
    inlineText: boolean;
    includeDates: boolean; // etc..
  };
}

export function isDateTextObject(
  snippetPiece: TextObject
): snippetPiece is DateTextObject {
  return 'abbreviateTimes' in snippetPiece.settings;
}

export interface DurationTextObject {
  settings: {
    abbreviate: boolean;
  };
}

export function isDurationTextObject(
  snippetPiece: TextObject
): snippetPiece is DurationTextObject {
  return 'abbreviate' in snippetPiece.settings;
}

export interface TextSnippet {
  // This is what gets passed down to the TextSnippetDropdown Component
  content: ContentState;
  id: string;
  title: string;
}
