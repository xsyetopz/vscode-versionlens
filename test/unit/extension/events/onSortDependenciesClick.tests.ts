import { DependencyCache, PackageDependency } from '#domain/packages';
import {
  createPackageGroupDesc,
  createPackageNameDesc,
  createTextRange,
  PackageDescriptor
} from '#domain/parsers';
import { GetSuggestionProvider, SortDependencies } from '#domain/useCases';
import { IVersionLensState } from '#extension';
import { OnSortDependenciesClick } from '#extension/events';
import { IVsCodeConstructFactory, IVsCodeWorkspace } from '#extension/vscode';
import { test } from '@esm-test/esm-test-node';
import { anything, instance, mock, verify, when } from 'ts-mockito';

type TestContext = {
  mockConstruct: IVsCodeConstructFactory
  mockWorkspace: IVsCodeWorkspace
  mockState: IVersionLensState
  mockGetSuggestionProvider: GetSuggestionProvider
  mockSortDependencies: SortDependencies
  mockDependencyCache: DependencyCache
}

export const onSortDependenciesClickTests = {

  [test.title]: OnSortDependenciesClick.name,

  beforeEach: function (this: TestContext) {
    this.mockConstruct = mock<IVsCodeConstructFactory>()
    this.mockWorkspace = mock<IVsCodeWorkspace>()
    this.mockState = mock<IVersionLensState>()
    this.mockGetSuggestionProvider = mock(GetSuggestionProvider)
    this.mockSortDependencies = mock(SortDependencies)
    this.mockDependencyCache = mock(DependencyCache)
  },

  "executes sort use case and applies edits": async function (this: TestContext) {
    // setup
    const testFileName = 'package.json';
    const testFileText = 'test text';
    const testProvider = { name: 'test-provider' };
    const testDeps = [
      new PackageDependency(
        { name: 'b', version: '1.0.0', path: 'test/path' } as any,
        new PackageDescriptor([
          createPackageNameDesc('b', createTextRange(0)),
          createPackageGroupDesc('dependencies', createTextRange(0, 1))
        ])
      ),
      new PackageDependency(
        { name: 'a', version: '1.0.0', path: 'test/path' } as any,
        new PackageDescriptor([
          createPackageNameDesc('a', createTextRange(2)),
          createPackageGroupDesc('dependencies', createTextRange(2, 3))
        ])
      )
    ];

    const testEdits = [
      { range: createTextRange(0, 1), newText: 'sorted-a' },
      { range: createTextRange(2, 3), newText: 'sorted-b' }
    ];

    const mockEditor = {
      document: {
        fileName: testFileName,
        getText: () => testFileText,
        uri: 'test-uri',
        positionAt: (offset: number) => ({ line: 0, character: offset })
      }
    };

    const mockWorkspaceEdit = mock<any>();

    when(this.mockGetSuggestionProvider.execute(testFileName)).thenReturn(testProvider as any);
    when(this.mockDependencyCache.get(testProvider.name, testFileName)).thenReturn(testDeps);
    when(this.mockSortDependencies.execute(testFileText, testDeps)).thenReturn(testEdits);
    when(this.mockConstruct.createWorkspaceEdit()).thenReturn(instance(mockWorkspaceEdit) as any);
    when(this.mockConstruct.createRange(anything(), anything())).thenReturn({} as any);

    const testEvent = new OnSortDependenciesClick(
      instance(this.mockConstruct),
      instance(this.mockWorkspace),
      instance(this.mockState),
      instance(this.mockGetSuggestionProvider),
      instance(this.mockSortDependencies),
      instance(this.mockDependencyCache)
    );

    // test
    await testEvent.execute(mockEditor as any);

    // verify
    verify(this.mockGetSuggestionProvider.execute(testFileName)).once();
    verify(this.mockDependencyCache.get(testProvider.name, testFileName)).once();
    verify(this.mockSortDependencies.execute(testFileText, testDeps)).once();
    verify(this.mockConstruct.createWorkspaceEdit()).once();
    verify(this.mockWorkspace.applyEdit(anything())).once();
  },

  "falls back to parseDependencies when cache is empty": async function (this: TestContext) {
    // setup
    const testFileName = 'package.json';
    const testFileText = 'test text';
    const mockProvider = mock<any>();
    const testProvider = instance(mockProvider);
    const testDeps: any[] = [{ package: { name: 'a' }, descriptors: { getType: () => ({ range: {} }) } }];
    const testEdits: any[] = [{ range: {}, newText: 'new' }];

    const mockEditor = {
      document: {
        fileName: testFileName,
        getText: () => testFileText,
        uri: 'test-uri',
        positionAt: (offset: number) => ({ line: 0, character: offset })
      }
    };

    const mockWorkspaceEdit = mock<any>();

    when(this.mockGetSuggestionProvider.execute(testFileName)).thenReturn(testProvider);
    when(this.mockDependencyCache.get(anything(), testFileName)).thenReturn(undefined);
    when(mockProvider.parseDependencies(testFileName, testFileText)).thenReturn(testDeps);
    when(this.mockSortDependencies.execute(testFileText, testDeps)).thenReturn(testEdits);
    when(this.mockConstruct.createWorkspaceEdit()).thenReturn(instance(mockWorkspaceEdit) as any);
    when(this.mockConstruct.createRange(anything(), anything())).thenReturn({} as any);

    const testEvent = new OnSortDependenciesClick(
      instance(this.mockConstruct),
      instance(this.mockWorkspace),
      instance(this.mockState),
      instance(this.mockGetSuggestionProvider),
      instance(this.mockSortDependencies),
      instance(this.mockDependencyCache)
    );

    // test
    await testEvent.execute(mockEditor as any);

    // verify
    verify(mockProvider.parseDependencies(testFileName, testFileText)).once();
    verify(this.mockSortDependencies.execute(testFileText, testDeps)).once();
    verify(this.mockWorkspace.applyEdit(anything())).once();
  }

};
