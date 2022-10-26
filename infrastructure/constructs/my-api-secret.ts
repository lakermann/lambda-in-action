import {Construct} from "constructs";
import * as random from "@cdktf/provider-random";
import * as aws from "@cdktf/provider-aws";

export default class MyApiSecret extends Construct {
    readonly apiKeyArn: string;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        const apiKey = new random.password.Password(this, `${id}-api-key`, {
            length: 16,
            special: false
        });

        const apiKeySecret = new aws.secretsmanagerSecret.SecretsmanagerSecret(this, `${id}-api-key-secret`, {
            name: 'lia-api-key' // TODO: Provide as parameter to authorizer function (currently magic string)
        });

        const secretsmanagerSecretVersion = new aws.secretsmanagerSecretVersion.SecretsmanagerSecretVersion(this, `${id}-api-key-secret-v1`, {
            secretId: apiKeySecret.id,
            secretString: apiKey.result
        });

        this.apiKeyArn = secretsmanagerSecretVersion.arn;
    }
}