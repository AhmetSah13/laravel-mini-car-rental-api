import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { getFieldErrors } from '@/shared/lib/errors'

export function applyApiFieldErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  error: unknown,
) {
  const errors = getFieldErrors(error)
  if (!errors) return
  Object.entries(errors).forEach(([field, messages]) => {
    setError(field as Path<T>, { message: messages[0] })
  })
}
