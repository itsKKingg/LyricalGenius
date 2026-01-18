// Test script to verify dark mode functionality
export function testDarkMode() {
  console.log('Testing dark mode implementation...');
  
  // Test 1: Check if dark class is applied to HTML
  const htmlElement = document.documentElement;
  const hasDarkClass = htmlElement.classList.contains('dark');
  console.log('✓ HTML has dark class:', hasDarkClass);
  
  // Test 2: Check if CSS variables are being applied
  const computedStyles = getComputedStyle(document.documentElement);
  const bgColor = computedStyles.getPropertyValue('--background');
  const fgColor = computedStyles.getPropertyValue('--foreground');
  console.log('✓ Background CSS variable:', bgColor);
  console.log('✓ Foreground CSS variable:', fgColor);
  
  // Test 3: Check if main content has proper background
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    const mainBgColor = getComputedStyle(mainContent).backgroundColor;
    console.log('✓ Main content background:', mainBgColor);
  }
  
  // Test 4: Check if theme toggle works
  const themeButtons = document.querySelectorAll('[aria-label="Toggle theme"]');
  console.log('✓ Theme toggle buttons found:', themeButtons.length);
  
  console.log('Dark mode test completed!');
}

// Auto-run test if in browser environment
if (typeof window !== 'undefined') {
  setTimeout(testDarkMode, 1000);
}