import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, UserRound, Users } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store'
import { UserRole } from '@/shared/types/enums'
import { PageHeader } from '@/shared/components/PageHeader'
import { Card } from '@/shared/components/Card'
import { Badge } from '@/shared/components/Badge'

type NavCard = {
  title: string
  description: string
  to: string
  icon: ReactNode
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === UserRole.ADMIN

  const cards: NavCard[] = isAdmin
    ? [
        { title: 'Müşteriler', description: 'Müşteri iletişim kayıtları', to: '/admin/customers', icon: <Users className="h-5 w-5" /> },
        { title: 'Kiralamalar', description: 'Kiralama listesi ve yeni kayıt akışı', to: '/rentals', icon: <CalendarDays className="h-5 w-5" /> },
      ]
    : [
        { title: 'Kiralamalar', description: 'Kiralama kayıtlarını görüntüleyin', to: '/rentals', icon: <CalendarDays className="h-5 w-5" /> },
        { title: 'Profil', description: 'Hesap bilgilerinizi kontrol edin', to: '/profile', icon: <UserRound className="h-5 w-5" /> },
      ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Hoş geldiniz, ${user?.name ?? 'kullanıcı'}. Rolünüze uygun operasyon ekranları aşağıda.`}
        actions={<Badge variant={isAdmin ? 'primary' : 'neutral'}>{user?.role}</Badge>}
      />

      <section className="rounded-card border border-border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isAdmin ? 'Admin operasyon merkezi' : 'Kullanıcı çalışma alanı'}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Sık kullanılan ekranlara hızlı erişim.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.to} to={card.to} className="group">
            <Card className="flex h-full flex-col transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-primary">
                {card.icon}
              </div>
              <h2 className="text-lg font-semibold text-foreground">{card.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-muted">{card.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary transition group-hover:gap-3">
                Aç
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
