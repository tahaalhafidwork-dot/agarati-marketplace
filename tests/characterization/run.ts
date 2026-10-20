import { runAllCharacterization } from "./contracts"

async function main() {
  const errors = await runAllCharacterization()
  if (errors.length) {
    console.error("Characterization FAILED:")
    for (const e of errors) console.error(" -", e)
    process.exit(1)
  }
  console.log("Characterization OK (", 0, "failures)")
}

void main()
