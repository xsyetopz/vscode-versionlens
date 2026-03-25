import type { ILogger } from '#domain/logging';
import {
  createPackageManifest,
  PackageDependency,
  PackageSourceType,
  PackageVersionType,
  SuggestionCategory,
  SuggestionTypes
} from '#domain/packages';
import {
  createPackageNameDesc,
  createPackageVersionDesc,
  createTextRange,
  PackageDescriptor
} from '#domain/parsers';
import { GetVulnerabilities } from '#domain/useCases';
import type { IContextState, ISuggestionCodeLens, IVersionLensState } from '#extension';
import { OnUpdateDependencyClick } from '#extension/events';
import { SuggestionsOptions } from '#extension/suggestions';
import type { IVsCodeConstructFactory, IVsCodeWindow, IVsCodeWorkspace } from '#extension/vscode';
import { VulnerabilityInteractions } from '#extension/vulnerabilities';
import { test } from 'mocha-ui-esm';
import { deepEqual, equal } from 'node:assert';
import { anything, instance, mock, verify, when } from 'ts-mockito';

type TestContext = {
  mockConstruct: IVsCodeConstructFactory
  mockWorkspace: IVsCodeWorkspace
  mockWindow: IVsCodeWindow
  mockGetVulnerabilities: GetVulnerabilities
  mockVulnerabilityInteractions: VulnerabilityInteractions
  mockSuggestionOptions: SuggestionsOptions
  mockState: IVersionLensState
  mockLogger: ILogger
  mockCodeLensReplace: IContextState<boolean>
}

