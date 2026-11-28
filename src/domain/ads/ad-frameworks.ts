/**
 * Performance Ad Buying Frameworks:
 * - 3-2-2 DCT (3 Creatives, 2 Primary Texts, 2 Headlines)
 * - 70/20/10 Full-Funnel (70% Prospecting, 20% Retargeting, 10% Experiments)
 * - Broad-First (Zero-targeting algorithmic scale)
 */

export type AdFrameworkId = '3-2-2-dct' | '70-20-10-funnel' | 'broad-first'

export interface AdFrameworkBlueprint {
  id: AdFrameworkId
  label: string
  summary: string
  adsets: Array<{ name: string; budgetShare: number; targeting: string; creatives: number }>
}

export function generateAdFramework(frameworkId: AdFrameworkId, dailyBudget = 100): AdFrameworkBlueprint {
  if (frameworkId === '70-20-10-funnel') {
    return {
      id: frameworkId,
      label: '70/20/10 Full-Funnel',
      summary: `Allocates $${(dailyBudget * 0.7).toFixed(0)} TOFU, $${(dailyBudget * 0.2).toFixed(0)} MOFU/BOFU, $${(dailyBudget * 0.1).toFixed(0)} Creative Lab`,
      adsets: [
        { name: 'TOFU Broad Prospecting', budgetShare: 0.7, targeting: 'Open / Broad', creatives: 3 },
        { name: 'MOFU/BOFU Retargeting (7d/30d)', budgetShare: 0.2, targeting: 'Engagers + Site Visitors', creatives: 2 },
        { name: 'Creative Sandbox Lab', budgetShare: 0.1, targeting: 'Broad Test', creatives: 4 },
      ],
    }
  }
  if (frameworkId === 'broad-first') {
    return {
      id: frameworkId,
      label: 'Broad-First Algorithmic',
      summary: `100% ($${dailyBudget.toFixed(0)}/day) in consolidated broad ad set for maximum signal density`,
      adsets: [
        { name: 'Consolidated Broad Winners', budgetShare: 1.0, targeting: 'Age + Geo Only', creatives: 5 },
      ],
    }
  }
  return {
    id: '3-2-2-dct',
    label: '3-2-2 Dynamic Creative Test',
    summary: `3 Visuals x 2 Primary Texts x 2 Headlines at $${dailyBudget.toFixed(0)}/day`,
    adsets: [
      { name: 'DCT Test Batch #1', budgetShare: 0.5, targeting: 'Broad + Advantage+', creatives: 3 },
      { name: 'DCT Control / Winners', budgetShare: 0.5, targeting: 'Broad', creatives: 3 },
    ],
  }
}
