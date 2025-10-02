"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { sendContactEmail } from "@/app/actions/sendContactEmail";
import Button from "./ui/button";
import { Send } from "lucide-react";

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const result = await sendContactEmail(data);

      if (result.success) {
        setSubmitMessage({ type: "success", text: result.message });
        reset();
      } else {
        setSubmitMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setSubmitMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name Field */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-semibold mb-2 text-gray-700"
        >
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          {...register("name", { required: "Name is required" })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapperton-green focus:border-transparent transition-all"
          placeholder="Your full name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold mb-2 text-gray-700"
        >
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Please enter a valid email address",
            },
          })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapperton-green focus:border-transparent transition-all"
          placeholder="your.email@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Phone Field */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-semibold mb-2 text-gray-700"
        >
          Phone (optional)
        </label>
        <input
          id="phone"
          type="tel"
          {...register("phone")}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapperton-green focus:border-transparent transition-all"
          placeholder="Your phone number"
        />
      </div>

      {/* Message Field */}
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-semibold mb-2 text-gray-700"
        >
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          rows={6}
          {...register("message", { required: "Message is required" })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapperton-green focus:border-transparent transition-all resize-vertical"
          placeholder="Tell us how we can help you..."
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
        )}
      </div>

      {/* Submit Message */}
      {submitMessage && (
        <div
          className={`p-4 rounded-lg ${
            submitMessage.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {submitMessage.text}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-center md:justify-start">
        <Button
          type="submit"
          label={isSubmitting ? "Sending..." : "Send Message"}
          icon={Send}
          loading={isSubmitting}
          disabled={isSubmitting}
          buttonStyle="green"
        />
      </div>
    </form>
  );
}
