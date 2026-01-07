import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useLocation } from "react-router-dom";
import { toast } from "sonner";

const quoteSchema = z.object({
  product: z.string().min(1, { message: "Please select a product" }),
  fullName: z.string().min(2, { message: "Full name is required" }),

  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Valid phone number is required" }),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;
// message: z
//   .string()
//   .regex(/^[A-Za-z\s,'".?\-!]+$/, {
//     message: "Only valid text are allowed. No HTML, JS, numbers or symbols.",
//   })
//   .min(5, { message: "Message must be at least 5 characters long." }),
const Quote = () => {
  const location = useLocation();
  const product = location.state?.product;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      product: product?.modelName || "",
      fullName: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (data: QuoteFormValues) => {
    if (!product?.id) {
      toast.error(
        "Product information is missing. Please go back and select a product.",
        {
          style: {
            background: "#ff0000", // your custom red
            color: "#fff",
            borderRadius: "10px",
            padding: "12px 16px",
          },
        }
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const body = {
        fullName: data.fullName,
        email: data.email,
        telephone: data.phone,
        country: "United States", // or add a country field in form
        productId: product.id,
      };
      const url = `${import.meta.env.VITE_API_URL}/contact-form/info-request`;
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
      const res = await fetch(
        url, options

      );

      if (!res.ok) {
        throw new Error("Failed to submit quote request");
      }

      toast.success(
        "Your quote request has been submitted successfully! Our team will get back to you shortly.",
        {
          style: {
            background: "#326e12", // your custom red
            color: "#fff",
            borderRadius: "10px",
            padding: "12px 16px",
          },
        }
      );

      form.reset();
    } catch (error) {
      console.error(error);
      toast.error(
        "There was an error submitting your request. Please try again later.",
        {
          style: {
            background: "#ff0000", // your custom red
            color: "#fff",
            borderRadius: "10px",
            padding: "12px 16px",
          },
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-muted/30">
        <div className="container max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
              Get a Custom Quote for Your Industrial Needs
            </h1>
            <p className="text-lg text-muted-foreground">
              Fill out the form below, and our experts will contact you within
              24 hours with a detailed estimate.
            </p>
          </div>

          <div className="bg-background rounded-lg shadow-lg p-8 md:p-12">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* Product Information Section */}
                <div>
                  <h2 className="text-xl font-semibold mb-6">
                    Product Information
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="product"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product of Interest</FormLabel>
                          <Input
                            value={product.modelName} // what user sees
                            readOnly
                            className="cursor-not-allowed bg-muted"
                            {...field}
                          />
                          {/* Store the actual product ID */}
                          <input type="hidden" value={product.id} {...field} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Contact Details Section */}
                <div>
                  <h2 className="text-xl font-semibold mb-6">
                    Your Contact Details
                  </h2>
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
                            <Input placeholder="e.g. Jane Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                              placeholder="you@company.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Phone Number{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="(123) 456-7890"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Message Section */}

                {/* Privacy Notice */}
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Lock className="w-4 h-4 mt-0.5 text-green-600" />
                  <p>
                    We protect your data. Your information is safe with us and
                    will not be shared.{" "}
                    <a href="/privacy" className="text-primary hover:underline">
                      Read our Privacy Policy.
                    </a>
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-[#163859] hover:bg-[#163859]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Quote Request"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Quote;
