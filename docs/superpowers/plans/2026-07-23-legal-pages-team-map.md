# Legal Pages, Team Section & Contact Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bilingual Privacy Policy page and Terms of Service page (wired to the existing dead Footer links), a founders/team section on the Nosotros page, and a Google Maps embed on the Contact page pinning the company's real legal address.

**Architecture:** Four additive, static-content features layered onto the existing i18n system (`src/i18n/ui.ts`, `src/i18n/utils.ts`) and component patterns (`src/components/pages/*Page.astro` + mirrored `/en/**` routes). No new dependencies — the map is a plain `<iframe>` embed (Google's no-API-key embed URL), not the Maps JavaScript SDK.

**Tech Stack:** Astro 7 (`.astro` components, TS frontmatter), existing `src/i18n/*` helpers. No new dependencies.

## Global Constraints

- No new dependencies. The Google Maps embed uses a plain `<iframe src="https://maps.google.com/maps?q=...&output=embed">` — this requires no API key and no billing account, unlike the Maps JavaScript API. Do not add `@googlemaps/*` or any other package.
- No test runner exists in this project (`package.json` has only the `astro` CLI). Verification for every task is `pnpm build` + Grep/`Select-String` checks against the build output — no TDD steps.
- This is a git repository now; commit at the end of each task (`git add -A && git commit`), matching the established workflow from the previous `i18n-followups` plan.
- Design tokens live in `src/styles/global.css` — reuse existing CSS custom properties (`--sx-space-*`, `--fs-*`, `--sx-electric-blue`, `--sx-tech-cyan`, `--sx-gradient-cyan`, `--sx-radius-*`). Do not hardcode new colors or spacing values.
- Follow the existing i18n patterns exactly: `Lang = 'es' | 'en'`, `defaultLang = 'es'`, translation keys added to **both** the `es` and `en` blocks of `src/i18n/ui.ts` (same key set in both — `UiKey` is derived from the `es` block's keys, so a mismatch is a type error), page copy always through `t('key')`.
- Route slugs stay **identical** (untranslated) between the ES root and the `/en` mirror, per the site's existing convention (e.g. `/servicios` ↔ `/en/servicios`, not `/en/services`). The new legal pages must be `/privacidad` ↔ `/en/privacidad` and `/terminos` ↔ `/en/terminos`.
- Each page route file (`src/pages/**/index.astro`) only ever passes a `lang` prop to its matching `src/components/pages/*Page.astro` component — it must not duplicate content arrays or markup. This matches the existing pattern in `NosotrosPage.astro` (its `steps`/`faqs` arrays are defined once inside the Page component, not in the route files).
- **Legal facts to use verbatim** (from the company's real incorporation and privacy-compliance documents, already reviewed for this plan): razón social **Synthetix AI S.A.S.**, **NIT 902069229-9**, domicilio **Manizales, Colombia**, objeto social = desarrollo de sistemas informáticos e inteligencia artificial aplicada, consultoría en tecnologías de información. Legal framework: **Ley Estatutaria 1581 de 2012** and its **Decreto Reglamentario 1377 de 2013**.
- **Legal contact email and phone:** the Privacy Policy and Terms of Service pages must use `contact@synthetixaisas.com` and phone `3148067436` (the company's real, current contact channels for exercising data-protection rights — per explicit user instruction, these supersede the different email/phone found in the source PDF) — **not** the placeholder `hello@synthetix.ai` used elsewhere on the site (that's a separate, already-tracked placeholder-domain issue, out of scope here). Do not "fix" `hello@synthetix.ai` anywhere else in this plan.
- **Never include, anywhere in these pages:** the founders' national ID numbers (cédulas), the capital/share structure, or any other content from the private incorporation deed beyond the company-level facts listed above. The only founder-related public content in this plan is the team section in Task 3, which shows **only full names and a single generic title** — no ID numbers, no equity data, no biographies, no social links (matching the reference layout the user pointed to).
- The address used for the Contact page's map pin and displayed "Oficina"/"Office" text is the company's real legal domicile: **Cra 21B # 55-25, Manizales, Caldas, Colombia** — this replaces the current placeholder text "Medellín, Antioquia, Colombia" in `contact.office.value` (both `es` and `en` blocks of `src/i18n/ui.ts`).

---

### Task 1: Bilingual Privacy Policy page

**Files:**
- Modify: `src/i18n/ui.ts`
- Create: `src/components/pages/PrivacidadPage.astro`
- Create: `src/pages/privacidad/index.astro`
- Create: `src/pages/en/privacidad/index.astro`
- Modify: `src/components/Footer.astro`

**Interfaces:**
- Consumes: `useTranslations`, `type Lang`, `type UiKey` from `src/i18n/utils.ts` (unchanged); `localizePath` from `src/i18n/utils.ts` (unchanged); `Layout` from `src/layouts/Layout.astro` (unchanged).
- Produces: route `/privacidad` (ES) and `/en/privacidad` (EN). Task 2 does not depend on this task's output, but both tasks touch `Footer.astro` — if executed by different subagents, whichever runs second must not clobber the other's edit to that file (each touches a different one of the two `href="#"` links).

- [ ] **Step 1: Add the Privacy Policy translation keys to the `es` block of `src/i18n/ui.ts`**

Find this line (the last line of the `es` block, right before the closing `},` that ends the `es` object):

```ts
    // ---- 404 ----
    '404.eyebrow': 'Error 404',
    '404.title': 'Página no encontrada',
    '404.lead': 'La página que buscas no existe o fue movida.',
    '404.cta': 'Volver al inicio',
  },
```

Replace it with (adds a new `Legal: Privacidad` block before the closing brace):

```ts
    // ---- 404 ----
    '404.eyebrow': 'Error 404',
    '404.title': 'Página no encontrada',
    '404.lead': 'La página que buscas no existe o fue movida.',
    '404.cta': 'Volver al inicio',

    // ---- Legal: Privacidad ----
    'legal.privacy.meta.title': 'Política de Privacidad',
    'legal.privacy.eyebrow': 'Legal',
    'legal.privacy.title': 'Política de Privacidad',
    'legal.privacy.updated': 'Última actualización: 23 de julio de 2026',
    'legal.privacy.intro': 'En Synthetix AI S.A.S. ("Synthetix AI", "nosotros"), identificada con NIT 902069229-9 y domicilio en Manizales, Colombia, damos cumplimiento a la Ley Estatutaria 1581 de 2012 y su Decreto Reglamentario 1377 de 2013 sobre protección de datos personales.',
    'legal.privacy.s1.title': '1. Responsable del tratamiento',
    'legal.privacy.s1.body': 'Synthetix AI S.A.S., NIT 902069229-9, con domicilio en Manizales, Colombia. Correo de contacto: contact@synthetixaisas.com. Teléfono: 3148067436.',
    'legal.privacy.s2.title': '2. Datos que recolectamos',
    'legal.privacy.s2.body': 'A través del formulario de contacto de este sitio recolectamos: nombre completo, correo electrónico, nombre de empresa (opcional) y el contenido del mensaje que usted decida compartir sobre su proyecto. No recolectamos datos de geolocalización ni categorías de datos sensibles.',
    'legal.privacy.s3.title': '3. Finalidad del tratamiento',
    'legal.privacy.s3.body': 'Los datos que usted nos proporciona se utilizan exclusivamente para responder a su solicitud de contacto, evaluar y dar seguimiento a una eventual relación comercial, y mantener comunicación relacionada con los servicios que solicite. No compartimos ni cedemos sus datos a terceros, salvo autorización expresa suya o requerimiento legal.',
    'legal.privacy.s4.title': '4. Derechos del titular',
    'legal.privacy.s4.body': 'Como titular de los datos personales, usted tiene derecho a conocer, actualizar y rectificar su información; solicitar prueba de la autorización otorgada; ser informado sobre el uso dado a sus datos; presentar quejas ante la Superintendencia de Industria y Comercio; y revocar su autorización o solicitar la supresión de sus datos en cualquier momento, salvo que exista un deber legal o contractual que lo impida.',
    'legal.privacy.s5.title': '5. Seguridad de la información',
    'legal.privacy.s5.body': 'Synthetix AI S.A.S. cuenta con medidas técnicas, humanas y administrativas para proteger sus datos personales frente a pérdida, alteración, uso o acceso no autorizado.',
    'legal.privacy.s6.title': '6. Vigencia y modificaciones',
    'legal.privacy.s6.body': 'Esta política podrá ser modificada en cualquier momento; cualquier cambio será publicado en esta misma página. Los datos se conservarán únicamente durante el tiempo necesario para cumplir con la finalidad descrita, salvo que exista una obligación legal de conservación mayor.',
    'legal.privacy.s7.title': '7. Contacto para ejercer sus derechos',
    'legal.privacy.s7.body': 'Para ejercer sus derechos de acceso, rectificación, actualización o supresión de datos personales, escríbanos a contact@synthetixaisas.com.',
  },
```

- [ ] **Step 2: Add the matching keys to the `en` block of `src/i18n/ui.ts`**

Find this line (the last line of the `en` block, right before the closing `},` `} as const;` that ends the whole `ui` object):

```ts
    // ---- 404 ----
    '404.eyebrow': '404 Error',
    '404.title': 'Page not found',
    '404.lead': "The page you're looking for doesn't exist or has moved.",
    '404.cta': 'Back to home',
  },
} as const;
```

Replace it with:

```ts
    // ---- 404 ----
    '404.eyebrow': '404 Error',
    '404.title': 'Page not found',
    '404.lead': "The page you're looking for doesn't exist or has moved.",
    '404.cta': 'Back to home',

    // ---- Legal: Privacy ----
    'legal.privacy.meta.title': 'Privacy Policy',
    'legal.privacy.eyebrow': 'Legal',
    'legal.privacy.title': 'Privacy Policy',
    'legal.privacy.updated': 'Last updated: July 23, 2026',
    'legal.privacy.intro': 'At Synthetix AI S.A.S. ("Synthetix AI", "we"), tax ID (NIT) 902069229-9, domiciled in Manizales, Colombia, we comply with Colombian Statutory Law 1581 of 2012 and its regulatory Decree 1377 of 2013 on personal data protection.',
    'legal.privacy.s1.title': '1. Data controller',
    'legal.privacy.s1.body': 'Synthetix AI S.A.S., NIT 902069229-9, domiciled in Manizales, Colombia. Contact email: contact@synthetixaisas.com. Phone: 3148067436.',
    'legal.privacy.s2.title': '2. Data we collect',
    'legal.privacy.s2.body': "Through this site's contact form we collect: full name, email address, company name (optional), and the content of any message you choose to share about your project. We do not collect geolocation data or sensitive data categories.",
    'legal.privacy.s3.title': '3. Purpose of processing',
    'legal.privacy.s3.body': 'The data you provide is used exclusively to respond to your contact request, evaluate and follow up on a potential business relationship, and maintain communication related to the services you request. We do not share or transfer your data to third parties, except with your express authorization or as required by law.',
    'legal.privacy.s4.title': '4. Your rights',
    'legal.privacy.s4.body': "As a data subject, you have the right to know, update, and correct your information; request proof of the authorization granted; be informed about how your data has been used; file complaints with Colombia's Superintendency of Industry and Commerce (SIC); and revoke your authorization or request deletion of your data at any time, unless a legal or contractual duty prevents it.",
    'legal.privacy.s5.title': '5. Data security',
    'legal.privacy.s5.body': 'Synthetix AI S.A.S. maintains technical, human, and administrative measures to protect your personal data against loss, alteration, unauthorized use, or access.',
    'legal.privacy.s6.title': '6. Term and changes',
    'legal.privacy.s6.body': 'This policy may be updated at any time; any change will be published on this same page. Data is retained only for as long as necessary to fulfill the purpose described above, unless a longer legal retention duty applies.',
    'legal.privacy.s7.title': '7. Exercising your rights',
    'legal.privacy.s7.body': 'To exercise your rights of access, correction, update, or deletion of personal data, write to us at contact@synthetixaisas.com.',
  },
} as const;
```

- [ ] **Step 3: Create `src/components/pages/PrivacidadPage.astro`**

```astro
---
import Layout from '../../layouts/Layout.astro';
import { useTranslations, type Lang, type UiKey } from '../../i18n/utils';

interface Props {
  lang: Lang;
}
const { lang } = Astro.props;
const t = useTranslations(lang);

const sections: { title: UiKey; body: UiKey }[] = [
  { title: 'legal.privacy.s1.title', body: 'legal.privacy.s1.body' },
  { title: 'legal.privacy.s2.title', body: 'legal.privacy.s2.body' },
  { title: 'legal.privacy.s3.title', body: 'legal.privacy.s3.body' },
  { title: 'legal.privacy.s4.title', body: 'legal.privacy.s4.body' },
  { title: 'legal.privacy.s5.title', body: 'legal.privacy.s5.body' },
  { title: 'legal.privacy.s6.title', body: 'legal.privacy.s6.body' },
  { title: 'legal.privacy.s7.title', body: 'legal.privacy.s7.body' },
];
---
<Layout title={t('legal.privacy.meta.title')} lang={lang}>
  <section>
    <div class="container legal-doc">
      <span class="eyebrow">{t('legal.privacy.eyebrow')}</span>
      <h1>{t('legal.privacy.title')}</h1>
      <p class="legal-updated">{t('legal.privacy.updated')}</p>
      <p class="legal-intro">{t('legal.privacy.intro')}</p>
      {sections.map((s) => (
        <div class="legal-section">
          <h2>{t(s.title)}</h2>
          <p>{t(s.body)}</p>
        </div>
      ))}
    </div>
  </section>
</Layout>

<style>
  .legal-doc { max-width: 720px; padding: var(--sx-space-24) 0; }
  .legal-updated { color: var(--sx-slate-500); font-size: var(--fs-sm); margin-bottom: var(--sx-space-6); }
  .legal-intro { font-size: 18px; margin-bottom: var(--sx-space-8); }
  .legal-section { margin-top: var(--sx-space-8); }
  .legal-section h2 { font-size: var(--fs-h2); margin-bottom: var(--sx-space-3); }
</style>
```

- [ ] **Step 4: Create `src/pages/privacidad/index.astro`**

```astro
---
import PrivacidadPage from '../../components/pages/PrivacidadPage.astro';
---
<PrivacidadPage lang="es" />
```

- [ ] **Step 5: Create `src/pages/en/privacidad/index.astro`**

```astro
---
import PrivacidadPage from '../../../components/pages/PrivacidadPage.astro';
---
<PrivacidadPage lang="en" />
```

- [ ] **Step 6: Wire the Footer's "Política de Privacidad" link**

In `src/components/Footer.astro`, replace:

```astro
    <div class="sx-footer__legal-links">
      <a href="#">{t('footer.privacy')}</a>
      <a href="#">{t('footer.terms')}</a>
    </div>
```

with:

```astro
    <div class="sx-footer__legal-links">
      <a href={localizePath('/privacidad', lang)}>{t('footer.privacy')}</a>
      <a href="#">{t('footer.terms')}</a>
    </div>
```

(The second link stays `href="#"` — Task 2 wires it to `/terminos` once that page exists. `localizePath` is already imported in this file's frontmatter, unchanged.)

- [ ] **Step 7: Build and verify**

Run: `pnpm build`
Expected: `17 page(s) built` (15 existing + `/privacidad/index.html` + `/en/privacidad/index.html`) with no errors.

- [ ] **Step 8: Manual verification**

Using Grep (or `Select-String`), confirm:
- `dist/privacidad/index.html` contains `Política de Privacidad`, `NIT 902069229-9`, `contact@synthetixaisas.com`, and `3148067436`, and does **not** contain `LEGALAPP` or any mention of geolocation.
- `dist/en/privacidad/index.html` contains `Privacy Policy` and the same NIT/email facts, in English.
- Neither file contains any cédula number or capital/share figures from the incorporation document.
- `dist/index.html`'s footer now links to `/privacidad` (not `href="#"`) for the privacy link.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add bilingual Privacy Policy page, wire Footer link"
```

---

### Task 2: Bilingual Terms of Service page

**Files:**
- Modify: `src/i18n/ui.ts`
- Create: `src/components/pages/TerminosPage.astro`
- Create: `src/pages/terminos/index.astro`
- Create: `src/pages/en/terminos/index.astro`
- Modify: `src/components/Footer.astro`

**Interfaces:**
- Consumes: same as Task 1 (`useTranslations`, `type Lang`, `type UiKey`, `Layout`, `localizePath`).
- Produces: route `/terminos` (ES) and `/en/terminos` (EN).

- [ ] **Step 1: Add the Terms of Service translation keys to the `es` block of `src/i18n/ui.ts`**

Find (this is the end of the `es` block, now including Task 1's addition):

```ts
    'legal.privacy.s7.title': '7. Contacto para ejercer sus derechos',
    'legal.privacy.s7.body': 'Para ejercer sus derechos de acceso, rectificación, actualización o supresión de datos personales, escríbanos a contact@synthetixaisas.com.',
  },
```

Replace with:

```ts
    'legal.privacy.s7.title': '7. Contacto para ejercer sus derechos',
    'legal.privacy.s7.body': 'Para ejercer sus derechos de acceso, rectificación, actualización o supresión de datos personales, escríbanos a contact@synthetixaisas.com.',

    // ---- Legal: Términos ----
    'legal.terms.meta.title': 'Términos de Servicio',
    'legal.terms.eyebrow': 'Legal',
    'legal.terms.title': 'Términos de Servicio',
    'legal.terms.updated': 'Última actualización: 23 de julio de 2026',
    'legal.terms.intro': 'Estos Términos de Servicio ("Términos") rigen el uso del sitio web de Synthetix AI S.A.S. ("Synthetix AI", "nosotros") y el acceso a la información sobre nuestros servicios de arquitectura de software e inteligencia artificial aplicada. Al usar este sitio, usted acepta estos Términos.',
    'legal.terms.s1.title': '1. Sobre Synthetix AI',
    'legal.terms.s1.body': 'Synthetix AI S.A.S. es una sociedad por acciones simplificada de nacionalidad colombiana, con domicilio en Manizales, Colombia, dedicada al desarrollo de sistemas informáticos, consultoría en tecnologías de información e inteligencia artificial aplicada.',
    'legal.terms.s2.title': '2. Uso del sitio',
    'legal.terms.s2.body': 'Este sitio tiene fines informativos y de contacto comercial. Usted se compromete a utilizarlo de forma lícita y a no interferir con su funcionamiento ni intentar acceder sin autorización a sistemas o datos que no le correspondan.',
    'legal.terms.s3.title': '3. Propiedad intelectual',
    'legal.terms.s3.body': 'El contenido de este sitio — textos, diseño, marca y materiales relacionados — es propiedad de Synthetix AI S.A.S. o se usa bajo licencia, y está protegido por las leyes de propiedad intelectual aplicables. Ninguna parte de este contenido puede reproducirse sin autorización previa por escrito.',
    'legal.terms.s4.title': '4. Servicios',
    'legal.terms.s4.body': 'La información publicada sobre nuestros servicios (desarrollo de software, agentes autónomos, vibe-to-production) es de carácter general. El alcance, entregables y condiciones específicas de cada proyecto se definen en un acuerdo comercial independiente entre Synthetix AI y el cliente.',
    'legal.terms.s5.title': '5. Limitación de responsabilidad',
    'legal.terms.s5.body': 'La información de este sitio se ofrece "tal cual", sin garantías de ningún tipo respecto a su exactitud o vigencia para casos particulares. Synthetix AI no será responsable por decisiones tomadas exclusivamente con base en el contenido de este sitio, sin un acuerdo comercial formal.',
    'legal.terms.s6.title': '6. Ley aplicable',
    'legal.terms.s6.body': 'Estos Términos se rigen por las leyes de la República de Colombia. Cualquier controversia derivada de su interpretación o aplicación se resolverá conforme a lo previsto en los estatutos sociales de Synthetix AI S.A.S. y la legislación colombiana vigente.',
    'legal.terms.s7.title': '7. Modificaciones',
    'legal.terms.s7.body': 'Podemos actualizar estos Términos en cualquier momento; la versión vigente será siempre la publicada en esta página.',
    'legal.terms.s8.title': '8. Contacto',
    'legal.terms.s8.body': 'Para preguntas sobre estos Términos, escríbanos a contact@synthetixaisas.com.',
  },
```

- [ ] **Step 2: Add the matching keys to the `en` block of `src/i18n/ui.ts`**

Find (the end of the `en` block, now including Task 1's addition):

```ts
    'legal.privacy.s7.title': '7. Exercising your rights',
    'legal.privacy.s7.body': 'To exercise your rights of access, correction, update, or deletion of personal data, write to us at contact@synthetixaisas.com.',
  },
} as const;
```

Replace with:

```ts
    'legal.privacy.s7.title': '7. Exercising your rights',
    'legal.privacy.s7.body': 'To exercise your rights of access, correction, update, or deletion of personal data, write to us at contact@synthetixaisas.com.',

    // ---- Legal: Terms ----
    'legal.terms.meta.title': 'Terms of Service',
    'legal.terms.eyebrow': 'Legal',
    'legal.terms.title': 'Terms of Service',
    'legal.terms.updated': 'Last updated: July 23, 2026',
    'legal.terms.intro': 'These Terms of Service ("Terms") govern the use of the Synthetix AI S.A.S. ("Synthetix AI", "we") website and access to information about our software architecture and applied artificial intelligence services. By using this site, you agree to these Terms.',
    'legal.terms.s1.title': '1. About Synthetix AI',
    'legal.terms.s1.body': 'Synthetix AI S.A.S. is a Colombian simplified stock corporation (S.A.S.), domiciled in Manizales, Colombia, engaged in software systems development, information technology consulting, and applied artificial intelligence.',
    'legal.terms.s2.title': '2. Use of the site',
    'legal.terms.s2.body': 'This site is intended for informational and business-contact purposes. You agree to use it lawfully and not to interfere with its operation or attempt unauthorized access to systems or data.',
    'legal.terms.s3.title': '3. Intellectual property',
    'legal.terms.s3.body': 'The content of this site — text, design, brand, and related materials — is owned by Synthetix AI S.A.S. or used under license, and is protected by applicable intellectual property laws. No part of this content may be reproduced without prior written authorization.',
    'legal.terms.s4.title': '4. Services',
    'legal.terms.s4.body': 'Information published about our services (software development, autonomous agents, vibe-to-production) is general in nature. The scope, deliverables, and specific conditions of each project are defined in a separate commercial agreement between Synthetix AI and the client.',
    'legal.terms.s5.title': '5. Limitation of liability',
    'legal.terms.s5.body': 'The information on this site is provided "as is," without warranties of any kind regarding its accuracy or applicability to particular cases. Synthetix AI is not liable for decisions made solely on the basis of this site’s content, absent a formal commercial agreement.',
    'legal.terms.s6.title': '6. Governing law',
    'legal.terms.s6.body': "These Terms are governed by the laws of the Republic of Colombia. Any dispute arising from their interpretation or application will be resolved in accordance with Synthetix AI S.A.S.'s corporate bylaws and applicable Colombian law.",
    'legal.terms.s7.title': '7. Changes',
    'legal.terms.s7.body': 'We may update these Terms at any time; the version published on this page is always the current one.',
    'legal.terms.s8.title': '8. Contact',
    'legal.terms.s8.body': 'For questions about these Terms, write to us at contact@synthetixaisas.com.',
  },
} as const;
```

- [ ] **Step 3: Create `src/components/pages/TerminosPage.astro`**

```astro
---
import Layout from '../../layouts/Layout.astro';
import { useTranslations, type Lang, type UiKey } from '../../i18n/utils';

