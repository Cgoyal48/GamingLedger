import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { supabase } from "@/api/supabase";

const schema = z.object({
  email: z.email("Enter an email"),
  password: z.string().min(6, "Use at least 6 characters"),
});

type Form = z.infer<typeof schema>;

export function SignInPage() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "info"; text: string } | null>(null);
  const { register, handleSubmit, trigger, getValues, formState } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function signIn(values: Form) {
    setPending(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      setMessage({ tone: "error", text: error.message });
    }
    setPending(false);
  }

  async function signUp() {
    if (!(await trigger())) {
      return;
    }
    setPending(true);
    setMessage(null);
    const { data, error } = await supabase.auth.signUp(getValues());
    if (error) {
      setMessage({ tone: "error", text: error.message });
    } else if (!data.session) {
      setMessage({ tone: "info", text: "Check your email to confirm the account, then sign in." });
    }
    setPending(false);
  }

  return (
    <main className="grid min-h-svh place-items-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <p className="hud-label text-primary">Save file 01</p>
          <h1 className="mt-2 text-5xl font-bold tracking-tight">
            GAMING<span className="text-primary">/</span>LEDGER
          </h1>
          <p className="mt-3 text-muted-foreground">Every hour you play makes your games cheaper.</p>
        </div>

        <form onSubmit={handleSubmit(signIn)} className="panel flex flex-col gap-4 p-6">
          <Field>
            <FieldLabel htmlFor="email" className="hud-label">
              Email
            </FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className="h-10 bg-background/60"
              aria-invalid={Boolean(formState.errors.email)}
              {...register("email")}
            />
            <FieldError errors={[formState.errors.email]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="password" className="hud-label">
              Password
            </FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              className="h-10 bg-background/60"
              aria-invalid={Boolean(formState.errors.password)}
              {...register("password")}
            />
            <FieldError errors={[formState.errors.password]} />
          </Field>

          {message ? (
            <p
              role={message.tone === "error" ? "alert" : "status"}
              className={message.tone === "error" ? "text-sm text-destructive" : "text-sm text-amber"}
            >
              {message.text}
            </p>
          ) : null}

          <Button type="submit" size="lg" disabled={pending} className="h-11 text-base font-semibold tracking-[0.2em]">
            {pending ? "LOADING…" : "PRESS START"}
          </Button>
          <Button type="button" variant="ghost" disabled={pending} onClick={() => void signUp()}>
            New save file (create account)
          </Button>
        </form>
      </motion.div>
    </main>
  );
}
