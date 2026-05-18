#!/usr/bin/env python3
"""Generate floating-shopping-assistant.tsx"""
from pathlib import Path

d = "</" + "motionHeader>"
d = "</" + "div>"

def part(*lines: str) -> str:
    return "\n".join(lines)

return_block = part(
    "  return (",
    '    <div className="pointer-events-none fixed right-4 top-24 z-50 flex flex-col items-end gap-3 sm:right-6 sm:top-28">',
    "      {open && (",
    '        <motionHeader />',
)

return_block = part(
    "  return (",
    '    <motionHeader />',
)

# Build properly
return_lines = [
    "  return (",
    '    <motionHeader />',
]

return_lines = [
    "  return (",
    '    <div className="pointer-events-none fixed right-4 top-24 z-50 flex flex-col items-end gap-3 sm:right-6 sm:top-28">',
    "      {open && (",
    '        <div',
    '          className="pointer-events-auto w-[min(100vw-2rem,22rem)] animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-300"',
    '          role="dialog"',
    f'          aria-label="{{`${{ASSISTANT_NAME}}}} shopping assistant`}}"',
    "        >",
    '          <motionHeader />',
]

# I'll build as one multiline string with d for closing
R = f"""
  return (
    <div className="pointer-events-none fixed right-4 top-24 z-50 flex flex-col items-end gap-3 sm:right-6 sm:top-28">
      {{open && (
        <div
          className="pointer-events-auto w-[min(100vw-2rem,22rem)] animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-300"
          role="dialog"
          aria-label={{`${{ASSISTANT_NAME}}}} shopping assistant`}}
        >
          <motionHeader />
"""

# Simpler: read template from heredoc in triple quotes without typo
template = r"""
  return (
    <div className="pointer-events-none fixed right-4 top-24 z-50 flex flex-col items-end gap-3 sm:right-6 sm:top-28">
      {open && (
        <div
          className="pointer-events-auto w-[min(100vw-2rem,22rem)] animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-300"
          role="dialog"
          aria-label={`${ASSISTANT_NAME} shopping assistant`}
        >
          <div className="overflow-hidden rounded-3xl border border-primary/15 bg-card/95 shadow-2xl shadow-primary/10 backdrop-blur-md">
            <div className="relative flex items-center gap-3 bg-gradient-to-br from-primary via-primary/90 to-accent px-4 py-3.5 text-primary-foreground">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30">
                <NoraAvatar />
              </motionHeader>
"""

template = template.replace("</motionHeader>", d)

print("ERROR in template still has typo", "motionHeader" in template)
