import { WorkspaceEdit } from 'vscode';
import type { IVsCodeConstructFactory } from './definitions';

export class VsCodeConstructionFactory implements IVsCodeConstructFactory {

  createWorkspaceEdit(): WorkspaceEdit {
    return new WorkspaceEdit();
  }

}