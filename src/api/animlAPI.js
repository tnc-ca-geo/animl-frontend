import { GraphQLClient, gql } from 'graphql-request';
// import parseLink, { Links } from 'parse-link-header'
import { API_URL } from '../config';


export async function getViews() {
  const query = gql`
    {
      views {
        _id
        name
        description
        filters {
          cameras
          labels
          createdStart
          createdEnd
          addedStart
          addedEnd
        }
      }
    }
  `
  try {
    const graphQLClient = new GraphQLClient(API_URL, {
      // headers: {
      //   authorization: 'Bearer MY_TOKEN',
      // },
    });
    const viewsResponse = await graphQLClient.request(query)
    // console.log(JSON.stringify(viewsResponse, undefined, 2))
    return viewsResponse;
  } catch (err) {
    throw err;
  }
};


export async function createView(values) {
  // TODO: look into using gql "fragments" to make these more DRY
  const mutation = gql`
    mutation CreateView($input: CreateViewInput!) {
      createView(input: $input) {
        view {
          _id
          name
          description
          filters {
            cameras
            labels
            createdStart
            createdEnd
            addedStart
            addedEnd
          }
        }
      }
    }
  `
  const variables = { input: values };
  try {
    const graphQLClient = new GraphQLClient(API_URL, {
      // headers: {
      //   authorization: 'Bearer MY_TOKEN',
      // },
    });
    const createViewResponse = await graphQLClient.request(mutation, variables);
    console.log(JSON.stringify(createViewResponse, undefined, 2));
    return createViewResponse.createView.view;
  } catch (err) {
    throw err;
  }
};

export async function updateView(input) {
  const mutation = gql`
    mutation UpdateView($input: UpdateViewInput!) {
      updateView(input: $input) {
        view {
          _id
          name
          description
          filters {
            cameras
            labels
            createdStart
            createdEnd
            addedStart
            addedEnd
          }
        }
      }
    }
  `
  const variables = { input: input };
  try {
    const graphQLClient = new GraphQLClient(API_URL, {
      // headers: {
      //   authorization: 'Bearer MY_TOKEN',
      // },
    });
    console.log('updating view with variables: ', variables);
    const createViewResponse = await graphQLClient.request(mutation, variables);
    console.log(JSON.stringify(createViewResponse, undefined, 2));
    return createViewResponse.createView.view;
  } catch (err) {
    throw err;
  }
};

export async function getImages(filters, pageInfo, page) {
  const query = gql`query GetImages($input: QueryImageInput!) {
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
  const variables = {
    input: {
      ...(page === 'next' && { next: pageInfo.next }),
      ...(page === 'previous' && { previous: pageInfo.previous }),
      paginatedField: pageInfo.paginatedField,
      sortAscending: pageInfo.sortAscending,
      limit: pageInfo.limit,
      ...filters,
    }
  };
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
    // console.log(JSON.stringify(labelsResponse, undefined, 2))
    return labelsResponse;
  } catch (err) {
    throw err;
  }
};