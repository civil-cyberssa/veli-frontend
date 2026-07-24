import { describe, expect, it } from 'vitest'
import type { PaymentCycle } from '@/src/features/finance/types'
import { getVisiblePaymentCycles } from '@/src/features/finance/utils'

function makeCycle(cycleNumber: number, isCurrentCycle = false): PaymentCycle {
  return {
    cycle_number: cycleNumber,
    invoice_id: null,
    status: 'pending',
    amount_due: '89.90',
    amount_paid: '0.00',
    due_date: `2026-${String(cycleNumber).padStart(2, '0')}-10T00:00:00-03:00`,
    period_start: `2026-${String(cycleNumber).padStart(2, '0')}-10T00:00:00-03:00`,
    period_end: `2026-${String(cycleNumber + 1).padStart(2, '0')}-10T00:00:00-03:00`,
    is_current_cycle: isCurrentCycle,
    is_projected: false,
    payments: [],
  }
}

describe('getVisiblePaymentCycles', () => {
  it('returns the previous, current and next cycles in chronological order', () => {
    const cycles = [
      makeCycle(4),
      makeCycle(2, true),
      makeCycle(1),
      makeCycle(3),
      makeCycle(5),
    ]

    expect(getVisiblePaymentCycles(cycles).map((cycle) => cycle.cycle_number))
      .toEqual([1, 2, 3])
  })

  it('does not mutate the API response while sorting cycles', () => {
    const cycles = [makeCycle(3), makeCycle(1), makeCycle(2, true)]

    getVisiblePaymentCycles(cycles)

    expect(cycles.map((cycle) => cycle.cycle_number)).toEqual([3, 1, 2])
  })
})
