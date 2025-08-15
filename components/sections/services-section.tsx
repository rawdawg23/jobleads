import { Card, CardDescription, CardHeader } from "@/components/ui/card"

export default function ServicesSection() {
  return (
    <section className="py-20 px-6 bg-white/40">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-foreground mb-6">Professional ECU Remapping Services</h3>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Our network of certified specialists use the latest ECU tools and software to unlock your vehicle's true
            potential.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg bg-white/70">
            <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600">
              <div className="h-full flex items-end p-4">
                <h4 className="font-bold text-lg text-white">Performance Remapping</h4>
              </div>
            </div>
            <CardHeader className="p-6">
              <CardDescription className="text-foreground/70 text-base">
                Increase power and torque by 15-35% with our Stage 1, 2 & 3 performance maps.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70">
            <div className="h-48 bg-gradient-to-br from-green-500 to-green-600">
              <div className="h-full flex items-end p-4">
                <h4 className="font-bold text-lg text-white">Economy Tuning</h4>
              </div>
            </div>
            <CardHeader className="p-6">
              <CardDescription className="text-foreground/70 text-base">
                Achieve 15-25% fuel savings with our economy maps. Perfect for fleet vehicles and daily drivers.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70">
            <div className="h-48 bg-gradient-to-br from-orange-500 to-red-500">
              <div className="h-full flex items-end p-4">
                <h4 className="font-bold text-lg text-white">DPF & EGR Services</h4>
              </div>
            </div>
            <CardHeader className="p-6">
              <CardDescription className="text-foreground/70 text-base">
                Professional DPF removal, EGR deletion, and AdBlue delete services.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  )
}
