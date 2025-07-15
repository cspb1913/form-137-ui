"use client"

import { useUser } from "@auth0/nextjs-auth0/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TopNavigation } from "@/components/top-navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { FileTextIcon, BarChartIcon, CheckCircleIcon } from "lucide-react"

export default function HomePage() {
  const { user, isLoading } = useUser()

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <TopNavigation />
      <main className="flex-1">
        <section className="w-full bg-white py-12 md:py-24 lg:py-32 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Request Your Form 137 with Ease
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Our streamlined portal makes it simple to request and track your Learner's Permanent Academic
                    Record. Get started in minutes.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  {isLoading ? (
                    <div className="h-10 w-36 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
                  ) : user ? (
                    <Button asChild size="lg">
                      <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                  ) : (
                    <Button asChild size="lg">
                      <Link href="/api/auth/login">Login to Get Started</Link>
                    </Button>
                  )}
                </div>
              </div>
              <img
                src="/placeholder.svg?height=550&width=550"
                width="550"
                height="550"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  A simple, transparent process to get the documents you need.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <FileTextIcon className="h-8 w-8" />
                  <CardTitle>Submit Request</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Fill out a simple form with your details and specify the purpose of your request. It only takes a
                    few minutes.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <BarChartIcon className="h-8 w-8" />
                  <CardTitle>Track Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Monitor the status of your request in real-time from your personal dashboard. No more guessing
                    games.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <CheckCircleIcon className="h-8 w-8" />
                  <CardTitle>Receive Document</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get notified once your Form 137 is ready for pickup or has been sent to your specified destination.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 Form 137 Request Portal. All rights reserved.</p>
        <nav className="flex gap-4 sm:ml-auto sm:gap-6">
          <Link href="#" className="text-xs hover:underline" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
