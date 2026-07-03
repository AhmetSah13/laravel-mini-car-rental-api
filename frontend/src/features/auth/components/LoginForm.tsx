import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'react-router-dom'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/authSchemas'
import { useLogin } from '@/features/auth/hooks/useAuth'

export function LoginForm() {
  const [searchParams] = useSearchParams()
  const redirectParam = searchParams.get('redirect') || '/dashboard'
  const redirectTo =
    redirectParam.startsWith('/') && !redirectParam.startsWith('//')
      ? redirectParam
      : '/dashboard'

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const login = useLogin(setError, redirectTo)

  return (
    <form className="space-y-4" onSubmit={handleSubmit((values) => login.mutate(values))}>
      <Input label="E-posta" type="email" error={errors.email?.message} {...register('email')} />
      <Input
        label="Şifre"
        type="password"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" className="w-full" loading={login.isPending}>
        Giriş yap
      </Button>
    </form>
  )
}
