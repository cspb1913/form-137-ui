import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LogIn } from "lucide-react"

export function LoginPrompt() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Authentication Required</CardTitle>
          <CardDescription className="text-gray-600">
            Please log in to access the dashboard and manage your requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <a href="/api/auth/login">
              <LogIn className="mr-2 h-5 w-5" />
              Log In with Auth0
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
