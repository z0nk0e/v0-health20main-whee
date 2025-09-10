import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { type VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";
import { badgeVariants } from "@/components/ui/badge";
import type * as React from "react";

type ButtonProps = React.ComponentProps<typeof Button> & VariantProps<typeof buttonVariants>;
type BadgeProps = React.ComponentProps<typeof Badge> & VariantProps<typeof badgeVariants>;
import { Search, MapPin, Clock, Star } from "lucide-react"

export default async function DashboardPage() {
  const { auth } = await import("@/auth")
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-bold text-slate-900 mb-2">Find Your Healthcare Provider</h1>
          <p className="text-slate-600">Search our database of 825K+ providers who prescribe specific medications</p>
        </div>

        {/* Enhanced Search Interface */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-accent" />
              Advanced Provider Search
            </CardTitle>
            <CardDescription>Find healthcare providers by medication, location, and specialty</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Medication Name</label>
                <Input placeholder="e.g., Metformin, Lisinopril, Atorvastatin" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Input placeholder="City, State or ZIP code" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Specialty (Optional)</label>
                <Input placeholder="e.g., Cardiology, Endocrinology" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Insurance (Optional)</label>
                <Input placeholder="e.g., Blue Cross, Aetna, Medicare" />
              </div>
            </div>
            <Button className="w-full md:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Search Providers
            </Button>
          </CardContent>
        </Card>

        {/* Sample Results */}
        <div className="grid gap-6">
          <h2 className="font-playfair text-2xl font-semibold text-slate-900">Recent Searches & Recommendations</h2>

          {[1, 2, 3].map((i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">Dr. Sarah Johnson, MD</h3>
                      <Badge variant="secondary">Endocrinology</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">4.8</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>2.3 miles away</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Next available: Tomorrow</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      Specializes in diabetes management and metabolic disorders. Frequently prescribes Metformin,
                      Insulin, and other diabetes medications.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Metformin</Badge>
                      <Badge variant="outline">Insulin</Badge>
                      <Badge variant="outline">Glipizide</Badge>
                      <Badge variant="outline">+12 more</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:w-48">
                    <Button className="w-full">View Profile</Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      Book Appointment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
