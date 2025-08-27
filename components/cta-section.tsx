import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Smartphone, Globe, Shield } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container px-4">
        <Card className="mx-auto max-w-4xl bg-gradient-to-r from-accent/5 to-accent/10 border-accent/20">
          <CardContent className="p-12 text-center">
            <h2 className="font-playfair text-3xl font-bold md:text-4xl">Ready to Find Your Healthcare Provider?</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of patients who have successfully connected with healthcare providers who prescribe their
              medications. Start your search today.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-base px-8">
                Start Your Search
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="text-base px-8 bg-transparent">
                Learn More
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground">
              <div className="flex items-center justify-center space-x-2">
                <Smartphone className="h-4 w-4 text-accent" />
                <span>Mobile Optimized</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Globe className="h-4 w-4 text-accent" />
                <span>Nationwide Coverage</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Shield className="h-4 w-4 text-accent" />
                <span>100% Secure</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
