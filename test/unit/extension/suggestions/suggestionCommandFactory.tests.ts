import { SuggestionCategory, SuggestionTypes } from '#domain/packages';
import { createSuggestedVersionCommand } from '../../../../src/extension/suggestions/suggestionCommandFactory';
import { test } from 'mocha-ui-esm';
import { equal, ok } from 'node:assert';
import * as os from 'node:os';

const isWindows = os.type() === "Windows_NT";

class MockCodeLens {
  command: any;
  packageResponse: any;
  constructor(packageResponse: any) {
    this.packageResponse = packageResponse;
  }
  setCommand(title: string, command: string, args?: Array<any>) {
    this.command = {
      title,
      command,
      arguments: args
    };
    return this;
  }
}

export const suggestionCommandFactoryTests = {

  [test.title]: 'SuggestionCommandFactory',

  "createSuggestedVersionCommand uses UpdateableVulnerable indicator when vulnerable": function () {
    // setup
    const testPackageResponse = {
      suggestion: {
        name: 'latest',
        version: '1.2.3',
        type: SuggestionTypes.release,
        category: SuggestionCategory.Updateable,
        isVulnerable: true
      }
    };
    const testCodeLens = new MockCodeLens(testPackageResponse);

    const testIndicators = {
      "Updateable": "↑ ",
      "UpdateableVulnerable": "⚠️"
    };

    // test
    createSuggestedVersionCommand(testCodeLens as any, testIndicators as any);

    // verify
    const expectedTitle = `⚠️${isWindows ? '' : ' '}latest 1.2.3`;
    equal(testCodeLens.command.title, expectedTitle);
  },

  "createSuggestedVersionCommand falls back to ⚠️ if UpdateableVulnerable is missing": function () {
    // setup
    const testPackageResponse = {
      suggestion: {
        name: 'latest',
        version: '1.2.3',
        type: SuggestionTypes.release,
        category: SuggestionCategory.Updateable,
        isVulnerable: true
      }
    };
    const testCodeLens = new MockCodeLens(testPackageResponse);

    const testIndicators = {
      "Updateable": "↑ "
    };

    // test
    createSuggestedVersionCommand(testCodeLens as any, testIndicators as any);

    // verify
    ok(testCodeLens.command.title.includes("⚠️"), "Should include the ⚠️ indicator");
    ok(!testCodeLens.command.title.includes("↑"), "Should NOT include the up arrow");
    ok(!testCodeLens.command.title.includes("undefined"), "Should NOT include 'undefined'");
  }

};
