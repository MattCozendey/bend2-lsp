# Bend 2 language server

`bend2-lsp` provides formatting, live compiler diagnostics, and Markdown hover
information for Bend 2 over LSP stdio. Node.js 26 or newer is required.

```sh
npm install -g bend2-lsp
bend2-lsp --stdio
```

To build from source, run `npm ci && npm test`.

The server accepts the `bend` and `bend2` language IDs. It uses full-document
sync, publishes diagnostics on open and 250 ms after edits, and rechecks open
documents that import a changed buffer. Open buffers override files on disk.
Compiler analysis is limited to `file:` documents; untitled documents still
receive formatting, lexical diagnostics, and syntax hover.

Analysis uses the bundled Bend compiler and Base library in a worker thread.
Relative imports resolve from the document, then from open overlays. Hash
package imports use `BEND_LIB`; missing packages may be downloaded from
`BEND_HUB`, checked by the compiler, and cached in the normal package layout.
Downloads time out after 10 seconds.

The formatter preserves line breaks, blank lines, comments, literal spelling,
line endings, and final-newline state. It normalizes indentation and safe token
spacing without wrapping code.

## Editor setup

VS Code:

Install the [Bend 2 extension](https://marketplace.visualstudio.com/items?itemName=kbrianps.bend2) (`kbrianps.bend2`, also on [Open VSX](https://open-vsx.org/extension/kbrianps/bend2)), which bundles `bend2-lsp` and provides syntax highlighting, live diagnostics, hover, and formatting out of the box.

To point the extension at a custom or local server build, set `bend.server.path` in `settings.json`:

```json
{
  "bend.server.path": "bend2-lsp"
}
```

Neovim with `nvim-lspconfig`:

```lua
vim.api.nvim_create_autocmd("FileType", {
  pattern = "bend",
  callback = function()
    vim.lsp.start({
      name = "bend2-lsp",
      cmd = { "bend2-lsp", "--stdio" },
      root_dir = vim.fs.root(0, { ".git" }),
    })
  end,
})
```

Helix (`languages.toml`):

```toml
[language-server.bend2-lsp]
command = "bend2-lsp"
args = ["--stdio"]

[[language]]
name = "bend"
scope = "source.bend"
file-types = ["bend"]
language-servers = ["bend2-lsp"]
auto-format = true
```

Emacs with Eglot:

```elisp
(add-to-list 'eglot-server-programs
             '(bend-mode . ("bend2-lsp" "--stdio")))
```

Local-variable type hover is intentionally out of scope because it would
require instrumentation in the trusted checker. Unknown names and inferred
locals therefore return no hover.

## Compiler source

`vendor/bend2/bend.ts` and `vendor/bend2/base.bend` are unmodified copies from
[`don2e4/bend` commit `bacc663`](https://github.com/don2e4/bend/commit/bacc663b4897e210be43768ca5a73fcbbc6c06dd).
They are bundled into the npm package so installation does not require a Bend
checkout. The compiler and this language server are licensed under Apache 2.0;
see `LICENSE`. Update both vendored files together from a pinned Bend commit,
then run `npm test` and inspect `npm pack --dry-run` before releasing.
