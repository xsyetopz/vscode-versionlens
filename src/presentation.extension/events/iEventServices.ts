import {
  OnActiveTextEditorChange,
  OnClearCache,
  OnErrorClick,
  OnFileLinkClick,
  OnPackageDependenciesChanged,
  OnPreSaveChanges,
  OnProviderEditorActivated,
  OnProviderTextDocumentChange,
  OnProviderTextDocumentClose,
  OnSaveChanges,
  OnTextDocumentChange,
  OnTextDocumentClose,
  OnTextDocumentSave,
  OnTogglePrereleases,
  OnToggleReleases,
  OnUpdateDependencyClick
} from '#extension';

// event di dependencies
export interface IEventServices {
  // command events
  onClearCache: OnClearCache;
  onFileLinkClick: OnFileLinkClick;
  onUpdateDependencyClick: OnUpdateDependencyClick;

  // editorTitleBar events
  onToggleReleases: OnToggleReleases;
  onTogglePrereleases: OnTogglePrereleases;
  onErrorClick: OnErrorClick;

  // install events
  onPreSaveChanges: OnPreSaveChanges;
  onSaveChanges: OnSaveChanges;

  // provider events
  onProviderEditorActivated: OnProviderEditorActivated;
  onProviderTextDocumentChange: OnProviderTextDocumentChange;
  onProviderTextDocumentClose: OnProviderTextDocumentClose;

  // vscode events
  onActiveTextEditorChange: OnActiveTextEditorChange;
  onTextDocumentChange: OnTextDocumentChange;
  onTextDocumentClose: OnTextDocumentClose;
  onTextDocumentSave: OnTextDocumentSave;

  // watcher events
  onPackageDependenciesChanged: OnPackageDependenciesChanged
}