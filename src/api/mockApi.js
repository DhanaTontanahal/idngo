import { colleague, ADDRESS_TYPES, CANCEL_REASONS, IDENTITY_TYPES, OPEN_STATUSES } from '../constants';
import { accountFromReference, normaliseReference } from '../format';
import { createSeedApplications } from './seed';

const STORAGE_KEY = 'lbg.colleague.cardApplications.v1';

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

let lastCall = null;
const listeners = new Set();
let queue = Promise.resolve();

function record(method, path, status) {
  lastCall = { method, path, status, at: new Date().toISOString() };
  listeners.forEach((listener) => listener(lastCall));
}

export function getLastCall() {
  return lastCall;
}

export function subscribeApi(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function latency() {
  return new Promise((resolve) => {
    setTimeout(resolve, 320 + Math.round(Math.random() * 220));
  });
}

function call(method, path, handler) {
  const execute = async () => {
    await latency();
    try {
      const body = handler();
      record(method, path, 200);
      return body;
    } catch (error) {
      record(method, path, error.status || 500);
      throw error;
    }
  };

  if (method === 'GET') return execute();

  const run = queue.then(execute);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createSeedApplications();
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return createSeedApplications();
    return parsed;
  } catch {
    return createSeedApplications();
  }
}

function save(applications) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  } catch {
    throw new ApiError(
      507,
      'The browser could not store that photograph. Use a smaller image or reset demonstration data.',
    );
  }
}

function findApplication(reference) {
  const ref = normaliseReference(reference);
  const applications = load();
  const application = applications.find((item) => item.reference === ref);
  return { applications, application, ref };
}

function assertOpen(application) {
  if (!application) {
    throw new ApiError(404, 'No credit card application was found for that reference.');
  }
  if (application.status === 'cancelled') {
    throw new ApiError(409, 'This application has been cancelled and can no longer be changed.');
  }
  if (application.status === 'activated') {
    throw new ApiError(409, 'This credit card account is already active.');
  }
}

function toSummary(application) {
  return {
    reference: application.reference,
    status: application.status,
    decision: application.decision,
    channel: application.channel,
    appliedAt: application.appliedAt,
    customer: {
      title: application.customer.title,
      firstName: application.customer.firstName,
      lastName: application.customer.lastName,
      city: application.address.city,
    },
    product: {
      name: application.product.name,
      approvedLimit: application.product.approvedLimit,
    },
    documents: {
      identity: Boolean(application.documents.identity),
      address: Boolean(application.documents.address),
    },
  };
}

function toDetail(application) {
  return structuredClone(application);
}

export function listApplications() {
  return call('GET', '/api/applications', () => {
    const applications = load().sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    return {
      actionable: applications.filter((item) => OPEN_STATUSES.has(item.status)).map(toSummary),
      closed: applications.filter((item) => !OPEN_STATUSES.has(item.status)).map(toSummary),
    };
  });
}

export function searchApplications(reference) {
  const query = normaliseReference(reference);
  return call('GET', `/api/applications?reference=${encodeURIComponent(query)}`, () => {
    if (!query) {
      throw new ApiError(400, 'Enter an application reference.');
    }
    return load()
      .filter((item) => item.reference.includes(query))
      .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
      .map(toSummary);
  });
}

export function getApplication(reference) {
  const ref = normaliseReference(reference);
  return call('GET', `/api/applications/${ref}`, () => {
    const { application } = findApplication(ref);
    if (!application) {
      throw new ApiError(404, `No credit card application was found for ${ref}.`);
    }
    return toDetail(application);
  });
}

export function cancelApplication(reference, payload) {
  const ref = normaliseReference(reference);
  return call('POST', `/api/applications/${ref}/cancel`, () => {
    const { applications, application } = findApplication(ref);
    assertOpen(application);
    const reason = payload?.reason || '';
    if (!CANCEL_REASONS.includes(reason)) {
      throw new ApiError(400, 'Choose a cancellation reason.');
    }
    const note = (payload?.note || '').trim();
    if (note.length > 240) {
      throw new ApiError(400, 'Keep the note to 240 characters.');
    }
    application.status = 'cancelled';
    application.cancellation = {
      reason,
      note,
      cancelledAt: new Date().toISOString(),
      cancelledBy: colleague.name,
    };
    save(applications);
    return toDetail(application);
  });
}

export function uploadDocument(reference, payload) {
  const ref = normaliseReference(reference);
  return call('POST', `/api/applications/${ref}/documents`, () => {
    const { applications, application } = findApplication(ref);
    assertOpen(application);
    const kind = payload?.kind;
    if (kind !== 'identity' && kind !== 'address') {
      throw new ApiError(400, 'Choose identity or proof of address.');
    }
    const allowed = kind === 'identity' ? IDENTITY_TYPES : ADDRESS_TYPES;
    if (!allowed.includes(payload?.documentType)) {
      throw new ApiError(400, 'Choose the type of document in the photograph.');
    }
    if (typeof payload?.dataUrl !== 'string' || !payload.dataUrl.startsWith('data:image/')) {
      throw new ApiError(400, 'Attach a photograph of the document.');
    }
    application.documents[kind] = {
      documentType: payload.documentType,
      fileName: payload.fileName || `${kind}.jpg`,
      dataUrl: payload.dataUrl,
      uploadedAt: new Date().toISOString(),
      uploadedBy: colleague.name,
    };
    const complete = application.documents.identity && application.documents.address;
    application.status = complete ? 'ready_to_activate' : 'documents_required';
    save(applications);
    return toDetail(application);
  });
}

export function activateAccount(reference, payload) {
  const ref = normaliseReference(reference);
  return call('POST', `/api/applications/${ref}/activate`, () => {
    const { applications, application } = findApplication(ref);
    assertOpen(application);
    if (!application.documents.identity || !application.documents.address) {
      throw new ApiError(422, 'Attach both an identity document and a proof of address before activation.');
    }
    if (!payload?.attested) {
      throw new ApiError(400, 'Confirm the documents match the applicant before activation.');
    }
    const note = (payload?.note || '').trim();
    if (note.length > 240) {
      throw new ApiError(400, 'Keep the note to 240 characters.');
    }
    application.status = 'activated';
    application.account = {
      ...accountFromReference(application.reference),
      activatedAt: new Date().toISOString(),
      activatedBy: colleague.name,
      note,
    };
    save(applications);
    return toDetail(application);
  });
}

export function resetDemonstrationData() {
  return call('POST', '/api/demonstration/reset', () => {
    localStorage.removeItem(STORAGE_KEY);
    return listSnapshot();
  });
}

function listSnapshot() {
  const applications = createSeedApplications().sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
  return {
    actionable: applications.filter((item) => OPEN_STATUSES.has(item.status)).map(toSummary),
    closed: applications.filter((item) => !OPEN_STATUSES.has(item.status)).map(toSummary),
  };
}
