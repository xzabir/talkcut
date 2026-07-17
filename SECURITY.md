# Security Policy

## Supported Versions

Only the latest release on the `main` branch receives security updates. Older
commits and branches are not monitored.

## Reporting a Vulnerability

If you discover a security vulnerability in TalkCut, please report it privately
to the maintainers via the GitHub Security Advisory feature or by opening a
confidential issue. Do not disclose vulnerabilities in public issue comments.

We will acknowledge receipt within 72 hours and aim to provide a fix timeline
within one week for critical issues.

## Scope

TalkCut processes all media locally in the browser. Reported issues should be
limited to the application code, build tooling, or documentation. Vulnerabilities
in upstream dependencies (browsers, whisper.cpp, WebCodecs) should be reported to
their respective projects unless TalkCut specifically misuses them.

## Security Design Notes

- No server-side processing is performed by TalkCut.
- Media files are stored in the browser's Origin Private File System (OPFS) and
  never leave the user's machine.
- No telemetry, analytics, or external API keys are included in the build.
