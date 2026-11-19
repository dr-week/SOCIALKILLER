<script setup lang="ts">
import { Images, Sparkles } from 'lucide-vue-next'
import catalog from '../../assets/asset-catalog.json'
import UiCard from '../../shared/ui/UiCard.vue'

const assets = catalog.assets
</script>

<template>
  <main class="asset-manager">
    <header class="asset-manager__hero">
      <p>LOCAL ASSET LIBRARY</p>
      <h1>Asset <span>Manager</span></h1>
      <div>Assets are catalogued once and reused across the shared mini-app ecosystem.</div>
      <ol aria-label="Asset processing stages">
        <li><b>01</b> Original</li><li><b>02</b> Processed master</li><li><b>03</b> Optimized variants</li>
      </ol>
    </header>
    <div class="asset-manager__grid">
      <UiCard v-for="asset in assets" :key="asset.id" :eyebrow="asset.category" :title="asset.name">
        <div class="asset-manager__visual" :class="`asset-manager__visual--${asset.kind}`">
          <img
            v-if="asset.kind === 'raster'"
            :src="asset.variants[1]?.preview || asset.variants[0]?.preview"
            :alt="`${asset.name} processed preview`"
            loading="lazy"
            decoding="async"
          />
          <div v-else-if="asset.kind === 'css'" class="asset-manager__css-art" aria-hidden="true"><i></i><i></i><i></i></div>
          <Sparkles v-else-if="asset.kind === 'library'" :size="30" aria-hidden="true" />
          <Images v-else :size="30" aria-hidden="true" />
        </div>
        <dl class="asset-manager__metadata">
          <div><dt>Creator</dt><dd>{{ asset.creator }}</dd></div>
          <div><dt>License</dt><dd>{{ asset.license }}</dd></div>
          <div><dt>Permission</dt><dd>{{ asset.usagePermission }}</dd></div>
          <div><dt>Source / dimensions</dt><dd>{{ asset.original || asset.originalDimensions }}</dd></div>
        </dl>
        <p v-if="asset.includedInApp === false" class="asset-manager__attribution">Reference material; not included in app assets.</p>
        <p v-else class="asset-manager__attribution">{{ asset.attribution }}</p>
      </UiCard>
    </div>
    <footer>Run <code>npm run branding:assets</code> to create deterministic variants and <code>npm run assets:validate</code> to check catalog files and processing metadata. No AI-generated images or icons are used.</footer>
  </main>
</template>

<style scoped>
.asset-manager { max-width: 1160px; margin: 0 auto; color: var(--ink); }
.asset-manager__hero { display: grid; gap: 9px; margin-bottom: 20px; padding: 23px 26px; border: 1px solid var(--glass-border); border-radius: 22px; background: radial-gradient(ellipse at 92% 10%, rgba(89,221,182,.16), transparent 40%), linear-gradient(135deg,var(--surface-card),var(--surface)); box-shadow: var(--card-shadow); }
.asset-manager__hero p { margin: 0; color: #59ddb6; font-size: 9px; font-weight: 700; letter-spacing: .14em; }.asset-manager__hero h1 { margin: 0; font: 700 clamp(24px,4vw,36px) Manrope,sans-serif; letter-spacing: -.045em; }.asset-manager__hero h1 span { color: #59ddb6; }.asset-manager__hero>div { color: var(--muted); font-size: 12px; line-height: 1.6; }
.asset-manager__hero ol { display: flex; flex-wrap: wrap; gap: 8px; margin: 6px 0 0; padding: 0; list-style: none; }.asset-manager__hero li { display: flex; align-items: center; gap: 7px; padding: 7px 10px; border: 1px solid var(--line); border-radius: 20px; background: var(--surface); color: var(--muted); font-size: 10px; }.asset-manager__hero b { color: #59ddb6; font-size: 9px; }
.asset-manager__grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 14px; }.asset-manager__visual { display: grid; min-height: 130px; place-items: center; overflow: hidden; margin-bottom: 14px; border: 1px solid var(--line); border-radius: 13px; background: radial-gradient(ellipse at center,var(--surface-raised),var(--surface)); color: var(--accent-primary); }.asset-manager__visual img { width: 120px; height: 120px; object-fit: contain; }.asset-manager__visual--reference { background: repeating-linear-gradient(135deg,var(--surface),var(--surface) 10px,var(--surface-raised) 10px,var(--surface-raised) 20px); color: var(--muted); }
.asset-manager__css-art { position: relative; display: flex; width: 130px; height: 90px; align-items: center; justify-content: center; gap: 9px; }.asset-manager__css-art i { width: 28px; height: 52px; border: 1px solid var(--accent-primary); border-radius: 50%; transform: rotate(38deg); box-shadow: 0 0 18px var(--accent-glow); }.asset-manager__css-art i:nth-child(2) { border-color: #b495ff; transform: rotate(-38deg); }.asset-manager__css-art i:nth-child(3) { border-color: #54d6ee; transform: rotate(90deg); }
.asset-manager__metadata { display: grid; gap: 9px; margin: 0; }.asset-manager__metadata>div { display: grid; grid-template-columns: 90px minmax(0,1fr); gap: 8px; font-size: 10px; }.asset-manager__metadata dt { color: var(--muted); }.asset-manager__metadata dd { margin: 0; color: var(--ink); overflow-wrap: anywhere; }.asset-manager__attribution,.asset-manager__warning { margin: 12px 0 0; padding-top: 10px; border-top: 1px solid var(--line); color: var(--muted); font-size: 10px; line-height: 1.5; }.asset-manager__warning { color: var(--status-warning); }
.asset-manager footer { margin-top: 16px; color: var(--muted); font-size: 10px; line-height: 1.7; text-align: center; }.asset-manager footer code { color: var(--ink); }
@media(max-width:720px) { .asset-manager__grid { grid-template-columns: 1fr; } }.asset-manager__metadata dd { word-break: break-word; }
</style>
