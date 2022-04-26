import { GraphQLClient, gql } from 'graphql-request';
import { Auth } from 'aws-amplify';
// import parseLink, { Links } from 'parse-link-header'
import buildQuery from './buildQuery';
import { API_URL } from '../config';

export async function call({ projId, request, input }) {

  let token;
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
  } catch (err) {
    console.log(err);
  }

  try {
    const params = buildQuery[request](input);
    const graphQLClient = new GraphQLClient(API_URL, {
      headers: {
        'authorization': `Bearer ${token}`,
        ...(projId && { 'x-selected-project': projId }),
      },
    });

    const query = gql`${params.template}`;
    return params.variables
      ? await graphQLClient.request(query, params.variables)
      : await graphQLClient.request(query)

  } catch (err) {
    console.log('err in call() catch block: ', err)
    // https://github.com/prisma-labs/graphql-request/issues/201
    throw JSON.parse(JSON.stringify(err)).response.errors;
  }
};
