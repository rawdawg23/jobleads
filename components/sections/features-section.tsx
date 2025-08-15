import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Shield, Clock, Users, Car, Zap } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: MapPin,
      title: "Local Network Coverage",
      description: "Connect with verified dealers within 30-60 miles of your location.",
    },
    {
      icon: Shield,
      title: "DVLA Integration",
      description: "Automatic vehicle data lookup using official DVLA API.",
    },
    {
      icon: Clock,
      title: "Real-Time Tracking",
      description: "Live updates when your dealer is traveling to you.",
    },
    {
      icon: Users,
      title: "Secure Communication",
      description: "Built-in messaging system for secure communication.",
    },
    {
      icon: Car,
      title: "Tool Compatibility",
      description: "Advanced matching system connects you with dealers who have the exact ECU tools.",
    },
    {
      icon: Zap,
      title: "Secure Payments",
      description: "Bank transfer gateway managed by our admin team.",
    },
  ]

  return (
    <section className="py-20 px-6 bg-white/40">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-foreground mb-6">Why Choose CTEK JOB LEADS?</h3>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Experience the future of ECU remapping with our advanced platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg bg-white/70">
              <CardHeader className="p-8">
                <div className="p-4 bg-gradient-to-br from-primary/80 to-secondary/80 rounded-2xl w-fit mb-6">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground mb-4">{feature.title}</CardTitle>
                <CardDescription className="text-foreground/70 text-base">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
