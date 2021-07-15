// TODO: Prune fields we're not using

const viewFields = `
  _id
  name
  description
  editable
  filters {
    cameras
    labels
    createdStart
    createdEnd
    addedStart
    addedEnd
  }
  automationRules {
    _id
    name
    event {
      type
      label
    }
    action {
      type
      alertRecipient
      model
    }
  }
`

const cameraFields = `
  _id
  make
  deployments {
    _id
    name
    description
    startDate
    editable
    location {
      _id
      geometry {
        type
        coordinates
      }
      name
    }
  }
`

const labelFields = `
  _id
  type
  category
  conf
  bbox
  labeledDate
  validation {
    validated
    validationDate
    userId
  }
  modelId
  userId
`

const objectFields = `
  _id
  bbox
  locked
  labels {
    ${labelFields}
  }
`

const imageFields = `
  _id
  dateTimeOriginal
  dateAdded
  cameraSn
  make
  originalFileName
  deploymentId
  objects {
    ${objectFields}
  }`;

const pageInfoFields = `
  previous
  hasPrevious
  next
  hasNext
  count`;

const queries = {

  getViews: (input) => ({
    template: `
      {
        views {
          ${viewFields}
        }
      }
    `,
  }),

  createView: (input) => ({
    template: `
      mutation CreateView($input: CreateViewInput!) {
        createView(input: $input) {
          view {
            ${viewFields}
          }
        }
      }
    `,
    variables: { input: input },
  }),

  updateView: (input) => ({
    template: `
      mutation UpdateView($input: UpdateViewInput!) {
        updateView(input: $input) {
          view {
            ${viewFields}
          }
        }
      }
    `,
    variables: { input: input },
  }),

  deleteView: (input) => ({
    template: `
      mutation DeleteView($input: DeleteViewInput!) {
        deleteView(input: $input) {
          success
          viewId
        }
      }
    `,
    variables: { input: input },
  }),

  getImages: ({ filters, pageInfo, page }) => ({
    template: `
      query GetImages($input: QueryImageInput!) {
        images(input: $input) {
          images {
            ${imageFields}
          }
          pageInfo {
            ${pageInfoFields}
          }
        }
      }
    `,
    variables: {
      input: {
        ...(page === 'next' && { next: pageInfo.next }),
        ...(page === 'previous' && { previous: pageInfo.previous }),
        paginatedField: pageInfo.paginatedField,
        sortAscending: pageInfo.sortAscending,
        limit: pageInfo.limit,
        ...filters,
      }
    },
  }),

  getCameras: (input) => ({
    template: `
      {
        cameras {
          ${cameraFields}
        }
      }
    `,
  }),

  getLabels: (input) => ({
    template: `
      {
        labels {
          categories
        }
      }
    `,
  }),

  getModels: (input) => ({
    template: `
      {
        models {
          _id
          name
          description
          version
        }
      }
    `,
  }),

  // updateObjects: (input) => ({
  //   template: `
  //     mutation UpdateObjects($input: UpdateObjectsInput!) {
  //       updateObjects(input: $input) {
  //         image {
  //           ${imageFields}
  //         }
  //       }
  //     }
  //   `,
  //   variables: { input: input },
  // }),

  createObject: (input) => ({
    template: `
      mutation CreateObject($input: CreateObjectInput!) {
        createObject(input: $input) {
          image {
            ${imageFields}
          }
        }
      }
    `,
    variables: { input: input },
  }),

  updateObject: (input) => ({
    template: `
      mutation UpdateObject($input: UpdateObjectInput!) {
        updateObject(input: $input) {
          image {
            ${imageFields}
          }
        }
      }
    `,
    variables: { input: input },
  }),

  deleteObject: (input) => ({
    template: `
      mutation DeleteObject($input: DeleteObjectInput!) {
        deleteObject(input: $input) {
          image {
            ${imageFields}
          }
        }
      }
    `,
    variables: { input: input },
  }),

  createLabel: (input) => ({
    template: `
      mutation CreateLabels($input: CreateLabelsInput!) {
        createLabels(input: $input) {
          image {
            ${imageFields}
          }
        }
      }
    `,
    variables: { input: input },
  }),

  updateLabel: (input) => ({
    template: `
      mutation UpdateLabel($input: UpdateLabelInput!) {
        updateLabel(input: $input) {
          image {
            ${imageFields}
          }
        }
      }
    `,
    variables: { input: input },
  }),

  deleteLabel: (input) => ({
    template: `
      mutation DeleteLabel($input: DeleteLabelInput!) {
        deleteLabel(input: $input) {
          image {
            ${imageFields}
          }
        }
      }
    `,
    variables: { input: input },
  }),

};

export default queries;
