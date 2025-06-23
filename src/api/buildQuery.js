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
  conf
  bbox
  labeledDate
  labelId
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
  imageHeight
  imageWidth
  tags
  reviewed
  url {
    medium
    small
  }
`;

const pageInfoFields = `
  previous
  hasPrevious
  next
  hasNext
`;

const batchFields = `
  _id
  projectId
  created
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
    tags
    createdStart
    createdEnd
    addedStart
    addedEnd
    reviewed
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
    country
    admin1Region
    confThreshold
    categoryConfig
  }
`;

const projectLabelFields = `
  _id
  name
  color
  reviewerEnabled
  ml
`;

const projectTagFields = `
  _id
  name
  color
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
    ${projectLabelFields}
  }
  tags {
    ${projectTagFields}
  }
  availableMLModels 
`;

const queries = {
  getProjects: (input) => ({
    template: `
      query GetProjects($input: QueryProjectsInput) {
        projects(input: $input) {
          ${projectFields}
        }
      }
    `,
    variables: { input: input },
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
    variables: { input: input },
  }),

  getViews: () => ({
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
        input: { imageId },
      },
    };
  },

  deleteImages: (input) => {
    return {
      template: `
        mutation DeleteImages($input: DeleteImagesInput!) {
          deleteImages(input: $input) {
            isOk
          }
        }
      `,
      variables: {
        input,
      },
    };
  },

  deleteImagesTask: (input) => {
    return {
      template: `
        mutation DeleteImagesTask($input: DeleteImagesInput!) {
          deleteImagesTask(input: $input) {
            _id
          }
        }
      `,
      variables: {
        input,
      },
    };
  },

  deleteImagesByFilterTask: ({ filters }) => {
    return {
      template: `
        mutation DeleteImagesByFilterTask($input: DeleteImagesByFilterTaskInput!) {
          deleteImagesByFilterTask(input: $input) {
            _id
          }
        }
      `,
      variables: {
        input: {
          filters: filters,
        },
      },
    };
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
      },
    },
  }),

  getImagesCount: ({ filters }) => ({
    template: `
      query GetImagesCount($input: QueryImagesCountInput!) {
        imagesCount(input: $input) {
          count
        }
      }
    `,
    variables: {
      input: {
        filters,
      },
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
              taxonomy
            }
          }
        }
      `,
    variables: { input: input },
  }),

  getTask: ({ taskId }) => ({
    template: `
      query GetTask($input: QueryTaskInput!) {
        task(input: $input) {
          _id
          user
          projectId
          type
          status
          created
          updated
          output
        }
      }
    `,
    variables: {
      input: { taskId },
    },
  }),

  getStats: ({ filters }) => ({
    template: `
      query GetStats($input: QueryStatsInput!) {
        stats(input: $input) {
          _id
        }
      }
    `,
    variables: {
      input: { filters },
    },
  }),

  // TODO: name this something more specific (like exportImageData)
  exportAnnotations: ({ format, filters, timezone, onlyIncludeReviewed, aggregateObjects }) => ({
    template: `
      query ExportAnnotations($input: ExportInput!) {
        exportAnnotations(input: $input) {
          _id
        }
      }
    `,
    variables: {
      input: { format, filters, timezone, onlyIncludeReviewed, aggregateObjects },
    },
  }),

  exportErrors: ({ filters }) => ({
    template: `
      query ExportErrors($input: ExportErrorsInput!) {
        exportErrors(input: $input) {
          _id
        }
      }
    `,
    variables: {
      input: { filters },
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
      input: { documentId },
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
      mutation DeleteLabels($input: DeleteLabelsInput!) {
        deleteLabels(input: $input) {
          isOk
        }
      }
    `,
    variables: { input: input },
  }),

  createProjectTag: (input) => ({
    template: `
      mutation CreateProjectTag($input: CreateProjectTagInput!) {
        createProjectTag(input: $input) {
          tags {
            ${projectTagFields}
          }
        }
      }
    `,
    variables: { input: input },
  }),

  deleteProjectTag: (input) => ({
    template: `
      mutation DeleteProjectTag($input: DeleteProjectTagInput!) {
        deleteProjectTag(input: $input) {
          tags {
            ${projectTagFields}
          }
        }
      }
    `,
    variables: { input: input },
  }),

  updateProjectTag: (input) => ({
    template: `
      mutation UpdateProjectTag($input: UpdateProjectTagInput!) {
        updateProjectTag(input: $input) {
          tags {
            ${projectTagFields}
          }
        }
      }
    `,
    variables: { input: input },
  }),

  createProjectLabel: (input) => ({
    template: `
      mutation CreateProjectLabel($input: CreateProjectLabelInput!) {
        createProjectLabel(input: $input) {
          labels {
            ${projectLabelFields}
          }
        }
      }
    `,
    variables: { input: input },
  }),

  updateProjectLabel: (input) => ({
    template: `
      mutation UpdateProjectLabel($input: UpdateProjectLabelInput!) {
        updateProjectLabel(input: $input) {
          labels {
            ${projectLabelFields}
          }
        }
      }
    `,
    variables: { input: input },
  }),

  deleteProjectLabel: (input) => ({
    template: `
      mutation DeleteProjectLabel($input: DeleteProjectLabelInput!) {
        deleteProjectLabel(input: $input) {
          isOk
          movingToTask
          task {
            _id
          }
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

  createImageTag: (input) => ({
    template: `
      mutation CreateImageTag($input: CreateImageTagInput!) {
        createImageTag(input: $input) {
          tags
        }
      }
    `,
    variables: { input: input },
  }),

  deleteImageTag: (input) => ({
    template: `
      mutation DeleteImageTag($input: DeleteImageTagInput!) {
        deleteImageTag(input: $input) {
          tags 
        }
      }
    `,
    variables: { input: input },
  }),

  createDeployment: (input) => ({
    template: `
      mutation CreateDeployment($input: CreateDeploymentInput!) {
        createDeployment(input: $input) {
          _id
        }
      }
    `,
    variables: { input: input },
  }),

  updateDeployment: (input) => ({
    template: `
      mutation UpdateDeployment($input: UpdateDeploymentInput!) {
        updateDeployment(input: $input) {
          _id
        }
      }
    `,
    variables: { input: input },
  }),

  deleteDeployment: (input) => ({
    template: `
      mutation DeleteDeployment($input: DeleteDeploymentInput!) {
        deleteDeployment(input: $input) {
          _id
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

  updateCameraSerialNumber: (input) => ({
    template: `
      mutation UpdateCameraSerialNumber($input: UpdateCameraSerialNumberInput!) {
        updateCameraSerialNumber(input: $input) {
          _id
        }
      }
    `,
    variables: { input: input },
  }),

  deleteCameraConfig: (input) => ({
    template: `
      mutation deleteCameraConfig($input: DeleteCameraInput!) {
        deleteCameraConfig(input: $input) {
          _id
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
    variables: { input },
  }),

  closeUpload: (input) => ({
    template: `
      mutation CloseUpload($input: CloseUploadInput!) {
        closeUpload(input: $input) {
          isOk
        }
      }
    `,
    variables: { input },
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
    variables: { input },
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
    variables: {
      input: {
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
      },
    },
  }),

  getBatch: ({ id }) => ({
    template: `
      query GetBatch($id: String!) {
        batch(_id: $id) {
          ${batchFields}
        }
      }
    `,
    variables: { id },
  }),

  stopBatch: ({ id }) => ({
    template: `
      mutation StopBatch($input: StopBatchInput!) {
        stopBatch(input: $input) {
          isOk
        }
      }
    `,
    variables: { input: { batch: id } },
  }),

  redriveBatch: ({ id }) => ({
    template: `
      mutation RedriveBatch($input: RedriveBatchInput!){
        redriveBatch(input: $input) {
          isOk
        }
      }
    `,
    variables: { input: { batch: id } },
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
    variables: { input: {} },
  }),

  updateUser: (input) => ({
    template: `
      mutation UpdateUser($input: UpdateUserInput!){
        updateUser(input: $input) {
          isOk
        }
      }
    `,
    variables: { input },
  }),

  createUser: (input) => ({
    template: `
      mutation createUser($input: CreateUserInput!){
        createUser(input: $input) {
          isOk
        }
      }
    `,
    variables: { input },
  }),

  resendTempPassword: (input) => ({
    template: `
      mutation resendTempPassword($input: ResendTempPasswordInput!){
        resendTempPassword(input: $input) {
          isOk
        }
      }
    `,
    variables: { input },
  }),
};

export default queries;
