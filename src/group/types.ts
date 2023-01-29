import type * as gitlab from "@pulumi/gitlab";
import type * as gitlabGroup from "./gitlab";
import type * as pulumi from "@pulumi/pulumi";

// Interface
export interface GroupData {
    args?: gitlabGroup.IGitlabGroupArgs | undefined;
    opts: pulumi.CustomResourceOptions;
}

export interface GroupInfo {
    desc: string;
    providers?: string[];
    logo?: string;
    groups?: GroupsPulumiInfo;
    labels?: ArgsDict;
    badges?: ArgsDict;
    hooks?: ArgsDict;
}

export interface ArgsDict {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export interface GroupsPulumiInfo {
    [key: string]: GroupInfo;
}

export interface GroupsDict {
    [key: string]: GroupSupportedObject;
}

export interface GroupPulumiConfig {
    [key: string]: pulumi.Inputs | object;
}

export interface GroupsPulumiConfig {
    [key: string]: GroupPulumiConfig;
}

export interface GroupLabelsPulumiConfig {
    [key: string]: GroupLabelsArgs;
}

export interface GroupBadgesPulumiConfig {
    [key: string]: GroupBadgesArgs;
}

export interface GroupHooksPulumiConfig {
    [key: string]: GroupHooksArgs;
}

// Type
// eslint warnings below won't be raised once other provider will be supported
export type GroupSupportedObject = gitlabGroup.GitlabGroup;
export type GroupArgs = gitlab.GroupArgs;
export type GroupLabelsArgs = gitlab.GroupLabelArgs;
export type GroupBadgesArgs = gitlab.GroupBadgeArgs;
export type GroupHooksArgs = gitlab.GroupHookArgs;

// Enum
export enum GroupType {
    default = "default",
    fork = "fork",
    mirror = "mirror"
}
