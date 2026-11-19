export const colleague = {
  id: 'C-10428',
  name: 'Alex Morgan',
  team: 'Card fulfilment',
};

export const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/applications?reference={reference}',
    purpose: 'Search by application reference',
  },
  {
    method: 'GET',
    path: '/api/applications/{reference}',
    purpose: 'Retrieve the selected application',
  },
  {
    method: 'POST',
    path: '/api/applications/{reference}/cancel',
    purpose: 'Cancel the selected application',
  },
  {
    method: 'POST',
    path: '/api/applications/{reference}/documents',
    purpose: 'Upload and attach an identity or proof-of-address photograph',
  },
  {
    method: 'POST',
    path: '/api/applications/{reference}/activate',
    purpose: 'Activate the credit card account',
  },
];

export const CANCEL_REASONS = [
  'Customer requested cancellation',
  'Duplicate application',
  'Applicant did not proceed',
  'Documents not accepted',
  'Unable to complete checks',
];

export const IDENTITY_TYPES = ['UK passport', 'UK driving licence', 'National identity card'];

export const ADDRESS_TYPES = [
  'Utility bill',
  'Council tax bill',
  'Bank or building society statement',
  'Mortgage statement',
];

export const STATUS_META = {
  in_progress: { label: 'In progress', tone: 'info' },
  documents_required: { label: 'Documents required', tone: 'warning' },
  ready_to_activate: { label: 'Ready to activate', tone: 'ready' },
  activated: { label: 'Account active', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
};

export const OPEN_STATUSES = new Set(['in_progress', 'documents_required', 'ready_to_activate']);
