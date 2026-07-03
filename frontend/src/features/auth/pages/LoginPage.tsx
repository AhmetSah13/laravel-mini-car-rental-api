import { Link } from 'react-router-dom'
import { Card } from '@/shared/components/Card'
import { LoginForm } from '@/features/auth/components/LoginForm'

export function LoginPage() {
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="text-xl font-semibold text-slate-900">Giriş yap</h1>
        <p className="mt-1 mb-6 text-sm text-slate-500">Sanctum token ile API oturumu açın.</p>
        <LoginForm />
        <p className="mt-4 text-sm text-slate-600">
          Hesabınız yok mu?{' '}
          <Link to="/register" className="font-medium text-slate-900 underline">
            Kayıt ol
          </Link>
        </p>
      </Card>
    </div>
  )
}
