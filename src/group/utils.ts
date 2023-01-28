import * as group from "../group";
import * as log from "../log";
import * as pulumi from "@pulumi/pulumi";
import type {
    GroupArgs,
    GroupData,
    GroupInfo,
    GroupOutput,
    GroupPulumiConfig,
    GroupSupportedObject,
    GroupsDict,
    GroupsOutput,
    GroupsPulumiConfig,
    GroupsPulumiInfo
} from "./types";
import type {
    ProviderSupportedObject,
    ProvidersDict
} from "../provider";

/**
 * Compute group configuration depending on the type of group
 *
 * @param {string} providerName - Name of the gitProvider
 * @param {string} providerType - Type of the gitProvider
 * @param {GroupsPulumiConfig} groupsConfig - Group configuration from the stack
 * @param {string} [groupType] - Type of the group (default: "default")
 * @returns {GroupArgs} Set of group args corresponding to group configuration
 */
function computeGroupConfig (
    providerName: string,
    providerType: string,
    groupsConfig?: GroupsPulumiConfig,
    groupType = "default"
): GroupArgs {
    if (groupsConfig) {
        const config: pulumi.Config = new pulumi.Config();

        const providerGroupConfigs: GroupPulumiConfig =
            groupsConfig[providerType];

        if (
            typeof providerGroupConfigs !== "undefined" &&
            "default" in providerGroupConfigs
        ) {
            if (providerName === config.require("mainProvider")) {
                return providerGroupConfigs.default as GroupArgs;
            }
            return {
                ...providerGroupConfigs.default,
                ...providerGroupConfigs[groupType]
            } as GroupArgs;
        }
    }

    return {} as GroupArgs;
}


/**
 * [TODO:description]
 *
 * @param {ProviderSupportedObject} provider - [TODO:description]
 * @param {GroupInfo} groupInfo - [TODO:description]
 * @param {string} groupName - [TODO:description]
 * @param {GroupsPulumiConfig} [groupsConfig] - [TODO:description]
 * @param {GroupSupportedObject} [parentGroup] - [TODO:description]
 * @returns {GroupData} [TODO:description]
 */
function computeGroupData (
    provider: ProviderSupportedObject,
    groupInfo: GroupInfo,
    groupName: string,
    groupsConfig?: GroupsPulumiConfig,
    parentGroup?: GroupSupportedObject
): GroupData {
    let data: GroupArgs = {
        "path": groupName.
            replace(/ /ugi, "-").
            replace(/---/ugi, "-").
            toLowerCase()
    };

    if (parentGroup) {
        const parentId: pulumi.Input<number> = parentGroup.group.id.apply(
            (id) => Number(id)
        );
        data = {
            ...data,
            parentId
        } as GroupArgs;
    }
    return {
        "args": {
            "groupConfig": {
                ...computeGroupConfig(
                    provider.name,
                    provider.providerType,
                    groupsConfig
                ),
                ...data,
                "name": groupName
            } as GroupArgs,
            provider
        },
        "opts": {
            "parent": parentGroup ?? provider,
            "provider": provider.provider
        }
    };
}

/**
 * [TODO:description]
 *
 * @param {ProviderSupportedObject} provider - [TODO:description]
 * @param {string} groupName - [TODO:description]
 * @param {GroupInfo} groupInfo - [TODO:description]
 * @param {ProvidersDict} providers - [TODO:description]
 * @param {GroupsPulumiConfig} [groupsConfig] - [TODO:description]
 * @param {GroupSupportedObject} [parentGroup] - [TODO:description]
 * @returns {GroupOutput} [TODO:description]
 */
function createGroup (
    provider: ProviderSupportedObject,
    groupName: string,
    groupInfo: GroupInfo,
    providers: ProvidersDict,
    groupsConfig?: GroupsPulumiConfig,
    parentGroup?: GroupSupportedObject
): GroupOutput {
    const data = computeGroupData(
        provider, groupInfo, groupName, groupsConfig, parentGroup
    );
    const currGroup = group.groupFactory(
        provider.providerType, groupName, data
    );

    return {
        "group": currGroup,
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        "subgroup": initGroup(
            providers, groupInfo.groups, groupsConfig, currGroup
        )
    };
}

/**
 * Process to the deployment of git groups for defined providers
 *
 * @param {string} groupName - Name of the group
 * @param {GroupInfo} groupInfo - Information of the group (such as desc, etc.)
 * @param {ProvidersDict} providers - Set of providers
 * @param {GroupsPulumiConfig} groupsConfig - groupConfigs set in the stack
 * @param {GroupSupportedObject} [parentGroup] - Group object to define subgroup
 * @returns {GroupSupportedObject[]} List of groups deployed
 */
function processGroups (
    groupName: string,
    groupInfo: GroupInfo,
    providers: ProvidersDict,
    groupsConfig?: GroupsPulumiConfig,
    parentGroup?: GroupSupportedObject
): GroupsOutput {
    const groups: GroupsOutput = {};
    if (parentGroup?.provider) {
        groups[parentGroup.provider.name] = createGroup(
            parentGroup.provider,
            groupName,
            groupInfo,
            providers,
            groupsConfig,
            parentGroup
        );
    } else {
        for (const iProvider of groupInfo.providers) {
            if (iProvider in providers) {
                groups[iProvider] = createGroup(
                    providers[iProvider],
                    groupName,
                    groupInfo,
                    providers,
                    groupsConfig
                );
            } else {
                log.warn(
                    "TODO: Implement 'fork' in createGroup() groups/utils.ts"
                );
            }
        }
    }
    return groups;
}

/**
 * Initialize the processing of each groups defined in the stack
 *
 * @param {ProvidersDict} providers - Set of providers
 * @param {GroupsPulumiInfo | undefined} groupsInfo - groups entry set in the
 *      stack
 * @param {GroupsPulumiConfig} groupsConfig - groupConfigs set in the stack
 * @param {GroupSupportedObject} parentGroup - Group parent if group is a
 *      subgroup
 * @returns {GroupsDict} Set of groups deployed
 */
export function initGroup (
    providers: ProvidersDict,
    groupsInfo: GroupsPulumiInfo | undefined,
    groupsConfig?: GroupsPulumiConfig,
    parentGroup?: GroupSupportedObject
): GroupsDict {
    const groups: GroupsDict = {};

    if (!groupsInfo) {
        return groups;
    }

    for (const iGroup in groupsInfo) {
        if (groupsInfo[iGroup].desc) {
            groups[iGroup] = processGroups(
                iGroup,
                groupsInfo[iGroup],
                providers,
                groupsConfig,
                parentGroup
            );
        }
    }
    return groups;
}
