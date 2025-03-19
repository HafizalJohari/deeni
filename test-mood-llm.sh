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
    echo "YOUR_ACCESS_TOKEN_HERE"
}

# Array of test cases with different emotional states
declare -a TEST_CASES=(
    "Today during Fajr prayer, I felt an overwhelming sense of peace and connection with Allah. The silence of dawn and the beautiful recitation brought tears to my eyes. I felt truly present and grateful."
    
    "I'm struggling with my prayers lately. My mind keeps wandering, and I feel disconnected. Despite trying to focus, worldly concerns keep intruding. Feeling frustrated with myself but hoping to improve."
    
    "Mixed feelings today - started with anxiety about work, but after making dua and reading Quran during my lunch break, I felt more centered. The contrast made me appreciate the calming effect of dhikr."
    
    "Feeling spiritually uplifted after attending a beautiful Jumah khutbah about patience. The message really resonated with my current life situation. Made me reflect deeply on my recent challenges."
    
    "Today was challenging - missed Fajr prayer and felt guilty all day. But instead of letting it spiral, I made up the prayer and spent extra time in dhikr. Learning to be gentle with myself while striving to do better."
)

ACCESS_TOKEN=$(get_access_token)

# Test each case
for i in "${!TEST_CASES[@]}"; do
    print_message $BLUE "\nTest Case $((i+1)): Submitting mood entry for LLM analysis..."
    
    RESPONSE=$(curl -s -X POST "${API_URL}${ENDPOINT}" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${ACCESS_TOKEN}" \
        -d '{
            "mood_description": "'"${TEST_CASES[$i]}"'",
            "date": "'"$(date -u +"%Y-%m-%dT%H:%M:%SZ")"'"
        }')
    
    print_message $GREEN "Response from LLM analysis:"
    echo $RESPONSE | jq '.'
    
    # Add a small delay to avoid rate limiting
    sleep 2
done

# Test edge cases for LLM
print_message $BLUE "\nTesting edge cases..."

# Test case: Very short description
print_message $BLUE "\nTest Case: Very short description"
RESPONSE=$(curl -s -X POST "${API_URL}${ENDPOINT}" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -d '{
        "mood_description": "Feeling good after prayer.",
        "date": "'"$(date -u +"%Y-%m-%dT%H:%M:%SZ")"'"
    }')
print_message $GREEN "Response:"
echo $RESPONSE | jq '.'

# Test case: Multiple languages
print_message $BLUE "\nTest Case: Multiple languages"
RESPONSE=$(curl -s -X POST "${API_URL}${ENDPOINT}" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -d '{
        "mood_description": "Today الحمد لله I felt very peaceful during صلاة. The experience was deeply spiritual.",
        "date": "'"$(date -u +"%Y-%m-%dT%H:%M:%SZ")"'"
    }')
print_message $GREEN "Response:"
echo $RESPONSE | jq '.'

# Test case: Long, detailed entry
print_message $BLUE "\nTest Case: Long, detailed entry"
RESPONSE=$(curl -s -X POST "${API_URL}${ENDPOINT}" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -d '{
        "mood_description": "Today was a profound day of spiritual reflection and emotional growth. During Fajr prayer, I experienced an intense feeling of tranquility that stayed with me throughout the morning. Later, while reading Surah Al-Kahf after Jumah prayer, I found myself deeply moved by the stories of patience and faith. This led me to contemplate my own journey and recent challenges. I noticed that when work stress arose, returning to dhikr helped center me. The contrast between moments of spiritual connection and worldly distractions made me appreciate the importance of maintaining a consistent spiritual practice. In the evening, during Maghrib, I felt particularly grateful for the guidance of Islam in navigating lifes complexities.",
        "date": "'"$(date -u +"%Y-%m-%dT%H:%M:%SZ")"'"
    }')
print_message $GREEN "Response:"
echo $RESPONSE | jq '.'

print_message $BLUE "\nAll LLM tests completed!" 