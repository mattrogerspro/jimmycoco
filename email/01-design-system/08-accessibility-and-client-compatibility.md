# Accessibility and Client Compatibility

## Purpose

Ensure every Sunless email is understandable, operable and visually coherent across major clients, assistive technologies and image-blocking conditions.

## Accessibility requirements

### Structure

- Use semantic heading hierarchy where supported.
- Keep reading order logical in the HTML source.
- Mark presentation tables appropriately.
- Set the email language.
- Include a descriptive title or preheader where supported.

### Text

- Use live HTML text for essential information.
- Maintain comfortable line height and readable size.
- Avoid long all-uppercase passages.
- Do not communicate meaning through colour alone.
- Ensure offer terms and legal conditions are readable.

### Contrast

Use strong contrast for body copy, links, buttons and utility information. Warm neutral backgrounds must not reduce readability. Test all approved combinations rather than assuming luxury tones are accessible.

### Images

- Provide concise, meaningful alt text.
- Use empty alt attributes for decorative images.
- Do not repeat surrounding copy in alt text.
- Keep the message useful when images are blocked.
- Never place essential offer terms or product selection guidance only inside images.

### Links and buttons

- Use descriptive labels.
- Ensure touch targets are at least 44px high where practical.
- Separate adjacent links sufficiently.
- Make text links visibly identifiable.

## Client compatibility

Test key templates in:

- Apple Mail on iOS and macOS
- Gmail web and mobile apps
- Outlook desktop variants
- Outlook web
- Yahoo Mail
- Samsung Mail where audience data justifies it

## Robust implementation

- Use table-based layout for structural reliability.
- Inline critical styles.
- Provide fallback background colours.
- Avoid reliance on JavaScript, forms, video autoplay or unsupported positioning.
- Use bulletproof HTML buttons.
- Treat border radius, background images and custom fonts as progressive enhancement.

## Dark mode

Dark mode must be reviewed, not ignored.

- Use transparent product images carefully.
- Prevent logos from disappearing against forced dark backgrounds.
- Add controlled outlines or background plates where necessary.
- Avoid text baked into transparent images.
- Check that brand colours remain legible when clients transform them.

## QA checklist

Before send, verify:

- subject and preheader pairing
- alt text
- link destinations and tracking
- button fallbacks
- mobile stacking
- image-blocked state
- dark mode
- keyboard and screen-reader reading order
- unsubscribe and preference links
- legal address and required compliance content
- plain-text version

## Success criteria

The standard succeeds when customers can understand and act on the email regardless of device, client, vision ability, image settings or input method.