import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas/authSchemas'
import { useRegister } from '@/features/auth/hooks/useAuth'

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  })

  const registerMutation = useRegister(setError)

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) => registerMutation.mutate(values))}
    >
      <Input label="Ad" error={errors.name?.message} {...register('name')} />
      <Input label="E-posta" type="email" error={errors.email?.message} {...register('email')} />
      <Input
        label="Şifre"
        type="password"
        error={errors.password?.message}
        {...register('password')}
      />
      <Input
        label="Şifre tekrarı"
        type="password"
        error={errors.password_confirmation?.message}
        {...register('password_confirmation')}
      />
      <Button type="submit" className="w-full" loading={registerMutation.isPending}>
        Kayıt ol
      </Button>
    </form>
  )
}
