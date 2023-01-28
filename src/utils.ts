import * as process from "process";
import * as pulumi from "@pulumi/pulumi";
import {spawnSync} from "child_process";

type ProtectedData = string | {[key: string]: string};

export const ID_SIZE = 5;
const INCREMENT = 1;

/**
 * Generate a random string with length specified as arguments
 *
 * @param {number} length - Size of the string
 * @returns {string} Random string
 */
export function genId (length: number = ID_SIZE): string {
    let result = "";
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let idx = 0; idx < length; idx += INCREMENT) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
}

/**
 * Return a slugify version of a string
 *
 * @param {string} str - String to slugify
 * @returns {string} Slugified string
 */
export function slugify (str: string): string {
    return str.
        replace(/ /ugi, "-").
        replace(/---/ugi, "-").
        toLowerCase();
}

/**
 * Compute a value from a command provided.
 *
 * @param {string} fullCmd - Command to execute
 * @throws {Error} - If command failed, throws an error
 * @returns {string} Result of the executed command if no error
 */
function getCmdValue (fullCmd: string): string {
    const zero = 0;
    const one = 1;
    const cmd = fullCmd.split(" ")[zero];
    const args = fullCmd.split(" ").slice(one);
    const exec = spawnSync(cmd, args, {"encoding": "utf8"});

    if (exec.status !== zero) {
        // eslint-disable-next-line max-len
        throw new Error(`Command ${fullCmd} exited with following error: \n${exec.stderr}`);
    }
    return exec.stdout.replace("\n", "");
}

/**
 * Get a value from a environment variable name provided.
 *
 * @param {string} envVarName - Name of the environment variable
 * @throws {Error} - If variable environment is not set, throws an error
 * @returns {string} Value of the environment variable if sets
 */
function getEnvValue (envVarName: string): string {
    const env = process.env[envVarName];
    if (env === "" || typeof env === "undefined") {
        throw new Error(`Environment variable '${envVarName}' does not exists`);
    } else {
        return env;
    }
}

/**
 * Compute value from a command or an environment variable for an object
 *
 * @param {string} parent - Parent key of the object with value to compute
 * @param {ProtectedData} data - Object with subkey which
 *      define how to get the value
 * @throws {Error} - Throw an error if unable to get the value
 * @returns {pulumi.Output<string> | string} Value computed
 */
export function getValue (
    parent: string,
    data: ProtectedData
): pulumi.Output<string> | string {
    if (typeof data === "string") {
        return data;
    } else if (data.cmd) {
        return pulumi.secret(getCmdValue(data.cmd));
    } else if (data.env) {
        return pulumi.secret(getEnvValue(data.env));
    }

    // eslint-disable-next-line max-len
    throw new Error(`Pulumi config key '${parent}' should have a subkey valid among (cmd | env)`);
}
