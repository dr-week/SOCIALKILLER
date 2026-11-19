import { createGeneratedDraftRepository } from './generated-draft-repository.mjs'
import { createPublishingRepository } from './publishing-repository.mjs'
import { createSchedulerStateRepository } from './scheduler-state-repository.mjs'
import { createUserTopicRepository } from './user-topic-repository.mjs'
import { createVaultDictionaryRepository } from './vault-dictionary-repository.mjs'
import { createBrandProfileRepository } from './brand-profile-repository.mjs'

export function createDbService(statements) {
  return Object.assign(
    {},
    createGeneratedDraftRepository(statements),
    createPublishingRepository(statements),
    createSchedulerStateRepository(statements),
    createUserTopicRepository(statements),
    createVaultDictionaryRepository(statements),
    createBrandProfileRepository(statements)
  )
}
