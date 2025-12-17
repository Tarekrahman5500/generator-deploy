import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import ContactTableSkeleton from "@/components/Skeleton/ContactFormSkeleton";
const ContactForm = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/contact-form`);
        const json = await res.json();
        setData(json.allContactForms.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load data", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-2">Contact Form Submissions</h1>
        <p className="text-gray-600 mb-6">
          View and manage all customer inquiries from the contact form.
        </p>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100 rounded-2xl">
                  <TableHead className="rounded-tl-xl">Full Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telephone</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead className="rounded-tr-xl">Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <ContactTableSkeleton />
                ) : (
                  data.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-semibold">
                        {row.fullName}
                      </TableCell>
                      <TableCell>{row.company}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.telephone}</TableCell>
                      <TableCell>{row.country}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {row.message}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactForm;
