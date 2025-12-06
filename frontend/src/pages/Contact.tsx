import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import map from "../assets/map.png";
const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you as soon as possible.",
    });
    setFormData({
      fullName: "",
      company: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="py-20">
        <div className="container px-6">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-heading font-bold mb-4">
              Contact Our Team
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Reach out for quotes, support, or any inquiries. We are committed
              to providing you with the best solutions and are ready to assist
              with your industrial equipment needs.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-12 max-w-7xl mx-auto">
            <div className="lg:col-span-2">
              {/* <h2 className="text-3xl font-heading font-bold mb-8">
                Our Information
              </h2> */}

              <div className="space-y-6 mb-12">
                <Card className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Phone
                      className="h-5 w-5 text-primary"
                      style={{ color: "#fa7238" }}
                    />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Phone</p>
                    <p className="text-muted-foreground">+1 (800) 555-0199</p>
                  </div>
                </Card>

                <Card className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Mail
                      className="h-5 w-5 text-primary"
                      style={{ color: "#fa7238" }}
                    />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Email</p>
                    <p className="text-muted-foreground">sales@industech.com</p>
                  </div>
                </Card>

                <Card className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <MapPin
                      className="h-5 w-5 text-primary"
                      style={{ color: "#fa7238" }}
                    />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Address</p>
                    <p className="text-muted-foreground">
                      123 Industrial Park Way, Suite 456
                      <br />
                      Manufacturing City, ST 78901
                    </p>
                  </div>
                </Card>
              </div>

              <div>
                <h3 className="text-xl font-heading font-bold mb-3">
                  Our Location
                </h3>
                <div className="w-full h-64 bg-secondary/50 rounded-lg flex items-center justify-center">
                  <img src={map} className="h-full min-w-full" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <Card className="p-8">
                <h2 className="text-3xl font-heading font-bold mb-8">
                  Send Us a Message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-sm font-medium mb-2"
                      >
                        Full Name
                      </label>
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="company"
                        className="block text-sm font-medium mb-2"
                      >
                        Company Name
                      </label>
                      <Input
                        id="company"
                        placeholder="ABC Corporation"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-2"
                      >
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium mb-2"
                      >
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium mb-2"
                    >
                      Your Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Please describe your inquiry in detail..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Submit Inquiry
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <div className="border-t">
        <div className="container px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              © 2025 Marexis All rights reserved.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
