import { AdminUpgradeClient } from "./admin-upgrade-client"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default function AdminUpgradePage() {
  return <AdminUpgradeClient />
}
