<script setup lang="ts">
import type { AppController } from './useAppController'
import MiniAppLauncher from './MiniAppLauncher.vue'
import AudienceAuditWorkspace from './AudienceAuditWorkspace.vue'
import ConnectionsWorkspace from './ConnectionsWorkspace.vue'
import ScriptStudioWorkspace from './ScriptStudioWorkspace.vue'
import WorkflowStudioWorkspace from './WorkflowStudioWorkspace.vue'
import WorkspaceOverview from './WorkspaceOverview.vue'
import DesignSystemWorkspace from '../design-system/DesignSystemWorkspace.vue'
import AssetManagerWorkspace from '../asset-manager/AssetManagerWorkspace.vue'
import AutomationStudioWorkspace from '../automation/AutomationStudioWorkspace.vue'
import AndroidBuildStudioWorkspace from '../android-studio/AndroidBuildStudioWorkspace.vue'
import SocialPublisher from '../../components/SocialPublisher.vue'
import CommunityInbox from '../../components/CommunityInbox.vue'
import CreativeHub from '../../components/CreativeHub.vue'
import ProfileScanner from '../../components/ProfileScanner.vue'

const props = defineProps<{ controller: AppController }>()
const emit = defineEmits<{ (event: 'open-profile'): void }>()
const { activeView, workspaces, assignCompanyAccount } = props.controller
const { currentTheme, currentAccent, setTheme, setAccent } = props.controller
const {
  activeBrand, currentScript, currentJourney, generateScript, generateJourney,
  generatingScript, generatingJourney
} = workspaces
</script>

<template>
  <MiniAppLauncher v-if="activeView === 'app-launcher'" :active-brand-name="activeBrand.name" @open-app="activeView = $event" />
  <SocialPublisher
    v-else-if="activeView === 'social-publisher'"
    :key="activeBrand.id" :brand-id="activeBrand.id" :brand-accounts="activeBrand.accounts"
    :brand-handle="activeBrand.name" :brand-tone="activeBrand.purpose.toneOfVoice" initial-tab="compose"
    @update-brand-account="assignCompanyAccount"
  />
  <CommunityInbox
    v-else-if="activeView === 'community-inbox'"
    :key="activeBrand.id" :brand-id="activeBrand.id" :brand-name="activeBrand.name"
    :brand-tone="activeBrand.purpose.toneOfVoice"
  />
  <ConnectionsWorkspace
    v-else-if="activeView === 'connections'"
    :key="activeBrand.id" :brand-id="activeBrand.id" :brand-name="activeBrand.name"
    :brand-accounts="activeBrand.accounts" @update-brand-account="assignCompanyAccount"
  />
  <WorkflowStudioWorkspace v-else-if="activeView === 'workflows'" :brand-id="activeBrand.id" :brand-name="activeBrand.name" />
  <DesignSystemWorkspace
    v-else-if="activeView === 'design-system'"
    :theme="currentTheme" :accent="currentAccent"
    @set-theme="setTheme" @set-accent="setAccent"
  />
  <AssetManagerWorkspace v-else-if="activeView === 'asset-manager'" />
  <AutomationStudioWorkspace v-else-if="activeView === 'automation-studio'" :brand-id="activeBrand.id" :brand-name="activeBrand.name" />
  <AndroidBuildStudioWorkspace v-else-if="activeView === 'android-studio'" />
  <CreativeHub v-else-if="activeView === 'content-studio'" :brand-handle="activeBrand.name" />
  <ScriptStudioWorkspace
    v-else-if="activeView === 'script-studio'" :brand="activeBrand"
    :script="currentScript" :journey="currentJourney"
    :generating-script="generatingScript" :generating-journey="generatingJourney"
    @generate-script="generateScript" @generate-journey="generateJourney"
  />
  <ProfileScanner v-else-if="activeView === 'profile-scout'" />
  <WorkspaceOverview v-else-if="activeView === 'workspaces'" :brand="activeBrand" @edit-profile="emit('open-profile')" />
  <AudienceAuditWorkspace v-else :controller="controller" />
</template>
