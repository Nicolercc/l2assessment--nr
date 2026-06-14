import { describe, it, expect } from 'vitest'
import { estimateUrgencyFallback } from '../urgencyScorer'
import { getRecommendedAction, shouldEscalate, getAvailableCategories } from '../templates'
import { normalize, getMockTriage } from '../triageCore'

describe('estimateUrgencyFallback', () => {
  it('returns High for outage signals', () => {
    expect(estimateUrgencyFallback('Server down now')).toBe('High')
  })

  it('returns Low for pure thank-you notes', () => {
    const msg =
      'Thank you so much! Your team has been incredibly helpful and I really appreciate the fast response!'
    expect(estimateUrgencyFallback(msg)).toBe('Low')
  })

  it('returns Medium for ambiguous reports', () => {
    expect(estimateUrgencyFallback('Something seems off with my account settings')).toBe('Medium')
  })

  it('is deterministic — identical results on repeated calls', () => {
    const msg = 'Server down now'
    expect(estimateUrgencyFallback(msg)).toBe(estimateUrgencyFallback(msg))
  })
})

describe('getRecommendedAction', () => {
  it('does not mention billing for Feature Request', () => {
    const action = getRecommendedAction('Feature Request', 'Low')
    expect(action.toLowerCase()).not.toContain('billing')
    expect(action).toContain('feedback')
  })

  it('prepends urgent response for High urgency', () => {
    const action = getRecommendedAction('Technical Problem', 'High')
    expect(action).toMatch(/respond within 1 hour/i)
  })

  it('returns a non-empty string for every category', () => {
    for (const category of getAvailableCategories()) {
      expect(getRecommendedAction(category, 'Medium').length).toBeGreaterThan(0)
    }
  })
})

describe('shouldEscalate', () => {
  it('returns true for High urgency', () => {
    expect(shouldEscalate('Technical Problem', 'High')).toBe(true)
  })

  it('returns false for calm Positive Feedback', () => {
    expect(shouldEscalate('Positive Feedback', 'Low')).toBe(false)
  })

  it('is not based on message length — long low-urgency still false', () => {
    const longLowUrgency = 'Positive Feedback'
    expect(shouldEscalate(longLowUrgency, 'Low')).toBe(false)
    expect(shouldEscalate('General Inquiry', 'Low')).toBe(false)
  })
})

describe('normalize', () => {
  it('coerces garbage input into a valid, safe object', () => {
    const result = normalize(
      { category: 'Not A Real Category', urgency: 'Critical', confidence: 5 },
      'ai',
    )
    expect(result.category).toBe('General Inquiry')
    expect(result.urgency).toBe('Medium')
    expect(result.confidence).toBe(1)
    expect(result.reasoning).toBeTruthy()
    expect(Array.isArray(result.tags)).toBe(true)
    expect(result.source).toBe('ai')
  })

  it('never throws on missing fields', () => {
    expect(() => normalize({}, 'mock')).not.toThrow()
    const result = normalize({}, 'mock')
    expect(result.confidence).toBe(0.5)
  })
})

describe('getMockTriage', () => {
  it('returns mock source with clamped confidence', () => {
    const result = getMockTriage('Server down now')
    expect(result.source).toBe('mock')
    expect(result.confidence).toBe(0.55)
    expect(result.category).toBe('Technical Problem')
    expect(result.urgency).toBe('High')
  })
})
