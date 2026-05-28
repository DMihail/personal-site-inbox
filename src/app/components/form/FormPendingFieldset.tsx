import { useFormStatus } from "react-dom";
import { cn } from "../ui/utils";

interface FormPendingFieldsetProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Layout wrapper for form fields. Does not use `<fieldset disabled>` so browser
 * disabled styles do not wash out custom inputs (e.g. `.auth-input`).
 */
export function FormPendingFieldset({ children, className }: FormPendingFieldsetProps) {
  const { pending } = useFormStatus();

  return (
    <div
      className={cn("min-w-0 w-full", className)}
      aria-busy={pending || undefined}
      data-form-pending={pending ? "" : undefined}
    >
      {children}
    </div>
  );
}
