import { SuggestionUpdate } from '#domain/packages';
import { PypiConfig, PypiSuggestionProvider, PypiSuggestionResolver } from '#domain/providers/pypi';
import { ILogger } from '#domain/logging';
import { equal } from 'node:assert';
import { instance, mock } from 'ts-mockito';
import Fixtures from './suggestionReplaceFn.fixtures';

export const PypiSuggestionReplaceFnTests = {

  title: 'PypiSuggestionReplaceFn',

  suggestionReplaceFn: {

    "case $i: correctly replaces versions": [
      ...Fixtures.suggestionReplaceFn,
      (fixture: any) => {
        // setup
        const { suggestion, newVersion, expected } = fixture;

        const resolverMock = mock(PypiSuggestionResolver);
        const configMock = mock(PypiConfig);
        const loggerMock = mock<ILogger>();

        const cut = new PypiSuggestionProvider(
          instance(resolverMock),
          instance(configMock),
          instance(loggerMock)
        );

        // test
        const actual = cut.suggestionReplaceFn(
          suggestion as SuggestionUpdate,
          newVersion
        );

        // assert
        equal(actual, expected);
      }
    ]

  }

}
