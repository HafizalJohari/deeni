#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BLUE='\033[0;34m'

# Configuration
API_URL="http://localhost:3000/api"
ENDPOINT="/personalization/mood-tracking"

# Function to print colored output
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to get the access token
get_access_token() {
    # You would typically get this from your authentication flow
    # For testing, you can paste a valid token here
    echo "eyJhbGciOiJIUzI1NiIsImtpZCI6IjVlSTZ5anlnRkVEN0d6UUUiLCJ0eXAiOiJKV1QifQ"
}

# Test 1: Submit a new mood entry
print_message $BLUE "\nTest 1: Submitting new mood entry..."
ACCESS_TOKEN=$(get_access_token)

RESPONSE=$(curl -s -X POST "${API_URL}${ENDPOINT}" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -d '{
        "mood_description": "Today I felt a deep sense of peace during Fajr prayer. The morning silence helped me focus, though I struggled with some distracting thoughts about work. Despite this, I maintained my concentration and felt a strong connection.",
        "date": "'"$(date -u +"%Y-%m-%dT%H:%M:%SZ")"'"
    }')

print_message $GREEN "Response from mood entry submission:"
echo $RESPONSE | jq '.'

# Test 2: Fetch mood entries
print_message $BLUE "\nTest 2: Fetching mood entries..."

ENTRIES_RESPONSE=$(curl -s -X GET "${API_URL}${ENDPOINT}" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}")

print_message $GREEN "Response from fetching mood entries:"
echo $ENTRIES_RESPONSE | jq '.'

# Test 3: Submit a mood entry with different emotions
print_message $BLUE "\nTest 3: Submitting mood entry with mixed emotions..."

RESPONSE=$(curl -s -X POST "${API_URL}${ENDPOINT}" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -d '{
        "mood_description": "I started the day feeling anxious about my responsibilities, but after Dhuhr prayer and reading some Quran, I experienced a sense of calm and clarity. The contrast between these emotions made me reflect on the power of worship.",
        "date": "'"$(date -u +"%Y-%m-%dT%H:%M:%SZ")"'"
    }')

print_message $GREEN "Response from second mood entry submission:"
echo $RESPONSE | jq '.'

# Test 4: Error case - empty description
print_message $BLUE "\nTest 4: Testing error case - empty description..."

RESPONSE=$(curl -s -X POST "${API_URL}${ENDPOINT}" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -d '{
        "mood_description": "",
        "date": "'"$(date -u +"%Y-%m-%dT%H:%M:%SZ")"'"
    }')

print_message $RED "Response from error case:"
echo $RESPONSE | jq '.'

print_message $BLUE "\nAll tests completed!" 