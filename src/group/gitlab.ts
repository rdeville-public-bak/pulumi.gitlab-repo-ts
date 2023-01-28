import * as gitlab from "@pulumi/gitlab";
import * as pulumi from "@pulumi/pulumi";
import type {
    GroupArgs
} from "./types";

export interface IGitlabGroupArgs {
    groupConfig: GroupArgs;
}

export interface IGitlabSubGroup {
    [key: string]: GitlabGroup;
}

export interface IGitlabGroup {
    group: gitlab.Group;
    subgroup: IGitlabSubGroup;
    /*
     * accessTokens: gitlab.GroupAccessToken[];
     * badges: gitlab.GroupBadge[];
     * hooks: gitlab.GroupHook[];
     * label: gitlab.GroupLabel[];
     * variables: gitlab.GroupVariable[];
     */
}


/**
 * Pulumi custom ComponentResource which deploy a gitlab groups and associated
 * resources such as labels, hooks, etc.
 *
 * @augments pulumi.ComponentResource
 * @implements {IGitlabGroup} IGitlabGroup
 */
export class GitlabGroup extends pulumi.ComponentResource
    implements IGitlabGroup {

    public group: gitlab.Group;

    public subgroup: IGitlabSubGroup = {};

    /*
     * public accessTokens: gitlab.GroupAccessToken[] = [];
     * public badges: gitlab.GroupBadge[] = [];
     * public hooks: gitlab.GroupHook[] = [];
     * public label: gitlab.GroupLabel[] = [];
     * public variables: gitlab.GroupVariable[] = [];
     */

    /**
     * Constructor of the ComponentResource GitlabGroup
     *
     * @param {string} name - Name of the group
     * @param {GroupArgs} args - Gitlab group arguments
     * @param {pulumi.ComponentResourceOptions} [opts] - Pulumi resources
     *      options
     */
    public constructor (
        name: string,
        args: IGitlabGroupArgs,
        opts?: pulumi.ComponentResourceOptions
    ) {
        super("git-repo:gitlab-group", name, args, opts);
        this.group = new gitlab.Group(
            name,
            args.groupConfig,
            {
                ...opts,
                "parent": this
            }
        );
        this.registerOutputs();
    }

}
