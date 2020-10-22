import { GraphQLClient, gql } from 'graphql-request';
// import parseLink, { Links } from 'parse-link-header'
import { API_URL } from '../config';

export async function getImages(filters, pageInfo, page) {
  const query = gql`query getImages($input: QueryImageInput!) {
    images(input: $input) {
      images {
        hash
        dateTimeOriginal
        cameraSn
        make
        labels {
          category
          bbox
          type
          conf
          validation {
            reviewed
            validated
          }
        }
      }
      pageInfo {
        previous
        hasPrevious
        next
        hasNext
      }
    }
  }`

  const selectedCameras = Object.keys(filters.cameras).filter((sn) => (
    filters.cameras[sn].selected === true
  ));

  const variables = {
    input: {
      paginatedField: pageInfo.paginatedField,
      sortAscending: pageInfo.sortAscending,
      limit: pageInfo.limit,
      ...(page === 'next' && { next: pageInfo.next }),
      ...(page === 'previous' && { previous: pageInfo.previous }),
      cameras: selectedCameras,
      createdStart: filters.dateCreated.start,
      createdEnd: filters.dateCreated.end,
    }
  };

  console.log('variables: ', variables);
  
  try {
    const graphQLClient = new GraphQLClient(API_URL, {
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
  const query = gql`
    {
      cameras {
        _id
      }
    }
  `
  
  try {
    const graphQLClient = new GraphQLClient(API_URL, {
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
