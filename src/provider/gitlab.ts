import * as gitlab from "@pulumi/gitlab";
import type * as group from "../group";
import * as pulumi from "@pulumi/pulumi";

export interface IGitlabProvider {
    name: string;
    provider: gitlab.Provider;
    groups: group.GroupsDict;
}


/**
 * Pulumi custom ComponentResource which deploy a gitlab provider and its
 * associated API client.
 *
 * @augments pulumi.ComponentResource
 * @implements {IGitlabProvider} IGitlabProvider
 */
export class GitlabProvider extends pulumi.ComponentResource
    implements IGitlabProvider {

    public readonly providerType = "gitlab";

    public name = "";

    public provider: gitlab.Provider;

    public groups: group.GroupsDict = {};

    /**
     * Constructor of the ComponentResource GitlabProvider
     *
     * @param {string} name - Name of the provider
     * @param {gitlab.ProviderArgs} args - Gitlab provider arguments
     * @param {pulumi.ComponentResourceOptions} [opts] - Pulumi resources
     *      options
     */
    public constructor (
        name: string,
        args: gitlab.ProviderArgs,
        opts?: pulumi.CustomResourceOptions
    ) {
        super(`git-repo:gitlab-provider:${name}`, name, args, opts);
        this.name = name;
        this.provider = new gitlab.Provider(
            this.name,
            args,
            {
                ...opts,
                "parent": this
            }
        );
    }

}
