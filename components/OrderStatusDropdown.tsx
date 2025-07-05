'use client'

import { useState } from 'react'
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select'
import { ConfirmDialog } from './ConfirmDialog'

export type Status = 'pending' | 'success' | 'sent back' | 'sent' | 'canceled' | 'ordered'

const STATUS_OPTIONS: { value: Status; label: string; emoji: string; color: string }[] = [
  { value: 'pending',   label: 'Pending',   emoji: '⏳', color: 'bg-yellow-700 text-white' },
  { value: 'success',   label: 'Success',   emoji: '✅', color: 'bg-green-700 text-white' },
  { value: 'sent back', label: 'Sent back', emoji: '📦↩️', color: 'bg-red-600 text-white' },
  { value: 'sent',      label: 'Sent',      emoji: '📦',   color: 'bg-blue-700 text-white' },
  { value: 'canceled',      label: 'Canceled',      emoji: '❌',   color: 'bg-pink-700 text-white' },
  { value: 'ordered',      label: 'Ordered',      emoji: '🛒',   color: 'bg-white' }
]

interface Props {
  orderId: string
  initialStatus: Status
}

export function OrderStatusDropdown({ orderId, initialStatus }: Props) {
  const [status, setStatus] = useState<Status>(initialStatus)
  const [pending, setPending] = useState<Status | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleSelect = (newStatus: string) => {
    const s = newStatus as Status
    if (s === status) return
    setPending(s)
    setConfirmOpen(true)
  }

  const confirm = async () => {
    if (!pending) return
    setStatus(pending)
    try {
        const res = await fetch('/api/update-order-fulfillment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: pending }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setStatus(initialStatus)
    } finally {
      setConfirmOpen(false)
      setPending(null)
    }
  }

  // fallback to pending option if status not recognized
  const current = STATUS_OPTIONS.find(o => o.value === status) || STATUS_OPTIONS[0]

  return (
    <>
      <Select onValueChange={handleSelect} value={current.value}>
        <SelectTrigger className={`w-auto rounded-lg border-2 border-black ${current.color} shadow-md`}>
          <span className="flex items-center justify-center gap-1">
            {current.emoji} {current.label}
          </span>
        </SelectTrigger>
        <SelectContent className='bg-white border-2 border-black shadow-md'>
          {STATUS_OPTIONS.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>
              <span className="flex items-center gap-1">
                {opt.emoji} {opt.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirm}
        title="Confirm status change"
        description={`Change status to “${pending}”?`}
      />
    </>
  )
}