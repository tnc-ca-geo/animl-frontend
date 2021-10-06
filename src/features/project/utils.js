import { CognitoIdentityProviderClient, ListUsersCommand } from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({ region: "REGION" });

const getUsers = (userPoolId) => {
	var params = {
	  UserPoolId: userPoolId,
	  // AttributesToGet: [
	  //   'ATTRIBUTE_NAME',
	  // ],
	};
	
	return new Promise((resolve, reject) => {
		// AWS.config.update({
    //   region: USER_POOL_REGION,
    //   'accessKeyId': AWS_ACCESS_KEY_ID,
    //   'secretAccessKey': AWS_SECRET_KEY
    // });
		// var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
		// cognitoidentityserviceprovider.listUsers(params, (err, data) => {
		// 	if (err) {
		// 		console.log(err);
		// 		reject(err)
		// 	}
		// 	else {
		// 		console.log("users: ", data);
		// 		resolve(data)
		// 	}
		// })

    // const command = new ListUsersCommand(input);
    // const response = await client.send(command);
	});
}

export {
  getUsers,
};

