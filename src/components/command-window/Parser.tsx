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


----------------- Official Modifiers Guide -----------------

1. Duration Modifier - specifies an amount time during a day 
    Ex: x hr, x min, x.y hour (1.5 hours)

2. Time Modifier - specifies a time ON a given day
    Ex: Morning, evening, night, noon, "xx:xx", "xx pm", all day etc

3. Date Modifier - specifies a particular day
    Ex: today, tomorrow, monday, tuesday.. month x (april 2), x month (2 april), "dd/mm/yyyy", "d/m"

4. Range Modifier - specifies a range of days
    Ex: week, month, year, weekend, x days (3 days), x weeks, x months



----------------- Official Prepositions Guide -----------------

1. for -> Duration Modifier
2. at -> Time Modifier
3. after -> Time Modifier
4. before -> Time Modifier 
5. this -> Time Modifier, Date Modifier, Range Modifier 
6. on -> Date Modifier  
7. next -> Date Modifier, Range Modifier 
8. in -> Range Modifier
9. week of -> Date Modifier 


The query result will be parsed and handled according to the following general rules:
1. Each modifier has a default value (for instance, range defaults to week, time to all day , etc). If no 
    value for the modifier is given, we use the default
2. The result engine will read the queryPieces array in order. Each modifier specifies some details about the calendar
    and if it is preceeded by a preposition, that will narrow the search space further. Prepositions can ONLY reduce the 
    search space, so it is important we design the logic handling the modifiers accordingly. In addition, each modifier 
    has a default preposition if none is given (usually just "this", or "on", etc). 


Edge Cases we need to handle:
1. "this" and "next' are able to change the range modifier without the user actually specifying a range modifier. 
    For instance, "next monday" is really the same as "next monday next week", which changes our target DAY to monday and
    our target RANGE to next week. This logic needs to be handled. 

----------------- Official Numerical Parsing Guide -----------------

There are two distinct numerical situations:

1. The number is a quantifier of either a Duration Modifier or a Range modifier. For instance "in 2 weeks". "in" is a preposition, 
    "2" is a quantifier, and "weeks" is a range modifier. "for 3 hours" is a second example. Each quantifier has the property of
    being a single, non negative, no space or special character (aside from the decimal) number. 
        NOTE: If we see a ".", this means the numerical is for sure a quantifier. "1.5 hours"

2. The number is ITSELF a modifier. Examples include "6/17" or "april 2". These two examples are illustrative because they break down
    this category further. 
      A. Numerical Modifiers that START with a number (i.e. "6/17", "4 pm") can be handled using the formatter logic. The parser completely 
        shuts off the autocomplete engine and ensures that the text string matches one of a collection of regex formats. This value is 
        then assigned to currentAutocomplete, inserted into queryPieces, and visually styled by the command line. Numerical Modifiers starting
        with a number make up the bulk of the numerical modifiers.
            NOTE: The parser should not start displaying the formats until AFTER either a special character (:, /) or a space follower by a letter 
            (ex: "2 p" -> implies we should show the "pm" format). Otherwise, we are forcing the user to use a number as a modifier when they may want
            it as a quantifier instead. 

      B. Numerical modifiers that start with text (only "april 2" and variants of that format) fit into this group. The handling for these values
      is slightly different. The parser will not recognize that it starts with a number, but it will continue to listen to see if the value matches
      the "month x" regex format. After a few characters, the autocompleter will no longer find any matches ("sept" will not be an autocomplete value). 
      The parser needs 

  Implications for the parser implementation:

  1. The parser needs to be constantly listening to the query fragment.
      if the query fragment starts with a number, we can instantly start ignoring the autocomplete and 

 */