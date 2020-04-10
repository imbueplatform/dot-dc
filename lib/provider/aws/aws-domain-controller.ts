import AWS from 'aws-sdk';
import _ from 'lodash';

import { DomainController, DomainAvailabilityResponse, CreateDomainResponse, DomainCreatioStatus } from '../../base/domain-controller';
import { resolveAvailabilityStatus, splitZoneId, splitDomain, createChange } from '../../common/utils/aws_utils';


export interface ConfigurationOptions {
    accessKeyId: string,
    secretAccessKey: string
}

export interface KeyValue {
    [key: string]: any
}

export class AwsDomainController extends DomainController {

    private _routeDomainsInstance: AWS.Route53Domains;
    private _routeInstance: AWS.Route53;
    private _config: ConfigurationOptions;

    constructor(config: ConfigurationOptions) {
        super();

        this._config = config;
        this._routeInstance = new AWS.Route53(config);
        this._routeDomainsInstance = new AWS.Route53Domains(config)
    }

    protected async createSubDomain(domainName: string): Promise<CreateDomainResponse> {

        let params: KeyValue = {
            ChangeBatch: {
                Changes: [],
                Comment: ''
            }
        };

        let domainDetails = splitDomain(domainName);
        let changeSet = createChange('create', domainDetails.base, domainDetails.sub)

        let hostedZoneId: string = await this.getHostedZoneId(domainName);

        params['HostedZoneId'] = hostedZoneId
        params['ChangeBatch']['Changes'] = [changeSet];
        params['ChangeBatch']['Comment'] = `created: ${domainDetails.sub}.${domainDetails.base}`

        return new Promise((res, rej) => {
            this._routeInstance.changeResourceRecordSets(params as AWS.Route53.ChangeResourceRecordSetsRequest, (err, data) => {
                if(err) 
                    return rej(`Unable to change resource record set for ${domainName}`);

                return res({
                    domainName: domainName,
                    status: data.ChangeInfo.Status == 'PENDING' ? DomainCreatioStatus.Pending : DomainCreatioStatus.InSync
                })
            });
        })
    }

    protected domainAvailability(domainName: string): Promise<DomainAvailabilityResponse> {

        var params = {
            DomainName: domainName
        };

        return new Promise((res, rej) => {

            this._routeDomainsInstance.checkDomainAvailability(params, (err, data) => {
                if (err)
                    return rej(`Unable to check domain: ${domainName} availability.`);

                let response: DomainAvailabilityResponse = {
                    domainName: domainName,
                    status: resolveAvailabilityStatus(data.Availability)
                }

                return res(response);

            })
        })
    }

    private getHostedZoneId(domain: string, nextMarker?: string): Promise<string> {
        let options: KeyValue = {}

        if (nextMarker) {
            options["NextMarker"] = nextMarker;
        }

        return new Promise((res, rej) => {

            this._routeInstance.listHostedZones(options, async (err, data) => {

                if (err)
                    return rej(`Unable to fetch hosted zone for domain: ${domain}`);

                if (data && data.HostedZones) {
                    let result = _.find(data.HostedZones, (hostedZone) => {
                        return hostedZone.Name == `${domain}.`;
                    });

                    if (result)
                        return res(splitZoneId(result.Id));

                    else if (!result && data.IsTruncated && data.NextMarker)
                        await this.getHostedZoneId(domain, data.NextMarker);

                    else
                        return rej(`No hosted zone id found for domain: ${domain}`);

                }
            });

        });

    }

}