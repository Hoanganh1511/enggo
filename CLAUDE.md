@AGENTS.md

## UI conventions

### Dropdown / popover animation

Mọi dropdown/popover kiểu hover hoặc click-to-open (workspace switcher, app switcher menu, ...) dùng chung 1 animation `framer-motion` để đồng bộ cảm giác trong toàn app:

```tsx
<AnimatePresence>
  {open && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      ...
    </motion.div>
  )}
</AnimatePresence>
```

Khi thêm dropdown/popover mới, tái dùng đúng các giá trị trên (không tự chế animation khác).
