import {Construct} from "constructs";
import {App, S3Backend, TerraformStack} from "cdktf";
import {AwsProvider} from "@cdktf/provider-aws/lib/provider";

class MyStack extends TerraformStack {
    constructor(scope: Construct, name: string) {
        super(scope, name);

        // define resources here
        const awsProvider = new AwsProvider(this, 'aws', {
            region: 'us-east-1'
        });

        // S3 backend
        new S3Backend(this, {
            key: 'lambda-in-action',
            bucket: 'lambda-in-action',
            region: awsProvider.region,
        });
    }
}

const app = new App();
new MyStack(app, "lambda-in-action");
app.synth();


