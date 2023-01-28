import * as group from "./group";
import * as provider from "./provider";
import * as pulumi from "@pulumi/pulumi";
import type {
    GroupsPulumiConfig,
    GroupsPulumiInfo
} from "./group";
import type {
    ProvidersDict,
    ProvidersPulumiConfig
} from "./provider/types";

/**
 * Function to deploy of every resources.
 *
 * @returns {Output} Output of pulumi deployed resources
 */
function deploy (): ProvidersDict {
    const config: pulumi.Config = new pulumi.Config();

    const providers = provider.initProvider(
        config.requireObject<ProvidersPulumiConfig>("gitProvider")
    );

    group.initGroup(
        providers,
        config.requireObject<GroupsPulumiInfo>("groups"),
        config.getObject<GroupsPulumiConfig>("groupConfigs")
    );

    return providers;
}

/**
 * Main function of the program
 *
 * @returns {Output} Output of pulumi deployed resources
 */
function main (): ProvidersDict {
    return deploy();
}

export const output = main();
