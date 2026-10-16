import type { ComponentProps } from "react";
import type { FieldError as FormError } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TextFieldProps = ComponentProps<typeof Input> & {
  id: string;
  label: string;
  error?: FormError;
  large?: boolean;
};

/** A labelled input with its validation message. Spread react-hook-form's `register(...)` into it. */
export function TextField({ id, label, error, large = false, className, ...input }: TextFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id} className="hud-label">
        {label}
      </FieldLabel>
      <Input
        id={id}
        autoComplete="off"
        aria-invalid={Boolean(error)}
        className={cn(large ? "h-11 bg-background/60 text-base" : "h-9 bg-background/50", className)}
        {...input}
      />
      <FieldError errors={[error]} />
    </Field>
  );
}
