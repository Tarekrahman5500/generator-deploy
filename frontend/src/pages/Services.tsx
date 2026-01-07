import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { Shield, Clock, Headphones, Award } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import servicesHeroImg from "@/assets/services-hero.jpg";
import installationImg from "@/assets/service-installation.jpg";
import maintenanceImg from "@/assets/service-maintenance.jpg";

const Services = ({ data: services, serviceHero }) => {
  const promises = [
    {
      icon: Shield,
      title: "Safety First",
      description:
        "Our protocols protect your team and assets, adhering to the highest industry safety standards.",
    },
    {
      icon: Clock,
      title: "Guaranteed Uptime",
      description:
        "We focus on preventative solutions and rapid response to keep your operations running smoothly.",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description:
        "Our dedicated support team is available around the clock to address any urgent issues you may face.",
    },
    {
      icon: Award,
      title: "Certified Technicians",
      description:
        "Every member of our team is fully certified and continuously trained on the latest technologies.",
    },
  ];

  const heroSection = {
    backgroundImage: serviceHero[0]?.file?.url,
    title: serviceHero[0]?.title,
    description: serviceHero[0]?.description
  }
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={`${import.meta.env.VITE_API_URL}/${heroSection.backgroundImage
              }`}
            alt="Industrial services"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/90 to-navy/70" />
        </div>

        <div className="container relative z-10 px-6 text-center">
          <h1 className="text-5xl font-heading font-bold text-white mb-4">
            {heroSection.title}
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            {heroSection.description}
          </p>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 bg-secondary/30">
        <div className="container px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold mb-4">What We Do</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your trusted partner for end-to-end industrial solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service: any, index: number) => (
              <Card
                key={index}
                className="overflow-hidden group hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={`${import.meta.env.VITE_API_URL}/${service.file.url
                      }`}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-heading font-bold mb-3">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {service.description}
                  </p>
                  <Button
                    asChild
                    variant="link"
                    className="p-0 h-auto text-[#163859]/90 font-semibold"
                  >
                    <NavLink to="/contact">Learn More →</NavLink>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Promise */}
      <section className="py-20">
        <div className="container px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold mb-4">
              Our Service Promise
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We are dedicated to providing unparalleled service that you can
              trust. Partner with us and benefit from our commitment to
              excellence in every job we undertake.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {promises.map((promise, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#163859]/90 text-white mb-4">
                  <promise.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-heading font-bold mb-3">
                  {promise.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {promise.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}

      <Footer />
    </div>
  );
};

export default Services;
