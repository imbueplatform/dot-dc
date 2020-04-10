import { DomainStatus } from '../../base/domain-controller';

export const resolveAvailabilityStatus = (availabilityType: string): DomainStatus => {

    if (["AVAILABLE", "AVAILABLE_PREORDER"].includes(availabilityType))
        return DomainStatus.Available;

    if (availabilityType === "PENDING")
        return DomainStatus.Pending;

    return DomainStatus.Unavailable;

}

export const splitZoneId = (zoneId: string): string => {
    return zoneId.split('/').slice(-1)[0];
}

export const splitDomain = (domain: string): {
    root: string,
    base: string,
    sub: string
} => {

    var newDomainSplit = domain.split('.');
    var baseDomain = newDomainSplit.slice(1).join('.');
    var subDomain = newDomainSplit[0];
    var rootDomain = newDomainSplit.slice(-2).join('.');

    return {
        root: rootDomain,
        base: baseDomain,
        sub: subDomain
    };
};

export const createChange = (type: string = 'create', baseDomain: string, subDomainName?: string): any => {

    type = type || 'CREATE';

    if (!subDomainName) {
        subDomainName = baseDomain;
        baseDomain = type;
        type = 'CREATE';
    } else {
        type = type.toUpperCase();
    }

    return {
        Action: type,
        ResourceRecordSet: {
            Name: subDomainName + '.' + baseDomain,
            Type: 'CNAME',
            ResourceRecords: [
                {
                    Value: baseDomain
                },
            ],
            TTL: 3600
        }
    };
}