import {
  SuggestionFactory,
  SuggestionStatusText,
  TPackageSuggestion,
  UpdateableFactory
} from 'domain/packages';

export default {
  fixedNoMatchWithLatestSuggestions: [
    SuggestionFactory.createNoMatchStatus(),
    UpdateableFactory.createLatestUpdateable('1.0.0'),
    UpdateableFactory.createTaggedPreleaseUpdateable('alpha', '1.1.0-alpha.1')
  ],
  fixedIsLatestNoSuggestions: [
    SuggestionFactory.createMatchesLatestStatus('3.0.0')
  ],
  fixedWithSuggestions: [
    SuggestionFactory.createFixedStatus('1.1.1'),
    UpdateableFactory.createLatestUpdateable('2.2.2'),
    UpdateableFactory.createNextMaxUpdateable('1.2.2', SuggestionStatusText.UpdateMinor),
    UpdateableFactory.createNextMaxUpdateable('1.1.2', SuggestionStatusText.UpdatePatch),
  ],
  fixedIsLatestWithPrereleaseSuggestions: [
    SuggestionFactory.createMatchesLatestStatus('3.0.0'),
    UpdateableFactory.createTaggedPreleaseUpdateable('next', '4.0.0-next')
  ],
  fixedNoMatchWithNextSuggestions: [
    SuggestionFactory.createNoMatchStatus(),
    UpdateableFactory.createLatestUpdateable('1.0.0'),
    UpdateableFactory.createNextMaxUpdateable('0.6.0', SuggestionStatusText.UpdateMinor),
    UpdateableFactory.createNextMaxUpdateable('0.5.1', SuggestionStatusText.UpdatePatch),
    UpdateableFactory.createTaggedPreleaseUpdateable('alpha', '1.1.0-alpha.1')
  ],
  rangeNoMatchWithLatestSuggestions: [
    SuggestionFactory.createNoMatchStatus(),
    UpdateableFactory.createLatestUpdateable('2.0.0')
  ],
  rangeSatisfiesLatest: [
    SuggestionFactory.createMatchesLatestStatus('3.0.0'),
    UpdateableFactory.createTaggedPreleaseUpdateable('next', '4.0.0-next')
  ],
  latestWithinRange: [
    SuggestionFactory.createSatisifiesLatestStatus('3.0.0'),
    UpdateableFactory.createLatestUpdateable('3.0.0'),
    UpdateableFactory.createTaggedPreleaseUpdateable('next', '4.0.0-next')
  ],
  rangeSatisfiesUpdateAndSuggestsLatest: [
    SuggestionFactory.createSatisifiesStatus('2.1.0'),
    UpdateableFactory.createLatestUpdateable('3.0.0'),
    UpdateableFactory.createNextMaxUpdateable('2.1.0', SuggestionStatusText.UpdateRange),
    UpdateableFactory.createTaggedPreleaseUpdateable('next', '4.0.0-next')
  ],
  rangeSatisfiesTildeRangeWithUpdateSuggestions: [
    SuggestionFactory.createSatisifiesStatus('1.1.2'),
    UpdateableFactory.createLatestUpdateable('2.2.2'),
    UpdateableFactory.createNextMaxUpdateable('1.1.2', SuggestionStatusText.UpdateRange),
    UpdateableFactory.createNextMaxUpdateable('1.2.2', SuggestionStatusText.UpdateMinor)
  ],
  rangeSatisfiesCaretRangeWithUpdateSuggestions: [
    SuggestionFactory.createSatisifiesStatus('1.2.2'),
    UpdateableFactory.createLatestUpdateable('2.2.2'),
    UpdateableFactory.createNextMaxUpdateable('1.2.2', SuggestionStatusText.UpdateRange),
  ],
  rangeSatisfiesMaxAndSuggestsLatest: [
    SuggestionFactory.createSatisifiesStatus('2.1.0'),
    UpdateableFactory.createLatestUpdateable('3.0.0'),
    UpdateableFactory.createTaggedPreleaseUpdateable('next', '4.0.0-next')
  ]
} satisfies Record<string, TPackageSuggestion[]>;