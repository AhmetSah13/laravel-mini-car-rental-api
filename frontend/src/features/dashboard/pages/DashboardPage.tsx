import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Car, Building2, Users, CalendarDays, UserRound } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store'
import { UserRole } from '@/shared/types/enums'
import { PageHeader } from '@/shared/components/PageHeader'
import { Card } from '@/shared/components/Card'

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
        {
          title: 'Markalar',
          description: 'Marka yönetimi',
          to: '/admin/brands',
          icon: <Building2 className="h-5 w-5" />,
        },
        {
          title: 'Araçlar',
          description: 'Araç yönetimi',
          to: '/admin/cars',
          icon: <Car className="h-5 w-5" />,
        },
        {
          title: 'Müşteriler',
          description: 'Müşteri yönetimi',
          to: '/admin/customers',
          icon: <Users className="h-5 w-5" />,
        },
        {
          title: 'Kiralamalar',
          description: 'Kiralama listesi ve oluşturma',
          to: '/rentals',
          icon: <CalendarDays className="h-5 w-5" />,
        },
      ]
    : [
        {
          title: 'Araçlar',
          description: 'Public araç kataloğu',
          to: '/cars',
          icon: <Car className="h-5 w-5" />,
        },
        {
          title: 'Kiralamalar',
          description: 'Kiralama kayıtlarını görüntüle',
          to: '/rentals',
          icon: <CalendarDays className="h-5 w-5" />,
        },
        {
          title: 'Profil',
          description: 'Hesap bilgileriniz',
          to: '/profile',
          icon: <UserRound className="h-5 w-5" />,
        },
      ]

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Hoş geldiniz, ${user?.name ?? 'kullanıcı'} (${user?.role})`}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.to} to={card.to}>
            <Card className="h-full transition hover:border-slate-400 hover:shadow-md">
              <div className="mb-3 text-slate-700">{card.icon}</div>
              <h2 className="text-lg font-semibold text-slate-900">{card.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{card.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
