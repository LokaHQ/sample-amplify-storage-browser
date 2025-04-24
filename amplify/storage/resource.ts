import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'myStorageBucket',
  isDefault: true,
  access: (allow) => ({
    'public/*': [
      allow.guest.to(['read', 'write']),
      allow.authenticated.to(['read', 'write', 'delete']),
      allow.groups(['admin']).to(['read', 'write', 'delete']),
    ],
    'admin/*': [
      allow.authenticated.to(['read']),
      allow.groups(['admin']).to(['read', 'write', 'delete']),
    ],
  }),
});

export const secondaryStorage = defineStorage({
  name: 'mySecondaryStorageBucket',
  access: (allow) => ({
    'backup_public/*': [
      allow.guest.to(['read', 'write']),
      allow.authenticated.to(['read', 'write', 'delete']),
      allow.groups(['admin']).to(['read', 'write', 'delete']),
    ],
    'backup_admin/*': [
      allow.authenticated.to(['read']),
      allow.groups(['admin']).to(['read', 'write', 'delete']),
    ],
  }),
});
