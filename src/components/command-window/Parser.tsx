import React from 'react';
import AutocompleteEngine, {
  AutocompleteEngineProps,
} from './autocomplete/AutocompleteEngine';
import { QueryFragment } from './autocomplete/types';
import { isNumeric } from './QueryUtil';

const FULL_NUMERIC = new RegExp('[0-9]+');

const CONTAINS_NUMERIC = new RegExp('.*[0-9]*.*');

const TIME = new RegExp('[0-9]?[0-9]:[0-9][0-9]');

interface ParserProps extends AutocompleteEngineProps {}

function _validateInput({ value }: QueryFragment): boolean {
  // Empty input gets handled by AutocompleteEngine
  if (value.length === 0) {
    return true;
  }

  if (FULL_NUMERIC.test(value)) {
  }
}

export default function Parser(props: ParserProps) {
  const { queryFragment, setHandlingNumericInput } = props;

  const { value } = queryFragment;

  if (value.length > 0 && isNumeric(value[0])) {
   //       Parse value here and choose what to render?
   setHandlingNumericInput(true)
   return <AutocompleteEngine {...props} />;
  } else {
    setHandlingNumericInput(false)
    return <AutocompleteEngine {...props} />;
  }
}

/* 

High Level Plan for Parser:

A few situations we handle
1. normal, non numeric related input -> gets routed directly to autocomplete engine

2. numeric related input that STARTS with a number (i.e. 2 hours, 4:00 PM etc) ->

    we immediately recognize the numeric input and wait for more typing. We should not be displaying Autocomplete Engine, and should instead
    be showing either nothing or a format guideline (x:xx, x hrs, x.x hrs, etc). The format guideline should be constrained by the values the
    user has actually entered, so need some "autocomplete" style logic for that. If the user correctly inputs the remainder of the fragment
    in one of these formats, the value is declared as the currentAutocomplete and CommandView instructs CommandLine to style it as a normal 
    modifier/preposition. 

        Note: Each of the formats has an associated modifier category or allowedModifierCategories (if it is a preposition numeric)
        Note: We should probably add other fields to the modifier and preposition types so its easier to manipulate stuff like "8.5 hrs" and 
        "5:00" when we actually use the query pieces to hit our calendar 

3. Numerical related input that DOES NOT START with a numbner ("may 3", etc (though i actually cant think of anything more than this rn hahah)) -> 
  Two approaches (lets decide, leaning toward latter):

    1. treat these words as special by adding some additional information when we create them from the library. When we autocomplete these words,
    we anticipate that they will be followed by a number and after recieving that number, we treat the combined string as one modifier

    2. We treat these words as prepositions, and the numbers that follow them as modifiers. However, these modifiers should be pulled from a seperate trie,
    since we dont want to recommend "3" unless the piece that preceded it was a preposition of type "month" etc. So we would have to add categories to prepositions
    as well, one for normal prepositions and one for prepositions that imply numbers should follow. If we see one of these number implier prepositions, we again listen to 
    see if the next thing typed is a number, and if it is, proceed with approach 2, but with a more limited space of formats. So for example if they typed 
    "may", then we autocomplete the word "may", and if the next thing they type is "1", we show the format "dd". If the next thing they type is 

 */