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

const imageCommentFields = `
  _id
  author
  created
  comment
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
  fileTypeExtension
  deploymentId
  projectId
  objects {
    ${objectFields}
  }
  comments {
    ${imageCommentFields}
  }
`;

const pageInfoFields = `
  previous
  hasPrevious
  next
  hasNext
  count
`;

const batchFields = `
  _id
  projectId
  uploadComplete
  ingestionComplete
  processingStart
  processingEnd
  stoppingInitiated
  overrideSerial
  originalFile
  total
  remaining
  dead
  imageErrors
  errors {
    error
  }
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
      query GetProjects($input: QueryProjectsInput) {
        projects(input: $input) {
          ${projectFields}
        }
      }
    `,
    variables: { input: input }
  }),

  createProject: (input) => ({
    template: `
      mutation CreateProject($input: CreateProjectInput!) {
        createProject(input: $input) {
          project {
            ${projectFields}
          }
        }
      }
    `,
    variables: { input: input }
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

  deleteImages: (input) => {
    return {
      template: `
        mutation DeleteImages($input: DeleteImagesInput!) {
          deleteImages(input: $input) {
            message
          }
        }
      `,
      variables: {
        input
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

  getModels: (input) => ({
      template: `
        query GetMLModels($input: QueryMLModelsInput) {
          mlModels(input: $input) {
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
      variables: { input: input }
  }),

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

  // TODO: name this something more specific (like exportImageData)
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

  exportErrors: ({ filters }) => ({
    template: `
      query ExportErrors($input: ExportErrorsInput!) {
        exportErrors(input: $input) {
            documentId
        }
      }
    `,
    variables: {
      input: { filters }
    },
  }),

  getExportStatus: ({ documentId }) => ({
    template: `
      query GetExportStatus($input: ExportStatusInput!) {
        exportStatus(input: $input) {
          status
          url
          count
          meta
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

  createObjects: (input) => ({
    template: `
      mutation CreateObjects($input: CreateObjectsInput!) {
        createObjects(input: $input) {
          isOk
        }
      }
    `,
    variables: { input: input },
  }),

  updateObjects: (input) => ({
    template: `
      mutation UpdateObjects($input: UpdateObjectsInput!) {
        updateObjects(input: $input) {
          isOk
        }
      }
    `,
    variables: { input: input },
  }),

  deleteObjects: (input) => ({
    template: `
      mutation DeleteObjects($input: DeleteObjectsInput!) {
        deleteObjects(input: $input) {
          isOk
        }
      }
    `,
    variables: { input: input },
  }),

  createLabels: (input) => ({
    template: `
      mutation CreateLabels($input: CreateLabelsInput!) {
        createLabels(input: $input) {
          isOk
        }
      }
    `,
    variables: { input: input },
  }),

  updateLabels: (input) => ({
    template: `
      mutation UpdateLabels($input: UpdateLabelsInput!) {
        updateLabels(input: $input) {
          isOk
        }
      }
    `,
    variables: { input: input },
  }),

  deleteLabels: (input) => ({
    template: `
      mutation CreateLabels($input: CreateLabelsInput!) {
        createLabels(input: $input) {
          isOk
        }
      }
    `,
    variables: { input: input },
  }),

  createImageComment: (input) => ({
    template: `
      mutation CreateImageComment($input: CreateImageCommentInput!){
        createImageComment(input: $input) {
          comments {
            ${imageCommentFields}
          }
        }
      }
    `,
    variables: { input: input },
  }),

  updateImageComment: (input) => ({
    template: `
      mutation UpdateImageComment($input: UpdateImageCommentInput!){
        updateImageComment(input: $input) {
          comments {
            ${imageCommentFields}
          }
        }
      }
    `,
    variables: { input: input },
  }),

  deleteImageComment: (input) => ({
    template: `
      mutation DeleteImageComment($input: DeleteImageCommentInput!){
        deleteImageComment(input: $input) {
          comments {
            ${imageCommentFields}
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

  createUpload: (input) => ({
    template: `
      mutation CreateUpload($input: CreateUploadInput!) {
        createUpload(input: $input) {
          batch
          multipartUploadId
          user
          url
          urls
        }
      }
    `,
    variables: { input }
  }),

  closeUpload: (input) => ({
    template: `
      mutation CloseUpload($input: CloseUploadInput!) {
        closeUpload(input: $input) {
          message
        }
      }
    `,
    variables: { input }
  }),

  updateBatch: (input) => ({
    template: `
      mutation UpdateBatch($input: UpdateBatchInput!) {
        updateBatch(input: $input) {
          batch {
            ${batchFields}
          }
        }
      }
    `,
    variables: { input }
  }),

  getBatches: ({ filter, pageInfo, page }) => ({
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
            ${batchFields}
          }
        }
      }
    `,
    variables: { input: {
      ...(page === 'next' && { next: pageInfo.next }),
      ...(page === 'previous' && { previous: pageInfo.previous }),
      filter: filter,
      paginatedField: 'uploadComplete',
      // TODO: sortAscending should be false to show in order of newest -> oldest, 
      // but for newly created batches, batch.processingStart is not yet set and
      // gets put at the bottom of the returned array b/c of that. Figure out how
      // to return the batches in reverse chronological order but surface newly
      // created batches at the top
      sortAscending: false,
      limit: 5,
    } }
  }),

  getBatch: ({ id }) => ({
    template: `
      query GetBatch($id: String!) {
        batch(_id: $id) {
          ${batchFields}
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
  }),

  getUsers: () => ({
    template: `
      query ListUsers($input: QueryUsersInput!){
        users(input: $input) {
            users {
                username,
                email,
                enabled,
                status,
                roles,
                created,
                enabled
            }
        }
      }
    `,
    variables: { input: {}}
  }),

  updateUser: (input) => ({
    template: `
      mutation UpdateUser($input: UpdateUserInput!){
        updateUser(input: $input) {
            message
        }
      }
    `,
    variables: { input }
  }),

  createUser: (input) => ({
    template: `
      mutation createUser($input: CreateUserInput!){
        createUser(input: $input) {
            message
        }
      }
    `,
    variables: { input }
  }),
};

export default queries;
