---
name: framer-motion-patterns
description: Framer Motion animation patterns for React components. Use when building component-level animations, page transitions, or gesture interactions with Framer Motion.
---

# Framer Motion Patterns

## Installation

```bash
npm install framer-motion
```

## Core Patterns

### 1. Entrance Animation (on mount)
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
>
  Content
</motion.div>
```

### 2. Staggered Children
```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 }
  }
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

<motion.ul variants={container} initial="hidden" animate="show">
  <motion.li variants={item}>Item 1</motion.li>
  <motion.li variants={item}>Item 2</motion.li>
  <motion.li variants={item}>Item 3</motion.li>
</motion.ul>
```

### 3. Scroll-Triggered Reveal (whileInView)
```tsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
>
  Reveals when scrolled into view
</motion.div>
```

### 4. Hover/Tap Micro-interactions
```tsx
<motion.button
  whileHover={{ scale: 1.03, y: -2 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  Click me
</motion.button>
```

### 5. Layout Animations (shared layout)
```tsx
<motion.div layout>
  <motion.div layoutId="card" />
</motion.div>
```

### 6. Page Transitions
```tsx
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

<motion.div
  variants={pageVariants}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={{ duration: 0.3 }}
/>;
```

### 7. AnimatePresence for exit animations
```tsx
import { AnimatePresence } from 'framer-motion';

<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  )}
</AnimatePresence>
```

### 8. Parallax on Scroll
```tsx
import { useScroll, useTransform } from 'framer-motion';

const { scrollY } = useScroll();
const y = useTransform(scrollY, [0, 500], [0, -150]);

<motion.div style={{ y }}>
  Parallax content
</motion.div>
```

## Easing Reference

| Name | Cubic-bezier | Use for |
|------|-------------|---------|
| easeOut | [0, 0, 0.2, 1] | Entrances |
| easeIn | [0.4, 0, 1, 1] | Exits |
| easeInOut | [0.4, 0, 0.2, 1] | Transitions |
| spring | type: "spring", stiffness: 300, damping: 24 | Natural movement |
| bounce | type: "spring", stiffness: 500, damping: 10 | Playful |

## Reduced Motion

```tsx
import { useReducedMotion } from 'framer-motion';

function Component() {
  const shouldReduceMotion = useReducedMotion();
  const variants = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 } };

  return <motion.div variants={variants} initial="initial" animate="animate" />;
}
```
