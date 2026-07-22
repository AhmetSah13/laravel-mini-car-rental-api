import { Link } from 'react-router-dom'
import { CarFront } from 'lucide-react'
import { Card } from '@/shared/components/Card'
import { RegisterForm } from '@/features/auth/components/RegisterForm'

export function RegisterPage() {
  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-card border border-border bg-white shadow-sm md:grid-cols-[0.9fr_1.1fr]">
      <div className="hidden bg-slate-900 p-8 text-white md:flex md:flex-col md:justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-primary">
            <CarFront className="h-5 w-5" />
          </span>
          FleetDesk
        </div>
        <div>
          <h1 className="text-3xl font-semibold">Yeni kullanıcı hesabı</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Yeni kayıtlar mevcut backend davranışına uygun şekilde user rolü ile açılır.
          </p>
        </div>
      </div>
      <Card className="border-0 shadow-none md:p-10">
        <h1 className="text-2xl font-semibold text-foreground">Kayıt ol</h1>
        <p className="mt-2 mb-6 text-sm leading-6 text-muted">Katalog ve kiralama ekranlarına erişmek için hesap oluşturun.</p>
        <RegisterForm />
        <p className="mt-5 text-sm text-muted">
          Zaten hesabınız var mı?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Giriş yap
          </Link>
        </p>
      </Card>
    </div>
  )
}
