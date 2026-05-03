import { run, SortByEnum } from '@esm-test/esm-test-node';
import * as UnitTests from './unit/index.tests';

export function testRun(): Promise<void> {
    return run([UnitTests], { sort: SortByEnum.none });
}

if (process.env.TEST_HEADLESS && process.env.TEST_HEADLESS === 'true') {
  testRun().catch(e => process.exit(1));
}
