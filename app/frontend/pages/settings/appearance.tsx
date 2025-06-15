import { Head } from "@inertiajs/react"

import AppearanceTabs from "@/components/appearance-tabs"
import HeadingSmall from "@/components/heading-small"
import AppLayout from "@/layouts/app-layout"
import SettingsLayout from "@/layouts/settings/layout"
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs"

export default function Appearance() {
  const breadcrumbs = useBreadcrumbs()

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={breadcrumbs[breadcrumbs.length - 1].title} />

      <SettingsLayout>
        <div className="space-y-6">
          <HeadingSmall
            title="Appearance settings"
            description="Update your account's appearance settings"
          />
          <AppearanceTabs />
        </div>
      </SettingsLayout>
    </AppLayout>
  )
}
