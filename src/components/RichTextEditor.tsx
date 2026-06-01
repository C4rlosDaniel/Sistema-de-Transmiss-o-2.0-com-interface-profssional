import { useEffect, useRef } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Heading2, Link2, Undo, Redo } from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

export function RichTextEditor({ value, onChange, placeholder, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
    ref.current?.focus();
  };

  const Btn = ({ icon: Icon, cmd, arg, title }: { icon: any; cmd: string; arg?: string; title: string }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => exec(cmd, arg)}
      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition"
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  return (
    <div className={`premium-border-inset rounded-xl overflow-hidden bg-card ${className ?? ""}`}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border/60 bg-muted/30 px-2 py-1.5">
        <Btn icon={Bold} cmd="bold" title="Negrito" />
        <Btn icon={Italic} cmd="italic" title="Itálico" />
        <Btn icon={Underline} cmd="underline" title="Sublinhado" />
        <span className="mx-1 h-5 w-px bg-border" />
        <Btn icon={Heading2} cmd="formatBlock" arg="<h2>" title="Título" />
        <Btn icon={List} cmd="insertUnorderedList" title="Lista" />
        <Btn icon={ListOrdered} cmd="insertOrderedList" title="Lista numerada" />
        <button
          type="button"
          title="Link"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const url = window.prompt("URL do link:");
            if (url) exec("createLink", url);
          }}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition"
        >
          <Link2 className="h-4 w-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-border" />
        <Btn icon={Undo} cmd="undo" title="Desfazer" />
        <Btn icon={Redo} cmd="redo" title="Refazer" />
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        data-placeholder={placeholder ?? "Escreva aqui..."}
        className="min-h-[140px] px-4 py-3 text-sm outline-none prose-rte"
      />
    </div>
  );
}