interface Props {
  lang: Lang;
}
const { lang } = Astro.props;
const t = useTranslations(lang);

const sections: { title: UiKey; body: UiKey }[] = [
  { title: 'legal.terms.s1.title', body: 'legal.terms.s1.body' },
  { title: 'legal.terms.s2.title', body: 'legal.terms.s2.body' },
  { title: 'legal.terms.s3.title', body: 'legal.terms.s3.body' },
  { title: 'legal.terms.s4.title', body: 'legal.terms.s4.body' },
  { title: 'legal.terms.s5.title', body: 'legal.terms.s5.body' },
  { title: 'legal.terms.s6.title', body: 'legal.terms.s6.body' },
  { title: 'legal.terms.s7.title', body: 'legal.terms.s7.body' },
  { title: 'legal.terms.s8.title', body: 'legal.terms.s8.body' },
];
---
<Layout title={t('legal.terms.meta.title')} lang={lang}>
  <section>
    <div class="container legal-doc">
      <span class="eyebrow">{t('legal.terms.eyebrow')}</span>
      <h1>{t('legal.terms.title')}</h1>
      <p class="legal-updated">{t('legal.terms.updated')}</p>
      <p class="legal-intro">{t('legal.terms.intro')}</p>
      {sections.map((s) => (
        <div class="legal-section">
          <h2>{t(s.title)}</h2>
          <p>{t(s.body)}</p>
        </div>
      ))}
    </div>
  </section>
