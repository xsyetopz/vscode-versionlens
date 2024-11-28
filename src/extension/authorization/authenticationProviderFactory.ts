import { type KeyDictionary, Disposable } from '#domain/utils';
import type { IVsCodeAuthentication } from '#extension';
import type {
  AuthenticationInteractions,
  AuthenticationScheme,
  IAuthenticationProviderFactory
} from '#extension/authorization';
import { throwUndefinedOrNull } from '@esm-test/guards';
import type { SecretStorage } from 'vscode';
import { CustomAuthenticationProvider } from './customAuthenticationProvider';

export class AuthenticationProviderFactory extends Disposable implements IAuthenticationProviderFactory {

  constructor(
    readonly authentication: IVsCodeAuthentication,
    readonly interactions: AuthenticationInteractions,
    readonly secrets: SecretStorage
  ) {
    super();
    throwUndefinedOrNull('authentication', authentication);
    throwUndefinedOrNull('interactions', interactions);
    throwUndefinedOrNull('secrets', secrets);
  }

  private registeredProviders: KeyDictionary<boolean | undefined> = {};

  async registerCustomAuthProvider(scheme: AuthenticationScheme, url: string): Promise<void> {
    const registeredKey = `${scheme}_${url}`;

    // check the custom provider isn't already created
    if (this.registeredProviders[registeredKey]) return;

    // instantiate the custom provider
    const customAuthProvider = new CustomAuthenticationProvider(
      scheme,
      url,
      this.secrets,
      this.interactions,
      this.authentication
    );

    // register the scheme provider
    const disposable = this.authentication.registerAuthenticationProvider(
      customAuthProvider.id,
      customAuthProvider.consentLabel,
      customAuthProvider
    );

    // store the disposable
    this.disposables.push(disposable);

    // mark the provider as created
    this.registeredProviders[registeredKey] = true;
  }

}