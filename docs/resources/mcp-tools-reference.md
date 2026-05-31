# MCP Tools Reference Guide

## 📋 Overview

This document contains the complete reference for all MCP (Model Context Protocol) tools available in the development environment, along with their usage patterns and best practices learned from the POS+Stock project implementation.

## 🛠️ Available MCP Tools

### 1. File System Tools

#### `read_file`
**Purpose:** Read file contents with optional line range
```typescript
read_file({
  file_path: string,           // Required: Absolute path
  offset?: number,            // Optional: 1-indexed line start
  limit?: number              // Optional: Number of lines to read
})
```

**Usage Examples:**
```typescript
// Read entire file
read_file({ file_path: "/path/to/file.tsx" })

// Read specific range
read_file({ 
  file_path: "/path/to/file.tsx", 
  offset: 100, 
  limit: 50 
})

// Read first 10 lines
read_file({ 
  file_path: "/path/to/file.tsx", 
  limit: 10 
})
```

**Best Practices:**
- Always use absolute paths
- Use limit for large files (>1000 lines)
- Check file exists before reading
- Handle empty files gracefully

#### `write_to_file`
**Purpose:** Create new files or overwrite existing ones
```typescript
write_to_file({
  TargetFile: string,          // Required: Absolute path
  CodeContent: string,         // Required: File content
  EmptyFile?: boolean         // Optional: Create empty file
})
```

**Usage Examples:**
```typescript
// Create new file with content
write_to_file({
  TargetFile: "/path/to/new-file.ts",
  CodeContent: "export const hello = 'world';"
})

// Create empty file
write_to_file({
  TargetFile: "/path/to/empty.txt",
  EmptyFile: true
})
```

**Best Practices:**
- Verify file doesn't exist before creating
- Use proper file extensions
- Include proper import statements
- Format code before writing

#### `edit`
**Purpose:** Make exact string replacements in existing files
```typescript
edit({
  file_path: string,           // Required: Absolute path
  old_string: string,         // Required: Text to replace
  new_string: string,         // Required: Replacement text
  replace_all?: boolean       // Optional: Replace all occurrences
})
```

**Usage Examples:**
```typescript
// Single replacement
edit({
  file_path: "/path/to/file.ts",
  old_string: "const old = 'value';",
  new_string: "const new = 'updated';"
})

// Replace all occurrences
edit({
  file_path: "/path/to/file.ts",
  old_string: "console.log",
  new_string: "logger.info",
  replace_all: true
})
```

**Best Practices:**
- Read file first to verify exact string
- Preserve exact indentation and whitespace
- Use unique strings to avoid accidental replacements
- Test with single replacement before using replace_all

#### `multi_edit`
**Purpose:** Make multiple edits to a single file atomically
```typescript
multi_edit({
  file_path: string,           // Required: Absolute path
  explanation: string,        // Required: Description of changes
  edits: Array<{              // Required: Array of edits
    old_string: string,
    new_string: string,
    replace_all?: boolean
  }>
})
```

**Usage Examples:**
```typescript
multi_edit({
  file_path: "/path/to/component.tsx",
  explanation: "Add state variables and handlers",
  edits: [
    {
      old_string: "const [count, setCount] = useState(0);",
      new_string: "const [count, setCount] = useState(0);\nconst [loading, setLoading] = useState(false);"
    },
    {
      old_string: "const handleClick = () => {",
      new_string: "const handleClick = async () => {"
    }
  ]
})
```

**Best Practices:**
- Use for related changes to same file
- Ensure edits don't conflict with each other
- Provide clear explanation
- Order edits logically (imports first, then functions)

### 2. Search Tools

#### `find_by_name`
**Purpose:** Search files and directories using fd with glob patterns
```typescript
find_by_name({
  SearchDirectory: string,      // Required: Directory to search
  Pattern: string,             // Required: Glob pattern
  Type?: "file" | "directory" | "any",  // Optional: Filter by type
  MaxDepth?: number,           // Optional: Search depth limit
  Extensions?: string[],       // Optional: File extensions
  Excludes?: string[],         // Optional: Exclude patterns
  FullPath?: boolean           // Optional: Match full path
})
```

**Usage Examples:**
```typescript
// Find all TypeScript files
find_by_name({
  SearchDirectory: "/src",
  Pattern: "*.ts",
  Extensions: ["ts", "tsx"]
})

// Find test files
find_by_name({
  SearchDirectory: "/src",
  Pattern: "*.test.*",
  Extensions: ["ts", "js"]
})

// Find directories
find_by_name({
  SearchDirectory: "/src",
  Pattern: "components",
  Type: "directory"
})
```

**Best Practices:**
- Use specific patterns to avoid too many results
- Combine with Type and Extensions for better filtering
- Use Excludes for node_modules, build folders
- Limit MaxDepth for large projects

