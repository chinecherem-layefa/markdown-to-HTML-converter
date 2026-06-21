# EDGE CASES

1. Nested lists don't get rendered properly.

- Grandfather
  - Father
  - Mother
    - Children

The nesting is unrecognized by the parser, it renders as list items on the same level. We should be able to solve this issue with a list stack to keep track of where we are at. That will be in Phase 2 refactoring.