export const onUpdateDependencyClickTests = {

  [test.title]: OnUpdateDependencyClick.name,

  beforeEach: function (this: TestContext) {
    this.mockConstruct = mock<IVsCodeConstructFactory>()
    this.mockWorkspace = mock<IVsCodeWorkspace>()
    this.mockWindow = mock<IVsCodeWindow>()
    this.mockGetVulnerabilities = mock<GetVulnerabilities>()
    this.mockVulnerabilityInteractions = mock<VulnerabilityInteractions>()
    this.mockSuggestionOptions = mock<SuggestionsOptions>()
    this.mockState = mock<IVersionLensState>()
    this.mockLogger = mock<ILogger>()
    this.mockCodeLensReplace = mock<IContextState<boolean>>()
  },

  "prevents replace when disabled": async function (this: TestContext) {
    // setup
    const testEvent = new OnUpdateDependencyClick(
      instance(this.mockConstruct),
      instance(this.mockWorkspace),
      instance(this.mockGetVulnerabilities),
      instance(this.mockVulnerabilityInteractions),
      instance(this.mockSuggestionOptions),
      instance(this.mockState)
    );
    const testCodelens = mock<ISuggestionCodeLens>()

    when(this.mockCodeLensReplace.value).thenReturn(false)
    when(this.mockState.codeLensReplace).thenReturn(instance(this.mockCodeLensReplace))

    // test
    await testEvent.execute(instance(testCodelens));

    // verify
    verify(this.mockState.enableCodeLensReplace(anything())).never();
  },

  "applies edits to '$1' versions": [
    [SuggestionTypes.tag, 'next', 'next'],
    [SuggestionTypes.release, '1.2.3', '2.3.4'],
    async function (this: TestContext, testType: SuggestionTypes, testVersion: string, expectedVersion: string) {
      // setup
      const testDocumentUrl = 'test-url'
      const testReplaceRange = {}
      const testEvent = new OnUpdateDependencyClick(
        instance(this.mockConstruct),
        instance(this.mockWorkspace),
        instance(this.mockGetVulnerabilities),
        instance(this.mockVulnerabilityInteractions),
        instance(this.mockSuggestionOptions),
        instance(this.mockState)
      );
      const mockCodeLens = mock<ISuggestionCodeLens>()
      const testPackageResponse = {
        suggestion: {
          name: 'latest',
          version: testVersion,
          type: testType,
          category: SuggestionCategory.Latest
        },
        providerName: 'test-provider',
        packageSource: PackageSourceType.Registry,
        type: PackageVersionType.Version,
        parsedDependency: new PackageDependency(
          createPackageManifest('test-name', testVersion, 'test/path'),
          new PackageDescriptor([
            createPackageNameDesc('testPackage1', createTextRange(0, 0)),
            createPackageVersionDesc('1.0.0', createTextRange(1, 1)),
          ])
        ),
        order: 0,
      }
      when(mockCodeLens.documentUrl).thenReturn(testDocumentUrl as any)
      when(mockCodeLens.replaceRange).thenReturn(testReplaceRange as any)
      when(mockCodeLens.packageResponse).thenReturn(testPackageResponse)
      when(this.mockCodeLensReplace.value).thenReturn(true)
      when(this.mockState.codeLensReplace).thenReturn(instance(this.mockCodeLensReplace))
      const testEdit = {
        replace: function (actualUrl: any, actualRange: any, actualVersion: string) {
          equal(actualUrl, testDocumentUrl)
          deepEqual(actualRange, testReplaceRange)
          equal(actualVersion, expectedVersion)
        }
      }
      when(this.mockConstruct.createWorkspaceEdit()).thenReturn(testEdit as any)
      when(mockCodeLens.replaceVersionFn(anything(), testVersion)).thenReturn(expectedVersion)

      // vulnerability check setup
      when(this.mockSuggestionOptions.showVulnerabilities).thenReturn(true)
      when(this.mockGetVulnerabilities.execute(
        testPackageResponse.providerName,
        testPackageResponse.parsedDependency.package.name,
        expectedVersion,
        testPackageResponse.parsedDependency.versionRange
      )).thenReturn(Promise.resolve({ vulnerabilities: [] }))

      // test
      await testEvent.execute(instance(mockCodeLens));

      // verify
      verify(this.mockState.enableCodeLensReplace(false)).once();
      if (testType !== SuggestionTypes.tag)
        verify(mockCodeLens.replaceVersionFn(anything(), testVersion)).once()
      verify(this.mockConstruct.createWorkspaceEdit()).once();
      verify(this.mockWorkspace.applyEdit(testEdit as any)).once();
    }
  ],

  "shows warning when vulnerabilities found and cancels": async function (this: TestContext) {
    // setup
    const testVersion = '1.2.3'
    const expectedVersion = '2.3.4'
    const testEvent = new OnUpdateDependencyClick(
      instance(this.mockConstruct),
      instance(this.mockWorkspace),
      instance(this.mockGetVulnerabilities),
      instance(this.mockVulnerabilityInteractions),
      instance(this.mockSuggestionOptions),
      instance(this.mockState)
    );
    const mockCodeLens = mock<ISuggestionCodeLens>()
    const testPackageResponse = {
      suggestion: {
        name: 'latest',
        version: testVersion,
        type: SuggestionTypes.release,
        category: SuggestionCategory.Latest
      },
      providerName: 'test-provider',
      packageSource: PackageSourceType.Registry,
      type: PackageVersionType.Version,
      parsedDependency: new PackageDependency(
        createPackageManifest('test-name', testVersion, 'test/path'),
        new PackageDescriptor([
          createPackageNameDesc('test-name', createTextRange(0, 0)),
          createPackageVersionDesc('1.0.0', createTextRange(1, 1)),
        ])
      ),
      order: 0,
    }
    when(mockCodeLens.packageResponse).thenReturn(testPackageResponse)
    when(this.mockCodeLensReplace.value).thenReturn(true)
    when(this.mockState.codeLensReplace).thenReturn(instance(this.mockCodeLensReplace))
    when(mockCodeLens.replaceVersionFn(anything(), testVersion)).thenReturn(expectedVersion)

    // vulnerability check setup
    when(this.mockSuggestionOptions.showVulnerabilities).thenReturn(true)
    when(this.mockGetVulnerabilities.execute(
      testPackageResponse.providerName,
      testPackageResponse.parsedDependency.package.name,
      expectedVersion,
      testPackageResponse.parsedDependency.versionRange
    )).thenReturn(Promise.resolve({ vulnerabilities: [{ id: '1', range: {} as any, msg: '', url: '' }] }))

    // vulnerability interaction setup
    when(this.mockVulnerabilityInteractions.alertUpdateHasVulnerability(
      testPackageResponse.parsedDependency.package.name,
      expectedVersion
    )).thenReturn(Promise.resolve(true))

    // test
    await testEvent.execute(instance(mockCodeLens));

    // verify
    verify(this.mockVulnerabilityInteractions.alertUpdateHasVulnerability(
      testPackageResponse.parsedDependency.package.name,
      expectedVersion
    )).once();
    verify(this.mockWorkspace.applyEdit(anything())).never();
  },

  "shows warning when vulnerabilities found and continues": async function (this: TestContext) {
    // setup
    const testVersion = '1.2.3'
    const expectedVersion = '2.3.4'
    const testEvent = new OnUpdateDependencyClick(
      instance(this.mockConstruct),
      instance(this.mockWorkspace),
      instance(this.mockGetVulnerabilities),
      instance(this.mockVulnerabilityInteractions),
      instance(this.mockSuggestionOptions),
      instance(this.mockState)
    );
    const mockCodeLens = mock<ISuggestionCodeLens>()
    const testPackageResponse = {
      suggestion: {
        name: 'latest',
        version: testVersion,
        type: SuggestionTypes.release,
        category: SuggestionCategory.Latest
      },
      providerName: 'test-provider',
      packageSource: PackageSourceType.Registry,
      type: PackageVersionType.Version,
      parsedDependency: new PackageDependency(
        createPackageManifest('test-name', testVersion, 'test/path'),
        new PackageDescriptor([
          createPackageNameDesc('test-name', createTextRange(0, 0)),
          createPackageVersionDesc('1.0.0', createTextRange(1, 1)),
        ])
      ),
      order: 0,
    }
    const testDocumentUrl = 'test-url'
    const testReplaceRange = {}
    when(mockCodeLens.documentUrl).thenReturn(testDocumentUrl as any)
    when(mockCodeLens.replaceRange).thenReturn(testReplaceRange as any)
    when(mockCodeLens.packageResponse).thenReturn(testPackageResponse)
    when(this.mockCodeLensReplace.value).thenReturn(true)
    when(this.mockState.codeLensReplace).thenReturn(instance(this.mockCodeLensReplace))
    when(mockCodeLens.replaceVersionFn(anything(), testVersion)).thenReturn(expectedVersion)

    // vulnerability check setup
    when(this.mockSuggestionOptions.showVulnerabilities).thenReturn(true)
    when(this.mockGetVulnerabilities.execute(
      testPackageResponse.providerName,
      testPackageResponse.parsedDependency.package.name,
      expectedVersion,
      testPackageResponse.parsedDependency.versionRange
    )).thenReturn(Promise.resolve({ vulnerabilities: [{ id: '1', range: {} as any, msg: '', url: '' }] }))

    // vulnerability interaction setup
    when(this.mockVulnerabilityInteractions.alertUpdateHasVulnerability(
      testPackageResponse.parsedDependency.package.name,
      expectedVersion
    )).thenReturn(Promise.resolve(false))

    const testEdit = {
      replace: function () { }
    }
    when(this.mockConstruct.createWorkspaceEdit()).thenReturn(testEdit as any)

    // test
    await testEvent.execute(instance(mockCodeLens));

    // verify
    verify(this.mockVulnerabilityInteractions.alertUpdateHasVulnerability(
      testPackageResponse.parsedDependency.package.name,
      expectedVersion
    )).once();
    verify(this.mockWorkspace.applyEdit(testEdit as any)).once();
  }

};