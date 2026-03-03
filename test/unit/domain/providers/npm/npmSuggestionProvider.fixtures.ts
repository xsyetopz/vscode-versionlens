import { createPackageResource, PackageDependency } from '#domain/packages';
import {
  createIgnoreChangesDesc,
  createPackageNameDesc,
  createPackageGroupDesc,
  createPackageVersionDesc,
  createTextRange,
  PackageDescriptor
} from '#domain/parsers';

export default {
  preFetchSuggestions: {
    ".npmrc": "//registry.npmjs.example/:_authToken=${NPM_AUTH}",
    ".npmrc-env": "NPM_AUTH=12345678",
    "cafile": `-----BEGIN CERTIFICATE-----
MIIECTCCA3KgAwIBAgIUDnU7Oa0fU9GFOwU7EWJP3HsRchEwDQYJKoZIhvcNAQEL
BQAwgZkxCzAJBgNVBAYTAlVTMRAwDgYDVQQIDAdNb250YW5hMRAwDgYDVQQHDAdC
b3plbWFuMREwDwYDVQQKDAhTYXd0b290aDEYMBYGA1UECwwPQ29uc3VsdGluZ18x
MDI0MRgwFgYDVQQDDA93d3cud29sZnNzbC5jb20xHzAdBgkqhkiG9w0BCQEWEGlu
Zm9Ad29sZnNzbC5jb20wHhcNMjIxMjE2MjExNzQ5WhcNMjUwOTExMjExNzQ5WjCB
mTELMAkGA1UEBhMCVVMxEDAOBgNVBAgMB01vbnRhbmExEDAOBgNVBAcMB0JvemVt
YW4xETAPBgNVBAoMCFNhd3Rvb3RoMRgwFgYDVQQLDA9Db25zdWx0aW5nXzEwMjQx
GDAWBgNVBAMMD3d3dy53b2xmc3NsLmNvbTEfMB0GCSqGSIb3DQEJARYQaW5mb0B3
b2xmc3NsLmNvbTCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEAzazdR+y+tyTD
YxtUmHnhxzEWWdadd52N4ovtBBeyxuvkm5G+MVBil1i1fynes3EkC7+XCX8m3C3s
qC6yZCt6KzUZLaKAy5n9lHEbI41U2y5ijYEILfQkcids+cmO20x1upsB+D8Y9OZ/
+1eUksyIxLQAwqrU5YgYsxEvc8DWKQkCAwEAAaOCAUowggFGMB0GA1UdDgQWBBTT
Io8oLOAF7tPtw3E9ybI2Oh2/qDCB2QYDVR0jBIHRMIHOgBTTIo8oLOAF7tPtw3E9
ybI2Oh2/qKGBn6SBnDCBmTELMAkGA1UEBhMCVVMxEDAOBgNVBAgMB01vbnRhbmEx
EDAOBgNVBAcMB0JvemVtYW4xETAPBgNVBAoMCFNhd3Rvb3RoMRgwFgYDVQQLDA9D
b25zdWx0aW5nXzEwMjQxGDAWBgNVBAMMD3d3dy53b2xmc3NsLmNvbTEfMB0GCSqG
SIb3DQEJARYQaW5mb0B3b2xmc3NsLmNvbYIUDnU7Oa0fU9GFOwU7EWJP3HsRchEw
DAYDVR0TBAUwAwEB/zAcBgNVHREEFTATggtleGFtcGxlLmNvbYcEfwAAATAdBgNV
HSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIwDQYJKoZIhvcNAQELBQADgYEAuIC/
svWDlVGBan5BhynXw8nGm2DkZaEElx0bO+kn+kPWiWo8nr8o0XU3IfMNZBeyoy2D
Uv9X8EKpSKrYhOoNgAVxCqojtGzG1n8TSvSCueKBrkaMWfvDjG1b8zLshvBu2ip4
q/I2+0j6dAkOGcK/68z7qQXByeGri3n28a1Kn6o=
-----END CERTIFICATE-----`
  },
  parseDependencies: {
    json: {
      matchesPackageManagerExpressions: {
        test: `
          {
            "packageManager": "pnpm@9.1.2"
          }
        `,
        expected: [
          new PackageDependency(
            createPackageResource('pnpm', '9.1.2', 'test/path/package.json'),
            new PackageDescriptor([
              createIgnoreChangesDesc(),
              createPackageNameDesc('pnpm@9.1.2', createTextRange(43)),
              createPackageVersionDesc('9.1.2', createTextRange(49, 54)),
              createPackageGroupDesc('packageManager', createTextRange(25, 55)),
            ])
          ),
        ]
      },
      matchesPackageManagerShaExpressions: {
        test: `
          {
            "packageManager": "pnpm@9.1.2+sha512.14e915759c11f77eac07faba4d019c193ec8637229e62ec99eefb7cf3c3b75c64447882b7c485142451ee3a6b408059cdfb7b7fa0341b975f12d0f7629c71195"
          }
        `,
        expected: [
          new PackageDependency(
            createPackageResource('pnpm', '9.1.2+sha512.14e915759c11f77eac07faba4d019c193ec8637229e62ec99eefb7cf3c3b75c64447882b7c485142451ee3a6b408059cdfb7b7fa0341b975f12d0f7629c71195', 'test/path/package.json'),
            new PackageDescriptor([
              createIgnoreChangesDesc(),
              createPackageNameDesc('pnpm@9.1.2+sha512.14e915759c11f77eac07faba4d019c193ec8637229e62ec99eefb7cf3c3b75c64447882b7c485142451ee3a6b408059cdfb7b7fa0341b975f12d0f7629c71195', createTextRange(43)),
              createPackageVersionDesc('9.1.2+sha512.14e915759c11f77eac07faba4d019c193ec8637229e62ec99eefb7cf3c3b75c64447882b7c485142451ee3a6b408059cdfb7b7fa0341b975f12d0f7629c71195', createTextRange(49, 190)),
              createPackageGroupDesc('packageManager', createTextRange(25, 191)),
            ])
          ),
        ],
      },
      matchesPackageManagerShaPrereleaseExpressions: {
        test: `
          {
            "packageManager": "pnpm@9.0.0-rc.2+sha.6d21a1f908b66fe37f42f3170d4ba8fd5e2dcde886ec85863a5e7cac"
          }
        `,
        expected: [
          new PackageDependency(
            createPackageResource('pnpm', '9.0.0-rc.2+sha.6d21a1f908b66fe37f42f3170d4ba8fd5e2dcde886ec85863a5e7cac', 'test/path/package.json'),
            new PackageDescriptor([
              createIgnoreChangesDesc(),
              createPackageNameDesc('pnpm@9.0.0-rc.2+sha.6d21a1f908b66fe37f42f3170d4ba8fd5e2dcde886ec85863a5e7cac', createTextRange(43)),
              createPackageVersionDesc('9.0.0-rc.2+sha.6d21a1f908b66fe37f42f3170d4ba8fd5e2dcde886ec85863a5e7cac', createTextRange(49, 120)),
              createPackageGroupDesc('packageManager', createTextRange(25, 121)),
            ])
          ),
        ],
      }
    }
  }
}
