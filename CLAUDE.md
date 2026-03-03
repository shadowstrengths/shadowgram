# Shadowgram 프로젝트 기본 지침
# Brand Architecture v4.0 기준 — 모든 작업의 표준

---

## 브랜드 구조 (마스터 → 하위)

| 브랜드 | 역할 | 타겟 |
|--------|------|------|
| **Shadowgram** | 우산 브랜드 (Master Brand) | 전체 |
| **Shadowgram Self** | 1인 개성화 과정 (구 ShiningShadow SOLO) | 개인 B2C |
| **Shadowgram Duo** | 2인 커플·관계 도구 (구 loveTWO) | 커플·부부 B2C |
| **Shadowgram Team** | 조직 심리 다이나믹스 (구 ShiningShadow TEAM) | 기업·조직 B2B |
| **leftnoon** | 커뮤니티 (가칭) | 40대+ |

---

## 금지 브랜드명 (더 이상 사용 안 함)

- ❌ ShiningShadow → ✅ Shadowgram
- ❌ ShiningShadow SOLO → ✅ Shadowgram Self
- ❌ ShiningShadow TEAM → ✅ Shadowgram Team
- ❌ loveTWO → ✅ Shadowgram Duo

---

## 8유형 공식 명칭

| 유형 | 주기능 | MBTI 대응 | 열등기능 |
|------|--------|-----------|----------|
| SPARK | Ne | ENFP, ENTP | Si |
| VISION | Ni | INFJ, INTJ | Se |
| STEADY | Si | ISFJ, ISTJ | Ne |
| PLAYER | Se | ESFP, ESTP | Ni |
| HARMONY | Fe | ESFJ, ENFJ | Ti |
| SOUL | Fi | INFP, ISFP | Te |
| LOGIC | Ti | ISTP, INTP | Fe |
| LEADER | Te | ESTJ, ENTJ | Fi |

- 구명칭(NE, NI, SE, SI, FE, FI, TE, TI)은 내부 코드 전용 — 공개 콘텐츠 사용 금지

---

## 리포트 제작 원칙

1. **CTA 금지** — 리포트 내 구매 링크·업셀 박스 넣지 않음. 정책은 웹페이지에서 관리
2. **MBTI® 표기** — 첫 언급 시 반드시: `* MBTI® is a registered trademark of The Myers & Briggs Foundation. Shadowgram은 독자적 프레임워크로, The Myers & Briggs Foundation과 무관합니다.`
3. **구어체·쉬운 단어** — 심리학 용어는 쉬운 말로 풀어 쓰기
4. **shadowgram.org** — 필요한 위치에만 포함
5. **CTA 없는 클로저** — 리포트 마지막은 저작권 표기로만 끝냄: `shadowgram.org · © 2025 Shadowgram · 구매자 본인만 사용 가능 · 재배포 금지`

---

## Shadowgram Self 콘텐츠 구조

**2단계 구조 (Free / Paid)**

| 단계 | 명칭 | 내용 | 분량 |
|------|------|------|------|
| **Free** | 첫 번째 빛 | 주기능 빛 핵심 소개 + 그림자 첫 인식 맛보기 | 5~8p |
| **Paid** | 빛과 그림자 완전판 | T1+T2+T3+부록A+B+C 전체 통합 | 30p+ |

- Free 내용은 Paid에서 중복 포함하지 않음 (별도 구성)
- 내부 제작 소스는 T1/T2/T3/AppA/AppB/AppC 6파일 유지 (조립 단위)
- 소스 파일 내부 구조 (참고용):
  - T1 Basic — 주기능·열등기능 핵심 축, 빛 7가지, 그림자 7가지, 관계 기상도, Stage1 퀘스트
  - T2 Deep — 그림자 4패턴 심층, 열등기능 보물창고, 성장 단계별, 재무 심층
  - T3 Master — Fluid Self 이론, 원형 진화, 고급 그림자 작업, 90일 퀘스트
  - 부록 A Storm Breaker — 위기·번아웃 긴급 프로토콜
  - 부록 B Climate Changer — 전환기 의사결정 가이드
  - 부록 C Harvest Moon — 황금기 극대화 전략

---

## 언어·시장 우선순위

| 순위 | 언어 | 주요 시장 | 출력 경로 |
|------|------|-----------|-----------|
| **1순위** | 포르투갈어 (PT-BR) | 브라질 | `PT-New/PT/` |
| **2순위** | 스페인어 (ES) | 멕시코 우선 → 콜롬비아·칠레 등 | `PT-New/ES/` |
| **3순위** | 영어 (EN) | 영어권 전반 | `PT-New/EN/` |
| **4순위** | 한국어·일본어 | 한국, 일본 | `PT-New/KR/`, `PT-New/JP/` |
| **5순위** | 기타 언어·문화권 | 추후 결정 | — |

---

## 기술 스펙 (리포트 빌드)

- 빌드 도구: Node.js ESM (`build_*.mjs`) + docx npm 패키지
- 페이지: A4 (11906 × 16838 DXA), 여백 1080 DXA
- 폰트: Apple SD Gothic Neo (한국어), Arial (기타 언어)
- 컬러: DARK=1A2030, GOLD=B8860B, SILVER=8899AA
- 출력 경로: 언어별 위 테이블 참고
- 검증: `python3 .skills/skills/docx/scripts/office/validate.py`

---

## 브랜드 언어 원칙

**쓸 것:** 빛·그림자, 개성화(Individuation), 주기능·열등기능, 통합·온전함, 여정(Journey)

**쓰지 말 것:** 약점·결함·문제, 고치다·치료하다, 완벽한 나, F=감성적·T=냉철한

---

## 현재 작업 현황 (2026-02)

- Brand Architecture v4 ✓ (`Shadowgram_Brand_Architecture_v4.docx`)
- SPARK KR 유료 완전판 ✓ (`PT-New/KR/SPARK_KR_Paid_빛과그림자_v2.docx`)
- SPARK KR Free / Paid 검수용 v4기준 재작성 진행 중
- 나머지 7개 유형 (VISION, STEADY, HARMONY, SOUL, LOGIC, PLAYER, LEADER) KR Free+Paid 제작 예정
- 이후 PT-BR → ES → EN 순으로 언어 확장 예정
