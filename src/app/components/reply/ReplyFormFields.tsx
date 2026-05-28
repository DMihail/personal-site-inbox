import { useId } from "react";
import { useFormStatus } from "react-dom";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
const MIN_REPLY_LENGTH = 2;

interface ReplyFormFieldsProps {
  apiConfigured: boolean;
}

export function ReplyFormFields({ apiConfigured }: ReplyFormFieldsProps) {
  const bodyId = useId();
  const { pending } = useFormStatus();

  return (
    <div className="space-y-2">
      <Label htmlFor={bodyId} className="text-text-primary">
        Your reply
      </Label>
      <Textarea
        id={bodyId}
        name="reply-body"
        placeholder="Write your reply…"
        disabled={!apiConfigured || pending}
        required
        minLength={MIN_REPLY_LENGTH}
        aria-describedby={`${bodyId}-hint`}
        className="reply-composer min-h-[12rem] resize-none focus-visible:ring-0"
      />
      <p id={`${bodyId}-hint`} className="text-meta text-text-muted">
        Sent via your portfolio contact API.
      </p>
    </div>
  );
}
