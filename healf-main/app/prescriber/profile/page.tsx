"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Upload, User, MapPin, Phone, Globe, Star } from "lucide-react"
import Link from "next/link"
import { Breadcrumbs } from "@/components/breadcrumbs"

interface ProfileData {
  firstName: string
  lastName: string
  practiceName: string
  specialty: string[]
  npiNumber: string
  addressStreet: string
  addressCity: string
  addressState: string
  addressZip: string
  phone: string
  website: string
  bio: string
  profileImageUrl?: string
}

export default function PrescriberProfile() {
  const { data: session } = useSession()
  const router = useRouter()
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    practiceName: "",
    specialty: [],
    npiNumber: "",
    addressStreet: "",
    addressCity: "",
    addressState: "",
    addressZip: "",
    phone: "",
    website: "",
    bio: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [completeness, setCompleteness] = useState(0)

  // Calculate profile completeness
  useEffect(() => {
    const fields = [
      profileData.firstName,
      profileData.lastName,
      profileData.practiceName,
      profileData.specialty.length > 0,
      profileData.npiNumber,
      profileData.addressStreet,
      profileData.addressCity,
      profileData.addressState,
      profileData.addressZip,
      profileData.phone,
      profileData.bio,
    ]

    const filledFields = fields.filter(Boolean).length
    const percentage = Math.round((filledFields / fields.length) * 100)
    setCompleteness(percentage)
  }, [profileData])

  // Load existing profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/prescriber/profile")
        if (response.ok) {
          const data = await response.json()
          if (data.profile) {
            setProfileData({
              firstName: data.profile.firstName || "",
              lastName: data.profile.lastName || "",
              practiceName: data.profile.practiceName || "",
              specialty: data.profile.specialty || [],
              npiNumber: data.profile.npiNumber || "",
              addressStreet: data.profile.addressStreet || "",
              addressCity: data.profile.addressCity || "",
              addressState: data.profile.addressState || "",
              addressZip: data.profile.addressZip || "",
              phone: data.profile.phone || "",
              website: data.profile.website || "",
              bio: data.profile.bio || "",
              profileImageUrl: data.profile.profileImageUrl,
            })
          }
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

  const handleSave = async () => {
    setIsSaving(true)
    setMessage("")

    try {
      const response = await fetch("/api/prescriber/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      })

      if (response.ok) {
        setMessage("Profile updated successfully!")
        setTimeout(() => setMessage(""), 3000)
      } else {
        const data = await response.json()
        setMessage(data.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("[v0] Error saving profile:", error)
      setMessage("An error occurred while saving")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSpecialtyAdd = (specialty: string) => {
    if (specialty && !profileData.specialty.includes(specialty)) {
      setProfileData({
        ...profileData,
        specialty: [...profileData.specialty, specialty],
      })
    }
  }

  const handleSpecialtyRemove = (specialty: string) => {
    setProfileData({
      ...profileData,
      specialty: profileData.specialty.filter((s) => s !== specialty),
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/20 bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="mb-2">
            <Breadcrumbs />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/prescriber/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
                <p className="text-muted-foreground">Manage your prescriber profile information</p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Completeness */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">Profile Completeness</h3>
                <p className="text-sm text-muted-foreground">Complete your profile to attract more patients</p>
              </div>
              <Badge variant={completeness === 100 ? "default" : "secondary"}>{completeness}% Complete</Badge>
            </div>
            <Progress value={completeness} className="w-full" />
          </CardContent>
        </Card>

        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="practice">Practice</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="bio">Bio & Image</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>Your personal and professional details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="npiNumber">NPI Number *</Label>
                  <Input
                    id="npiNumber"
                    value={profileData.npiNumber}
                    onChange={(e) => setProfileData({ ...profileData, npiNumber: e.target.value })}
                    placeholder="Enter your 10-digit NPI number"
                    maxLength={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Medical Specialties *</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profileData.specialty.map((spec, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer">
                        {spec}
                        <button
                          type="button"
                          onClick={() => handleSpecialtyRemove(spec)}
                          className="ml-2 text-xs hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a specialty (e.g., Internal Medicine)"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleSpecialtyAdd(e.currentTarget.value)
                          e.currentTarget.value = ""
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                        handleSpecialtyAdd(input.value)
                        input.value = ""
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="practice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Practice Information
                </CardTitle>
                <CardDescription>Details about your medical practice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="practiceName">Practice Name *</Label>
                  <Input
                    id="practiceName"
                    value={profileData.practiceName}
                    onChange={(e) => setProfileData({ ...profileData, practiceName: e.target.value })}
                    placeholder="Enter your practice name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressStreet">Street Address *</Label>
                  <Input
                    id="addressStreet"
                    value={profileData.addressStreet}
                    onChange={(e) => setProfileData({ ...profileData, addressStreet: e.target.value })}
                    placeholder="Enter street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="addressCity">City *</Label>
                    <Input
                      id="addressCity"
                      value={profileData.addressCity}
                      onChange={(e) => setProfileData({ ...profileData, addressCity: e.target.value })}
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressState">State *</Label>
                    <Input
                      id="addressState"
                      value={profileData.addressState}
                      onChange={(e) => setProfileData({ ...profileData, addressState: e.target.value })}
                      placeholder="State"
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressZip">ZIP Code *</Label>
                    <Input
                      id="addressZip"
                      value={profileData.addressZip}
                      onChange={(e) => setProfileData({ ...profileData, addressZip: e.target.value })}
                      placeholder="ZIP"
                      maxLength={10}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>How patients can reach you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                      placeholder="https://yourpractice.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Bio & Profile Image
                </CardTitle>
                <CardDescription>Tell patients about yourself and your practice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Tell patients about your experience, approach to care, and what makes your practice unique..."
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground">{profileData.bio.length}/500 characters</p>
                </div>

                <div className="space-y-2">
                  <Label>Profile Image</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center">
                      {profileData.profileImageUrl ? (
                        <img
                          src={profileData.profileImageUrl || "/placeholder.svg"}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-accent" />
                      )}
                    </div>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Upload a professional headshot. JPG or PNG, max 2MB.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
