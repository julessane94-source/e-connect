"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { MessageCircle, Send, Sparkles, X, Loader2 } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const welcomeMessage: Message = {
  role: "assistant",
  content: "Bonjour ! Je peux vous orienter dans les services de la mairie, les pièces à fournir et le suivi de vos demandes. Que souhaitez-vous savoir ?",
};

export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (open) messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = async () => {
    const content = draft.trim();
    if (!content || sending) return;
    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setDraft("");
    setNotice("");
    setSending(true);
    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-10) }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Je n’ai pas pu répondre. Réessayez dans un instant.");
      setMessages((current) => [...current, { role: "assistant", content: payload.answer || "Je n’ai pas trouvé de réponse." }]);
      if (payload.aiAvailable === false) {
        setNotice("Réponses basées sur les informations configurées par la mairie ; l’IA n’est pas activée sur cette instance.");
      }
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", content: error instanceof Error ? error.message : "Le service de chat est momentanément indisponible." }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void send();
  };

  return (
    <div className="fixed bottom-5 right-4 z-[80] sm:bottom-6 sm:right-6">
      {open && (
        <section aria-label="Assistant IA de la mairie" className="mb-3 flex h-[min(620px,calc(100dvh-7rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl sm:w-[390px] dark:border-slate-700 dark:bg-slate-950">
          <header className="flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-700 to-teal-600 px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/15 p-2"><Sparkles className="h-5 w-5" /></div>
              <div><h2 className="font-semibold">Assistant de la mairie</h2><p className="text-xs text-emerald-50">Services, démarches et suivi</p></div>
            </div>
            <button type="button" aria-label="Fermer l’assistant" onClick={() => setOpen(false)} className="rounded-lg p-2 transition hover:bg-white/15"><X className="h-5 w-5" /></button>
          </header>

          <div aria-live="polite" className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-900/60">
            {messages.map((message, index) => (
              <div key={`${index}-${message.role}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${message.role === "user" ? "rounded-br-md bg-emerald-700 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"}`}>
                  {message.content.split(/(\/nos-services|\/demandes\/nouvelle|\/demandes\/suivi)/g).map((part, partIndex) => ["/nos-services", "/demandes/nouvelle", "/demandes/suivi"].includes(part)
                    ? <a key={partIndex} href={part} className="font-semibold underline underline-offset-2">{part === "/nos-services" ? "Nos services" : part === "/demandes/nouvelle" ? "Nouvelle demande" : "Suivi citoyen"}</a>
                    : part)}
                </div>
              </div>
            ))}
            {sending && <div className="flex justify-start"><div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800"><Loader2 className="h-4 w-4 animate-spin" />Je prépare une réponse…</div></div>}
            <div ref={messageEndRef} />
          </div>

          <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
            {notice && <p className="mb-2 rounded-lg bg-amber-50 px-2.5 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">{notice}</p>}
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <textarea ref={inputRef} rows={1} maxLength={1200} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={handleKeyDown} placeholder="Écrivez votre question…" aria-label="Votre question" className="max-h-28 min-h-11 flex-1 resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-emerald-950" />
              <button type="submit" disabled={sending || !draft.trim()} aria-label="Envoyer la question" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" /></button>
            </form>
            <p className="mt-2 text-center text-[11px] text-slate-400">Ne partagez pas de données sensibles. Entrée pour envoyer · Maj+Entrée pour aller à la ligne.</p>
          </div>
        </section>
      )}

      <button type="button" aria-label={open ? "Fermer le chatbot" : "Ouvrir le chatbot de la mairie"} aria-expanded={open} onClick={() => setOpen((current) => !current)} className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700 text-white shadow-xl ring-4 ring-white transition hover:scale-105 hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:ring-slate-950">
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-lime-400 dark:border-slate-950" />}
      </button>
    </div>
  );
}

