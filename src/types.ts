import { EditorState, SelectionState, ContentState } from 'draft-js'


export interface queryPiece {
  value: string
  type: string
}

export interface textSnippet {
  content: ContentState
  id: string
  title: string
}
