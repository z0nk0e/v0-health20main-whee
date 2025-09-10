"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  User,
  Eye,
  Search,
  MessageSquare,
  TrendingUp,
  Settings,
  Star,
  MapPin,
  Phone,
  Globe,
  Edit,
  Plus,
} from "lucide-react"
import Link from "next/link"

interface PrescriberProfile {
  id: string
  firstName: string
  lastName: string
  practiceName: string
  specialty: string[]
  verified: boolean
  subscriptionStatus: "FREE" | "VERIFIED" | "FEATURED"
  profileCompleteness: number
  profileImageUrl?: string
  addressCity: string
  addressState: string
  phone?: string
  website?: string
}

interface DashboardStats {
  profileViews: number
  searchAppearances: number
  patientInquiries: number
  monthlyGrowth: number
}

export default function PrescriberDashboard() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<PrescriberProfile | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for charts
  const viewsData = [
    { name: "Mon", views: 12 },
    { name: "Tue", views: 19 },
    { name: "Wed", views: 8 },
    { name: "Thu", views: 15 },
    { name: "Fri", views: 22 },
    { name: "Sat", views: 18 },
    { name: "Sun", views: 14 },
  ]

  const subscriptionData = [
    { name: "Free", value: 65, color: "#6b7280" },
    { name: "Verified", value: 25, color: "#8b5cf6" },
    { name: "Featured", value: 10, color: "#22c55e" },
  ]

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/prescriber/profile")
        if (response.ok) {
          const data = await response.json()
          setProfile(data.profile)
          setStats(data.stats)
        }
      } catch (error) {
        console.error("[v0] Error fetching profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const getSubscriptionBadge = (status: string) => {
    switch (status) {
      case "FEATURED":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Featured</Badge>
      case "VERIFIED":
        return <Badge className="bg-accent/20 text-accent border-accent/30">Verified</Badge>
      default:
        return <Badge variant="outline">Free</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/20 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Prescriber Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {profile?.firstName} {profile?.lastName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {getSubscriptionBadge(profile?.subscriptionStatus || "FREE")}
              <Link href="/prescriber/profile">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Profile Completeness Alert */}
        {profile && profile.profileCompleteness < 100 && (
          <Card className="mb-6 border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">Complete Your Profile</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    A complete profile gets 3x more patient inquiries
                  </p>
                  <Progress value={profile.profileCompleteness} className="w-full max-w-sm" />
                  <p className="text-xs text-muted-foreground mt-1">{profile.profileCompleteness}% complete</p>
                </div>
                <Link href="/prescriber/profile">
                  <Button>
                    <Edit className="w-4 h-4 mr-2" />
                    Complete Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.profileViews || 0}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Search Appearances</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.searchAppearances || 0}</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patient Inquiries</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.patientInquiries || 0}</div>
              <p className="text-xs text-muted-foreground">+23% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats?.monthlyGrowth || 0}%</div>
              <p className="text-xs text-muted-foreground">Engagement increase</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Summary</CardTitle>
                  <CardDescription>Your current profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile && (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {profile.firstName} {profile.lastName}
                          </h3>
                          <p className="text-muted-foreground">{profile.practiceName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {profile.addressCity}, {profile.addressState}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            Specialties: {profile.specialty?.join(", ") || "Not specified"}
                          </span>
                        </div>
                        {profile.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{profile.phone}</span>
                          </div>
                        )}
                        {profile.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{profile.website}</span>
                          </div>
                        )}
                      </div>

                      <Link href="/prescriber/profile">
                        <Button variant="outline" className="w-full bg-transparent">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      </Link>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Manage your prescriber presence</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/prescriber/pharmaceuticals">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Plus className="w-4 h-4 mr-2" />
                      Manage Pharmaceuticals
                    </Button>
                  </Link>
                  <Link href="/prescriber/subscription">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Star className="w-4 h-4 mr-2" />
                      Upgrade Subscription
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    View Patient Messages
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Public Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Views Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Views</CardTitle>
                  <CardDescription>Daily profile views over the last week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={viewsData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-muted-foreground" />
                      <YAxis className="text-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line type="monotone" dataKey="views" stroke="hsl(var(--accent))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Subscription Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Distribution</CardTitle>
                  <CardDescription>Subscription types across all prescribers</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={subscriptionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {subscriptionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-4">
                    {subscriptionData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm text-muted-foreground">
                          {entry.name} ({entry.value}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Management</CardTitle>
                <CardDescription>Manage your prescriber profile and settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Profile Settings</h3>
                  <p className="text-muted-foreground mb-6">
                    Update your profile information, manage pharmaceuticals, and configure your settings.
                  </p>
                  <Link href="/prescriber/profile">
                    <Button>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
