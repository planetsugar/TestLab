import * as constants from './Constants';

export default {
    'AGAIN': 'Try Again',
    'FETCHING_RANDOMS': 'I am currently fetching random information.',
    'DISARM': 'Disarm',
    'DISARMED': 'Disarmed',
    'REDWIRE': 'Red Wire',
    'GREENWIRE': 'Green Wire',
    'CUT_WIRE': `You must cut the red wire or the green wire in ${constants.__BUTTON_TIMER_IN_SECONDS__} seconds.`,
    'YOU_HAVE_DISARMED_THE_BOMB': 'You have disarmed the bomb.....',
    'YOU_ARE_DEAD': 'You are dead!',
    'DISCLAIMER': 'The management take no responsibility for the action you did or did not take.'
} as const;