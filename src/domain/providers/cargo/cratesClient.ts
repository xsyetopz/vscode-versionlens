import type { IJsonHttpClient } from '#domain/clients';
import type { ILogger } from '#domain/logging';
import type {
  CargoConfig,
  CratesPackageVersionEntry,
  CratesPackageVersionsResponse
} from '#domain/providers/cargo';
import { throwUndefinedOrNull } from '@esm-test/guards';

export class CratesClient {

  constructor(
    readonly config: CargoConfig,
    readonly jsonClient: IJsonHttpClient,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("config", config);
    throwUndefinedOrNull("jsonClient", jsonClient);
    throwUndefinedOrNull("logger", logger);
  }

  async get(packageName: string): Promise<CratesPackageVersionsResponse> {
    const url = `${this.config.apiUrl}${packageName}/versions`;
    const jsonResponse = await this.jsonClient.get(url) as CratesPackageVersionsResponse;
    if (jsonResponse.rejected) return jsonResponse as any;
    // reduce the dataset
    const data = {
      versions: jsonResponse.data.versions.map<CratesPackageVersionEntry>(
        x => ({ num: x.num, yanked: x.yanked })
      )
    };
    // return the response
    return { ...jsonResponse, data };
  }

}