---
name: react-bits-components
description: react-bits UI component library patterns and usage. Use when building UI components with react-bits. Library: https://github.com/DavidHDev/react-bits
---

# react-bits Components

## Installation

```bash
npm install react-bits
```

## Component Patterns

### Button
```tsx
import { Button } from 'react-bits';

<Button variant="primary" size="md" onClick={handleClick}>
  Get Started
</Button>

// Variants: primary, secondary, ghost, danger
// Sizes: sm, md, lg
```

### Card
```tsx
import { Card } from 'react-bits';

<Card hoverable onClick={handleClick}>
  <Card.Header>
    <h3>Title</h3>
  </Card.Header>
  <Card.Body>
    Content here
  </Card.Body>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

### Input
```tsx
import { Input } from 'react-bits';

<Input
  label="Email"
  placeholder="you@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
/>
```

### Modal
```tsx
import { Modal } from 'react-bits';

<Modal open={isOpen} onClose={() => setOpen(false)}>
  <h2>Modal Title</h2>
  <p>Content</p>
</Modal>
```

### Tooltip
```tsx
import { Tooltip } from 'react-bits';

<Tooltip content="This is helpful information">
  <Button>Hover me</Button>
</Tooltip>
```

### Badge
```tsx
import { Badge } from 'react-bits';

<Badge variant="success">Active</Badge>
<Badge variant="warning">Beta</Badge>
<Badge variant="info">New</Badge>
```

### Tabs
```tsx
import { Tabs } from 'react-bits';

<Tabs defaultActive="features">
  <Tabs.Tab id="features" label="Features">
    Features content
  </Tabs.Tab>
  <Tabs.Tab id="pricing" label="Pricing">
    Pricing content
  </Tabs.Tab>
</Tabs>
```

### Accordion
```tsx
import { Accordion } from 'react-bits';

<Accordion>
  <Accordion.Item>
    <Accordion.Trigger>What is this?</Accordion.Trigger>
    <Accordion.Content>It's a tool.</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

## Styling

react-bits components accept `className` and `style` props for customization. Use CSS custom properties to theme:

```css
:root {
  --rb-color-primary: #5e60ce;
  --rb-color-bg: #161b22;
  --rb-color-text: #e6edf3;
  --rb-radius: 10px;
}
```
