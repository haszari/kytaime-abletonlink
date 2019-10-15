import _ from 'lodash';

import { createReducer, } from 'redux-starter-kit';

import actions from './actions';

function createDeck() {
  return {
    slug: '',
    hue: Math.random() * 360,
    triggeredSection: null,
    playingSection: null,
    sections: [],
  };
}

// interesting that this is a different kind of selector
// doesn't need to go down into .throwdown`
function getDeck( state, deckSlug ) {
  return _.find( state.decks,
    deck => ( deck.slug === deckSlug )
  );
}

const throwdownReducer = createReducer( {
  audioContext: null,
  buffers: [],

  patterns: [],

  deferAllTriggers: false,

  decks: [],
}, {
  // patterns (may be used in multiple deck sections)
  [actions.addPattern]: ( state, action ) => {
    const patternData = action.payload;
    state.patterns.push( patternData );
  },

  [actions.setDeferAllTriggers]: ( state, action ) => {
    state.deferAllTriggers = action.payload;
  },
  [actions.toggleDeferAllTriggers]: ( state, action ) => {
    state.deferAllTriggers = !state.deferAllTriggers;
  },

  // decks
  [actions.addDeck]: ( state, action ) => {
    const deck = getDeck( state, action.payload.deckSlug );
    if ( deck ) return;

    const newDeck = {
      ...createDeck(),
      slug: action.payload.deckSlug,
    };

    const shuntedDeck = getDeck( state, action.payload.replaceDeckSlug );
    const insertPosition = _.findIndex( state.decks, { slug: action.payload.replaceDeckSlug, } );
    if ( action.payload.replaceDeckSlug && insertPosition !== -1 ) {
      // if we're "replacing" a deck row, reorder decks so added one is in that slot
      state.decks.splice( insertPosition, 0, newDeck );
      _.remove( state.decks, shuntedDeck );
      state.decks.push( shuntedDeck );
    }
    else {
      // otherwise just add at the end of the list
      state.decks.push( newDeck );
    }
  },

  [actions.addSection]: ( state, action ) => {
    const deck = getDeck( state, action.payload.deckSlug );
    if ( ! deck ) return;

    const patternsInSection = action.payload.patterns;
    // console.log( deck );
    // console.log( state.patterns );
    // console.log( patternsInSection );

    // input:
    // - array of pattern slugs in section
    // - pattern data, including pattern part slug

    // get a list of pattern data for the patterns in the section (i.e. filter out others)
    // we lose pattern slug here
    const sectionPatternData = _.filter( state.patterns, ( data, slug ) => {
      return _.find( patternsInSection, slug );
    } );

    // get a list of the part names in this section
    const sectionPartSlugs = _.uniq( _.map( sectionPatternData, 'part' ) );
    // console.log( sectionPartSlugs );

    const partsPatterns = _.map( sectionPartSlugs, partSlug => {
      const patternData = _.filter( sectionPatternData, ( pattern, slug ) => {
        return ( pattern.part === partSlug );
      } );
      const patterns = _.get( patternData );
      return {
        part: partSlug,
        patterns: patterns,
        // this could be index or slug
        triggeredPattern: _.get( patterns, 0 ),
        playingPattern: null,
      };
    } );

    // const partPatterns = _.map( sectionPartSlugs, part => {
    //   return {
    //     part: part,
    //     // we just want pattern names here .. tricky ..
    //     // come back to this!!
    //     // this could be an array or object keyed by pattern slug
    //     patterns: patternsByPart,
    //   };
    // } );

    // output:
    // array of parts, each containing an array of pattern slugs
    // and add in the trigger stuff later

    deck.sections.push( {
      slug: action.payload.slug,
      duration: action.payload.bars * 4,
      patterns: action.payload.patterns,
      parts: partsPatterns,
    } );
  },

  [actions.setDeckTriggeredSection]: ( state, action ) => {
    const deck = getDeck( state, action.payload.deckSlug );
    if ( ! deck ) return;

    // pass no slug to clear triggered section
    deck.triggeredSection = action.payload.sectionSlug;
  },
  [actions.toggleDeckTriggeredSection]: ( state, action ) => {
    const deck = state.decks[action.payload.deckIndex];
    if ( !deck ) return;

    const section = deck.sections[action.payload.sectionIndex];
    const sectionSlug = section ? section.slug : '';
    if ( deck.triggeredSection !== sectionSlug ) {
      deck.triggeredSection = sectionSlug;
    }
    else {
      deck.triggeredSection = null;
    }
  },

  [actions.setDeckPlayingSection]: ( state, action ) => {
    const deck = getDeck( state, action.payload.deckSlug );
    if ( !deck ) return;

    // pass no slug to clear playing section
    deck.playingSection = action.payload.sectionSlug;
  },

} );

export default throwdownReducer;
