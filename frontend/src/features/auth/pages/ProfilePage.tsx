import { useAuthStore } from '@/features/auth/store'
import { Card } from '@/shared/components/Card'
import { PageHeader } from '@/shared/components/PageHeader'
import { Badge } from '@/shared/components/Badge'

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)

  if (!user) return null

  return (
    <div>
      <PageHeader title="Profil" description="Giriş yapan kullanıcı bilgileri" />
      <Card className="max-w-lg space-y-3">
        <div>
          <p className="text-xs uppercase text-slate-500">Ad</p>
          <p className="font-medium">{user.name}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-500">E-posta</p>
          <p className="font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-500">Rol</p>
          <Badge className="bg-slate-100 text-slate-800">{user.role}</Badge>
        </div>
      </Card>
    </div>
  )
}
