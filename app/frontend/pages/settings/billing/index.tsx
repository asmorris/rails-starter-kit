import { Head, router } from "@inertiajs/react"
import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  CreditCard,
  AlertCircle,
  CheckCircle,
  Pause,
  Play,
  X,
  ExternalLink,
  Settings,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import AppLayout from "@/layouts/app-layout"
import SettingsLayout from "@/layouts/settings/layout"
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs"

interface Subscription {
  status: string
  plan_name: string
  monthly_price: { formatted: string }
  subscription_starts_at: string
  current_period_end: string | null
  next_billing_date: string | null
  trial_active: boolean
  trial_ends_at: string | null
  days_until_trial_ends: number | null
  canceled_at: string | null
}

interface BillingData {
  has_subscription: boolean
  can_access_features: boolean
  subscription: Subscription | null
}

interface BillingProps {
  billing: BillingData
}

export default function BillingPage({ billing }: BillingProps) {
  const breadcrumbs = useBreadcrumbs()
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Active
          </Badge>
        )
      case "trialing":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            <AlertCircle className="mr-1 h-3 w-3" />
            Trial
          </Badge>
        )
      case "paused":
        return (
          <Badge variant="secondary">
            <Pause className="mr-1 h-3 w-3" />
            Paused
          </Badge>
        )
      case "canceled":
        return (
          <Badge variant="destructive">
            <X className="mr-1 h-3 w-3" />
            Canceled
          </Badge>
        )
      case "past_due":
        return (
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            Past Due
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleManageSubscription = async () => {
    try {
      setActionLoading("manage")

      const response = await fetch("/settings/billing/manage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token":
            document
              .querySelector('meta[name="csrf-token"]')
              ?.getAttribute("content") || "",
        },
      })

      const data = await response.json()

      if (response.ok && data.management_url) {
        window.open(data.management_url, "_blank")
      } else {
        toast.error(data.error || "Unable to access subscription management")
      }
    } catch (error) {
      console.error("Management error:", error)
      toast.error("Failed to access subscription management")
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancelSubscription = async () => {
    try {
      setActionLoading("cancel")

      const response = await fetch("/settings/billing/cancel", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token":
            document
              .querySelector('meta[name="csrf-token"]')
              ?.getAttribute("content") || "",
        },
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        router.reload()
        setCancelDialogOpen(false)
      } else {
        toast.error(data.error || "Failed to cancel subscription")
      }
    } catch (error) {
      console.error("Cancel error:", error)
      toast.error("Failed to cancel subscription")
    } finally {
      setActionLoading(null)
    }
  }

  const handlePauseSubscription = async () => {
    try {
      setActionLoading("pause")

      const response = await fetch("/settings/billing/pause", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token":
            document
              .querySelector('meta[name="csrf-token"]')
              ?.getAttribute("content") || "",
        },
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        router.reload()
        setPauseDialogOpen(false)
      } else {
        toast.error(data.error || "Failed to pause subscription")
      }
    } catch (error) {
      console.error("Pause error:", error)
      toast.error("Failed to pause subscription")
    } finally {
      setActionLoading(null)
    }
  }

  const handleResumeSubscription = async () => {
    try {
      setActionLoading("resume")

      const response = await fetch("/settings/billing/resume", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token":
            document
              .querySelector('meta[name="csrf-token"]')
              ?.getAttribute("content") || "",
        },
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        router.reload()
      } else {
        toast.error(data.error || "Failed to resume subscription")
      }
    } catch (error) {
      console.error("Resume error:", error)
      toast.error("Failed to resume subscription")
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpgrade = async () => {
    try {
      setActionLoading("upgrade")

      // Replace with your actual Stripe price ID
      const priceId = "price_your_stripe_price_id"

      const response = await fetch("/settings/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token":
            document
              .querySelector('meta[name="csrf-token"]')
              ?.getAttribute("content") || "",
        },
        body: JSON.stringify({ price_id: priceId }),
      })

      const data = await response.json()

      if (response.ok && data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        toast.error(data.error || "Failed to create checkout session")
      }
    } catch (error) {
      console.error("Upgrade error:", error)
      toast.error("Failed to start upgrade process")
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Billing & Subscription" />
      <SettingsLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Billing & Subscription</h1>
            <p className="text-muted-foreground">
              Manage your subscription and billing information
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-8">
            {/* Current Subscription */}
            <div className="lg:col-span-5">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Current Subscription
                      </CardTitle>
                      <CardDescription>
                        Your current billing plan and status
                      </CardDescription>
                    </div>
                    {billing.subscription &&
                      getStatusBadge(billing.subscription.status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {billing.has_subscription && billing.subscription ? (
                    <>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="text-muted-foreground text-sm font-medium">
                            Plan
                          </h4>
                          <p className="text-lg font-semibold">
                            {billing.subscription.plan_name}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-muted-foreground text-sm font-medium">
                            Price
                          </h4>
                          <p className="text-lg font-semibold">
                            {billing.subscription.monthly_price.formatted}/month
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="text-muted-foreground text-sm font-medium">
                            Started
                          </h4>
                          <p className="text-sm">
                            {formatDate(
                              billing.subscription.subscription_starts_at,
                            )}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-muted-foreground text-sm font-medium">
                            Next Billing
                          </h4>
                          <p className="text-sm">
                            {formatDate(
                              billing.subscription.current_period_end ||
                                billing.subscription.next_billing_date,
                            )}
                          </p>
                        </div>
                      </div>

                      {billing.subscription.trial_active && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-800">
                              Trial Period Active
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-blue-700">
                            Your trial ends in{" "}
                            {billing.subscription.days_until_trial_ends} days on{" "}
                            {formatDate(billing.subscription.trial_ends_at)}
                          </p>
                        </div>
                      )}

                      {billing.subscription.status === "canceled" &&
                        billing.subscription.canceled_at && (
                          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                            <div className="flex items-center gap-2">
                              <X className="h-4 w-4 text-red-600" />
                              <span className="font-medium text-red-800">
                                Subscription Canceled
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-red-700">
                              Canceled on{" "}
                              {formatDate(billing.subscription.canceled_at)}.
                              Access continues until{" "}
                              {formatDate(
                                billing.subscription.current_period_end,
                              )}
                              .
                            </p>
                          </div>
                        )}

                      <Separator />

                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={handleManageSubscription}
                          disabled={actionLoading === "manage"}
                          variant="outline"
                        >
                          {actionLoading === "manage" ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <Settings className="mr-2 h-4 w-4" />
                              Manage Payment
                            </>
                          )}
                        </Button>

                        {billing.subscription.status === "active" && (
                          <>
                            <Dialog
                              open={pauseDialogOpen}
                              onOpenChange={setPauseDialogOpen}
                            >
                              <DialogTrigger asChild>
                                <Button variant="outline">
                                  <Pause className="mr-2 h-4 w-4" />
                                  Pause
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Pause Subscription?</DialogTitle>
                                  <DialogDescription>
                                    This will pause your subscription at the end
                                    of the current billing period. You can
                                    resume anytime.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => setPauseDialogOpen(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handlePauseSubscription}
                                    disabled={actionLoading === "pause"}
                                  >
                                    {actionLoading === "pause"
                                      ? "Pausing..."
                                      : "Pause Subscription"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Dialog
                              open={cancelDialogOpen}
                              onOpenChange={setCancelDialogOpen}
                            >
                              <DialogTrigger asChild>
                                <Button variant="destructive">
                                  <X className="mr-2 h-4 w-4" />
                                  Cancel
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
                                    Cancel Subscription?
                                  </DialogTitle>
                                  <DialogDescription>
                                    This will cancel your subscription at the
                                    end of the current billing period. This
                                    action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => setCancelDialogOpen(false)}
                                  >
                                    Keep Subscription
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={handleCancelSubscription}
                                    disabled={actionLoading === "cancel"}
                                  >
                                    {actionLoading === "cancel"
                                      ? "Canceling..."
                                      : "Cancel Subscription"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}

                        {billing.subscription.status === "paused" && (
                          <Button
                            onClick={handleResumeSubscription}
                            disabled={actionLoading === "resume"}
                          >
                            {actionLoading === "resume" ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Resuming...
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Resume
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="py-8 text-center">
                      <CreditCard className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                      <h3 className="mb-2 text-lg font-medium">
                        No Active Subscription
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        You're currently on the free plan with limited features.
                      </p>
                      <Button
                        onClick={handleUpgrade}
                        disabled={actionLoading === "upgrade"}
                      >
                        {actionLoading === "upgrade" ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          "Upgrade to Pro"
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Usage */}
            <div className="space-y-4 lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {!billing.has_subscription && (
                    <Button
                      onClick={handleUpgrade}
                      disabled={actionLoading === "upgrade"}
                      className="w-full"
                    >
                      {actionLoading === "upgrade" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Upgrade to Pro"
                      )}
                    </Button>
                  )}

                  {billing.has_subscription && (
                    <>
                      <Button variant="outline" className="w-full" disabled>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Download Invoice
                      </Button>

                      <Button variant="outline" className="w-full" disabled>
                        View Billing History
                      </Button>
                    </>
                  )}

                  {!billing.has_subscription && (
                    <div className="py-4 text-center">
                      <p className="text-muted-foreground text-sm">
                        Billing actions will be available after subscribing
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Features Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Premium Features</span>
                      {billing.can_access_features ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Priority Support</span>
                      {billing.can_access_features ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Advanced Analytics</span>
                      {billing.can_access_features ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SettingsLayout>
    </AppLayout>
  )
}
