const errorContent = {
  'INTERNAL_SERVER_ERROR': 'An error occurred and some of your recent ' +
      'actions may not have been saved. Please refresh your ' +
      'browser and try again.',

  'FORBIDDEN': 'You are not permitted to perform the previous action.',
};

function getErrorContent(error) {
  const code = error.extensions.code;
  const errMessageOverride = errorContent[code];
  return errMessageOverride || error.message;
}

export default getErrorContent;