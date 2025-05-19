import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'medicalRecordsBucket',
  isDefault: true,
  access: (allow) => ({
    'public/*': [
      // Educational materials, consent forms
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write']),
    ],
    'clinical/*': [
      // Clinical notes, test results
      allow.groups(['physicians', 'nurses']).to(['read', 'write']),
      allow.groups(['admin']).to(['read', 'write', 'delete']),
    ],
    'imaging/{patient_id}/*': [
      // X-rays, MRIs, CT scans
      allow.entity('identity').to(['read']),
      allow.groups(['radiologists', 'physicians']).to(['read', 'write']),
    ],
    'patient-records/{patient_id}/*': [
      // Personal health information
      allow.entity('identity').to(['read', 'write', 'delete']),
      allow.groups(['physicians']).to(['read', 'write']),
    ],
  }),
});

export const secondaryStorage = defineStorage({
  name: 'archiveMedicalBucket',
  access: (allow) => ({
    'archive/*': [
      // Archived medical records
      allow.groups(['admin']).to(['read', 'write', 'delete']),
      allow.authenticated.to(['read']),
    ],
    'backup/{patient_id}/*': [
      // Patient record backups
      allow.entity('identity').to(['read']),
      allow.groups(['admin']).to(['read', 'write', 'delete']),
    ],
  }),
});
