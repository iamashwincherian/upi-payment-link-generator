"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Download } from "lucide-react";
import Image from "next/image";
import { QRCodeCanvas } from "qrcode.react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  upiId: z.string().nonempty(),
  senderName: z.string().optional(),
  message: z.string().optional(),
  amount: z.string().optional(),
});

export default function HomePage() {
  const [link, setLink] = useState<string | null>(null);
  const [qrImgSrc, setQrImgSrc] = useState<string | null>(null);
  const qrRef = useRef<HTMLCanvasElement | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      upiId: "someone@okaxis",
      senderName: "",
      message: "",
      amount: "399",
    },
  });

  useEffect(() => {
    const canvas = qrRef?.current;
    if (canvas) {
      setQrImgSrc(canvas.toDataURL("image/png"));
    }
  }, [link]);

  const downloadQRCode = () => {
    const canvas = qrRef?.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "payment-qr.png";
      link.click();
    }
  };

  const handleReset = () => {
    setLink(null);
    form.reset();
  };

  const toLowerCase = (e: ChangeEvent<HTMLInputElement>) =>
    (e.target.value = e.target.value.toLowerCase());

  const onSubmit = form.handleSubmit((values: z.infer<typeof formSchema>) => {
    const { upiId, senderName, amount } = values;
    setLink(
      `upi://pay?pa=${upiId}&pn=${senderName}&mc=&tid=&tr=&tn=&am=${amount}&cu=INR`
    );
  });

  const copyLink = () => {
    if (link) {
      navigator.clipboard.writeText(link).then(() => {
        alert("Text copied!");
      });
    }
  };

  return (
    <div className="flex flex-col m-4 w-[400px] items-center">
      <p className="text-xl font-bold text-center">
        UPI Payment Link Generator
      </p>
      <div className="mt-4 w-full">
        <Form {...form}>
          <form onSubmit={onSubmit}>
            <FormField
              control={form.control}
              name="upiId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UPI Id</FormLabel>
                  <FormControl>
                    <Input
                      onInput={toLowerCase}
                      placeholder="someone@okaxis"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="senderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sender Name (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What name should be displayed?"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Message (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="What is this payment for?" {...field} />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="How much?"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4">
              <Button
                variant="outline"
                type="reset"
                className="mt-2 w-full"
                onClick={handleReset}
              >
                Clear
              </Button>
              <Button type="submit" className="mt-2 w-full">
                Create
              </Button>
            </div>
          </form>
        </Form>
      </div>
      {link && (
        <Card className="w-full mt-4">
          <CardHeader>
            <div className="flex gap-4 w-full">
              <Button
                variant="outline"
                className="py-2 px-3 w-full"
                onClick={copyLink}
              >
                Copy Link
                <Copy />
              </Button>
              <Button
                variant="outline"
                className="py-2 px-3 w-full"
                onClick={downloadQRCode}
              >
                Download QR
                <Download />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <QRCodeCanvas
              ref={qrRef}
              size={300}
              value={link}
              marginSize={2}
              className="hidden"
            />
            {qrImgSrc && (
              <Image
                className="border rounded"
                height={300}
                width={300}
                src={qrImgSrc}
                alt="QR Code"
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
