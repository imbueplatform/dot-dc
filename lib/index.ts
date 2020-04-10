import { DomainController } from './base/domain-controller';
import { AwsDomainController } from './provider/aws/aws-domain-controller';


export enum DomainControllerProviderType {
    Aws
}

export class DomainControllerProvider {
    public static getProvider(config: any, providerType: DomainControllerProviderType = DomainControllerProviderType.Aws): DomainController {
        switch(providerType) {
            case DomainControllerProviderType.Aws:
                return new AwsDomainController(config);
            default:
                return new AwsDomainController(config);
        }
    }
}