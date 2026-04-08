/**
 * A FIFO request queue that serializes async API calls for image review
 * mutations. This ensures that requests are processed in the order they were
 * dispatched, preventing race conditions caused by concurrent Lambda execution.
 *
 * See: https://github.com/tnc-ca-geo/animl-api/issues/316
 */

let queue = [];
let processing = false;

function onBeforeUnload(e) {
  e.preventDefault();
  e.returnValue = '';
}

function updateBeforeUnloadListener() {
  if (queue.length > 0 || processing) {
    window.addEventListener('beforeunload', onBeforeUnload);
  } else {
    window.removeEventListener('beforeunload', onBeforeUnload);
  }
}

/**
 * Enqueue an async function to be executed sequentially.
 * Returns a promise that resolves/rejects when the function completes.
 */
export function enqueue(asyncFn) {
  return new Promise((resolve, reject) => {
    queue.push({ asyncFn, resolve, reject });
    updateBeforeUnloadListener();
    processQueue();
  });
}

async function processQueue() {
  if (processing) return;
  processing = true;
  while (queue.length > 0) {
    const { asyncFn, resolve, reject } = queue.shift();
    try {
      const result = await asyncFn();
      resolve(result);
    } catch (err) {
      reject(err);
    }
  }
  processing = false;
  updateBeforeUnloadListener();
}

export function hasPendingRequests() {
  return queue.length > 0 || processing;
}
