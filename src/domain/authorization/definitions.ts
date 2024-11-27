export interface IAuthorization {
  getConsent(url: string): Promise<boolean>;
  getToken(url: string): Promise<string | undefined>;
  isUrlAuthorized(url: string): boolean;
}

export interface IUrlAuthenticationSession {
  updateConsent(url: string, value: boolean): void;
  incrementRetries(url: string): void;
  hasRetries(url: string): Promise<boolean>;
  clear(url: string): void;
}