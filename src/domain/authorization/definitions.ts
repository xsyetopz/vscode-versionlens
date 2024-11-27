export interface IAuthorization {
  getConsent(url: string): Promise<boolean>;
  getToken(url: string): Promise<string | undefined>;
  isUrlAuthorized(url: string): boolean;
}