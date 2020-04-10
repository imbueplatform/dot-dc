

export enum DomainStatus {
    Available = 'available',
    Pending = 'pending',
    Unavailable = 'unavailable'
}

export enum DomainCreatioStatus {
    Pending = 'pending',
    InSync = 'in-sync'
}

export interface DomainAvailabilityResponse {
    domainName: string,
    status: DomainStatus
}

export interface CreateDomainResponse {
    domainName: string,
    status: DomainCreatioStatus
}

export abstract class DomainController {

    protected abstract createSubDomain(domainName: string): Promise<CreateDomainResponse>;

    protected abstract domainAvailability(domainName: string): Promise<DomainAvailabilityResponse>;
}

