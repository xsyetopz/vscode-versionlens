import { IWorkspaceAdapter } from '#infrastructure/vscode';

export interface IInfrastructureServices {
  workspaceAdapter: IWorkspaceAdapter;
}