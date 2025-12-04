# Mandatory Workflow - Non-Negotiable Rules

## Core Principle
**TEST EVERYTHING ON SIMULATOR BEFORE SHOWING RESULTS**

---

## 1. Error Detection System

### Why I'm Missing Errors:
- Not checking process output frequently enough
- Not running diagnostics before committing
- Not testing on actual device/simulator
- Building features without verifying they work

### How to Catch ALL Errors:

#### A. Before Writing Any Code:
```bash
# Check current errors
getDiagnostics on all modified files
Check process logs
Verify no existing errors
```

#### B. After Writing Code:
```bash
# Immediate checks
1. getDiagnostics on new/modified files
2. Check process output for errors
3. Test on simulator
4. Verify logs show expected behavior
5. Test all user interactions
```

#### C. Where to Find Errors:

**Metro Bundler Logs:**
- Syntax errors
- Import errors
- Type errors
- Runtime errors

**Simulator Console:**
- Runtime errors
- API errors
- Navigation errors
- State errors

**Backend Logs:**
- API errors
- Database errors
- Authentication errors

**Diagnostics Tool:**
- TypeScript errors
- Linting errors
- Type mismatches

### Automated Error Checking:
```bash
# Run before every commit
npm run type-check
npm run lint
getDiagnostics on all files
Check process output
Test on simulator
```

---

## 2. Connection Error Fix

### The Error:
```
Could not connect to development server.
URL: http://192.168.100.91:8082/index.ts.bundle
```

### Root Cause:
- Metro bundler running on port 8081
- App trying to connect to port 8082
- Port mismatch

### Fix:
```bash
# 1. Kill all processes
pkill -f expo
pkill -f metro

# 2. Clear cache
cd frontend
rm -rf node_modules/.cache
rm -rf .expo

# 3. Restart clean
npx expo start --clear

# 4. Verify port
# Should show: Metro waiting on exp://192.168.100.91:8081
```

### Prevention:
- Always use `npx expo start --clear` after errors
- Check port in logs matches app config
- Verify network connectivity
- Test connection before building features

---

## 3. Mandatory Testing Workflow

### NON-NEGOTIABLE STEPS:

#### Step 1: Before Writing Code
- [ ] Check existing errors in logs
- [ ] Run diagnostics on all files
- [ ] Verify simulator is working
- [ ] Verify backend is running

#### Step 2: While Writing Code
- [ ] Write small increments
- [ ] Test each increment immediately
- [ ] Check logs after each change
- [ ] Fix errors immediately

#### Step 3: After Writing Code
- [ ] Run diagnostics
- [ ] Check process logs
- [ ] Test on simulator
- [ ] Verify all interactions work
- [ ] Check for UI cutting
- [ ] Verify logs show expected behavior

#### Step 4: Before Committing
- [ ] All diagnostics pass
- [ ] No errors in logs
- [ ] Tested on simulator
- [ ] All features work
- [ ] UI doesn't cut
- [ ] Navigation works

#### Step 5: Before Showing Results
- [ ] Everything tested
- [ ] Everything working
- [ ] Evidence collected (logs, screenshots)
- [ ] Can demonstrate working feature

### If ANY Step Fails:
**STOP. FIX. TEST. REPEAT.**

---

## 4. Ingrained Principles

### What I Must Always Do:
1. **Test on simulator myself** - Never ask others
2. **Find errors myself** - Check logs constantly
3. **Fix errors immediately** - Don't accumulate issues
4. **Show working features only** - Not half-done work
5. **Use infrastructure I build** - Don't just create it
6. **Apply patterns consistently** - BaseScreen on ALL screens
7. **Check logs continuously** - Every 5 minutes
8. **Verify everything works** - Before moving forward

### What I Must Never Do:
1. ❌ Ask others to test my code
2. ❌ Build without testing
3. ❌ Ignore errors in logs
4. ❌ Show broken features
5. ❌ Make excuses
6. ❌ Skip simulator testing
7. ❌ Commit without verification
8. ❌ Waste time on non-working code

---

## 5. Checklist for Every Task

### Before Starting:
- [ ] Understand the requirement
- [ ] Check current state
- [ ] Verify no existing errors
- [ ] Plan the implementation

### During Implementation:
- [ ] Write small increments
- [ ] Test each increment
- [ ] Check logs continuously
- [ ] Fix errors immediately

### After Implementation:
- [ ] Run diagnostics
- [ ] Test on simulator
- [ ] Verify all interactions
- [ ] Check logs for errors
- [ ] Test edge cases

### Before Showing:
- [ ] Everything works
- [ ] No errors in logs
- [ ] Tested thoroughly
- [ ] Can demonstrate
- [ ] Have evidence

---

## 6. Error Detection Automation

### Create Pre-Commit Hook:
```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "🔍 Running pre-commit checks..."

# 1. TypeScript check
echo "Checking TypeScript..."
npm run type-check || exit 1

# 2. Lint check
echo "Checking lint..."
npm run lint || exit 1

# 3. Check for console.errors
echo "Checking for errors in code..."
if grep -r "console.error" frontend/screens/ frontend/components/; then
  echo "⚠️  Found console.error - verify these are intentional"
fi

# 4. Check process is running
if ! pgrep -f "expo" > /dev/null; then
  echo "⚠️  Expo not running - start it to test"
fi

echo "✅ Pre-commit checks passed"
```

### Create Test Script:
```bash
#!/bin/bash
# test_before_commit.sh

echo "🧪 Testing before commit..."

# 1. Check diagnostics
echo "Running diagnostics..."
# Use getDiagnostics tool

# 2. Check process logs
echo "Checking logs..."
# Use getProcessOutput tool

# 3. Verify simulator
echo "Checking simulator..."
# Verify app is running

# 4. Run automated tests
echo "Running tests..."
npm test

echo "✅ All checks passed"
```

---

## 7. Session Workflow

### Start of Session:
1. Check what's running
2. Check for errors in logs
3. Review previous session notes
4. Plan what to build
5. Verify testing environment

### During Session:
1. Build small increments
2. Test each increment
3. Check logs every 5 minutes
4. Fix errors immediately
5. Document progress

### End of Session:
1. Run full test suite
2. Verify everything works
3. Document what's done
4. Document what's next
5. Commit only working code

---

## 8. Commitment

### I Will:
- ✅ Test everything on simulator
- ✅ Check logs continuously
- ✅ Fix errors immediately
- ✅ Show only working features
- ✅ Use the tools I build
- ✅ Be thorough and systematic
- ✅ Take responsibility for quality

### I Will Not:
- ❌ Ask others to test
- ❌ Build without testing
- ❌ Ignore errors
- ❌ Show broken code
- ❌ Make excuses
- ❌ Waste time

---

## This is Non-Negotiable

Every task follows this workflow.
Every feature is tested before showing.
Every error is caught and fixed.
Every commit is verified working.

**No exceptions. No shortcuts. No excuses.**
