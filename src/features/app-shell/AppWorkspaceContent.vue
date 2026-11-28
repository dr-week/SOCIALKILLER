<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import type { AppController } from './useAppController'
import MiniAppLauncher from './MiniAppLauncher.vue'

const AudienceAuditWorkspace = defineAsyncComponent(() => import('./AudienceAuditWorkspace.vue'))
const ConnectionsWorkspace = defineAsyncComponent(() => import('./ConnectionsWorkspace.vue'))
const ScriptStudioWorkspace = defineAsyncComponent(() => import('./ScriptStudioWorkspace.vue'))
const WorkflowStudioWorkspace = defineAsyncComponent(() => import('./WorkflowStudioWorkspace.vue'))
const WorkspaceOverview = defineAsyncComponent(() => import('./WorkspaceOverview.vue'))
const DesignSystemWorkspace = defineAsyncComponent(() => import('../design-system/DesignSystemWorkspace.vue'))
const AssetManagerWorkspace = defineAsyncComponent(() => import('../asset-manager/AssetManagerWorkspace.vue'))
const AutomationStudioWorkspace = defineAsyncComponent(() => import('../automation/AutomationStudioWorkspace.vue'))
const AndroidBuildStudioWorkspace = defineAsyncComponent(() => import('../android-studio/AndroidBuildStudioWorkspace.vue'))
const LeadsWorkspace = defineAsyncComponent(() => import('../leads/LeadsWorkspace.vue'))
const AdsWorkspace = defineAsyncComponent(() => import('../ads/AdsWorkspace.vue'))
const SocialPublisher = defineAsyncComponent(() => import('../../components/SocialPublisher.vue'))
const CommunityInbox = defineAsyncComponent(() => import('../../components/CommunityInbox.vue'))
const CreativeHub = defineAsyncComponent(() => import('../../components/CreativeHub.vue'))
const ProfileScanner = defineAsyncComponent(() => import('../../components/ProfileScanner.vue'))

const props = defineProps<{ controller: AppController }>()
const emit = defineEmits<{ (event: 'open-profile'): void }>()
const { activeView, search, workspaces, assignCompanyAccount, audience } = props.controller
const { currentTheme, currentAccent, setTheme, setAccent } = props.controller
const {
  activeBrand, currentScript, currentJourney, generateScript, generateJourney,
  generatingScript, generatingJourney
} = workspaces
</script>

<template>
  <Transition name="workspace-fade" mode="out-in">
    <MiniAppLauncher v-if="activeView === 'app-launcher'" :active-brand-name="activeBrand.name" :search-query="search" @open-app="activeView = $event" />
    <SocialPublisher
      v-else-if="activeView === 'social-publisher'"
      :key="activeBrand.id" :brand-id="activeBrand.id" :brand-accounts="activeBrand.accounts"
      :brand-handle="activeBrand.name" :brand-tone="activeBrand.purpose.toneOfVoice" :search-query="search" initial-tab="compose"
      @update-brand-account="assignCompanyAccount" @open-connections="activeView = 'connections'"
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
    <LeadsWorkspace
      v-else-if="activeView === 'leads'"
      :key="activeBrand.id" :brand-id="activeBrand.id" :brand-name="activeBrand.name"
    />
    <AdsWorkspace v-else-if="(activeView as string) === 'ads'" />
    <CreativeHub v-else-if="activeView === 'content-studio'" :brand-handle="activeBrand.name" :search-query="search" />
    <ScriptStudioWorkspace
      v-else-if="activeView === 'script-studio'" :brand="activeBrand"
      :script="currentScript" :journey="currentJourney"
      :generating-script="generatingScript" :generating-journey="generatingJourney"
      @generate-script="generateScript" @generate-journey="generateJourney"
    />
    <ProfileScanner v-else-if="activeView === 'profile-scout'" />
    <WorkspaceOverview
      v-else-if="activeView === 'workspaces'"
      :brand="activeBrand"
      :audience-handle="audience.currentAccountUsername.value"
      :audience-followers-count="audience.followers.value.length"
      :audience-unfollowers-count="audience.notFollowingBack.value.length"
      @edit-profile="emit('open-profile')"
      @open-audience="activeView = 'overview'"
    />
    <div v-else class="audience-workspace-root">
      <AudienceAuditWorkspace :controller="controller" />
    </div>
  </Transition>
</template>
