import { useId } from "react";
import { Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search messages…",
}: SearchBarProps) {
  const inputId = useId();

  return (
    <search className="relative" role="search">
      <label htmlFor={inputId} className="sr-only">
        Search messages
      </label>
      <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
      <Input
        id={inputId}
        type="search"
        name="message-search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        enterKeyHint="search"
        className="border-glass-border glass ps-10 pe-10 transition-colors focus:border-cyan"
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange("")}
          className="absolute end-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-glass-elevated"
          aria-label="Clear search"
        >
          <X className="h-3 w-3" />
        </Button>
      ) : null}
    </search>
  );
}
