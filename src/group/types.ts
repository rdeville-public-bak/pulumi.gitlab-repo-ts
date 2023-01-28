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

// Type
// eslint warnings below won't be raised once other provider will be supported
export type GroupSupportedObject = gitlabGroup.GitlabGroup;
export type GroupArgs = gitlab.GroupArgs;

// Enum
export enum GroupType {
    default = "default",
    fork = "fork",
    mirror = "mirror"
}
