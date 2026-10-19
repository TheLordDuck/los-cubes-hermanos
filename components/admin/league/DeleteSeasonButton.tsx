// components/admin/league/DeleteSeasonButton.tsx
'use client'

import { DeleteButton } from '@/components/admin/DeleteButton'

export function DeleteSeasonButton({ id, name }: { id: number; name: string }) {
  return <DeleteButton id={id} name={name} endpoint={`/api/seasons/${id}`} />
}
