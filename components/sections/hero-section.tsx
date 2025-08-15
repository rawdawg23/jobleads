import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users } from "lucide-react"
import Link from "next/link"

export default function HeroSection() {
  return (
    <section className="py-24 px-6">
      <div className="container mx-auto text-center max-w-5xl">
        <Badge variant="secondary" className="px-6 py-3 text-sm font-semibold bg-primary/10 text-primary border-0 mb-6">
          🚗 Professional ECU Remapping Network
        </Badge>

        <h2 className="text-6xl font-bold text-foreground mb-8">
          UK's Leading
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            {" "}
            ECU Remapping Platform
          </span>
        </h2>

        <p className="text-2xl text-foreground/70 mb-8 max-w-4xl mx-auto">
          Connect with certified ECU remapping specialists across the UK. We specialize in performance tuning, economy
          mapping, DPF removal, EGR deletion, and diagnostic services.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <Button size="lg" className="text-lg px-10 py-4 bg-primary hover:bg-primary/90" asChild>
            <Link href="/jobs/post" className="flex items-center gap-2">
              Get Your ECU Remapped
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-10 py-4 border-2 border-primary/30 text-primary hover:bg-primary/5 bg-transparent"
            asChild
          >
            <Link href="/dealers/register" className="flex items-center gap-2">
              Join as ECU Specialist
              <Users className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
