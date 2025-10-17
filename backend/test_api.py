#!/usr/bin/env python3
"""
Comprehensive API test script for Umuhuza platform
Run: python test_api.py
"""

import requests
import json
from pprint import pprint

BASE_URL = "http://127.0.0.1:8000/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_success(msg):
    print(f"{Colors.GREEN}✓ {msg}{Colors.END}")

def print_error(msg):
    print(f"{Colors.RED}✗ {msg}{Colors.END}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ {msg}{Colors.END}")

def test_endpoint(method, endpoint, data=None, headers=None, description=""):
    """Test an API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    print_info(f"Testing: {method} {endpoint} - {description}")
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers)
        elif method == "PUT":
            response = requests.put(url, json=data, headers=headers)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers)
        
        if 200 <= response.status_code < 300:
            print_success(f"Status: {response.status_code}")
            return response.json() if response.content else {}
        else:
            print_error(f"Status: {response.status_code}")
            print_error(f"Error: {response.text}")
            return None
            
    except Exception as e:
        print_error(f"Exception: {str(e)}")
        return None

def main():
    print(f"\n{Colors.YELLOW}{'='*60}")
    print("🚀 UMUHUZA API TESTING SUITE")
    print(f"{'='*60}{Colors.END}\n")
    
    tokens = {}
    user_ids = {}
    listing_ids = {}
    
    # ========== AUTHENTICATION TESTS ==========
    print(f"\n{Colors.YELLOW}{'='*60}")
    print("📝 TESTING AUTHENTICATION")
    print(f"{'='*60}{Colors.END}\n")
    
    # Register User 1
    user1_data = {
        "user_firstname": "John",
        "user_lastname": "Doe",
        "email": "john@test.com",
        "phone_number": "+25779111111",
        "password": "SecurePass123",
        "password_confirm": "SecurePass123"
    }
    result = test_endpoint("POST", "/auth/register/", user1_data, description="Register User 1")
    if result:
        user_ids['user1'] = result['user']['userid']
        print(f"  User1 ID: {user_ids['user1']}")
    
    # Login User 1
    login_data = {"email": "john@test.com", "password": "SecurePass123"}
    result = test_endpoint("POST", "/auth/login/", login_data, description="Login User 1")
    if result:
        tokens['user1'] = result['tokens']['access']
        print(f"  User1 Token: {tokens['user1'][:20]}...")
    
    # Register User 2
    user2_data = {
        "user_firstname": "Jane",
        "user_lastname": "Smith",
        "email": "jane@test.com",
        "phone_number": "+25779222222",
        "password": "SecurePass123",
        "password_confirm": "SecurePass123"
    }
    result = test_endpoint("POST", "/auth/register/", user2_data, description="Register User 2")
    if result:
        user_ids['user2'] = result['user']['userid']
    
    # Login User 2
    login_data = {"email": "jane@test.com", "password": "SecurePass123"}
    result = test_endpoint("POST", "/auth/login/", login_data, description="Login User 2")
    if result:
        tokens['user2'] = result['tokens']['access']
    
    # Get Profile
    headers1 = {"Authorization": f"Bearer {tokens['user1']}"}
    test_endpoint("GET", "/auth/profile/", headers=headers1, description="Get User1 Profile")
    
    # ========== CATEGORY TESTS ==========
    print(f"\n{Colors.YELLOW}{'='*60}")
    print("📂 TESTING CATEGORIES")
    print(f"{'='*60}{Colors.END}\n")
    
    result = test_endpoint("GET", "/categories/", description="Get All Categories")
    
    # ========== LISTING TESTS ==========
    print(f"\n{Colors.YELLOW}{'='*60}")
    print("🏠 TESTING LISTINGS")
    print(f"{'='*60}{Colors.END}\n")
    
    # Create Listing
    listing_data = {
        "cat_id": 1,
        "listing_title": "Beautiful House in Bujumbura",
        "list_description": "3 bedrooms, 2 bathrooms, modern kitchen, large garden",
        "listing_price": 75000000,
        "list_location": "Bujumbura, Rohero"
    }
    result = test_endpoint("POST", "/listings/create/", listing_data, headers1, "Create Listing")
    if result:
        listing_ids['listing1'] = result['listing']['listing_id']
        print(f"  Listing ID: {listing_ids['listing1']}")
    
    # Get All Listings
    test_endpoint("GET", "/listings/", description="Get All Listings")
    
    # Get Listing Detail
    if 'listing1' in listing_ids:
        test_endpoint("GET", f"/listings/{listing_ids['listing1']}/", description="Get Listing Detail")
    
    # Get My Listings
    test_endpoint("GET", "/listings/my-listings/", headers=headers1, description="Get My Listings")
    
    # ========== FAVORITE TESTS ==========
    print(f"\n{Colors.YELLOW}{'='*60}")
    print("⭐ TESTING FAVORITES")
    print(f"{'='*60}{Colors.END}\n")
    
    if 'listing1' in listing_ids:
        headers2 = {"Authorization": f"Bearer {tokens['user2']}"}
        test_endpoint("POST", f"/favorites/{listing_ids['listing1']}/toggle/", headers=headers2, description="Add to Favorites")
        test_endpoint("GET", "/favorites/", headers=headers2, description="Get Favorites")
    
    # ========== MESSAGING TESTS ==========
    print(f"\n{Colors.YELLOW}{'='*60}")
    print("💬 TESTING MESSAGING")
    print(f"{'='*60}{Colors.END}\n")
    
    if 'listing1' in listing_ids:
        # Create Chat
        chat_data = {"listing_id": listing_ids['listing1']}
        result = test_endpoint("POST", "/chats/create/", chat_data, headers2, "Create Chat")
        chat_id = None
        if result:
            chat_id = result['chat']['chat_id']
            print(f"  Chat ID: {chat_id}")
        
        # Send Message
        if chat_id:
            message_data = {"content": "Hi! Is this still available?"}
            test_endpoint("POST", f"/chats/{chat_id}/messages/send/", message_data, headers2, "Send Message")
            
            # Get Messages
            test_endpoint("GET", f"/chats/{chat_id}/messages/", headers1, "Get Messages")
            
            # Get Chats
            test_endpoint("GET", "/chats/", headers=headers1, description="Get All Chats")
    
    # ========== NOTIFICATION TESTS ==========
    print(f"\n{Colors.YELLOW}{'='*60}")
    print("🔔 TESTING NOTIFICATIONS")
    print(f"{'='*60}{Colors.END}\n")
    
    test_endpoint("GET", "/notifications/", headers=headers1, description="Get Notifications")
    test_endpoint("GET", "/notifications/unread-count/", headers=headers1, description="Get Unread Count")
    
    # ========== REPORT TESTS ==========
    print(f"\n{Colors.YELLOW}{'='*60}")
    print("🚨 TESTING REPORTS")
    print(f"{'='*60}{Colors.END}\n")
    
    if 'listing1' in listing_ids:
        report_data = {
            "listing_id": listing_ids['listing1'],
            "report_type": "spam",
            "report_reason": "This looks like a duplicate listing"
        }
        test_endpoint("POST", "/reports/create/", report_data, headers2, "Submit Report")
        test_endpoint("GET", "/reports/my-reports/", headers=headers2, description="Get My Reports")
    
    # ========== SUMMARY ==========
    print(f"\n{Colors.YELLOW}{'='*60}")
    print("📊 TEST SUMMARY")
    print(f"{'='*60}{Colors.END}\n")
    print(f"Users Created: {len(user_ids)}")
    print(f"Listings Created: {len(listing_ids)}")
    print(f"Tokens Generated: {len(tokens)}")
    print(f"\n{Colors.GREEN}✓ All tests completed!{Colors.END}\n")

if __name__ == "__main__":
    main()