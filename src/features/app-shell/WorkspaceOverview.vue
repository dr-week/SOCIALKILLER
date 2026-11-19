<script setup lang="ts">
import { BookOpen, ExternalLink, Github, Link2, Radio, Sparkles, Users } from 'lucide-vue-next'
import type { BrandProfile } from '../../types/brand'

defineProps<{
  brand: BrandProfile
  audienceHandle?: string
  audienceFollowersCount?: number
  audienceUnfollowersCount?: number
}>()
const emit = defineEmits<{
  (event: 'edit-profile'): void
  (event: 'open-audience'): void
}>()
</script>

<template>
  <main class="workspace-overview">
    <div class="workspace-grid">
      <section class="workspace-card">
        <h2><Sparkles :size="16" /> Brand voice</h2>
        <p>{{ brand.purpose.what || 'Add what this brand does in its profile.' }}</p>
        <dl><dt>Tone</dt><dd>{{ brand.purpose.toneOfVoice || 'Not set' }}</dd><dt>Key themes</dt><dd>{{ brand.purpose.keyThemes.join(' · ') || 'Not set' }}</dd></dl>
      </section>
      <section class="workspace-card">
        <h2><Radio :size="16" /> Assigned channels</h2>
        <p v-if="!brand.accounts.length">No channel handles assigned yet.</p>
        <ul v-else><li v-for="account in brand.accounts" :key="`${account.platformId}-${account.handle}`">{{ account.platformId }} <strong>{{ account.handle }}</strong><span>{{ account.status }}</span></li></ul>
      </section>
      <section class="workspace-card">
        <h2><BookOpen :size="16" /> Reference material</h2>
        <p>{{ brand.purpose.docs?.length || 0 }} notes · {{ brand.purpose.repos?.length || 0 }} public repositories</p>
        <a v-if="brand.purpose.githubUser" :href="`https://github.com/${encodeURIComponent(brand.purpose.githubUser)}`" target="_blank" rel="noreferrer"><Github :size="14" /> {{ brand.purpose.githubUser }} <ExternalLink :size="12" /></a>
        <p v-else><Link2 :size="14" /> Add links, notes, or a GitHub account in the profile.</p>
      </section>
      <section class="workspace-card">
        <h2><Users :size="16" /> Audience</h2>
        <p>{{ audienceHandle ? `@${audienceHandle}` : 'Instagram follower & unfollower audit' }}</p>
        <dl v-if="audienceFollowersCount">
          <dt>Followers</dt><dd>{{ audienceFollowersCount.toLocaleString() }}</dd>
          <dt>Unfollowers</dt><dd>{{ (audienceUnfollowersCount || 0).toLocaleString() }}</dd>
        </dl>
        <button type="button" class="audience-jump-btn" @click="emit('open-audience')">Open Audience Audit →</button>
      </section>
    </div>
  </main>
</template>

<style scoped>
.workspace-overview { max-width: 1080px; margin: 0 auto; }
.workspace-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 13px; }
.workspace-card { position: relative; min-width: 0; overflow: hidden; padding: 18px; border: 1px solid var(--glass-border); border-radius: 19px; background: radial-gradient(ellipse at 100% 0%, color-mix(in srgb, var(--accent-primary) 8%, transparent), transparent 52%), var(--glass-bg); box-shadow: var(--card-shadow); backdrop-filter: blur(18px); }
.workspace-card h2 { display: flex; align-items: center; gap: 8px; margin: 0 0 12px; font: 700 13px Manrope, sans-serif; }
.workspace-card h2 svg { color: var(--accent-primary); }
.workspace-card > p,.workspace-card dd { color: var(--muted); font-size: 11px; line-height: 1.55; }
.workspace-card dl { display: grid; grid-template-columns: 80px 1fr; gap: 8px; margin: 13px 0 0; font-size: 10px; }
.workspace-card dt { color: var(--muted); }.workspace-card dd { margin: 0; }
.workspace-card ul { display: grid; gap: 8px; padding: 0; list-style: none; }
.workspace-card li { display: flex; flex-wrap: wrap; gap: 7px; font-size: 10px; }.workspace-card li strong { color: var(--ink); }.workspace-card li span { margin-left: auto; color: var(--muted); }
.workspace-card a,.workspace-card > p:last-child,.audience-jump-btn { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; padding: 0; border: 0; background: transparent; color: var(--accent-primary); cursor: pointer; font-size: 10px; font-weight: 600; text-decoration: none; }
@media (max-width: 640px) { .workspace-grid { grid-template-columns: 1fr; } }
</style>
