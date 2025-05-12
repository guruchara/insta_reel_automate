/**
 * NOTE: Use this on the your risk please don't use personal insta account 
 * 
 * Guru @2025 
 * Instagram Reels Extractor
 * 
 * This script extracts all reels links from a specific Instagram account.
 * How to use:
 * 1. Navigate to the Instagram profile you want to extract reels from
 * 2. Open browser developer tools (F12 or right-click > Inspect)
 * 3. Go to the Console tab
 * 4. Paste this script and press Enter
 * 5. The script will scroll through the profile and collect all reels links
 */

// Configuration
const SCROLL_DELAY = 1500; // Time to wait between scrolls (ms)
const MAX_SCROLLS = 100;   // Maximum number of scrolls to prevent infinite loops
const BASE_URL = 'https://www.instagram.com/reel/';

// Function to check if we're on an Instagram profile page
function checkIfOnInstagramProfile() {
  const url = window.location.href;
  if (!url.includes('instagram.com/') || url.includes('/p/') || url.includes('/reel/')) {
    console.error('❌ Please navigate to an Instagram profile page first.');
    return false;
  }
  return true;
}

// Function to extract username from current URL
function extractUsername() {
  const url = window.location.href;
  const match = url.match(/instagram\.com\/([^\/]+)/);
  return match ? match[1] : 'unknown_user';
}

// Function to find all reels links on the page
function findReelsLinks() {
  const links = Array.from(document.querySelectorAll('a'));
  return links.filter(link => {
    const href = link.getAttribute('href');
    return href && href.includes('/reel/');
  }).map(link => {
    const href = link.getAttribute('href');
    const reelCode = href.match(/\/reel\/([^\/]+)/);
    return reelCode ? BASE_URL + reelCode[1] : null;
  }).filter(Boolean);
}

// Function to scroll down the page
function scrollDown() {
  window.scrollTo(0, document.body.scrollHeight);
  return new Promise(resolve => setTimeout(resolve, SCROLL_DELAY));
}

// Main function to extract all reels
async function extractAllReels() {
  if (!checkIfOnInstagramProfile()) return;
  
  const username = extractUsername();
  console.log(`🔍 Starting extraction of reels from ${username}'s profile...`);
  
  const allReelsLinks = new Set();
  let prevSize = 0;
  let scrollCount = 0;
  let noNewLinksCount = 0;
  
  while (scrollCount < MAX_SCROLLS) {
    // Find reels links on current view
    const reelsLinks = findReelsLinks();
    reelsLinks.forEach(link => allReelsLinks.add(link));
    
    // Check if we found new links
    if (allReelsLinks.size === prevSize) {
      noNewLinksCount++;
      // If no new links found for 5 consecutive scrolls, we're probably at the end
      if (noNewLinksCount >= 5) {
        console.log('🛑 No new reels found after multiple scrolls. Likely reached the end.');
        break;
      }
    } else {
      noNewLinksCount = 0;
      console.log(`📌 Found ${allReelsLinks.size} reels so far...`);
    }
    
    prevSize = allReelsLinks.size;
    await scrollDown();
    scrollCount++;
  }
  
  if (scrollCount >= MAX_SCROLLS) {
    console.log(`⚠️ Reached maximum scroll limit (${MAX_SCROLLS}). Some reels might be missed.`);
  }
  
  // Convert Set to Array for output
  const finalReelsLinks = Array.from(allReelsLinks);
  
  // Display results
  console.log(`✅ Extraction complete! Found ${finalReelsLinks.length} reels for ${username}`);
  console.log('📋 Copy all links (formatted as array):');
  console.log(JSON.stringify(finalReelsLinks, null, 2));
  
  // Create a download link
  const filename = `${username}_reels_links.json`;
  const blob = new Blob([JSON.stringify(finalReelsLinks, null, 2)], {type: 'application/json'});
  const downloadUrl = URL.createObjectURL(blob);
  
  const downloadLink = document.createElement('a');
  downloadLink.href = downloadUrl;
  downloadLink.download = filename;
  downloadLink.textContent = `Download ${username}'s reels links as JSON`;
  downloadLink.style.position = 'fixed';
  downloadLink.style.top = '10px';
  downloadLink.style.left = '10px';
  downloadLink.style.zIndex = '10000';
  downloadLink.style.background = '#0095f6';
  downloadLink.style.color = 'white';
  downloadLink.style.padding = '10px 15px';
  downloadLink.style.borderRadius = '5px';
  downloadLink.style.textDecoration = 'none';
  downloadLink.style.fontFamily = 'Arial, sans-serif';
  
  // Add download button to page
  document.body.appendChild(downloadLink);
  
  return finalReelsLinks;
}

// Run the extraction
extractAllReels().then(reels => {
  console.log(`Total reels extracted: ${reels ? reels.length : 0}`);
}).catch(error => {
  console.error('❌ Error during extraction:', error);
});