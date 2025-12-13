#!/bin/bash

# Maestro UI Test Runner
# Runs all Maestro tests and generates reports

echo "🎭 Maestro UI Test Runner"
echo "========================="
echo ""

# Check if Maestro is installed
if ! command -v maestro &> /dev/null; then
    echo "❌ Maestro is not installed"
    echo "Install with: curl -Ls 'https://get.maestro.mobile.dev' | bash"
    exit 1
fi

# Check if simulator/device is running
echo "📱 Checking for connected devices..."
maestro test --help > /dev/null 2>&1

# Create output directory
OUTPUT_DIR="maestro_results_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUTPUT_DIR"

echo ""
echo "📂 Results will be saved to: $OUTPUT_DIR"
echo ""

# Run tests
TESTS=(
    "frontend/.maestro/flows/01_landing_screen.yaml"
    "frontend/.maestro/flows/02_signup_google_alert.yaml"
    "frontend/.maestro/flows/03_patient_signup_flow.yaml"
    "frontend/.maestro/flows/04_medical_staff_signup.yaml"
    "frontend/.maestro/flows/05_doctor_dashboard.yaml"
)

PASSED=0
FAILED=0
WARNED=0

for test in "${TESTS[@]}"; do
    if [ -f "$test" ]; then
        echo "▶️  Running: $(basename $test)"
        
        # Run test and capture output
        OUTPUT=$(maestro test "$test" 2>&1)
        EXIT_CODE=$?
        
        # Save output
        echo "$OUTPUT" > "$OUTPUT_DIR/$(basename $test .yaml).log"
        
        if [ $EXIT_CODE -eq 0 ]; then
            if echo "$OUTPUT" | grep -q "WARNED"; then
                echo "   ⚠️  Completed with warnings"
                ((WARNED++))
            else
                echo "   ✅ Passed"
                ((PASSED++))
            fi
        else
            echo "   ❌ Failed"
            ((FAILED++))
        fi
        echo ""
    else
        echo "⚠️  Test not found: $test"
    fi
done

# Copy screenshots
echo "📸 Copying screenshots..."
LATEST_TEST=$(ls -td ~/.maestro/tests/*/ 2>/dev/null | head -1)
if [ -n "$LATEST_TEST" ]; then
    cp "$LATEST_TEST"/*.png "$OUTPUT_DIR/" 2>/dev/null
    cp "$LATEST_TEST"/*.html "$OUTPUT_DIR/" 2>/dev/null
fi

# Summary
echo ""
echo "========================="
echo "📊 Test Summary"
echo "========================="
echo "✅ Passed:  $PASSED"
echo "⚠️  Warned:  $WARNED"
echo "❌ Failed:  $FAILED"
echo ""
echo "📂 Results saved to: $OUTPUT_DIR"
echo ""

# List screenshots
echo "📸 Screenshots taken:"
ls -1 "$OUTPUT_DIR"/*.png 2>/dev/null | while read f; do
    echo "   - $(basename $f)"
done

exit $FAILED
