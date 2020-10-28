import { GraphQLClient, gql } from 'graphql-request';
// import parseLink, { Links } from 'parse-link-header'
import { API_URL } from '../config';

export async function getImages(filters, pageInfo, page) {

  const query = gql`query getImages($input: QueryImageInput!) {
    images(input: $input) {
      images {
        hash
        dateTimeOriginal
        dateAdded
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
        count
      }
    }
  }`

  const cameras = filters.cameras.cameras;
  const selectedCameras = Object.keys(cameras).filter((sn) => (
    cameras[sn].selected === true
  ));

  const categories = filters.labels.categories;
  const selectedLabels = Object.keys(categories).filter((category) => (
    categories[category].selected === true
  ));

  const variables = {
    input: {
      ...(page === 'next' && { next: pageInfo.next }),
      ...(page === 'previous' && { previous: pageInfo.previous }),
      paginatedField: pageInfo.paginatedField,
      sortAscending: pageInfo.sortAscending,
      limit: pageInfo.limit,
      cameras: selectedCameras,
      labels: selectedLabels,
      createdStart: filters.dateCreated.start,
      createdEnd: filters.dateCreated.end,
      addedStart: filters.dateAdded.start,
      addedEnd: filters.dateAdded.end,
    }
  };
  // console.log('variables: ', variables);

  try {
    const graphQLClient = new GraphQLClient(API_URL, {
      // headers: {
      //   authorization: 'Bearer MY_TOKEN',
      // },
    });

    const imagesResponse = await graphQLClient.request(query, variables);
    // console.log(JSON.stringify(imagesResponse, undefined, 2))
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
    return camerasResponse;
  } catch (err) {
    throw err;
  }
};

export async function getLabels() {
  const query = gql`
    {
      labels {
        categories
      }
    }
  `
  
  try {
    const graphQLClient = new GraphQLClient(API_URL, {
      // headers: {
      //   authorization: 'Bearer MY_TOKEN',
      // },
    });
    const labelsResponse = await graphQLClient.request(query)
    console.log(JSON.stringify(labelsResponse, undefined, 2))
    return labelsResponse;
  } catch (err) {
    throw err;
  }
};