</Layout>

<style>
  .legal-doc { max-width: 720px; padding: var(--sx-space-24) 0; }
  .legal-updated { color: var(--sx-slate-500); font-size: var(--fs-sm); margin-bottom: var(--sx-space-6); }
  .legal-intro { font-size: 18px; margin-bottom: var(--sx-space-8); }
  .legal-section { margin-top: var(--sx-space-8); }
  .legal-section h2 { font-size: var(--fs-h2); margin-bottom: var(--sx-space-3); }
</style>
```

(This duplicates `PrivacidadPage.astro`'s layout structure and `<style>` block. This is intentional — it matches the existing convention in this codebase of one dedicated component per page rather than a shared generic template, the same way `NosotrosPage.astro` and `ContactoPage.astro` each define their own layout instead of sharing one. Do not extract a shared `LegalPage.astro` component; that would be a new architectural pattern not used elsewhere in this codebase and is out of scope for this plan.)

- [ ] **Step 4: Create `src/pages/terminos/index.astro`**

```astro
---
import TerminosPage from '../../components/pages/TerminosPage.astro';
---
<TerminosPage lang="es" />
```

- [ ] **Step 5: Create `src/pages/en/terminos/index.astro`**

```astro
---
import TerminosPage from '../../../components/pages/TerminosPage.astro';
---
<TerminosPage lang="en" />
```

- [ ] **Step 6: Wire the Footer's "Términos de Servicio" link**

In `src/components/Footer.astro`, replace:

```astro
    <div class="sx-footer__legal-links">
      <a href={localizePath('/privacidad', lang)}>{t('footer.privacy')}</a>
      <a href="#">{t('footer.terms')}</a>
    </div>
