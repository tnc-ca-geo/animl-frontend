import { GraphQLClient, gql } from 'graphql-request';
// import parseLink, { Links } from 'parse-link-header'

// export async function getImages(filters) {
//   const url = `https://api.github.com/repos/${org}/${repo}/issues?per_page=25&page=${page}`;

//   try {
//     const imagesResponse = await axios.get(url)
//     // let pageCount = 0
//     // const pageLinks = parseLink(issuesResponse.headers.link)

//     // if (pageLinks !== null) {
//     //   pageCount = getPageCount(pageLinks)
//     // }

//     return {
//       // pageLinks,
//       // pageCount,
//       images: imagesResponse.data
//     };
//   } catch (err) {
//     throw err;
//   }
// };

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