#### `grep_search`
**Purpose:** Search file contents using ripgrep with regex patterns
```typescript
grep_search({
  SearchPath: string,           // Required: File or directory path
  Query: string,               // Required: Search pattern
  CaseSensitive?: boolean,     // Optional: Case sensitivity
  FixedStrings?: boolean,      // Optional: Literal string search
  Includes?: string[],         // Optional: File glob patterns
  MatchPerLine?: boolean       // Optional: Show context
})
```

**Usage Examples:**
```typescript
// Search for function definitions
grep_search({
  SearchPath: "/src",
  Query: "function.*handleSubmit",
  Includes: ["*.ts", "*.tsx"]
})

// Case-sensitive search
grep_search({
  SearchPath: "/src",
  Query: "API_KEY",
  CaseSensitive: true
})

// Literal string search
grep_search({
  SearchPath: "/src",
  Query: "localhost:3000",
  FixedStrings: true
})
```

**Best Practices:**
- Use FixedStrings for exact matches
- Use Includes to limit file types
- Be specific with Query to avoid noise
- Use MatchPerLine for context when needed

### 3. Directory Tools

#### `list_dir`
**Purpose:** List files and directories in a path
```typescript
list_dir({
  DirectoryPath: string        // Required: Absolute directory path
})
```

**Usage Examples:**
```typescript
// List directory contents
list_dir({ DirectoryPath: "/src/components" })

// Check if directory exists
list_dir({ DirectoryPath: "/path/to/check" })
```

**Best Practices:**
- Use absolute paths only
- Check for directory existence before operations
- Use find_by_name for more complex searches

### 4. Terminal Tools

#### `bash`
**Purpose:** Execute shell commands
```typescript
bash({
  CommandLine: string,         // Required: Command to execute
  Cwd?: string,               // Optional: Working directory
  Background?: boolean,       // Optional: Run in background
  WaitMsBeforeAsync?: number, // Optional: Wait before async
  SafeToAutoRun?: boolean     // Optional: Auto-run without approval
})
```

**Usage Examples:**
```typescript
// Run npm command
bash({
  CommandLine: "npm run dev",
  Cwd: "/project/client"
})

// Check git status
bash({
  CommandLine: "git status",
  Cwd: "/project"
})

// Background process
bash({
  CommandLine: "npm start",
  Background: true
})
```

**Best Practices:**
- Never use cd in CommandLine (use Cwd instead)
- Set SafeToAutoRun only for safe commands
- Use Background for long-running processes
- Check process status with command_status

#### `command_status`
**Purpose:** Check status of background commands
```typescript
command_status({
  CommandId: string,           // Required: Command ID from bash
  OutputCharacterCount?: number, // Optional: Limit output
  WaitDurationSeconds?: number   // Optional: Wait for completion
})
```

**Usage Examples:**
```typescript
// Check if command is still running
command_status({
  CommandId: "abc123",
  WaitDurationSeconds: 5
})

// Get limited output
command_status({
  CommandId: "abc123",
  OutputCharacterCount: 1000
})
```

**Best Practices:**
- Use WaitDurationSeconds for async operations
- Limit OutputCharacterCount for large outputs
- Poll status periodically for long operations

### 5. Memory Tools

#### `create_memory`
**Purpose:** Save context to memory database
```typescript
create_memory({
  Id?: string,                 // Optional: Update existing memory
  Title: string,               // Required: Memory title
  Content: string,             // Required: Memory content
  CorpusNames: string[],       // Required: Workspace names
  Tags: string[],              // Required: Search tags
  Action: "create" | "update" | "delete", // Required: Action
  UserTriggered?: boolean      // Optional: User requested
})
```

**Usage Examples:**
```typescript
// Create new memory
create_memory({
  Title: "SurveyJS Dropdown Implementation",
  Content: "Complete implementation guide...",
  CorpusNames: ["f:/Programming/tire-shop-pos"],
  Tags: ["surveyjs", "dropdown", "react", "ux"],
  Action: "create"
})

// Update existing memory
create_memory({
  Id: "memory-id",
  Title: "Updated Implementation Guide",
  Content: "Updated content...",
  CorpusNames: ["f:/Programming/tire-shop-pos"],
  Tags: ["surveyjs", "dropdown", "react", "ux"],
  Action: "update"
})
```

**Best Practices:**
- Use descriptive titles and tags
- Check for existing memories before creating
- Update memories when information changes
- Use snake_case for tags

### 6. Notebook Tools

#### `read_notebook`
**Purpose:** Read and parse Jupyter notebooks
```typescript
read_notebook({
  AbsolutePath: string         // Required: Path to .ipynb file
})
```

#### `edit_notebook`
**Purpose:** Edit Jupyter notebook cells
```typescript
edit_notebook({
  absolute_path: string,       // Required: Path to .ipynb file
  cell_number?: number,       // Optional: Cell index (0-based)
  cell_id?: string,           // Optional: Cell ID
  new_source: string,         // Required: New cell content
  cell_type?: "code" | "markdown", // Optional: Cell type
  edit_mode?: "replace" | "insert" // Optional: Edit mode
})
```

### 7. Web Tools

#### `read_url_content`
**Purpose:** Read content from URLs
```typescript
read_url_content({
  Url: string                 // Required: HTTP/HTTPS URL
})
```

