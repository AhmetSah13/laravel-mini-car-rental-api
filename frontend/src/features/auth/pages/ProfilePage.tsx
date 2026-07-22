import { Mail, Shield, UserRound } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store'
import { Card } from '@/shared/components/Card'
import { PageHeader } from '@/shared/components/PageHeader'
import { Badge } from '@/shared/components/Badge'

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)

  if (!user) return null

  return (
    <div>
      <PageHeader title="Profil" description="Oturum açan kullanıcının hesap ve rol bilgileri" />
      <Card className="max-w-2xl">
        <div className="flex items-center gap-4 border-b border-border pb-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-primary">
            <UserRound className="h-7 w-7" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-foreground">{user.name}</h2>
            <p className="truncate text-sm text-muted">{user.email}</p>
          </div>
        </div>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-border p-4">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase text-muted">
              <Mail className="h-4 w-4" /> E-posta
            </dt>
            <dd className="mt-2 break-all font-medium">{user.email}</dd>
          </div>
          <div className="rounded-md border border-border p-4">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase text-muted">
              <Shield className="h-4 w-4" /> Rol
            </dt>
            <dd className="mt-2">
              <Badge variant={user.role === 'admin' ? 'primary' : 'neutral'}>{user.role}</Badge>
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
