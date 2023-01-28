import * as group from "./group";
import * as provider from "./provider";
import * as pulumi from "@pulumi/pulumi";
import type {
    GroupsDict,
    GroupsPulumiConfig,
    GroupsPulumiInfo
} from "./group";
import type {
    ProvidersDict,
    ProvidersPulumiConfig
} from "./provider/types";

interface Output {
    groups: GroupsDict;
    providers: ProvidersDict;
}

/**
 * Function to deploy of every resources.
 *
 * @returns {Output} Output of pulumi deployed resources
 */
function deploy (): Output {
    const config: pulumi.Config = new pulumi.Config();

    const providers = provider.initProvider(
        config.requireObject<ProvidersPulumiConfig>("gitProvider")
    );

    const groups = group.initGroup(
        providers,
        config.requireObject<GroupsPulumiInfo>("groups"),
        config.getObject<GroupsPulumiConfig>("groupConfigs")
    );

    return {
        groups,
        providers
    };
}

/**
 * Main function of the program
 *
 * @returns {Output} Output of pulumi deployed resources
 */
function main (): Output {
    return deploy();
}

export const output = main();