#### `search_web`
**Purpose:** Web search with optional domain filter
```typescript
search_web({
  query: string,              // Required: Search query
  domain?: string             // Optional: Domain priority
})
```

#### `view_content_chunk`
**Purpose:** View specific chunk of web content
```typescript
view_content_chunk({
  document_id: string,        // Required: Document ID
  position: number            // Required: Chunk position
})
```

### 8. Browser Tools

#### `browser_preview`
**Purpose:** Spin up browser preview for web servers
```typescript
browser_preview({
  Url: string,                // Required: Server URL with scheme
  Name: string                // Required: Short display name
})
```

**Usage Examples:**
```typescript
// Preview local development server
browser_preview({
  Url: "http://localhost:5173",
  Name: "Frontend Dev Server"
})

// Preview backend API
browser_preview({
  Url: "http://localhost:3000",
  Name: "Backend API Server"
})
```

**Best Practices:**
- Include scheme (http:// or https://)
- Use descriptive names
- Check server is running before preview

### 9. Task Management Tools

#### `todo_list`
**Purpose:** Create and manage task lists
```typescript
todo_list({
  todos: Array<{
    id: string,                // Required: Unique ID
    content: string,           // Required: Task description
    status: "pending" | "in_progress" | "completed", // Required
    priority: "high" | "medium" | "low" // Required
  }>
})
```

**Usage Examples:**
```typescript
// Create new task list
todo_list({
  todos: [
    {
      id: "1",
      content: "Implement SurveyJS dropdown",
      status: "in_progress",
      priority: "high"
    },
    {
      id: "2",
      content: "Test dropdown functionality",
      status: "pending",
      priority: "medium"
    }
  ]
})
```

**Best Practices:**
- Use unique IDs for each task
- Mark tasks completed immediately when done
- Update status regularly
- Use descriptive content

### 10. Resource Tools

#### `list_resources`
**Purpose:** List available resources from MCP servers
```typescript
list_resources({
  ServerName: string          // Required: MCP server name
})
```

#### `read_resource`
**Purpose:** Read specific resource content
```typescript
read_resource({
  ServerName: string,         // Required: MCP server name
  Uri: string                 // Required: Resource URI
})
```

## 🎯 Usage Patterns from POS+Stock Project

### 1. File Operations Pattern
```typescript
// Read existing file
const content = await read_file({ file_path: "/path/to/file.ts" });

// Make edits
await edit({
  file_path: "/path/to/file.ts",
  old_string: "old code",
  new_string: "new code"
});

// Verify changes
const updated = await read_file({ file_path: "/path/to/file.ts" });
```

### 2. Search Pattern
```typescript
// Find all TypeScript files in directory
const files = await find_by_name({
  SearchDirectory: "/src",
  Pattern: "*.ts",
  Extensions: ["ts", "tsx"]
});

// Search for specific pattern
const results = await grep_search({
  SearchPath: "/src",
  Query: "function.*handle",
  Includes: ["*.ts", "*.tsx"]
});
```

### 3. Development Server Pattern
```typescript
// Start development server
await bash({
  CommandLine: "npm run dev",
  Cwd: "/project/client",
  Background: true
});

// Check server status
const status = await command_status({
  CommandId: "server-id",
  WaitDurationSeconds: 3
});

// Setup browser preview
await browser_preview({
  Url: "http://localhost:5173",
  Name: "Frontend Dev Server"
});
```

### 4. Task Management Pattern
```typescript
// Create task list
await todo_list({
  todos: [
    { id: "1", content: "Task 1", status: "pending", priority: "high" },
    { id: "2", content: "Task 2", status: "in_progress", priority: "medium" }
  ]
});

// Update task status
await todo_list({
  todos: [
    { id: "1", content: "Task 1", status: "completed", priority: "high" },
    { id: "2", content: "Task 2", status: "completed", priority: "medium" }
  ]
});
```

## 🚀 Best Practices Summary

### 1. File Operations
- Always read files before editing
- Use absolute paths consistently
- Verify exact string matches
- Use multi_edit for related changes

### 2. Search Operations
- Be specific with patterns
- Use appropriate filters
- Combine tools for complex searches
- Limit results for large projects

### 3. Terminal Operations
- Never use cd in commands
- Use Cwd parameter instead
- Set SafeToAutoRun carefully
- Monitor background processes

### 4. Error Handling
- Check tool responses for errors
- Handle missing files gracefully
- Verify operations succeeded
- Use appropriate timeouts

### 5. Performance
- Use limits for large files
- Batch related operations
- Use background processes for long tasks
- Cache results when appropriate

## 📚 Additional Resources

- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Tool Usage Examples](https://github.com/modelcontextprotocol/servers)
- [Best Practices Guide](https://modelcontextprotocol.io/docs/best-practices)

---

**Last Updated:** May 31, 2026  
**Version:** 1.0  
**Environment:** Windows PowerShell  
**Project:** POS+Stock Tire Shop System
