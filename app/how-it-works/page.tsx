import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MapPin, Users, CheckCircle } from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        <div className="container px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold md:text-5xl">How It Works</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Find healthcare providers who prescribe your medications in just a few simple steps
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Search Medication</h3>
                <p className="text-muted-foreground">
                  Enter the name of your medication or browse our database of 25,000+ FDA-approved prescriptions
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Set Location</h3>
                <p className="text-muted-foreground">
                  Enter your ZIP code or city to find providers in your area with customizable search radius
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. View Results</h3>
                <p className="text-muted-foreground">
                  Browse through 200,000+ verified healthcare providers with experience prescribing your medication
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">4. Connect</h3>
                <p className="text-muted-foreground">
                  Get full contact details and make appointments with providers who have experience with your medication
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-8">Why Choose RX Prescribers?</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Comprehensive Database</h3>
                  <p className="text-muted-foreground">
                    Access to 3 million prescription records from verified healthcare providers
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Experience-Based Matching</h3>
                  <p className="text-muted-foreground">
                    Our % Match system shows how much experience each provider has with your specific medication
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">HIPAA Compliant</h3>
                  <p className="text-muted-foreground">
                    All data is handled with the highest security standards and privacy protection
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
