import { GraphQLClient, gql } from 'graphql-request';
// import parseLink, { Links } from 'parse-link-header'

export async function getImages(filters) {
  const endpoint = 'https://e1vc45j344.execute-api.us-west-1.amazonaws.com/dev/';
  const query = gql`
    query getImages($cameras: [String!]) {
      images (cameras: $cameras) {
        hash
        bucket
        cameraSn
      }
    }
  `
  const selectedCameras = Object.keys(filters.cameras).filter((sn) => (
    filters.cameras[sn].selected === true
  ));

  const variables = {
    cameras: selectedCameras,
  };
  
  try {
    const graphQLClient = new GraphQLClient(endpoint, {
      // headers: {
      //   authorization: 'Bearer MY_TOKEN',
      // },
    });

    const imagesResponse = await graphQLClient.request(query, variables)
    console.log(JSON.stringify(imagesResponse, undefined, 2))
    return imagesResponse;
  } catch (err) {
    throw err;
  }
};

export async function getCameras() {
  const endpoint = 'https://e1vc45j344.execute-api.us-west-1.amazonaws.com/dev/';
  const query = gql`
    {
      cameras {
        _id
      }
    }
  `
  
  try {
    const graphQLClient = new GraphQLClient(endpoint, {
      // headers: {
      //   authorization: 'Bearer MY_TOKEN',
      // },
    });
    const camerasResponse = await graphQLClient.request(query)
    console.log(JSON.stringify(camerasResponse, undefined, 2))
    return camerasResponse;
  } catch (err) {
    throw err;
  }
};
