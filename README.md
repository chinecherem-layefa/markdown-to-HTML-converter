# Markdown to HTML converter.

To take plain markdown that humans can write easily given the domain rules, and convert to HTML, that can be easily rendered by browsers.

## Typical Architectural Components

- **Program Organization**
- **Major Classes**
- **Data Design**
- **Business Rules**
- **User Interface Design**
- **Resource Management/Performance Optimization**
- **Security**
- **Scalability**
- **Interoperability**
- **Input/output**
- **Error Processing**
- **Fault Tolerance**
- **Architectural Feasiblility**
- **Overengineering**
- **Change Strategy/Flexible System Design Patterns**

# Three levels of software design...

## Architectural design

- **Pattern**: Pipeline with state machine.
- **Components**: Input validator,
- **Data Flow**: String(input) -> Array of lines -> Array of HTML lines -> String(output)

## High-level design (describes the relationship between each module/component)

- **markdownToHtml()**: Public API.
- **parseInLine()**: Recursive for inline-level transformation.
- **escapeHtml()**: Critical for secure rendering of file to avoid malicious activity by hackers; acts as sanitizer.
- **flushParagraph()**: To publish the state in bits.
