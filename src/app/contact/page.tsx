"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Échec de l'envoi");
      }
      
      toast.success("Message envoyé avec succès !");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="public-page min-h-screen flex flex-col bg-[color:var(--bg-page)]">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-[rgba(15,23,42,0.75)] border-b border-[rgba(31,41,55,0.4)] pt-[env(safe-area-inset-top)]">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[color:var(--accent-soft)] mb-6">
              <Mail className="w-8 h-8 text-[color:var(--accent)]" />
            </div>
            <h1 className="text-3xl font-semibold text-[color:var(--text-primary)] mb-3">
              Contactez-nous
            </h1>
            <p className="text-[color:var(--text-muted)]">
              Une question ? Une suggestion ? N'hésitez pas à nous écrire.
            </p>
          </div>

          {/* Contact Form */}
          <div className="bg-[color:var(--bg-card)] border border-[color:var(--border-subtle)] rounded-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-[color:var(--text-primary)]"
                >
                  Nom complet
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Jean Dupont"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-[color:var(--bg-page)] border-[color:var(--border-subtle)]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-[color:var(--text-primary)]"
                >
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jean.dupont@exemple.fr"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-[color:var(--bg-page)] border-[color:var(--border-subtle)]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="subject"
                  className="text-sm font-medium text-[color:var(--text-primary)]"
                >
                  Sujet
                </label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="Question sur mon compte"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="bg-[color:var(--bg-page)] border-[color:var(--border-subtle)]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="message"
                  className="text-sm font-medium text-[color:var(--text-primary)]"
                >
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Décrivez votre demande..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="bg-[color:var(--bg-page)] border-[color:var(--border-subtle)] resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[color:var(--accent)] hover:bg-[color:var(--accent)]/90 text-white"
              >
                {isSubmitting ? (
                  "Envoi en cours..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer le message
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center text-sm text-[color:var(--text-muted)]">
            <p>
              Nous vous répondrons dans les plus brefs délais.
              <br />
              Temps de réponse habituel : 24-48 heures
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}