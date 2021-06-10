import { ContentState } from 'draft-js';

export interface textSnippet {
  content: ContentState;
  id: string;
  title: string;
}
