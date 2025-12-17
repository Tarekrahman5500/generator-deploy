import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NavLink } from "@/components/NavLink";
import { Target, Eye, Settings, Lightbulb, Users } from "lucide-react";
import Footer from "@/components/Footer";
import aboutHeroImg from "@/assets/about-hero.jpg";
import CEO from "@/assets/ceo.jpg";
import CE from "@/assets/CE.jpg";
import COO from "@/assets/coo.jpg";
import SM from "@/assets/sm.jpg";
const About = () => {
  const values = [
    {
      icon: Settings,
      title: "Commitment to Quality",
      description:
        "We uphold the highest standards in every piece of equipment we build, ensuring durability, reliability, and peak performance.",
    },
    {
      icon: Lightbulb,
      title: "Innovation in Engineering",
      description:
        "We continuously push the boundaries of technology to create forward-thinking solutions that drive efficiency and progress.",
    },
    {
      icon: Users,
      title: "Partnership with Customers",
      description:
        "Your success is our success. We work closely with our clients to understand their needs and provide unparalleled support.",
    },
  ];

  const team = [
    {
      img: CEO,
      name: "John D. Miller",
      role: "Founder & CEO",
    },
    {
      img: COO,
      name: "Sarah Chen",
      role: "Chief Operating Officer",
    },
    {
      img: CE,
      name: "David Rodriguez",
      role: "Head of Engineering",
    },
    {
      img: SM,
      name: "Emily White",
      role: "VP of Sales & Marketing",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={aboutHeroImg}
            alt="About IndusTech"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/90 to-navy/70" />
        </div>

        <div className="container relative z-10 px-6 text-center">
          <h1 className="text-5xl font-heading font-bold text-white mb-4">
            Engineering the Future of Industry Since 1985
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Discover our commitment to quality, innovation, and customer
            satisfaction that has driven us for over three decades.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container px-6">
          <h2 className="text-4xl font-heading font-bold text-center mb-16">
            Our Mission & Vision
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="p-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 text-primary mb-6">
                <Target className="h-7 w-7" style={{ color: "#fa7238" }} />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-4">
                Our Mission
              </h3>
              <p className="text-muted-foreground">
                To provide the most reliable and efficient industrial equipment,
                empowering our clients to achieve their production goals with
                confidence.
              </p>
            </Card>

            <Card className="p-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 text-primary mb-6">
                <Eye className="h-7 w-7 " style={{ color: "#fa7238" }} />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-4">
                Our Vision
              </h3>
              <p className="text-muted-foreground">
                To be the global leader in industrial innovation, pioneering new
                technologies that redefine the standards of manufacturing and
                engineering.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-secondary/30">
        <div className="container px-6">
          <h2 className="text-4xl font-heading font-bold text-center mb-16">
            Our Core Values
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <Card key={index} className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-primary mb-6">
                  <value.icon
                    className="h-8 w-8"
                    style={{ color: "#fa7238" }}
                  />
                </div>
                <h3 className="text-xl font-heading font-bold mb-4">
                  {value.title}
                </h3>
                <p className="text-muted-foreground">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20">
        <div className="container px-6">
          <h2 className="text-4xl font-heading font-bold text-center mb-16">
            Meet the Leadership Team
          </h2>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="overflow-hidden">
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6 text-center">
                  <h3 className="font-heading font-bold mb-1">{member.name}</h3>
                  <p className="text-sm text-primary">{member.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy text-navy-foreground">
        <div className="container px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-heading font-bold mb-4">
              Ready to Elevate Your Operations?
            </h2>
            <p className="text-lg text-navy-foreground/90 mb-8">
              Let's discuss how our industrial equipment can meet your specific
              needs. Explore our products or contact our team for a personalized
              quote.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="bg-accent hover:bg-accent">
                <NavLink to="/products">View Products</NavLink>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-navy-foreground/20 text-navy-foreground hover:bg-navy-foreground/10"
              >
                <NavLink to="/contact">Contact Us</NavLink>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
