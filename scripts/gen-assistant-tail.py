#!/usr/bin/env python3
from pathlib import Path

cd = "</" + "motionHeader>"
cd = "</" + "motionHeader>"
cd = "</" + "div>"

path = Path(__file__).resolve().parents[1] / "components/floating-shopping-assistant.tsx"
text = path.read_text()
marker = "      {open && (\n        <motionHeader />"
if marker not in text:
    marker = "      {open && (\n        <motionHeader />"
# find broken ending
idx = text.find("      {open && (")
if idx == -1:
    raise SystemExit("marker not found")
head = text[:idx]

tail = f"""      {{open && (
        <div
          className="pointer-events-auto w-[min(100vw-2rem,22rem)] duration-300 animate-in fade-in slide-in-from-bottom-4 zoom-in-95"
          role="dialog"
          aria-label={{`${{ASSISTANT_NAME}}}} shopping assistant`}}
        >
          <div className="overflow-hidden rounded-3xl border border-primary/15 bg-card/95 shadow-2xl shadow-primary/10 backdrop-blur-md">
            <div className="relative flex items-center gap-3 bg-gradient-to-br from-primary via-primary/90 to-accent px-4 py-3.5 text-primary-foreground">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30">
                <NoraAvatar />
              {cd}
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight">{{ASSISTANT_NAME}}</p>
                <p className="text-xs text-primary-foreground/85">Your Nordic shopping buddy</p>
              {cd}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full text-primary-foreground hover:bg-white/20"
                onClick={{() => setOpen(false)}}
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </Button>
            {cd}
            <div ref={{scrollRef}} className="h-72 overflow-y-auto px-3 py-3">
              <motionHeader />
"""

# Still has motionHeader in tail - fix by building rest without it
rest = f"""
            <div ref={{scrollRef}} className="h-72 overflow-y-auto px-3 py-3">
              <div className="flex flex-col gap-3">
                {{messages.map((msg) => (
                  <MessageBubble key={{msg.id}} message={{msg}} />
                ))}}
              {cd}
            {cd}
            <motionHeader />
"""

rest = (
    '            <div ref={scrollRef} className="h-72 overflow-y-auto px-3 py-3">\n'
    '              <div className="flex flex-col gap-3">\n'
    '                {messages.map((msg) => (\n'
    '                  <MessageBubble key={msg.id} message={msg} />\n'
    '                ))}\n'
    f'              {cd}\n'
    f'            {cd}\n'
    '            <motionHeader />\n'
)

rest = (
    '            <motionHeader />\n'
)

# Build tail as list
L = []
a = L.append
a("      {open && (")
a('        <div')
a('          className="pointer-events-auto w-[min(100vw-2rem,22rem)] duration-300 animate-in fade-in slide-in-from-bottom-4 zoom-in-95"')
a('          role="dialog"')
a('          aria-label={`${ASSISTANT_NAME} shopping assistant`}')
a("        >")
a('          <div className="overflow-hidden rounded-3xl border border-primary/15 bg-card/95 shadow-2xl shadow-primary/10 backdrop-blur-md">')
a('            <div className="relative flex items-center gap-3 bg-gradient-to-br from-primary via-primary/90 to-accent px-4 py-3.5 text-primary-foreground">')
a('              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30">')
a("                <NoraAvatar />")
a(f"              {cd}")
a('              <div className="min-w-0 flex-1">')
a('                <p className="font-semibold leading-tight">{ASSISTANT_NAME}</p>')
a('                <p className="text-xs text-primary-foreground/85">Your Nordic shopping buddy</p>')
a(f"              {cd}")
a("              <Button")
a('                type="button"')
a('                variant="ghost"')
a('                size="icon"')
a('                className="h-8 w-8 shrink-0 rounded-full text-primary-foreground hover:bg-white/20"')
a("                onClick={() => setOpen(false)}")
a('                aria-label="Close assistant"')
a("              >")
a('                <X className="h-4 w-4" />')
a("              </Button>")
a(f"            {cd}")
a('            <div ref={scrollRef} className="h-72 overflow-y-auto px-3 py-3">')

# fix last broken line
L[-1] = '              <div className="flex flex-col gap-3">'
L.extend([
    "                {messages.map((msg) => (",
    "                  <MessageBubble key={msg.id} message={msg} />",
    "                ))}",
    f"              {cd}",
    f"            {cd}",
    '            <div className="border-t border-border/60 bg-muted/30 px-3 py-3">',
    '              <div className="mb-2 flex flex-wrap gap-1.5">',
    "                {QUICK_PROMPTS.map((prompt) => (",
    "                  <button",
    '                    key={prompt.query}',
    '                    type="button"',
    '                    onClick={() => sendMessage(prompt.query)}',
    '                    className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"',
    "                  >",
    "                    {prompt.label}",
    "                  </button>",
    "                ))}",
    f"              {cd}",
    '              <form onSubmit={handleSubmit} className="flex gap-2">',
    "                <Input",
    '                  ref={inputRef}',
    '                  value={input}',
    "                  onChange={(e) => setInput(e.target.value)}",
    '                  placeholder="Ask Nora anything..."',
    '                  className="h-9 flex-1 rounded-full border-border/80 bg-card text-sm"',
    "                />",
    "                <Button",
    '                  type="submit"',
    '                  size="icon"',
    '                  className="h-9 w-9 shrink-0 rounded-full bg-primary shadow-md"',
    '                  aria-label="Send message"',
    "                >",
    '                  <Send className="h-4 w-4" />',
    "                </Button>",
    "              </form>",
    f"            {cd}",
    f"          {cd}",
    f"        {cd}",
    "      )}",
    "",
])

fab = [
    "      <Button",
    '        type="button"',
    "        onClick={() => setOpen((v) => !v)}",
    '        className={cn(',
    '          "pointer-events-auto group relative h-14 w-14 rounded-full border-2 border-white/40 bg-gradient-to-br from-primary to-accent p-0 shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",',
    "          open && \"ring-2 ring-accent/50\"",
    "        )}",
    '        aria-label={open ? `Close ${ASSISTANT_NAME}` : "Open shopping assistant"}',
    f'        aria-expanded={{open}}',
    "      >",
    '        <span className="absolute -inset-1 -z-10 animate-ping rounded-full bg-accent/25 opacity-75 group-hover:opacity-100" aria-hidden />',
    '        <NoraAvatar className="text-lg" />',
    "      </Button>",
    "",
    '      {!open && (',
    '        <span className="pointer-events-none hidden rounded-full bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-md ring-1 ring-border sm:block">',
    "          Hi! I'm {ASSISTANT_NAME} ✨",
    "        </span>",
    "      )}",
    f"    {cd}",
    "  );",
    "}",
]

path.write_text(head + "\n".join(L) + "\n" + "\n".join(fab) + "\n")
print("done", len(path.read_text()), "motionHeader" in path.read_text())
