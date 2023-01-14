import * as provider from "./provider/index";
import * as pulumi from "@pulumi/pulumi";
import * as utils from "./utils";

const SUPPORTED_PROVIDER = ["gitlab"];

interface RepoConfig {
    baseUrl: string;
    type: string;
    token: string | {[key: string]: string};
}

interface RepoDict {
    [key: string]: RepoConfig;
}

/**
 * [TODO:description]
 *
 * @param {RepoDict} providerConfig - [TODO:description]
 * @returns {provider.GitlabProvider[]} [TODO:description]
 */
function initProvider (providerConfig: RepoDict):
provider.GitlabProvider[] {
    const providers = [];

    for (const iProvider in providerConfig) {
        if (SUPPORTED_PROVIDER.includes(providerConfig[iProvider].type)) {
            const currProvider = providerConfig[iProvider];
            const token = utils.getValue(iProvider, currProvider.token);
            const data: provider.ProviderData = {
                "args": {
                    "baseUrl": currProvider.baseUrl,
                    token
                },
                "opts": {
                    "aliases": [{"name": iProvider}]
                }
            };
            providers.push(provider.providerFactory(
                currProvider.type,
                iProvider,
                data
            ));
        } else {
            // eslint-disable-next-line function-paren-newline
            pulumi.log.warn(
                "Provider type is not supported at all: " +
                `${providerConfig[iProvider].type}`
            // eslint-disable-next-line
            ).catch(() => {});
        }
    }
    return providers;
}

/**
 * [TODO:description]
 *
 * @returns {provider.GitlabProvider[]} [TODO:description]
 */
export function deploy (): provider.GitlabProvider[] {
    const config: pulumi.Config = new pulumi.Config();
    // eslint-disable-next-line function-paren-newline
    const providers = initProvider(
        config.requireObject<RepoDict>("gitProvider")
        // eslint-disable-next-line function-paren-newline
    );

    return providers;
}

/**
 * [TODO:description]
 *
 * @returns {boolean} [TODO:description]
 */
export function main (): provider.GitlabProvider[] {
    return deploy();
}

main();
