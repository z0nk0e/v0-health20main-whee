"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Patient",
    location: "Austin, TX",
    avatar: "/professional-woman.png",
    rating: 5,
    content:
      "Finding a provider who prescribed my ADHD medication was so difficult before RX Prescribers. Now I found three specialists in my area within minutes!",
    medication: "ADHD Treatment",
  },
  {
    name: "Dr. Michael Chen",
    role: "Healthcare Provider",
    location: "San Francisco, CA",
    avatar: "/doctor-asian-male.png",
    rating: 5,
    content:
      "As a provider, I appreciate how this platform connects me with patients who specifically need the treatments I specialize in. It's a win-win.",
    medication: "Diabetes Care",
  },
  {
    name: "Maria Rodriguez",
    role: "Patient",
    location: "Miami, FL",
    avatar: "/hispanic-woman-smiling.png",
    rating: 5,
    content:
      "The search results were incredibly accurate. I found a cardiologist who prescribes my exact heart medication just 10 minutes from my home.",
    medication: "Cardiac Medication",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-12 bg-muted/30">
      <div className="container px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-playfair text-3xl font-bold md:text-4xl">Trusted by Patients and Providers</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Real stories from people who found the healthcare they needed
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="h-full">
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <blockquote className="text-sm text-muted-foreground mb-6">"{testimonial.content}"</blockquote>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {testimonial.role} • {testimonial.location}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {testimonial.medication}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
