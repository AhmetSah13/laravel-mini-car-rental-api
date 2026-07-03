import { Link } from 'react-router-dom'
import { Card } from '@/shared/components/Card'
import { RegisterForm } from '@/features/auth/components/RegisterForm'

export function RegisterPage() {
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="text-xl font-semibold text-slate-900">Kayıt ol</h1>
        <p className="mt-1 mb-6 text-sm text-slate-500">Yeni kullanıcı varsayılan olarak user rolü alır.</p>
        <RegisterForm />
        <p className="mt-4 text-sm text-slate-600">
          Zaten hesabınız var mı?{' '}
          <Link to="/login" className="font-medium text-slate-900 underline">
            Giriş yap
          </Link>
        </p>
      </Card>
    </div>
  )
}
