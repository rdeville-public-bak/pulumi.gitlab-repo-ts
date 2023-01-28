import * as group from "../../src/group";
import * as provider from "../../src/provider";
import test from "ava";

// FAKE PROVIDER CONFIG
const PROVIDER_BASE_URL = "https://fake.gitlab.tld";
const PROVIDER_TOKEN = "fakeToken";
const PROVIDER_NAME = [
    "fakeGitlab1",
    "fakeGitlab2",
    "fakeGithub"
];
const [MAIN_PROVIDER] = PROVIDER_NAME;

const PROVIDER_DATA = {
    "baseUrl": PROVIDER_BASE_URL,
    "token": PROVIDER_TOKEN
};
const SUPPORTED_PROVIDER = {
    "type": "gitlab"
};
const UNSUPPORTED_PROVIDER = {
    "type": "unsupported"
};

const PROVIDER: provider.ProvidersPulumiConfig = {
    "fakeGitlab1": {
        ...PROVIDER_DATA,
        ...SUPPORTED_PROVIDER
    },
    "fakeGitlab2": {
        ...PROVIDER_DATA,
        ...SUPPORTED_PROVIDER
    },
    "fakeUnsupported": {
        ...PROVIDER_DATA,
        ...UNSUPPORTED_PROVIDER
    }
};

const GROUP_DESC = "Fake Group Description";

const ENV: {[key: string]: string} = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "PULUMI_CONFIG": `{ "project:mainProvider": "${MAIN_PROVIDER}" }`
};

Object.entries(ENV).forEach(([key, val]) => {
    process.env[key] = val;
});

test("group with unsupported provider", (currTest) => {
    const fakeGroups: group.GroupsPulumiInfo = {
        "fakeGroupName": {
            "desc": GROUP_DESC,
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            "providers": [PROVIDER_NAME[2]]
        }
    };

    const providers = provider.initProvider(PROVIDER);
    group.initGroup(
        providers,
        fakeGroups
    );

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    currTest.deepEqual(typeof providers[PROVIDER_NAME[2]], "undefined");
});

test("group with supported provider without group args", (currTest) => {
    const fakeGroups: group.GroupsPulumiInfo = {
        "fakeGroupName": {
            "desc": GROUP_DESC,
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            "providers": [PROVIDER_NAME[0]]
        }
    };

    const providers = provider.initProvider(PROVIDER);
    group.initGroup(
        providers,
        fakeGroups
    );

    currTest.snapshot(
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        providers[PROVIDER_NAME[0]].groups.fakeGroupName.group.name
    );
});

test("group with supported provider with default group args", (currTest) => {
    const fakeGroups: group.GroupsPulumiInfo = {
        "fakeGroupName": {
            "desc": GROUP_DESC,
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            "providers": [PROVIDER_NAME[0]]
        }
    };

    const fakeGroupConfigs: group.GroupsPulumiConfig = {
        "gitlab": {
            "default": {}
        }
    };

    const providers = provider.initProvider(PROVIDER);
    group.initGroup(
        providers,
        fakeGroups,
        fakeGroupConfigs
    );

    currTest.snapshot(
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        providers[PROVIDER_NAME[0]].groups.fakeGroupName.group.name
    );
});

test("group with supported provider mirror groups args", (currTest) => {
    const fakeGroups: group.GroupsPulumiInfo = {
        "fakeGroupName": {
            "desc": GROUP_DESC,
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            "providers": [PROVIDER_NAME[0], PROVIDER_NAME[1]]
        }
    };

    const fakeGroupConfigs: group.GroupsPulumiConfig = {
        "gitlab": {
            "default": {},
            "mirror": {}
        }
    };

    const providers = provider.initProvider(PROVIDER);
    group.initGroup(
        providers,
        fakeGroups,
        fakeGroupConfigs
    );

    currTest.snapshot(
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        providers[PROVIDER_NAME[0]].groups.fakeGroupName.group.name
    );
    currTest.snapshot(
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        providers[PROVIDER_NAME[1]].groups.fakeGroupName.group.name
    );
});


test("group with supported provider with subgroup", (currTest) => {
    const fakeGroups: group.GroupsPulumiInfo = {
        "fakeGroupName": {
            "desc": GROUP_DESC,
            "groups": {
                "fakeGroupName": {
                    "desc": GROUP_DESC,
                    "providers": []
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            "providers": [PROVIDER_NAME[0]]
        }
    };

    const fakeGroupConfigs: group.GroupsPulumiConfig = {
        "gitlab": {
            "default": {},
            "mirror": {}
        }
    };

    const providers = provider.initProvider(PROVIDER);
    group.initGroup(
        providers,
        fakeGroups,
        fakeGroupConfigs
    );

    currTest.snapshot(
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        providers[PROVIDER_NAME[0]].groups.fakeGroupName.group.name
    );
    currTest.snapshot(
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        providers[PROVIDER_NAME[0]].
            groups.fakeGroupName.
            subgroup.fakeGroupName.group.name
    );
});
