import { GraphQLClient, gql } from 'graphql-request';
import { Auth } from 'aws-amplify';
// import parseLink, { Links } from 'parse-link-header'
import buildQuery from './buildQuery';
import { API_URL } from '../config';

export async function call(request, input) {
  let token;

  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
  } catch (err) {
    console.log(err);
  }
  const params = buildQuery[request](input);
  try {
    const graphQLClient = new GraphQLClient(API_URL, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    const query = gql`${params.template}`;
    const res = params.variables
      ? await graphQLClient.request(query, params.variables)
      : await graphQLClient.request(query)
    // console.log('response: ', JSON.stringify(res, undefined, 2))
    return res;
  } catch (err) {
    throw err;
  }
};
