import { IDomainServices, ServiceCollection } from '#domain';
import { CachingOptions } from '#domain/caching';
import { createJsonClient, HttpOptions } from '#domain/clients';
import {
  DockerConfig,
  DockerFeatures,
  DockerHubClient,
  DockerServiceName,
  DockerSuggestionProvider,
  DockerSuggestionResolver,
  IDockerServices,
  MicrosoftDockerClient
} from '#domain/providers/docker';

/**
 * Registers all Docker-specific services into the provided service collection.
 * @param services The service collection to configure.
 */
export function registerServices(services: ServiceCollection<IDomainServices & IDockerServices>) {

  services.addSingletonFactory(
    DockerServiceName.dockerCachingOpts,
    c => new CachingOptions(c.appConfig, DockerFeatures.Caching, 'caching')
  );

  services.addSingletonFactory(
    DockerServiceName.dockerHttpOpts,
    c => new HttpOptions(c.appConfig, DockerFeatures.Http, 'http')
  );

  services.addSingletonFactory(
    DockerServiceName.dockerConfig,
    c => new DockerConfig(c.appConfig, c.dockerCachingOpts, c.dockerHttpOpts)
  );

  services.addSingletonFactory(
    DockerServiceName.dockerHubClient,
    c => new DockerHubClient(
      c.dockerConfig,
      createJsonClient(c.authorizer, c.dockerHttpOpts),
      c.urlRequestCache,
      c.loggerFactory(DockerHubClient)
    )
  );

  services.addSingletonFactory(
    DockerServiceName.microsoftDockerClient,
    c => new MicrosoftDockerClient(
      c.dockerConfig,
      createJsonClient(c.authorizer, c.dockerHttpOpts),
      c.urlRequestCache,
      c.loggerFactory(MicrosoftDockerClient)
    )
  );

  services.addSingletonFactory(
    DockerServiceName.dockerSuggestionResolver,
    c => new DockerSuggestionResolver(
      c.dockerConfig,
      c.dockerHubClient,
      c.microsoftDockerClient,
      c.loggerFactory(DockerSuggestionResolver)
    )
  );

  services.addSingletonFactory(
    "docker.suggestionProvider" as any,
    c => new DockerSuggestionProvider(
      c.dockerSuggestionResolver,
      c.dockerConfig,
      c.loggerFactory(DockerSuggestionProvider)
    )
  );

}
