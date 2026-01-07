/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-useless-escape */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Lock,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import countryList from "country-list"; // sim
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import map from "../assets/map.png";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// lightweight country list

const contactSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required" }),
  company: z.string().optional(),
  country: z.string().optional(),
  email: z.string().email({ message: "Invalid email address" }),
  telephone: z.string().min(10, { message: "Valid phone number is required" }),
  message: z
    .string()
    .regex(/^[A-Za-z0-9\s,'".?\-!]+$/, {
      message: "Only valid text are allowed. No HTML, JS, numbers or symbols.",
    })
    .min(5, { message: "Message must be at least 5 characters long." }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const Contact = ({ data: contactData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: "",
      company: "",
      email: "",
      telephone: "",
      message: "",
      country: "Bangladesh",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);

    try {
      const url = `${import.meta.env.VITE_API_URL}/contact-form`;
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
      const res = await fetch(url, options);

      if (!res.ok) {
        toast.error("Failed to submit.", {
          style: {
            background: "#ff0000", // your custom red
            color: "#fff",
            borderRadius: "10px",
            padding: "12px 16px",
          },
        });
      }

      toast.success("Message Sent!", {
        style: {
          background: "#326e12", // your custom red
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });

      form.reset();
    } catch (error) {
      toast.error("Failed to send message. Please try again", {
        style: {
          background: "#ff0000", // your custom red
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const countries = countryList.getNames(); // top-level hookless
  const [search, setSearch] = useState("");

  const filteredCountries = countries.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );
  const getIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case "phone":
        return <Phone className="h-5 w-5 text-white" />;
      case "email":
        return <Mail className="h-5 w-5 text-white" />;
      case "address":
        return <MapPin className="h-5 w-5 text-white" />;
      default:
        return <Phone className="h-5 w-5 text-white" />;
    }
  };
  return (
    <div className="min-h-screen">
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
              <div className="space-y-6 mb-12">
                {contactData.map((item) => (
                  <Card key={item.id} className="p-6 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#163859] flex items-center justify-center flex-shrink-0">
                      {getIcon(item.title)}
                    </div>
                    <div>
                      <p className="font-medium mb-1">{item.title}</p>
                      {/* Using white-space pre-line to handle any manual line breaks in address strings */}
                      <p className="text-muted-foreground whitespace-pre-line">
                        {item.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>

              <div>
                <h3 className="text-2xl font-heading font-bold mb-6">
                  Our Location
                </h3>
                <div className="w-full h-64 bg-secondary/50 rounded-lg flex items-center justify-center">
                  <img src={map} />
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <Card className="p-8">
                <h2 className="text-3xl font-heading font-bold mb-8">
                  Send Us a Message
                </h2>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Full Name{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Company Name{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="ABC Corporation" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Email Address{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="you@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="telephone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Phone Number{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Country Name{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Select
                                value={field.value || ""}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your country" />
                                </SelectTrigger>
                                <SelectContent>
                                  <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search country..."
                                    className="w-full p-2 border-b border-border mb-2"
                                  />
                                  {filteredCountries.map((country) => (
                                    <SelectItem key={country} value={country}>
                                      {country}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Your Message{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Please describe your inquiry in detail..."
                              rows={6}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Lock className="w-4 h-4 mt-0.5 text-green-600" />
                      <p>
                        We protect your data. Your information is safe with us
                        and will not be shared.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-[#163859] hover:bg-[#163859] text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Submit Inquiry"}
                    </Button>
                  </form>
                </Form>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
