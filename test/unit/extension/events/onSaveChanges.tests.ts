import type { ILogger } from '#domain/logging';
import type { IProviderConfig, ISuggestionProvider } from '#domain/providers';
import type { IContextState, IVersionLensState } from '#extension';
import { OnSaveChanges } from '#extension/events';
import type { IVsCodeTasks } from '#extension/vscode';
import { test } from 'mocha-ui-esm';
import { anything, instance, mock, verify, when } from 'ts-mockito';
import type { Task } from 'vscode';

type TestContext = {
  mockVsCodeTasks: IVsCodeTasks
  mockVersionLensState: IVersionLensState
  mockLogger: ILogger
  mockProvider: ISuggestionProvider
  mockConfig: IProviderConfig
}

export const onSaveChangesTests = {

  [test.title]: OnSaveChanges.name,

  beforeEach: function (this: TestContext) {
    this.mockVsCodeTasks = mock<IVsCodeTasks>();
    this.mockVersionLensState = mock<IVersionLensState>();
    this.mockLogger = mock<ILogger>();

    this.mockProvider = mock<ISuggestionProvider>();
    this.mockConfig = mock<IProviderConfig>();
    when(this.mockProvider.config).thenReturn(instance(this.mockConfig))
  },

  "skips task execution when onSaveChangesTask is not defined": async function (this: TestContext) {
    const testProviderName = 'testProvider';
    const testPackageFilePath = 'test/path/dir';
    const testProvider = instance(this.mockProvider)
    const testEvent = new OnSaveChanges(
      instance(this.mockVsCodeTasks),
      instance(this.mockVersionLensState),
      instance(this.mockLogger)
    );

    when(this.mockConfig.onSaveChangesTask).thenReturn(null)
    when(this.mockProvider.name).thenReturn(testProviderName)
    when(this.mockVsCodeTasks.fetchTasks() as Promise<Task[]>)
      .thenResolve([]);

    // test
    await testEvent.execute(testProvider, testPackageFilePath);

    // verify
    verify(this.mockVsCodeTasks.fetchTasks()).never();
    verify(this.mockLogger.info(OnSaveChanges.log.skipSaveChangesTask, testProvider.name)).once();
  },

  "logs error when the specified onSaveChangesTask is not found": async function (this: TestContext) {
    const testProviderName = 'testProvider';
    const testPackageFilePath = 'test/path/dir';
    const testProvider = instance(this.mockProvider)
    const testEvent = new OnSaveChanges(
      instance(this.mockVsCodeTasks),
      instance(this.mockVersionLensState),
      instance(this.mockLogger)
    );

    when(this.mockConfig.onSaveChangesTask).thenReturn('versionlens-install-task')
    when(this.mockProvider.name).thenReturn(testProviderName)
    when(this.mockVsCodeTasks.fetchTasks() as Promise<Task[]>)
      .thenResolve([]);

    // test
    await testEvent.execute(testProvider, testPackageFilePath);

    // verify
    verify(this.mockVsCodeTasks.fetchTasks()).once();
    verify(
      this.mockLogger.error(
        OnSaveChanges.log.saveChangesTaskNotFound,
        testProvider.name,
        testProvider.config.onSaveChangesTask
      )
    ).once();
    verify(this.mockVsCodeTasks.executeTask(anything())).never();
  },

  "executes onSaveChangesTask": [
    0,
    1,
    async function (this: TestContext, expectedExitCode: number) {
      const testProviderName = 'testProvider';
      const testPackageFilePath = 'test/path/dir';
      const testProvider = instance(this.mockProvider)
      const testTaskName = 'versionlens-install-task'
      const testTask = { name: testTaskName }
      // const expectedExitCode = 0
      const testEvent = new OnSaveChanges(
        instance(this.mockVsCodeTasks),
        instance(this.mockVersionLensState),
        instance(this.mockLogger)
      );
      when(this.mockConfig.onSaveChangesTask).thenReturn(testTaskName)
      when(this.mockProvider.name).thenReturn(testProviderName)
      when(this.mockVsCodeTasks.fetchTasks() as Promise<Task[]>).thenResolve([testTask as any]);
      when(this.mockVsCodeTasks.onDidEndTaskProcess(anything(), anything(), anything()))
        .thenCall(
          callback => {
            callback({
              execution: { task: testTask },
              exitCode: expectedExitCode
            })
          }
        )

      const mockOutdatedState = mock<IContextState<boolean>>()
      when(this.mockVersionLensState.showOutdated).thenReturn(instance(mockOutdatedState));

      // test
      await testEvent.execute(testProvider, testPackageFilePath);

      // verify
      verify(
        this.mockLogger.info(
          OnSaveChanges.log.executingTask,
          testProvider.name,
          testProvider.config.onSaveChangesTask
        )
      ).once();
      verify(this.mockVsCodeTasks.executeTask(testTask as any)).once();
      verify(
        this.mockLogger.info(
          OnSaveChanges.log.taskCompleted,
          testProvider.name,
          testProvider.config.onSaveChangesTask,
          expectedExitCode
        )
      ).once();

      if (expectedExitCode === 0)
        verify(mockOutdatedState.change(anything())).once();
      else
        verify(mockOutdatedState.change(anything())).never();
    }
  ],

};