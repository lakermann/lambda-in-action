import {Construct} from "constructs";
import * as aws from "@cdktf/provider-aws";

export interface MyKinesisStreamConfig {
    streamName: string,
}

export default class MyKinesisStream extends Construct {
    readonly stream;

    constructor(scope: Construct, id: string, config: MyKinesisStreamConfig) {
        super(scope, id);

        this.stream = new aws.kinesisStream.KinesisStream(this, `${id}-kinesis-stream`, {
            name: config.streamName,
            streamModeDetails: {
                streamMode: 'ON_DEMAND'
            }
        });
    }
}
