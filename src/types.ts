import { ContentState } from 'draft-js';

export enum QueryPieceType {
  PREPOSITION = 'PREPOSITION',
  MODIFIER = 'MODIFIER',
}
export interface textSnippet {
  content: ContentState;
  id: string;
  title: string;
}
