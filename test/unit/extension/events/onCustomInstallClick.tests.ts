import type { ILogger } from '#domain/logging';
import type { IProviderConfig, ISuggestionProvider } from '#domain/providers';
import type { IContextState } from '#extension';
import { OnCustomInstallClick, OnSaveChanges } from '#extension/events';
import { VersionLensState } from '#extension/state';
import { SuggestionCodeLensProvider } from '#extension/suggestions';
import { test } from 'mocha-ui-esm';
import { instance, mock, verify, when } from 'ts-mockito';

type TestContext = {
  mockSuggestionCodeLensProvider: SuggestionCodeLensProvider;
  mockSuggestionProvider: ISuggestionProvider;
  mockProviderConfig: IProviderConfig;
  mockState: VersionLensState;
  mockOnSaveChanges: OnSaveChanges;
  mockLogger: ILogger;
}

export const onCustomInstallClickTests = {

  [test.title]: OnCustomInstallClick.name,

  beforeEach: function (this: TestContext) {
    this.mockSuggestionCodeLensProvider = mock<SuggestionCodeLensProvider>();
    this.mockSuggestionProvider = mock<ISuggestionProvider>();
    this.mockProviderConfig = mock<IProviderConfig>();
    this.mockState = mock<VersionLensState>();
    this.mockOnSaveChanges = mock<OnSaveChanges>();
    this.mockLogger = mock<ILogger>();

    // setup mocks
    when(this.mockSuggestionCodeLensProvider.suggestionProvider)
      .thenReturn(instance(this.mockSuggestionProvider));

    when(this.mockSuggestionProvider.config)
      .thenReturn(instance(this.mockProviderConfig));
  },

  "executes custom install task for the active provider": async function (this: TestContext) {
    // setup
    const testProviderName = 'test-provider';
    const testTaskName = 'test-task';

    const mockProviderActiveState = mock<IContextState<string | null>>();
    when(mockProviderActiveState.value).thenReturn(testProviderName);
    when(this.mockState.providerActive).thenReturn(instance(mockProviderActiveState) as any);

    when(this.mockSuggestionCodeLensProvider.providerName).thenReturn(testProviderName);
    when(this.mockProviderConfig.onSaveChangesTask).thenReturn(testTaskName);
    when(this.mockSuggestionProvider.name).thenReturn(testProviderName);

    const testEvent = new OnCustomInstallClick(
      [instance(this.mockSuggestionCodeLensProvider)],
      instance(this.mockState),
      instance(this.mockOnSaveChanges),
      instance(this.mockLogger)
    );

    // test
    await testEvent.execute();

    // verify
    verify(this.mockLogger.debug("executing custom install task for {providerName}", testProviderName)).once();
    verify(this.mockOnSaveChanges.runTask(instance(this.mockSuggestionProvider))).once();
  },

  "skips execution when no provider is active": async function (this: TestContext) {
    // setup
    const mockProviderActiveState = mock<IContextState<string | null>>();
    when(mockProviderActiveState.value).thenReturn(null);
    when(this.mockState.providerActive).thenReturn(instance(mockProviderActiveState) as any);

    const testEvent = new OnCustomInstallClick(
      [instance(this.mockSuggestionCodeLensProvider)],
      instance(this.mockState),
      instance(this.mockOnSaveChanges),
      instance(this.mockLogger)
    );

    // test
    await testEvent.execute();

    // verify
    verify(this.mockOnSaveChanges.runTask(instance(this.mockSuggestionProvider))).never();
  },

  "skips execution when active provider has no custom task": async function (this: TestContext) {
    // setup
    const testProviderName = 'test-provider';

    const mockProviderActiveState = mock<IContextState<string | null>>();
    when(mockProviderActiveState.value).thenReturn(testProviderName);
    when(this.mockState.providerActive).thenReturn(instance(mockProviderActiveState) as any);

    when(this.mockSuggestionCodeLensProvider.providerName).thenReturn(testProviderName);
    when(this.mockProviderConfig.onSaveChangesTask).thenReturn(undefined);
    when(this.mockSuggestionProvider.name).thenReturn(testProviderName);

    const testEvent = new OnCustomInstallClick(
      [instance(this.mockSuggestionCodeLensProvider)],
      instance(this.mockState),
      instance(this.mockOnSaveChanges),
      instance(this.mockLogger)
    );

    // test
    await testEvent.execute();

    // verify
    verify(
      this.mockLogger.debug(
        "{providerName} does not have a custom install task configured",
        testProviderName
      )
    ).once();
    verify(this.mockOnSaveChanges.runTask(instance(this.mockSuggestionProvider))).never();
  },

};