/**
 * Interfaces for vscode namespaces
 */
import type {
  AuthenticationGetSessionOptions,
  AuthenticationProvider,
  AuthenticationProviderOptions,
  AuthenticationSession,
  AuthenticationSessionAccountInformation,
  AuthenticationSessionsChangeEvent,
  CancellationToken,
  Disposable,
  Event,
  FileSystemWatcher,
  GlobPattern,
  InputBoxOptions,
  MessageOptions,
  QuickPickItem,
  QuickPickOptions,
  Task,
  TaskExecution,
  TaskFilter,
  TaskProcessEndEvent,
  TextDocument,
  TextEditor,
  Uri,
  ViewColumn
} from 'vscode';

/***
 * Adapter interface for the 'workspace' namespace
 */
export interface IVsCodeWorkspace {
  findFiles(
    include: GlobPattern,
    exclude?: GlobPattern | null,
    maxResults?: number,
    token?: CancellationToken
  ): Promise<Uri[]>;

  createFileSystemWatcher(
    globPattern: GlobPattern,
    ignoreCreateEvents?: boolean,
    ignoreChangeEvents?: boolean,
    ignoreDeleteEvents?: boolean
  ): FileSystemWatcher;
}

/***
 * Adapter interface for the 'authentication' namespace
 */
export interface IVsCodeAuthentication {
  getAccounts(providerId: string): Promise<readonly AuthenticationSessionAccountInformation[]>;

  onDidChangeSessions: Event<AuthenticationSessionsChangeEvent>

  getSession(
    providerId: string,
    scopes: readonly string[],
    options?: AuthenticationGetSessionOptions
  ): Promise<AuthenticationSession | undefined>;

  registerAuthenticationProvider(
    id: string,
    label: string,
    provider: AuthenticationProvider,
    options?: AuthenticationProviderOptions
  ): Disposable
}

/***
 * Adapter interface for the 'window' namespace
 */
export interface IVsCodeWindow {
  activeTextEditor: TextEditor | undefined;

  showInputBox(
    options?: InputBoxOptions,
    token?: CancellationToken
  ): Thenable<string | undefined>

  showQuickPick<T extends QuickPickItem>(
    items: readonly T[] | Thenable<readonly T[]>,
    options?: QuickPickOptions & { canPickMany?: false },
    token?: CancellationToken
  ): Thenable<T | undefined>;

  showQuickPick<T extends QuickPickItem>(
    items: readonly T[] | Thenable<readonly T[]>,
    options?: QuickPickOptions & { canPickMany: true },
    token?: CancellationToken
  ): Thenable<T[] | undefined>;

  showInformationMessage<T extends string>(
    message: string,
    options: MessageOptions,
    ...items: T[]
  ): Thenable<T | undefined>;

  showTextDocument(
    document: TextDocument,
    column?: ViewColumn,
    preserveFocus?: boolean
  ): Thenable<TextEditor>;
}

/***
 * Adapter interface for the 'env' namespace
 */
export interface IVsCodeEnv {
  openExternal(target: Uri): Thenable<boolean>;
}

/***
 * Adapter interface for the 'tasks' namespace
 */
export interface IVsCodeTasks {
  onDidEndTaskProcess: Event<TaskProcessEndEvent>;
  executeTask(task: Task): Thenable<TaskExecution>;
  fetchTasks(filter?: TaskFilter): Thenable<Task[]>;
}