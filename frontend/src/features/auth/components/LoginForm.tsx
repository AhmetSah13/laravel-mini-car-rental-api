import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/authSchemas'
import { useLogin } from '@/features/auth/hooks/useAuth'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
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
      <Input
        label="E-posta"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <div className="relative">
        <Input
          label="Şifre"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          error={errors.password?.message}
          className="pr-11"
          {...register('password')}
        />
        <button
          type="button"
          className="absolute right-2 top-8 rounded-md p-2 text-muted hover:bg-slate-100 hover:text-foreground"
          onClick={() => setShowPassword((value) => !value)}
          aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <Button type="submit" className="w-full" loading={login.isPending}>
        Giriş yap
      </Button>
    </form>
  )
}
