"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Database, Loader2 } from "lucide-react"
import { postRequest } from "@/lib/utils"
import { useAppCheck } from "@/context/firebase/AppCheckContext"

interface SeedResult {
  type: string
  action: string
  item: string
  reason?: string
}

export default function Page() {
  const [loading, setLoading] = useState(false)
  const { getAppCheckToken } = useAppCheck()

  const handleSeed = async () => {
    setLoading(true)
    try {
      const appCheckToken = await getAppCheckToken()
      const response = await postRequest("/api/admin/seed", appCheckToken)

      const data = await response.json() as {
        summary: { created: number; skipped: number }
        results: SeedResult[]
        error?: string
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to run seeds")
      }

      const { summary, results } = data
      const message = `Seeding completed: ${summary.created} created, ${summary.skipped} skipped`
      
      toast.success(message, {
        description: results.map((r: SeedResult) =>
          `${r.type}: ${r.item} (${r.action}${r.reason ? ` - ${r.reason}` : ""})`
        ).join(", "),
      })
    } catch (error) {
      toast.error("Failed to run seeds", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grow">
      <h1>Admin Dashboard</h1>
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-5" />
              Database Seeding
            </CardTitle>
            <CardDescription>
              Run seed functions to initialize default data in the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSeed}
              disabled={loading}
              variant="default"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Running seeds...
                </>
              ) : (
                <>
                  <Database className="mr-2 size-4" />
                  Run All Seeds
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
