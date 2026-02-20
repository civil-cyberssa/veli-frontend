"use client"

import Dashboard from "@/src/features/dashboard/dashboard"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-[1400px]">
        <Dashboard />
      </div>
    </div>
  )
}