```

with:

```astro
    <div class="sx-footer__legal-links">
      <a href={localizePath('/privacidad', lang)}>{t('footer.privacy')}</a>
      <a href={localizePath('/terminos', lang)}>{t('footer.terms')}</a>
    </div>
```

If Task 1 has not yet been applied to this checkout when this task runs, the first line will still read `<a href="#">{t('footer.privacy')}</a>` — in that case, only change the second line's `href="#"` to `href={localizePath('/terminos', lang)}` and leave the first line as you found it.

- [ ] **Step 7: Build and verify**

Run: `pnpm build`
Expected: page count is 2 more than whatever it was before this task (e.g. `19 page(s) built` if run after Task 1's 17) with no errors.

- [ ] **Step 8: Manual verification**

Using Grep, confirm:
- `dist/terminos/index.html` contains `Términos de Servicio`, `Synthetix AI S.A.S.`, and `Manizales`.
- `dist/en/terminos/index.html` contains `Terms of Service` in English.
- `dist/index.html`'s footer now links to `/terminos` (not `href="#"`) for the terms link.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add bilingual Terms of Service page, wire Footer link"
```

---

### Task 3: Founders/team section on the Nosotros page

**Context:** The user asked for a founders section similar to https://www.stackoverflight.com/about/ — a minimal grid showing a photo, name, and a single-line title per person, deliberately with no biography or social links. There are 4 founders (from the company's incorporation document, names only — no ID numbers or equity data belong on a public page). No headshot photos exist yet, so this task uses an initials-based placeholder avatar (a new small `Avatar.astro` component, matching the "Avatar" primitive already named in the project's design system reference but not yet built). All 4 founders use the same generic title ("Cofundador"/"Co-Founder") as a placeholder until real titles are provided.

