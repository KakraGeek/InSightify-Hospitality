import { requireRole } from '../../lib/auth/permissions'

export default async function ProtectedPage() {
  await requireRole('admin')
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">Admin Area</h1>
      <p className="text-brand-gray">You are seeing this because your session includes the admin role.</p>
    </section>
  )
}
