import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";

interface FormSubmitButtonProps extends Omit<ComponentProps<typeof Button>, "type"> {
  pendingLabel: string;
  children: React.ReactNode;
}

/** Submit button wired to React 19 `useFormStatus` — must render inside a `<form action={…}>`. */
export function FormSubmitButton({
  pendingLabel,
  children,
  disabled,
  className,
  ...props
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
      className={className}
      {...props}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