**Files:**
- Modify: `src/i18n/ui.ts`
- Create: `src/components/Avatar.astro`
- Modify: `src/components/pages/NosotrosPage.astro`

**Interfaces:**
- Produces: `Avatar.astro` accepting `{ initials: string }` — no other component in this plan consumes it, but it's a general-purpose primitive (matches the Design System's "Avatar" component) that could be reused later if real photos replace the initials.

- [ ] **Step 1: Add the team-section translation keys to the `es` block of `src/i18n/ui.ts`**

Find the end of the `es` block (now including Tasks 1 and 2's additions):

```ts
    'legal.terms.s8.title': '8. Contacto',
    'legal.terms.s8.body': 'Para preguntas sobre estos Términos, escríbanos a contact@synthetixaisas.com.',
  },
```

Replace with:

```ts
    'legal.terms.s8.title': '8. Contacto',
    'legal.terms.s8.body': 'Para preguntas sobre estos Términos, escríbanos a contact@synthetixaisas.com.',

    // ---- Nosotros: Equipo ----
    'about.team.eyebrow': 'Nuestro Equipo',
    'about.team.title': 'Las personas detrás de Synthetix AI',
    'about.team.lead': 'Un equipo fundador con experiencia en ingeniería de software y arquitectura de IA.',
    'about.team.role': 'Cofundador',
  },
```

If Tasks 1 and/or 2 have not yet been applied when this task runs, find whatever the current last entry of the `es` block is (it will end in `},` right before the block closes) and append the `// ---- Nosotros: Equipo ----` block the same way, immediately before that closing `},`.

- [ ] **Step 2: Add the matching keys to the `en` block of `src/i18n/ui.ts`**

Find the end of the `en` block (now including Tasks 1 and 2's additions):

```ts
    'legal.terms.s8.title': '8. Contact',
    'legal.terms.s8.body': 'For questions about these Terms, write to us at contact@synthetixaisas.com.',
  },
} as const;
```

Replace with:

```ts
    'legal.terms.s8.title': '8. Contact',
    'legal.terms.s8.body': 'For questions about these Terms, write to us at contact@synthetixaisas.com.',

    // ---- Nosotros: Team ----
    'about.team.eyebrow': 'Our Team',
    'about.team.title': 'The people behind Synthetix AI',
    'about.team.lead': 'A founding team with a background in software engineering and AI architecture.',
    'about.team.role': 'Co-Founder',
  },
} as const;
```

If Tasks 1 and/or 2 have not yet been applied when this task runs, apply the same `// ---- Nosotros: Team ----` addition immediately before the `en` block's closing `},` (the one right before `} as const;`), using whatever keys currently precede it.

- [ ] **Step 3: Create `src/components/Avatar.astro`**

```astro
---
interface Props {
  initials: string;
}
const { initials } = Astro.props;
---
<div class="sx-avatar" aria-hidden="true">{initials}</div>

<style>
  .sx-avatar {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--sx-gradient-cyan);
    color: #fff;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: var(--fs-h2);
    margin: 0 auto var(--sx-space-4);
  }
</style>
```

- [ ] **Step 4: Add the team section to `src/components/pages/NosotrosPage.astro`**

Replace the frontmatter:

```astro
---
import Layout from '../../layouts/Layout.astro';
import Card from '../Card.astro';
import { useTranslations, type Lang, type UiKey } from '../../i18n/utils';

interface Props {
  lang: Lang;
}
const { lang } = Astro.props;
const t = useTranslations(lang);

const steps: { title: UiKey; body: UiKey }[] = [
  { title: 'about.how.1.title', body: 'about.how.1.body' },
  { title: 'about.how.2.title', body: 'about.how.2.body' },
  { title: 'about.how.3.title', body: 'about.how.3.body' },
];

const faqs: { q: UiKey; a: UiKey }[] = [
  { q: 'about.faq.1.q', a: 'about.faq.1.a' },
  { q: 'about.faq.2.q', a: 'about.faq.2.a' },
  { q: 'about.faq.3.q', a: 'about.faq.3.a' },
  { q: 'about.faq.4.q', a: 'about.faq.4.a' },
];
---
```

with:

```astro
---
import Layout from '../../layouts/Layout.astro';
import Card from '../Card.astro';
import Avatar from '../Avatar.astro';
import { useTranslations, type Lang, type UiKey } from '../../i18n/utils';

interface Props {
  lang: Lang;
}
const { lang } = Astro.props;
const t = useTranslations(lang);

const steps: { title: UiKey; body: UiKey }[] = [
  { title: 'about.how.1.title', body: 'about.how.1.body' },
  { title: 'about.how.2.title', body: 'about.how.2.body' },
  { title: 'about.how.3.title', body: 'about.how.3.body' },
];

const team = [
  { name: 'Cristian Camilo Montes Londoño', initials: 'CM' },
  { name: 'Sergio Molina Cadavid', initials: 'SM' },
  { name: 'Santiago Rentería Gutiérrez', initials: 'SR' },
  { name: 'Mateo Rodríguez Morales', initials: 'MR' },
];

const faqs: { q: UiKey; a: UiKey }[] = [
  { q: 'about.faq.1.q', a: 'about.faq.1.a' },
  { q: 'about.faq.2.q', a: 'about.faq.2.a' },
  { q: 'about.faq.3.q', a: 'about.faq.3.a' },
  { q: 'about.faq.4.q', a: 'about.faq.4.a' },
];
---
```

Then replace the template's `<section id="faq">` opening (insert a new team section directly before the existing FAQ section):

```astro
  <section id="faq">
```

with:

```astro
  <section id="equipo" class="grain-surface">
    <div class="container">
      <div class="section-head" data-reveal>
        <span class="eyebrow">{t('about.team.eyebrow')}</span>
        <h2>{t('about.team.title')}</h2>
        <p>{t('about.team.lead')}</p>
      </div>
      <div class="team-grid">
        {team.map((member) => (
          <div class="team-card" data-reveal>
            <Avatar initials={member.initials} />
            <h4>{member.name}</h4>
            <p class="team-role">{t('about.team.role')}</p>
          </div>
        ))}
      </div>
    </div>
  </section>

  <section id="faq">
```

Finally, add the team-grid styles to the `<style>` block. Replace:

```astro
<style>
  .lead { max-width: 560px; font-size: 18px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sx-space-6); }
```

with:

```astro
<style>
  .lead { max-width: 560px; font-size: 18px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sx-space-6); }
  .team-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sx-space-6); text-align: center; }
  .team-card h4 { margin: var(--sx-space-2) 0 var(--sx-space-1); }
  .team-role { color: var(--sx-slate-400); font-size: var(--fs-sm); margin: 0; }
```

And add the responsive step for `.team-grid` alongside the existing `.grid-3` media queries. Replace:

```astro
  @media (max-width: 900px) {
    .grid-3 { grid-template-columns: 1fr 1fr; }
    .grid-3 > :last-child { grid-column: 1 / -1; }
  }
  @media (max-width: 560px) {
    .grid-3 { grid-template-columns: 1fr; }
  }
</style>
```

with:

```astro
  @media (max-width: 900px) {
    .grid-3 { grid-template-columns: 1fr 1fr; }
    .grid-3 > :last-child { grid-column: 1 / -1; }
    .team-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 560px) {
    .grid-3 { grid-template-columns: 1fr; }
    .team-grid { grid-template-columns: 1fr; }
  }
</style>
```

(`.team-grid` has exactly 4 items, so the 2-column tablet step divides evenly — no `:last-child` spanning rule is needed here, unlike `.grid-3`'s 3-item case.)

- [ ] **Step 5: Build and verify**

Run: `pnpm build`
Expected: page count unchanged from whatever it was before this task (this task adds a section to an existing page, not a new route) with no errors.

- [ ] **Step 6: Manual verification**

Using Grep, confirm `dist/nosotros/index.html` contains all 4 founder names (`Cristian Camilo Montes Londoño`, `Sergio Molina Cadavid`, `Santiago Rentería Gutiérrez`, `Mateo Rodríguez Morales`) and does **not** contain any cédula/ID number or capital/share figures. Confirm `dist/en/nosotros/index.html` shows the same 4 names with the English section heading ("Our Team").

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add founders/team section to Nosotros page"
```

---

### Task 4: Google Maps embed on the Contact page

**Context:** The user asked for a map with a pin at the office address, on the Contact page. No Google Maps API key or billing setup is available (or needed) — this uses Google's no-API-key `<iframe>` embed URL pattern (`https://maps.google.com/maps?q=<address>&output=embed`), which requires no new dependency. This task also corrects `contact.office.value`, which currently reads the placeholder "Medellín, Antioquia, Colombia", to the company's real legal address in Manizales (per explicit user decision) — the map pin and the displayed office text must show the same address, so the map's query string is derived from `t('contact.office.value')` rather than a second hardcoded string.

**Files:**
- Modify: `src/i18n/ui.ts`
- Modify: `src/components/pages/ContactoPage.astro`

**Interfaces:** None — pure content + markup, no new exports.

- [ ] **Step 1: Update `contact.office.value` in the `es` block of `src/i18n/ui.ts`**

Replace:

```ts
    'contact.office.value': 'Medellín, Antioquia, Colombia',
```

with:

```ts
    'contact.office.value': 'Cra 21B # 55-25, Manizales, Caldas, Colombia',
```

- [ ] **Step 2: Update `contact.office.value` in the `en` block of `src/i18n/ui.ts`**

Replace:

```ts
    'contact.office.value': 'Medellín, Antioquia, Colombia',
```

with:

```ts
    'contact.office.value': 'Cra 21B # 55-25, Manizales, Caldas, Colombia',
```

(The address itself is not translated — street addresses stay as written in both locales, matching how proper nouns are already handled elsewhere in this file.)

- [ ] **Step 3: Add the map embed to `src/components/pages/ContactoPage.astro`**

Replace the frontmatter:

```astro
---
import Layout from '../../layouts/Layout.astro';
import Card from '../Card.astro';
import Input from '../Input.astro';
import Button from '../Button.astro';
import MeshBackground from '../MeshBackground.astro';
import { useTranslations, type Lang } from '../../i18n/utils';

interface Props {
  lang: Lang;
}
const { lang } = Astro.props;
const t = useTranslations(lang);
---
```

with:

```astro
---
import Layout from '../../layouts/Layout.astro';
import Card from '../Card.astro';
import Input from '../Input.astro';
import Button from '../Button.astro';
import MeshBackground from '../MeshBackground.astro';
import { useTranslations, type Lang } from '../../i18n/utils';

interface Props {
  lang: Lang;
}
const { lang } = Astro.props;
const t = useTranslations(lang);
const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(t('contact.office.value'))}&z=15&output=embed`;
---
```

Then replace the office-info block:

```astro
        <div class="office-info">
          <h4>{t('contact.hours')}</h4>
          <p>{t('contact.hours.value')}</p>
          <h4>{t('contact.mail')}</h4>
          <p><a href="mailto:hello@synthetix.ai">hello@synthetix.ai</a></p>
          <h4>{t('contact.office')}</h4>
          <p>{t('contact.office.value')}</p>
        </div>
```

with:

```astro
        <div class="office-info">
          <h4>{t('contact.hours')}</h4>
          <p>{t('contact.hours.value')}</p>
          <h4>{t('contact.mail')}</h4>
          <p><a href="mailto:hello@synthetix.ai">hello@synthetix.ai</a></p>
          <h4>{t('contact.office')}</h4>
          <p>{t('contact.office.value')}</p>
          <div class="office-map">
            <iframe
              src={mapSrc}
              width="100%"
              height="220"
              style="border:0"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              title={t('contact.office.value')}
            ></iframe>
          </div>
        </div>
```

Finally, add the map styling. Replace:

```astro
<style>
  .lead { max-width: 480px; font-size: 18px; }
  .contact-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--sx-space-16);
    align-items: start;
  }
  .office-info { margin-top: var(--sx-space-8); }
  .office-info h4 { font-size: var(--fs-sm); text-transform: uppercase; letter-spacing: 0.06em; color: var(--sx-slate-400); margin: var(--sx-space-4) 0 var(--sx-space-1); }
  .office-info p { margin: 0; }
  .office-info a { color: var(--sx-tech-cyan); }
  .contact-form { display: flex; flex-direction: column; }
  @media (max-width: 900px) { .contact-grid { grid-template-columns: 1fr; } }
</style>
```

with:

```astro
<style>
  .lead { max-width: 480px; font-size: 18px; }
  .contact-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--sx-space-16);
    align-items: start;
  }
  .office-info { margin-top: var(--sx-space-8); }
  .office-info h4 { font-size: var(--fs-sm); text-transform: uppercase; letter-spacing: 0.06em; color: var(--sx-slate-400); margin: var(--sx-space-4) 0 var(--sx-space-1); }
  .office-info p { margin: 0; }
  .office-info a { color: var(--sx-tech-cyan); }
  .office-map { margin-top: var(--sx-space-4); border-radius: var(--sx-radius-lg); overflow: hidden; }
  .office-map iframe { display: block; }
  .contact-form { display: flex; flex-direction: column; }
  @media (max-width: 900px) { .contact-grid { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 4: Build and verify**

Run: `pnpm build`
Expected: page count unchanged from whatever it was before this task with no errors.

- [ ] **Step 5: Manual verification**

Using Grep, confirm `dist/contacto/index.html` contains an `<iframe` with `src` pointing at `maps.google.com/maps?q=` and the URL-encoded address (`Manizales`, percent-encoded, should appear in the `src` attribute), and that both `dist/contacto/index.html` and `dist/nosotros/index.html`... (no — only `contacto`) show `Manizales` rather than `Medellín` for the office address. Also confirm `dist/en/contacto/index.html` renders the same iframe.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Google Maps embed to Contact page, correct office address to Manizales"
```

---

## Self-Review Notes

- **Spec coverage:** Task 1 → Privacy Policy page (adapted from the real PDF, LEGALAPP/geolocation content excluded per user decision). Task 2 → Terms of Service page (drafted, no source document existed). Task 3 → founders/team section per the `stackoverflight.com/about` reference (names + generic title only, no sensitive incorporation data, no photos yet). Task 4 → Google Maps embed + office address correction, per user decision to use the real Manizales legal domicile.
- **Sensitive-data check:** Verified none of the four tasks' code blocks include the founders' cédula numbers or the capital/share breakdown from the incorporation document — only full names (Task 3) and company-level facts (NIT, razón social, domicilio, objeto social — Tasks 1 and 2) are used.
- **Placeholder scan:** No TBD/TODO markers. Two intentional placeholders, both called out explicitly rather than hidden: the team section's generic "Cofundador"/"Co-Founder" title (real titles not yet provided) and the initials-based `Avatar` (real headshots not yet available) — both are one-line/one-file swaps once the real data exists.
- **Type consistency:** `UiKey` additions in `src/i18n/ui.ts` use identical key sets across the `es` and `en` blocks in every task (required — `UiKey` is derived from the `es` block, so a mismatched `en` block would be a type error surfaced at build time). `Avatar` component's `initials` prop is a plain `string`, consumed identically in Task 3's only call site.
- **Route slug check:** `/privacidad`, `/en/privacidad`, `/terminos`, `/en/terminos` all keep the same (Spanish) slug across both language roots, matching every other route in this site (`/servicios` ↔ `/en/servicios`, etc.) — confirmed against `switchLangPath`'s implementation in `src/i18n/utils.ts`, which assumes identical path segments between locales.
