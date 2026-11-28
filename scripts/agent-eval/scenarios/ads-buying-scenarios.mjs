/**
 * 8+ Evaluation Scenarios for the Micro-Modular Ad Buying AI.
 */
import assert from 'node:assert/strict'
import { clampBudgetShift, checkSpendGuardrails } from '../../../server/ads/engine/spend-guardrails.mjs'
import { evaluateCampaignRules } from '../../../server/ads/engine/rules-evaluator.mjs'
import { allocateBanditWeights } from '../../../server/ads/engine/bandit-allocator.mjs'
import { solveQuboBudget } from '../../../server/ads/engine/qubo-budget-solver.mjs'
import { evaluateIntradayPacing } from '../../../server/ads/engine/pacing-controller.mjs'
import { sha256Normalized } from '../../../server/ads/connectors/capi-webhook.mjs'

export const adsBuyingScenarios = [
  {
    id: 'ads-guardrail-clamp-15pct',
    run: () => {
      assert.equal(clampBudgetShift(100, 150), 115)
      assert.equal(clampBudgetShift(100, 50), 85)
    },
  },
  {
    id: 'ads-guardrail-hourly-circuit-breaker',
    run: () => {
      const res = checkSpendGuardrails({ currentDailySpend: 24, proposedDailyBudget: 24, hourlySpend: 2.5 })
      assert.equal(res.allowed, false)
      assert.equal(res.circuitBreakerTripped, true)
    },
  },
  {
    id: 'ads-rule-kill-bleeder',
    run: () => {
      const decisions = evaluateCampaignRules({ targetCpa: 20 }, { spend: 35, conversions: 0, impressions: 1000, ctr: 1.5 })
      assert.ok(decisions.some(d => d.ruleId === 'KILL_BLEEDER_NO_CONV'))
    },
  },
  {
    id: 'ads-rule-kill-low-ctr',
    run: () => {
      const decisions = evaluateCampaignRules({ targetCpa: 20 }, { spend: 10, conversions: 0, impressions: 600, ctr: 0.4 })
      assert.ok(decisions.some(d => d.ruleId === 'KILL_LOW_CTR'))
    },
  },
  {
    id: 'ads-rule-scale-winner',
    run: () => {
      const decisions = evaluateCampaignRules({ targetCpa: 25 }, { spend: 40, conversions: 3, cpa: 13.33, impressions: 2000, ctr: 2.1, frequency: 1.5 })
      assert.ok(decisions.some(d => d.ruleId === 'SCALE_WINNER_20PCT'))
    },
  },
  {
    id: 'ads-bandit-ucb1-weights',
    run: () => {
      const weights = allocateBanditWeights([
        { id: 'c1', name: 'Hook A', impressions: 500, clicks: 20, conversions: 5 },
        { id: 'c2', name: 'Hook B', impressions: 500, clicks: 10, conversions: 0 },
      ], 'ucb1')
      assert.equal(weights[0].id, 'c1')
    },
  },
  {
    id: 'ads-qubo-sub-2-5ms',
    run: () => {
      const res = solveQuboBudget([
        { id: 'meta', platform: 'meta', currentBudget: 50, roas: 3.5 },
        { id: 'google', platform: 'google', currentBudget: 50, roas: 2.2 },
      ], 100)
      assert.equal(res.allocations.length, 2)
      assert.ok(res.elapsedMs < 2.5, `Expected < 2.5ms, got ${res.elapsedMs}ms`)
    },
  },
  {
    id: 'ads-pacing-and-capi-hash',
    run: () => {
      const pacing = evaluateIntradayPacing({ dailyBudget: 100, spendSoFar: 90, hourUtc: 6 })
      assert.equal(pacing.status, 'over_pacing')
      assert.equal(sha256Normalized(' User@Example.com ').length, 64)
    },
  },
]
