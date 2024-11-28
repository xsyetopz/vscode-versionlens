import type { ILogger } from '#domain/logging';
import type { ISuggestionProvider } from '#domain/providers';
import { throwUndefinedOrNull } from '@esm-test/guards';
import type { IVsCodeTasks } from 'src/extension/vscode/definitions';
import type { Task } from 'vscode';

export class OnSaveChanges {

  constructor(readonly tasks: IVsCodeTasks, readonly logger: ILogger) {
    throwUndefinedOrNull("tasks", tasks);
    throwUndefinedOrNull("logger", logger);
  }

  async execute(provider: ISuggestionProvider, packageFilePath: string): Promise<void> {
    // check we have a task to run
    if (provider.config.onSaveChangesTask === null) {
      this.logger.info(
        'Skipping "%s.onSaveChanges" because a custom task was not provided.',
        provider.name
      );
      return;
    }

    // fetch the custom task for the provider
    const availableTasks = await this.tasks.fetchTasks();
    const filteredTasks = availableTasks.filter(
      x => x.name == provider.config.onSaveChangesTask
    );

    // check we found a task
    if (filteredTasks.length == 0) {
      this.logger.error(
        'Could not find the %s.onSaveChanges["%s"] task.',
        provider.name,
        provider.config.onSaveChangesTask
      );
      return;
    }

    this.logger.info(
      'Executing %s.onSaveChanges["%s"] task.',
      provider.name,
      provider.config.onSaveChangesTask
    );

    // execute the task
    const exitCode = await this.executeTask(filteredTasks[0])

    this.logger.info(
      '%s.onSaveChanges["%s"] task exited with %s.',
      provider.name,
      provider.config.onSaveChangesTask,
      exitCode
    );
  }

  private async executeTask(task: Task): Promise<number> {
    await this.tasks.executeTask(task);
    return new Promise((resolve, reject) => {
      const disposable = this.tasks.onDidEndTaskProcess(e => {
        if (task.name === e.execution.task.name) {
          disposable.dispose();
          resolve(e.exitCode);
        }
      });
    });
  }

}