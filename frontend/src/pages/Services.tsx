import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { Shield, Clock, Headphones, Award } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import servicesHeroImg from "@/assets/services-hero.jpg";
import installationImg from "@/assets/service-installation.jpg";
import maintenanceImg from "@/assets/service-maintenance.jpg";

const Services = () => {
  const services = [
    {
      title: "Equipment Installation & Commissioning",
      description: "Our certified experts ensure your equipment is set up correctly and safely for optimal performance and longevity.",
      image: installationImg,
    },
    {
      title: "Preventative Maintenance Plans",
      description: "Scheduled maintenance that maximizes uptime and extends the life of your valuable assets.",
      image: maintenanceImg,
    },
    {
      title: "Emergency Repair Services",
      description: "Rapid, reliable 24/7 emergency response to get your operations back online as quickly as possible.",
      image: installationImg,
    },
    {
      title: "Technical Consultation & Training",
      description: "Empower your team with expert advice and hands-on training to maximize operational efficiency.",
      image: maintenanceImg,
    },
    {
      title: "Genuine Parts & Upgrades",
      description: "Modernize your systems and ensure reliability with our inventory of authentic, high-performance parts.",
      image: installationImg,
    },
  ];

  const promises = [
    {
      icon: Shield,
      title: "Safety First",
      description: "Our protocols protect your team and assets, adhering to the highest industry safety standards."
    },
    {
      icon: Clock,
      title: "Guaranteed Uptime",
      description: "We focus on preventative solutions and rapid response to keep your operations running smoothly."
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Our dedicated support team is available around the clock to address any urgent issues you may face."
    },
    {
      icon: Award,
      title: "Certified Technicians",
      description: "Every member of our team is fully certified and continuously trained on the latest technologies."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={servicesHeroImg} 
            alt="Industrial services" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/90 to-navy/70" />
        </div>
        
        <div className="container relative z-10 px-6 text-center">
          <h1 className="text-5xl font-heading font-bold text-white mb-4">
            Comprehensive Industrial Equipment Services
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Delivering expert installation, maintenance, and support to keep your operations running at peak efficiency. Our commitment is to quality, safety, and reliability.
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
            {services.map((service, index) => (
              <Card key={index} className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-heading font-bold mb-3">{service.title}</h3>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <Button asChild variant="link" className="p-0 h-auto text-accent">
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
            <h2 className="text-4xl font-heading font-bold mb-4">Our Service Promise</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We are dedicated to providing unparalleled service that you can trust. Partner with us and benefit from our commitment to excellence in every job we undertake.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {promises.map((promise, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent mb-4">
                  <promise.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-heading font-bold mb-3">{promise.title}</h3>
                <p className="text-muted-foreground text-sm">{promise.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy text-navy-foreground">
        <div className="container px-6 text-center">
          <h2 className="text-4xl font-heading font-bold mb-4">
            Ready to Optimize Your Operations?
          </h2>
          <p className="text-lg text-navy-foreground/90 mb-8 max-w-2xl mx-auto">
            Contact our experts today for a personalized consultation and learn how our tailored service plans can enhance your productivity and reduce downtime.
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <NavLink to="/contact">Schedule a Consultation</NavLink>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
