import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AuthErrorPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Authentication Error</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            An error occurred during authentication. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 dark:text-gray-400">
            If the problem persists, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}