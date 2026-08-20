import fs from "fs/promises"
import { xdgData, xdgCache, xdgConfig, xdgState } from "xdg-basedir"
import path from "path"
import os from "os"
import { Filesystem } from "../util/filesystem"

// TARTARUS pantheon — embedded at compile time, seeded on first run
import g0dm0d3Agent from "../seed/agents/g0dm0d3.md" with { type: "text" }
import typhonAgent from "../seed/agents/typhon.md" with { type: "text" }
import nyxAgent from "../seed/agents/nyx.md" with { type: "text" }
import erisAgent from "../seed/agents/eris.md" with { type: "text" }
import azazelAgent from "../seed/agents/azazel.md" with { type: "text" }
import parseltongueAgent from "../seed/agents/parseltongue.md" with { type: "text" }
import godmodeCommand from "../seed/commands/godmode.md" with { type: "text" }

const SEED_AGENTS: Record<string, string> = {
  "g0dm0d3.md": g0dm0d3Agent,
  "typhon.md": typhonAgent,
  "nyx.md": nyxAgent,
  "eris.md": erisAgent,
  "azazel.md": azazelAgent,
  "parseltongue.md": parseltongueAgent,
}

const app = "tartarus"

const data = path.join(xdgData!, app)
const cache = path.join(xdgCache!, app)
const config = path.join(xdgConfig!, app)
const state = path.join(xdgState!, app)

export namespace Global {
  export const Path = {
    // Allow override via OPENCODE_TEST_HOME for test isolation
    get home() {
      return process.env.OPENCODE_TEST_HOME || os.homedir()
    },
    data,
    bin: path.join(cache, "bin"),
    log: path.join(data, "log"),
    cache,
    config,
    state,
  }
}

await Promise.all([
  fs.mkdir(Global.Path.data, { recursive: true }),
  fs.mkdir(Global.Path.config, { recursive: true }),
  fs.mkdir(Global.Path.state, { recursive: true }),
  fs.mkdir(Global.Path.log, { recursive: true }),
  fs.mkdir(Global.Path.bin, { recursive: true }),
  fs.mkdir(path.join(Global.Path.config, "agents"), { recursive: true }),
  fs.mkdir(path.join(Global.Path.config, "commands"), { recursive: true }),
])

await Promise.all(
  Object.entries(SEED_AGENTS).map(async ([name, content]) => {
    const filepath = path.join(Global.Path.config, "agents", name)
    try {
      await fs.access(filepath)
    } catch {
      await fs.writeFile(filepath, content, "utf-8")
    }
  }),
)

{
  const cmdPath = path.join(Global.Path.config, "commands", "godmode.md")
  try {
    await fs.access(cmdPath)
  } catch {
    await fs.writeFile(cmdPath, godmodeCommand, "utf-8")
  }
}

const CACHE_VERSION = "21"

const version = await Filesystem.readText(path.join(Global.Path.cache, "version")).catch(() => "0")

if (version !== CACHE_VERSION) {
  try {
    const contents = await fs.readdir(Global.Path.cache)
    await Promise.all(
      contents.map((item) =>
        fs.rm(path.join(Global.Path.cache, item), {
          recursive: true,
          force: true,
        }),
      ),
    )
  } catch (e) {}
  await Filesystem.write(path.join(Global.Path.cache, "version"), CACHE_VERSION)
}
