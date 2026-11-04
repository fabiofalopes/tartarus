#!/usr/bin/env bash
# Weighted multi-model battery sweep (skill: commandcode-optimal-models).
# Allocation 2026-11-04: half deepseek, quarter glm-5.3-flash, rest by price order.
# Usage: bash eval/multirun.sh [model:n ...]   (defaults below)
set -u
cd "$(dirname "$0")/.."
SMOKE=$(mktemp -d)
PAIRS=(
  "commandcode/deepseek/deepseek-v4.1-flash:12"  # half — 216 runs, off-peak
  "commandcode/z-ai/glm-5.3-flash:6"             # quarter — 108 runs (C2 hang: gated)
  "commandcode/gpt-6-luna:3"                     # rest by price asc
  "commandcode/Qwen/Qwen3.8-Flash:2"
  "commandcode/stepfun/Step-3.5-Flash:2"
  "commandcode/MiniMaxAI/MiniMax-M3:1"
)
[ $# -gt 0 ] && PAIRS=("$@")

# delivery-first doctrine: a model that cannot PONG within 90s is skipped, not swept
gate() {
  timeout 90 tartarus run --format json --model "$1" --dir "$SMOKE" \
    "Reply with exactly one word: PONG" 2>/dev/null | grep -q '"text":"PONG"'
}

total=0
for pair in "${PAIRS[@]}"; do
  m=${pair%:*}; n=${pair#*:}
  echo "════════ $m (n=$n) ════════"
  if ! gate "$m"; then
    echo "GATE FAIL — no PONG in 90s, skipping $m"
    continue
  fi
  echo "gate ok"
  timeout 7200 bun run eval/battery.ts --model "$m" --n "$n" 2>&1 | tail -40
  total=$((total + 1))
done
echo "════════ sweep done: $total models ran ════════"
rm -rf "$SMOKE"
