import * as group from "../group";
import * as pulumi from "@pulumi/pulumi";
import type {
    GroupArgs,
    GroupData,
    GroupInfo,
    GroupPulumiConfig,
    GroupSupportedObject,
    GroupsPulumiConfig,
    GroupsPulumiInfo
} from "./types";
import type {
    ProviderSupportedObject,
    ProvidersDict
} from "../provider";
import {
    genId,
    slugify
} from "../utils";

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
 * Compute data, i.e. args and opts for the group
 *
 * @param {ProviderSupportedObject} provider - Provider object
 * @param {GroupInfo} groupInfo - Info of the group
 * @param {string} groupName - Name of the group
 * @param {GroupsPulumiConfig} [groupsConfig] - Possible group configurations
 * @param {GroupSupportedObject} [parentGroup] - Pulumi group object depending
 *      on provider
 * @returns {GroupData} Object with args and data for Pulumi Group object
 */
function computeGroupData (
    provider: ProviderSupportedObject,
    // Will be used later when other type of group resources will be supported
    groupInfo: GroupInfo,
    groupName: string,
    groupsConfig?: GroupsPulumiConfig,
    parentGroup?: GroupSupportedObject
): GroupData {
    let data: GroupArgs = {
        "path": slugify(groupName)
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
            } as GroupArgs
        },
        "opts": {
            "parent": parentGroup?.group ?? provider,
            "provider": provider.provider
        }
    };
}

/**
 * Create provider supported group
 *
 * @param {ProviderSupportedObject} provider - Provider object
 * @param {string} groupName - Name of the group
 * @param {GroupInfo} groupInfo - Info of the group
 * @param {GroupsPulumiConfig} [groupsConfig] - Possible group configurations
 * @param {GroupSupportedObject} [parentGroup] - Pulumi parent group
 * @returns {GroupSupportedObject} Pulumi group object depending on provider
 */
function createGroup (
    provider: ProviderSupportedObject,
    groupName: string,
    groupInfo: GroupInfo,
    groupsConfig?: GroupsPulumiConfig,
    parentGroup?: GroupSupportedObject
): GroupSupportedObject {
    const data = computeGroupData(
        provider, groupInfo, groupName, groupsConfig, parentGroup
    );
    const groupNameSlug = slugify(`${groupName}-${genId()}`);
    const currGroup = group.groupFactory(
        provider.providerType, groupNameSlug, data
    );

    if (parentGroup) {
        parentGroup.subgroup[groupName] = currGroup;
    } else {
        provider.groups[groupName] = currGroup;
    }
    return currGroup;
}

/**
 * Process to the deployment of git groups for defined providers
 *
 * @param {ProvidersDict} providers - Set of providers
 * @param {string} groupName - Name of the group
 * @param {GroupInfo} groupInfo - Information of the group (such as desc, etc.)
 * @param {GroupsPulumiConfig} groupsConfig - groupConfigs set in the stack
 * @param {GroupSupportedObject} [parentGroup] - Group object to define subgroup
 */
function processGroups (
    providers: ProvidersDict,
    groupName: string,
    groupInfo: GroupInfo,
    groupsConfig?: GroupsPulumiConfig,
    parentGroup?: GroupSupportedObject
): void {
    if (parentGroup) {
        for (const iProvider in providers) {
            // eslint-disable-next-line max-len
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if (groupInfo.providers?.includes(iProvider)) {
                createGroup(
                    providers[iProvider],
                    groupName,
                    groupInfo,
                    groupsConfig,
                    parentGroup
                );
            }
        }
    } else {
        for (const iProvider in providers) {
            // eslint-disable-next-line max-len
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if (groupInfo.providers?.includes(iProvider)) {
                createGroup(
                    providers[iProvider],
                    groupName,
                    groupInfo,
                    groupsConfig
                );
                if (groupInfo.groups) {
                    // eslint-disable-next-line max-len
                    // eslint-disable-next-line @typescript-eslint/no-use-before-define
                    initGroup(
                        providers,
                        groupInfo.groups,
                        groupsConfig,
                        providers[iProvider].groups[groupName],
                        groupInfo.providers
                    );
                }
            }
        }
    }
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
 * @param {string[]} [parentProviders] - List of provider used for parent Group
 */
export function initGroup (
    providers: ProvidersDict,
    groupsInfo: GroupsPulumiInfo | undefined,
    groupsConfig?: GroupsPulumiConfig,
    parentGroup?: GroupSupportedObject,
    parentProviders?: string[]
): void {
    for (const iGroup in groupsInfo) {
        if (groupsInfo[iGroup].desc) {
            processGroups(
                providers,
                iGroup,
                {
                    ...groupsInfo[iGroup],
                    "providers": parentProviders ?? groupsInfo[iGroup].providers
                },
                groupsConfig,
                parentGroup
            );
        }
    }
}
