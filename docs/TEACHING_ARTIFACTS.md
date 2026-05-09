# GoAgent Teaching Artifacts

Teaching Artifacts turn an AI teacher reply into a compact, shareable review
object. The renderer displays structured data; the runtime owns validation,
redaction, pruning and static HTML export.

## Phase 1: Structured Runtime Artifact

The teacher agent may call `artifact.createTeachingArtifact` after it has enough
tool evidence. The tool accepts agent JSON artifact data, validates it at runtime,
normalizes candidate ranks, trims oversized arrays, redacts secrets/local paths,
and regenerates the static export HTML from safe structured fields.

`TeacherRunResult.artifact` prefers the validated agent JSON artifact. If the
agent does not create a valid artifact, GoAgent falls back to the runtime-derived
artifact built from KataGo analysis, structured teacher text, knowledge matches
and recommended problems.

No evidence means no artifact. A title and summary alone are not enough.

## Evidence Sources

Artifacts may use:

- KataGo current-position analysis: candidates, winrate, score lead, visits and PV.
- Structured teacher result: key mistakes, training ideas and follow-up intent.
- Vision evidence metadata: whether a board image was attached and validated.
- Local knowledge matches: joseki, life-and-death, tesuji, shape and concept matches.
- Recommended training problems generated from the local knowledge matcher.

Artifacts must not store full base64 board images in session history or reports.
Only metadata and compact teaching facts should be persisted.

## Phase 2: Static HTML Export

`exportHtml` is always produced by GoAgent code, not by injected model HTML. It is
safe, static and self-contained:

- no script tags or event handlers,
- no remote assets,
- no base64 images,
- no local filesystem paths,
- no API keys or bearer tokens,
- escaped text content.

The UI must not inject artifact HTML back into the app with
`dangerouslySetInnerHTML`. Users can copy or export the static HTML as a local
file, but the app should render the structured artifact fields directly.
There are no remote scripts and no remote assets in the static export.

## Phase 3: Sandbox HTML Foundation

Richer sandbox HTML is typed separately as `artifact.sandboxHtml`. It is never
merged into `exportHtml`.

The default script policy is `disabled`: scripts, inline event handlers and
`javascript:` URLs are removed during validation. A future renderer may opt into
`sandbox-iframe-only`, but only inside a sandboxed iframe and only after the same
runtime checks reject remote assets, base64 images, local paths and secrets.

This phase intentionally does not change renderer UI. It only establishes the
type and runtime validation boundary for future interactive artifacts.

## Runtime Contract

`buildTeacherArtifact` creates a fallback artifact from trusted runtime evidence.
`createTeachingArtifact` and `validateTeachingArtifact` accept agent JSON artifact
input and return only a validated artifact. Both paths generate `exportHtml` via
`renderTeacherArtifactHtml` and should pass `validateStaticTeacherArtifactHtml`.

Candidate order is display-normalized: KataGo zero-based `order=0` is rank 1 and
renders as the first choice, never as "第 0 选".
