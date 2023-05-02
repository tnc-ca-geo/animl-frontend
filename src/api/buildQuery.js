// TODO: Prune fields we're not using

const wirelessCameraFields = `
  _id
  make
  model 
  projRegistrations {
    _id
    projectId
    active
  }
`;

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
  mlModel
  userId
`;

const objectFields = `
  _id
  bbox
  locked
  labels {
    ${labelFields}
  }
`;

const imageFields = `
  _id
  dateTimeOriginal
  timezone
  dateAdded
  cameraId
  make
  originalFileName
  deploymentId
  projectId
  objects {
    ${objectFields}
  }`;

const pageInfoFields = `
  previous
  hasPrevious
  next
  hasNext
  count
`;

const cameraConfigFields = `
  _id
  deployments {
    _id
    name
    description
    timezone
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
`;

const viewFields = `
  _id
  name
  description
  editable
  filters {
    cameras
    deployments
    labels
    createdStart
    createdEnd
    addedStart
    addedEnd
    reviewed
    notReviewed
    custom
  }
`;

const automationRuleFields = `
  _id
  name
  event {
    type
    label
  }
  action {
    type
    alertRecipients
    mlModel
    confThreshold
    categoryConfig
  }
`;

const projectFields = `
  _id
  name
  timezone
  description
  views {
    ${viewFields}
  }
  automationRules {
    ${automationRuleFields}
  }
  cameraConfigs {
    ${cameraConfigFields}
  }
  labels {
    categories
  }
  availableMLModels 
`

const queries = {

  getProjects: (input) => ({
    template: `
      {
        projects {
          ${projectFields}
        }
      }
    `,
  }),

  getViews: (input) => ({
    template: `
      {
        views {
          ${viewFields}
        }
      }
    `,
  }),

  getImage: ({ imageId }) => {
    return {
      template: `
        query GetImage($input: QueryImageInput!) {
          image(input: $input) {
            ${imageFields}
          }
        }
      `,
      variables: {
        input: { imageId }
      }
    }
  },

  getImages: ({ filters, pageInfo, page }) => ({
    template: `
      query GetImages($input: QueryImagesInput!) {
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
        filters,
      }
    },
  }),

  getWirelessCameras: () => ({
    template: `
      {
        wirelessCameras {
          ${wirelessCameraFields}
        }
      }
    `,
  }),

  getLabels: () => ({
    template: `
      {
        labels {
          categories
        }
      }
    `,
  }),

  getModels: (input) => {
    return {
      template: `
        {
          mlModels {
            _id
            description
            version
            defaultConfThreshold
            categories {
              _id
              name
            }
          }
        }
      `,
      variables: { input: input },
    }
  },

  getStats: ({ filters }) => ({
    template: `
      query GetStats($input: QueryStatsInput!) {
        stats(input: $input) {
          imageCount
          reviewedCount {
            reviewed
            notReviewed
          }
          reviewerList {
            userId
            reviewedCount
          }
          labelList
          multiReviewerCount
        }
      }
    `,
    variables: {
      input: { filters }
    },
  }),

  export: ({ format, filters }) => ({
    template: `
      query Export($input: ExportInput!) {
        export(input: $input) {
          documentId
        }
      }
    `,
    variables: {
      input: { format, filters }
    },
  }),

  getExportStatus: ({ documentId }) => ({
    template: `
      query GetExportStatus($input: ExportStatusInput!) {
        exportStatus(input: $input) {
          status
          url
          imageCount
          reviewedCount {
            reviewed
            notReviewed
          }
          error {
            message
          }
        }
      }
    `,
    variables: {
      input: { documentId }
    },
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
          project {
            ${projectFields}
          }
        }
      }
    `,
    variables: { input: input },
  }),

  updateAutomationRules: (input) => ({
    template: `
      mutation UpdateAutomationRules($input: UpdateAutomationRulesInput!) {
        updateAutomationRules(input: $input) {
          automationRules {
            ${automationRuleFields}
          }
        }
      }
    `,
    variables: { input: input },
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

  createDeployment: (input) => ({
    template: `
      mutation CreateDeployment($input: CreateDeploymentInput!) {
        createDeployment(input: $input) {
          cameraConfig {
            ${cameraConfigFields}
          }
        }
      }
    `,
    variables: { input: input },
  }),

  updateDeployment: (input) => ({
    template: `
      mutation UpdateDeployment($input: UpdateDeploymentInput!) {
        updateDeployment(input: $input) {
          cameraConfig {
            ${cameraConfigFields}
          }
        }
      }
    `,
    variables: { input: input },
  }),

  deleteDeployment: (input) => ({
    template: `
      mutation DeleteDeployment($input: DeleteDeploymentInput!) {
        deleteDeployment(input: $input) {
          cameraConfig {
            ${cameraConfigFields}
          }
        }
      }
    `,
    variables: { input: input },
  }),

  registerCamera: (input) => ({
    template: `
      mutation RegisterCamera($input: RegisterCameraInput!) {
        registerCamera(input: $input) {
          project {
            ${projectFields}
          }
          wirelessCameras {
            ${wirelessCameraFields}
          }
        }
      }
    `,
    variables: { input: input },
  }),

  unregisterCamera: (input) => ({
    template: `
      mutation UnregisterCamera($input: UnregisterCameraInput!) {
        unregisterCamera(input: $input) {
          project {
            ${projectFields}
          }
          wirelessCameras {
            ${wirelessCameraFields}
          }
        }
      }
    `,
    variables: { input: input },
  }),

  getSignedUrl: (input) => ({
    template: `
      mutation CreateUpload($input: CreateUploadInput!) {
        createUpload(input: $input) {
            batch
            user
            url
        }
      }
    `,
    variables: { input }
  }),

  getBatches: ({user, pageInfo, page}) => ({
    template: `
      query GetBatches($input: QueryBatchesInput!) {
        batches(input: $input) {
          pageInfo {
            previous
            hasPrevious
            next
            hasNext
          },
          batches {
            _id
            eTag
            processingStart
            processingEnd
            remaining
            total
            originalFile
          }
        }
      }
    `,
    variables: { input: {
      ...(page === 'next' && { next: pageInfo.next }),
      ...(page === 'previous' && { previous: pageInfo.previous }),
      limit: 5,
      user
    } }
  }),

  getBatch: ({ id }) => ({
    template: `
      query GetBatch($id: String!) {
        batch(_id: $id) {
          _id
          eTag
          processingStart
          processingEnd
          dead
          remaining
          total
          errors {
            error
          }
        }
      }
    `,
    variables: { id }
  }),

  stopBatch: ({ id }) => ({
    template: `
      mutation StopBatch($input: StopBatchInput!) {
        stopBatch(input: $input) {
          message
        }
      }
    `,
    variables: { input: { batch: id } }
  })
};

export default queries;
