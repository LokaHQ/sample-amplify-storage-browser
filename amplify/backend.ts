import { defineBackend } from '@aws-amplify/backend';
import { secondaryStorage, storage } from './storage/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
defineBackend({
  storage,
  secondaryStorage,
});
