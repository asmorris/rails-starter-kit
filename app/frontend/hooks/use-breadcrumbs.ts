import { usePage } from "@inertiajs/react"
import type { BreadcrumbItem } from "@/types"

interface BreadcrumbConfig {
  [key: string]: {
    title: string
    href?: string
  }
}

const defaultConfig: BreadcrumbConfig = {
  dashboard: { title: "Dashboard", href: "/dashboard" },
  posts: { title: "Posts", href: "/posts" },
  settings: { title: "Settings", href: "/settings/profile" },
  profile: { title: "Profile", href: "/settings/profile" },
  email: { title: "Email", href: "/settings/email" },
  password: { title: "Password", href: "/settings/password" },
  sessions: { title: "Sessions", href: "/settings/sessions" },
  appearance: { title: "Appearance", href: "/settings/appearance" },
  billing: { title: "Billing", href: "/settings/billing" },
  identity: { title: "Identity" },
  password_resets: { title: "Password Reset" },
  users: { title: "Users" },
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function generateBreadcrumbsFromPath(
  pathname: string,
  config: BreadcrumbConfig = defaultConfig,
): BreadcrumbItem[] {
  // Remove leading/trailing slashes and split by '/'
  const segments = pathname.replace(/^\/+|\/+$/g, "").split("/")

  if (segments.length === 0 || (segments.length === 1 && segments[0] === "")) {
    return []
  }

  const breadcrumbs: BreadcrumbItem[] = []
  let currentPath = ""

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`

    // Look up the segment in our config
    const configItem = config[segment]

    if (configItem) {
      breadcrumbs.push({
        title: configItem.title,
        href: configItem.href || currentPath,
      })
    } else {
      // Fallback: capitalize the segment
      breadcrumbs.push({
        title: capitalizeFirst(segment.replace(/[-_]/g, " ")),
        href: currentPath,
      })
    }
  })

  return breadcrumbs
}

export function useBreadcrumbs(
  customConfig?: BreadcrumbConfig,
): BreadcrumbItem[] {
  const { url } = usePage()

  // Merge custom config with default config
  const config = customConfig
    ? { ...defaultConfig, ...customConfig }
    : defaultConfig

  return generateBreadcrumbsFromPath(url, {})
}

export function useBreadcrumbsWithOverride(
  overrideBreadcrumbs?: BreadcrumbItem[],
  customConfig?: BreadcrumbConfig,
): BreadcrumbItem[] {
  const autoBreadcrumbs = useBreadcrumbs(customConfig)

  return overrideBreadcrumbs || autoBreadcrumbs
}
