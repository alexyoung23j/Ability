import { EditorState, SelectionState, ContentState } from './components/command_window/results_display/snippet_display/node_modules/draft-js'


export interface queryPiece {
  value: string
  type: string
}

export interface textSnippet {
  content: ContentState
  id: string
  title: string
}
