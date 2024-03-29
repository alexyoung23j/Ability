import {
  PREPOSITION_FIXTURES,
  MODIFIER_FIXTURES,
} from '../../../constants/AutocompleteConstants';
import { assert } from '../../util/assert';
import {
  Piece,
  QueryFragment,
  CategoryFilters,
  isModifierPiece,
  ModifierPiece,
  ModifierQueryFragment,
  PrepositionPiece,
  PrepositionQueryFragment,
} from '../../../constants/types';

export class TreeNode<
  TPiece extends Piece,
  TQueryFragment extends QueryFragment
> {
  piece: TPiece;
  char: string;
  isRoot: boolean;
  isLeaf: boolean;
  childrenPieces: Set<TPiece>;
  // TODO Kedar: make this more performant by changing the children to an array of len 256
  //   - each index represents an ascii character, and then you can use
  //   ord(piece.value[idx]) to index into the array instead of iterating over all of them in findChild
  children: Array<TreeNode<TPiece, TQueryFragment>>;

  constructor(isRoot: boolean = false) {
    this.isRoot = isRoot;
    this.char = '';
    this.children = [];
    this.childrenPieces = new Set<TPiece>();
  }

  /**
   * Determine whether a piece can be returned given a set of category filters.
   *
   * Currently category filters only apply to modifier pieces, and all other piece types will always be allowed.
   * @param categoryFilters - categoryFilters should include every modifier category if all modifier pieces are allowed
   */
  _isPieceAllowed(piece: TPiece, categoryFilters: CategoryFilters): boolean {
    if (isModifierPiece(piece)) {
      return categoryFilters.includes(piece.category);
    }
    return true;
  }

  /**
   * Recursively iterate through the trie to find all matching completions of a query fragment.
   */
  findMatchingPieces(
    {
      queryValue,
      currentIdx,
    }: {
      queryValue: string;
      currentIdx: number;
    },
    otherMatchingPieces: Array<TPiece>,
    categoryFilters: CategoryFilters
  ): Array<TPiece> {
    if (this.isLeaf || currentIdx == queryValue.length - 1) {
      const matchingPieces = [];
      for (const piece of Array.from(this.childrenPieces)) {
        if (
          this._isPieceAllowed(piece, categoryFilters) &&
          queryValue[currentIdx] === piece.value[currentIdx]
        ) {
          matchingPieces.push(piece);
        }
      }
      return [...matchingPieces, ...otherMatchingPieces];
    }
    const child = this.findChild({ queryValue, currentIdx });
    if (child == null) {
      return otherMatchingPieces;
    }
    return child.findMatchingPieces(
      { queryValue, currentIdx: currentIdx + 1 },
      otherMatchingPieces,
      categoryFilters
    );
  }

  /**
   * Return list of pieces in the trie that can be used as autocompletions of a query fragment.
   */
  autocomplete(
    queryValue: string,
    categoryFilters?: CategoryFilters
  ): Array<TPiece> {
    return this.findMatchingPieces(
      { queryValue, currentIdx: 0 },
      [],
      categoryFilters
    );
  }

  /**
   * Return the matching child node for the first character of a query fragment.
   *
   * Returns null if no matching child node is found.
   */
  findChild({
    queryValue,
    currentIdx,
  }: {
    queryValue: string;
    currentIdx: number;
  }): TreeNode<TPiece, TQueryFragment> | null {
    if (currentIdx === queryValue.length) {
      return null;
    }
    assert(
      this.children != null,
      'this.children should be instantiated before using for search.'
    );
    return this.children.find(
      (childNode) => childNode.char === queryValue[currentIdx]
    );
  }

  /**
   * Recursively iterate through the trie, and add new nodes as needed to build the trie.
   */
  traverseAndConstruct(piece: TPiece, currentIdx: number): void {
    this.childrenPieces.add(piece);

    // Reached end of piece's value so save in this node
    if (currentIdx === piece.value.length) {
      this.isLeaf = true;
      this.piece = piece;
      return;
    }

    let childNode = this.findChild({ queryValue: piece.value, currentIdx });
    if (childNode == null) {
      const node = new TreeNode<TPiece, TQueryFragment>();
      // TODO kedar: move this into the node constructor
      node.char = piece.value[currentIdx];
      this.children.push(node);
      childNode = node;
    }

    childNode.traverseAndConstruct(piece, currentIdx + 1);
  }

  /**
   * Construct the trie for a given library of pieces.
   */
  build(library: Array<TPiece>): void {
    for (const piece of library) {
      this.traverseAndConstruct(piece, 0);
    }
  }

  printTrie(): void {
    console.log(this.char);
    for (const child of this.children) {
      child.printTrie();
    }
    if (this.isLeaf) {
      console.log('full word:', this.piece.value);
    }
  }
}

class ModifierNode extends TreeNode<ModifierPiece, ModifierQueryFragment> {}
class PrepositionNode extends TreeNode<
  PrepositionPiece,
  PrepositionQueryFragment
> {}

function buildTrie<TPiece extends Piece, TQueryFragment extends QueryFragment>(
  library: Array<TPiece>
): TreeNode<TPiece, TQueryFragment> {
  const root = new TreeNode<TPiece, TQueryFragment>(true);
  root.build(library);

  return root;
}

export function buildModifierTrie(): ModifierNode {
  const trie =
    buildTrie<ModifierPiece, ModifierQueryFragment>(MODIFIER_FIXTURES);
  return trie;
}

export function buildPrepositionTrie(): PrepositionNode {
  const trie =
    buildTrie<PrepositionPiece, PrepositionQueryFragment>(PREPOSITION_FIXTURES);
  return trie;
}
