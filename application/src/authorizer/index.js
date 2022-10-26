const SecretsManager = require('./secretsManager.js');

exports.handler = async (event, context, callback) => {

    const token = event.headers['x-api-key']
    console.log(JSON.stringify(event));
    console.log(`Token: ${token}`);

    // TODO: extract api-key as parameter, provide from IaC
    let secret = await SecretsManager.getSecret('lia-api-key', 'us-east-1');

    if (secret === token) {
        console.log('Auth success');
        return {
            "isAuthorized": true,
        }
    } else {
        console.log('Auth failed');
        return {
            "isAuthorized": false,
        }
    }
};