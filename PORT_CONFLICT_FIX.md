# Port Conflict Fix Documentation

## Problem Analysis

### Original Issue

When generating multiple frontend projects sequentially, the second, third, etc. projects would fail with:

- **Error Message**: "Server process exited with code 1"
- **HTTP Status**: 400 Bad Request
- **Root Cause**: Port conflict - all projects tried to use the same hardcoded port (8080)

### Error Flow

1. First project successfully starts on port 8080
2. Second project attempts to start on port 8080
3. Node.js server.listen() fails with EADDRINUSE error
4. npm start process exits with code 1
5. Backend service throws HttpException with status 400

## Solution Implementation

### 1. Dynamic Port Allocation

```typescript
private readonly BASE_PORT = 8080;
private static usedPorts: Set<number> = new Set();

private async findAvailablePort(): Promise<number> {
  for (let port = this.BASE_PORT; port < this.BASE_PORT + 100; port++) {
    if (!this.usedPorts.has(port) && await this.isPortAvailable(port)) {
      this.usedPorts.add(port);
      return port;
    }
  }
  throw new Error('No available ports found in range 8080-8179');
}
```

### 2. Port Availability Check

```typescript
private isPortAvailable(port: number): Promise<boolean> {
  const net = require('net');
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close();
      resolve(true);
    });
    server.on('error', () => resolve(false));
  });
}
```

### 3. Enhanced Error Handling

- **Port Conflict Detection**: Monitors stderr for EADDRINUSE errors
- **Automatic Cleanup**: Removes failed ports from usedPorts set
- **Better Error Messages**: Provides clear guidance to users

### 4. Server Tracking

```typescript
private static runningServers: Map<number, { projectName: string; processId?: number }> = new Map();

private registerRunningServer(port: number, projectName: string, processId?: number): void {
  GenerateNewProjectFrontendService.runningServers.set(port, { projectName, processId });
}
```

## Key Changes Made

### Modified Methods

1. **`setupVanillaProject()`**

   - Added `await this.findAvailablePort()`
   - Pass port to `generateProjectFiles()` and `startDevelopmentServer()`
   - Enhanced logging with assigned port

2. **`generateProjectFiles()`**

   - Now accepts `port: number` parameter
   - Generates server.js with dynamic port

3. **`startDevelopmentServer()`**

   - Now accepts `port: number` parameter
   - Enhanced error detection for port conflicts
   - Automatic cleanup on failures
   - Server registration for tracking

4. **`generateBasicHtml()`**
   - Removed hardcoded port reference from user message

## Benefits

### ✅ **Prevents Port Conflicts**

- Each project gets a unique port (8080, 8081, 8082, etc.)
- Automatic port availability checking
- Range of 100 ports available (8080-8179)

### ✅ **Better Error Handling**

- Clear error messages for port conflicts
- Automatic cleanup of failed allocations
- Graceful degradation with helpful suggestions

### ✅ **Server Tracking**

- Track all running development servers
- Monitor project names and process IDs
- Easy debugging and management

### ✅ **Enhanced User Experience**

- Multiple projects can run simultaneously
- Clear port assignment logging
- No need to manually stop previous projects

## Testing Scenarios

### Scenario 1: Multiple Project Generation

```bash
# First project
POST /generate-frontend/vanilla
{ "projectName": "Company Website" }
# Result: Success, port 8080

# Second project
POST /generate-frontend/vanilla
{ "projectName": "Landing Page" }
# Result: Success, port 8081

# Third project
POST /generate-frontend/vanilla
{ "projectName": "E-commerce Store" }
# Result: Success, port 8082
```

### Scenario 2: Port Conflict Recovery

```bash
# If port 8080 is externally occupied
POST /generate-frontend/vanilla
{ "projectName": "Test Project" }
# Result: Automatically uses port 8081
```

### Scenario 3: Error Recovery

```bash
# If a project fails to start
# The allocated port is automatically freed
# Next project can reuse the port
```

## Migration Notes

### Breaking Changes

- **None** - All changes are backward compatible
- Existing functionality remains unchanged
- Only internal port management improved

### New Features

- `getRunningServers()` method for monitoring
- Enhanced logging with port information
- Automatic port conflict resolution

## Monitoring

### Server Status

```typescript
// Get list of running servers
const runningServers = service.getRunningServers();
console.log(runningServers);
// Output: [
//   { port: 8080, projectName: "Company Website", processId: 12345 },
//   { port: 8081, projectName: "Landing Page", processId: 12346 }
// ]
```

### Log Messages

- `📡 Assigned port: 8081` - Port allocation
- `📝 Registered server for 'ProjectName' on port 8081` - Server registration
- `✅ Development server started successfully on port 8081!` - Success confirmation
- `❌ Port 8081 is already in use!` - Conflict detection
- `🔄 Server on port 8081 has stopped.` - Server cleanup

## Future Enhancements

### Potential Improvements

1. **Port Range Configuration**: Make port range configurable
2. **Server Management API**: Add endpoints to stop/start servers
3. **Health Monitoring**: Check server health status
4. **Load Balancing**: Distribute across multiple base ports
5. **Container Support**: Docker port mapping integration

This fix ensures reliable, scalable frontend project generation without port conflicts!
