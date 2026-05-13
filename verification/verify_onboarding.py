from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    # Set standard viewport
    page.set_viewport_size({"width": 1280, "height": 800})

    # We can't really login without real credentials and supabase,
    # but we can try to navigate to the pages we created.
    # For verification in this environment, I'll focus on UI structure and presence of components.

    # Check 404 page
    print("Checking 404 page...")
    try:
        page.goto("http://localhost:3000/404-test-page", timeout=60000)
        page.wait_for_timeout(5000)
        page.screenshot(path="verification/screenshots/404_page.png")
    except Exception as e:
        print(f"Error checking 404 page: {e}")

    # Check Help page
    print("Checking Help page...")
    try:
        page.goto("http://localhost:3000/dashboard/help", timeout=60000)
        page.wait_for_timeout(5000)
        page.screenshot(path="verification/screenshots/help_page.png")
    except Exception as e:
        print(f"Error checking Help page: {e}")

    # Check Audit page
    print("Checking Audit page...")
    try:
        page.goto("http://localhost:3000/dashboard/audit", timeout=60000)
        page.wait_for_timeout(5000)
        page.screenshot(path="verification/screenshots/audit_page.png")
    except Exception as e:
        print(f"Error checking Audit page: {e}")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        except Exception as e:
            print(f"Error during verification: {e}")
        finally:
            context.close()
            browser.close()
