---
phase: "07"
phase_slug: "扩展功能"
status: "draft"
nyquist_compliant: true
wave_0_complete: false
created: "2026-05-08"
---

# Phase 7: 扩展功能 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Maven compile + integration test |
| **Config file** | none — Wave 0 verifies build |
| **Quick run command** | `mvn compile -f zlt-business/mall-center/pom.xml` |
| **Full suite command** | `mvn compile test -f zlt-business/mall-center/pom.xml` |
| **Estimated runtime** | ~120 seconds |

---

## Sampling Rate

- **After every task commit:** Run `mvn compile -f zlt-business/mall-center/pom.xml`
- **After every plan wave:** Run full compile
- **Before `/gsd-verify-work`:** Full compile must pass
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 07-01 | 1 | ADVANCED-02 | T-07-01 | Lua script timeout protection | build | `mvn compile -f zlt-business/mall-center/pom.xml` | ✅ W0 | ⬜ pending |
| 07-02-01 | 07-02 | 1 | ADVANCED-03 | T-07-03 | Manual review before activation | build | `mvn compile -f zlt-business/mall-center/pom.xml` | ✅ W0 | ⬜ pending |
| 07-02-02 | 07-02 | 1 | ADVANCED-03 | T-07-04 | Tenant ID spoofing protection | build | `mvn compile -f zlt-business/mall-center/pom.xml` | ✅ W0 | ⬜ pending |
| 07-02-03 | 07-02 | 1 | ADVANCED-03 | — | N/A | build | `mvn compile -f zlt-business/mall-center/pom.xml` | ✅ W0 | ⬜ pending |
| 07-03-01 | 07-03 | 1 | ADVANCED-04 | T-07-05 | Rate limit per user | build | `mvn compile -f zlt-business/mall-center/pom.xml` | ✅ W0 | ⬜ pending |
| 07-03-02 | 07-03 | 1 | ADVANCED-04 | T-07-06 | HTTPS token transmission | build | `mvn compile -f zlt-business/mall-center/pom.xml` | ✅ W0 | ⬜ pending |
| 07-03-03 | 07-03 | 1 | ADVANCED-04 | T-07-07 | Graceful degradation | build | `mvn compile -f zlt-business/mall-center/pom.xml` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] All 3 plans have valid frontmatter (wave, depends_on, files_modified, autonomous)
- [ ] All tasks have `<acceptance_criteria>` with grep-verifiable conditions
- [ ] All tasks have `<read_first>` pointing to files being modified
- [ ] `mvn compile -f zlt-business/mall-center/pom.xml` passes after all tasks

*If none: "Build infrastructure already verified in Phase 1."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Redis Lua script atomicity | ADVANCED-02 | Requires Redis instance with stock data | 1. Set stock to 5 for SKU 100 2. Call preAllocateStock with quantity 3 3. Verify stock becomes 2 atomically (single Lua script) |
| Multi-tenant isolation | ADVANCED-03 | Requires admin UI + two merchant tenants | 1. Create merchant A (tenant A), approve 2. Create merchant B (tenant B), approve 3. Switch x-tenant-header to A 4. Query mall_goods — only A's goods visible |
| WeChat message delivery | ADVANCED-04 | Requires real WeChat account + openid | 1. Configure wechat.template.* in application.yml 2. Place order with real openid 3. Complete payment 4. Verify WeChat message received |
| Merchant review flow | ADVANCED-03 | End-to-end workflow | 1. Register merchant → status=0 (pending) 2. Admin approves → status=1, tenantId assigned 3. Admin rejects → status=2, rejectReason set |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending