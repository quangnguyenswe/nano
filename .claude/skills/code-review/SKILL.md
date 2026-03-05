---
name: code-review
description: Use when the user asks to "do a code review", "review code", "review this file", "review this folder", or any request to analyze code for issues, review pull requests, or provide code feedback against team standards.
---

# Code Review Skill

## Purpose
This skill provides comprehensive code review capabilities aligned with our team's standards, security requirements, and architectural patterns.

## When to Use This Skill
- When reviewing pull requests or code changes
- When analyzing code for potential issues
- When providing feedback on code structure or implementation
- When checking code against team standards

## Code Review Checklist

### 1. Code Standards &amp; Style
- **Naming Conventions**
  - Use camelCase for variables and functions (e.g., `getUserData`, `isValid`)
  - Use PascalCase for classes and components (e.g., `UserService`, `DataProcessor`)
  - Use UPPER_SNAKE_CASE for constants (e.g., `MAX_RETRY_ATTEMPTS`)
  - Avoid single-letter variables except in short loops

- **File Organization**
  - Maximum 300 lines per file
  - Group related functions together
  - Place imports at the top, organized: external libraries, internal modules, types
  - Export statements at the bottom of the file

### 2. Security Vulnerabilities
Check for these common security issues:
- SQL injection risks (always use parameterized queries)
- XSS vulnerabilities (sanitize user input before rendering)
- Hardcoded credentials or API keys (use environment variables)
- Insecure direct object references (validate user permissions)
- Missing authentication/authorization checks on sensitive endpoints

### 3. Performance Patterns
- **Database Queries**
  - Flag N+1 query patterns
  - Suggest eager loading for related data
  - Recommend indexing for frequently queried fields

- **API Calls**
  - Ensure proper caching for repeated requests
  - Check for unnecessary API calls in loops
  - Verify timeout and retry logic exists

### 4. Error Handling
- All async operations must have try-catch blocks
- Errors should be logged with context (user ID, request ID, timestamp)
- User-facing errors should never expose internal details
- Use custom error classes: `ValidationError`, `AuthenticationError`, `DatabaseError`

### 5. Testing Requirements
- Unit tests required for all business logic functions
- Integration tests required for API endpoints
- Minimum 80% code coverage for new code
- Test file naming: `[filename].test.js` or `[filename].spec.js`

### 6. Documentation Standards
- JSDoc comments required for all exported functions
- Include @param, @returns, and @throws tags
- Complex logic should have inline comments explaining the "why"
- Update README.md if public API changes

### 7. Architecture Alignment
- **Service Layer Pattern**: Business logic must be in service files, not controllers
- **Dependency Injection**: Use constructor injection for dependencies
- **Event-Driven**: Use event emitters for cross-module communication, not direct calls
- **Repository Pattern**: Database access only through repository classes

## Review Output Format
Structure your review as follows:
1. **Summary**: Brief overview of the changes and overall assessment
2. **Critical Issues**: Must be fixed before merge (security, bugs, breaking changes)
3. **Suggestions**: Improvements for code quality, performance, or maintainability
4. **Positive Feedback**: Highlight what was done well
5. **Questions**: Any clarifications needed from the author

## Example Review Comments
**Good**: "Line 45: This query could cause N+1 problem. Consider using `include` to eager load the user's orders: `User.findById(id).include('orders')`"
**Avoid**: "This is bad" or "Fix this"

## CI/CD Integration Notes
- All tests must pass before merge
- Linting errors must be resolved (ESLint configuration in `.eslintrc.js`)
- Build must succeed in staging environment
- Database migrations must be reversible

# Code Quality Checklist

## Error Handling

### Anti-patterns to Flag

- **Swallowed exceptions**: Empty catch blocks or catch with only logging
  ```javascript
  try { ... } catch (e) { }  // Silent failure
  try { ... } catch (e) { console.log(e) }  // Log and forget
  ```
- **Overly broad catch**: Catching `Exception`/`Error` base class instead of specific types
- **Error information leakage**: Stack traces or internal details exposed to users
- **Missing error handling**: No try-catch around fallible operations (I/O, network, parsing)
- **Async error handling**: Unhandled promise rejections, missing `.catch()`, no error boundary

### Best Practices to Check

- [ ] Errors are caught at appropriate boundaries
- [ ] Error messages are user-friendly (no internal details exposed)
- [ ] Errors are logged with sufficient context for debugging
- [ ] Async errors are properly propagated or handled
- [ ] Fallback behavior is defined for recoverable errors
- [ ] Critical errors trigger alerts/monitoring

### Questions to Ask
- "What happens when this operation fails?"
- "Will the caller know something went wrong?"
- "Is there enough context to debug this error?"

---

## Performance & Caching

### CPU-Intensive Operations

- **Expensive operations in hot paths**: Regex compilation, JSON parsing, crypto in loops
- **Blocking main thread**: Sync I/O, heavy computation without worker/async
- **Unnecessary recomputation**: Same calculation done multiple times
- **Missing memoization**: Pure functions called repeatedly with same inputs

### Database & I/O

- **N+1 queries**: Loop that makes a query per item instead of batch
  ```javascript
  // Bad: N+1
  for (const id of ids) {
    const user = await db.query(`SELECT * FROM users WHERE id = ?`, id)
  }
  // Good: Batch
  const users = await db.query(`SELECT * FROM users WHERE id IN (?)`, ids)
  ```
- **Missing indexes**: Queries on unindexed columns
- **Over-fetching**: SELECT * when only few columns needed
- **No pagination**: Loading entire dataset into memory

### Caching Issues

- **Missing cache for expensive operations**: Repeated API calls, DB queries, computations
- **Cache without TTL**: Stale data served indefinitely
- **Cache without invalidation strategy**: Data updated but cache not cleared
- **Cache key collisions**: Insufficient key uniqueness
- **Caching user-specific data globally**: Security/privacy issue

### Memory

- **Unbounded collections**: Arrays/maps that grow without limit
- **Large object retention**: Holding references preventing GC
- **String concatenation in loops**: Use StringBuilder/join instead
- **Loading large files entirely**: Use streaming instead

### Questions to Ask
- "What's the time complexity of this operation?"
- "How does this behave with 10x/100x data?"
- "Is this result cacheable? Should it be?"
- "Can this be batched instead of one-by-one?"

---

## Boundary Conditions

### Null/Undefined Handling

- **Missing null checks**: Accessing properties on potentially null objects
- **Truthy/falsy confusion**: `if (value)` when `0` or `""` are valid
- **Optional chaining overuse**: `a?.b?.c?.d` hiding structural issues
- **Null vs undefined inconsistency**: Mixed usage without clear convention

### Empty Collections

- **Empty array not handled**: Code assumes array has items
- **Empty object edge case**: `for...in` or `Object.keys` on empty object
- **First/last element access**: `arr[0]` or `arr[arr.length-1]` without length check

### Numeric Boundaries

- **Division by zero**: Missing check before division
- **Integer overflow**: Large numbers exceeding safe integer range
- **Floating point comparison**: Using `===` instead of epsilon comparison
- **Negative values**: Index or count that shouldn't be negative
- **Off-by-one errors**: Loop bounds, array slicing, pagination

### String Boundaries

- **Empty string**: Not handled as edge case
- **Whitespace-only string**: Passes truthy check but is effectively empty
- **Very long strings**: No length limits causing memory/display issues
- **Unicode edge cases**: Emoji, RTL text, combining characters

### Common Patterns to Flag

```javascript
// Dangerous: no null check
const name = user.profile.name

// Dangerous: array access without check
const first = items[0]

// Dangerous: division without check
const avg = total / count

// Dangerous: truthy check excludes valid values
if (value) { ... }  // fails for 0, "", false
```

### Questions to Ask
- "What if this is null/undefined?"
- "What if this collection is empty?"
- "What's the valid range for this number?"
- "What happens at the boundaries (0, -1, MAX_INT)?"