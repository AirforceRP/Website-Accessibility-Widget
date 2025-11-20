# Accessibility Widget by AirforceRP

[![License](https://img.shields.io/badge/license-Free-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](CHANGELOG.md)
[![GitHub](https://img.shields.io/badge/GitHub-Open%20Source-black)](https://github.com/airforcerp/Website-Accessibility-Widget)

A comprehensive, lightweight, self-contained accessibility plugin that provides extensive customization options including text-to-speech, color blindness filters, and many other accessibility features. Perfect for shared web servers as it requires no server-side configuration.

## 🌟 Overview

The Accessibility Widget is designed to make websites more inclusive and accessible to all users, regardless of their abilities or disabilities. With 20+ accessibility features, this plugin helps websites comply with WCAG (Web Content Accessibility Guidelines) and provides users with the tools they need to customize their browsing experience.

### Why Use This Plugin?

- ✅ **Zero Dependencies** - Pure JavaScript and CSS
- ✅ **Lightweight** - Minimal performance impact
- ✅ **Easy Integration** - Works with any HTML/PHP page
- ✅ **Fully Customizable** - Extensive configuration options
- ✅ **Mobile Friendly** - Responsive design for all devices
- ✅ **Open Source** - Free to use and modify
- ✅ **WCAG Compliant** - Follows accessibility best practices

## ✨ Features

### 📝 Text & Display Customization

The plugin offers comprehensive text customization options to help users with reading difficulties, dyslexia, or visual impairments:

- **Font Size Adjustment**: 
  - 75% (Small) - For users who prefer compact text
  - 100% (Normal) - Default size
  - 125% (Large) - Slightly larger for easier reading
  - 150% (Extra Large) - Significantly larger text
  - 200% (Huge) - Maximum size for severe visual impairments
  
- **Contrast Modes**: 
  - **Normal**: Standard contrast
  - **High Contrast**: Enhanced contrast for low vision users
  - **Dark Mode**: Dark background with light text to reduce eye strain
  
- **Line Height**: 
  - Normal spacing for standard reading
  - Large spacing for users who need more vertical space between lines
  
- **Letter Spacing**: 
  - Normal spacing for standard text
  - Wide spacing to help users with dyslexia distinguish letters better
  
- **Font Family Options**: 
  - Default: Uses the website's default font
  - Sans Serif: Clean, modern fonts like Arial or Helvetica
  - Serif: Traditional fonts like Times New Roman
  - Monospace: Fixed-width fonts like Courier

### 🎨 Color & Vision Support

Comprehensive color vision support for users with various types of color blindness:

- **Color Blindness Filters**: 
  - **Protanopia** (Red-Blind): Simulates red-green color blindness where red appears darker
  - **Deuteranopia** (Green-Blind): Simulates red-green color blindness where green appears darker
  - **Tritanopia** (Blue-Blind): Simulates blue-yellow color blindness
  - **Achromatopsia** (Total Color Blind): Converts everything to grayscale
  
- **High Contrast Mode**: Increases contrast between text and background for better visibility

### 📖 Reading & Navigation Tools

Advanced reading assistance tools for users with reading difficulties:

- **Text-to-Speech (TTS)**: 
  - Read selected text aloud
  - Read entire page content (first 5000 characters)
  - Adjustable speech rate (0.5x to 2.0x speed)
  - Adjustable pitch (0 to 2.0)
  - Adjustable volume (0 to 1.0)
  - Multiple voice support (browser-dependent)
  - Word-by-word highlighting as text is read
  
- **Reading Guide**: 
  - Visual guide line that follows your cursor
  - Helps with tracking while reading long passages
  - Customizable height and color
  
- **Reading Mask**: 
  - Hides text below the reading position
  - Reduces distractions while reading
  - Adjustable mask height (3 lines default)
  
- **Text Highlight**: 
  - Highlights text as you read
  - Helps maintain focus on current reading position
  
- **Image Alt Text Display**: 
  - Shows image descriptions (alt text) when hovering over images
  - Helps users understand image content

### ♿ Accessibility Tools

Essential accessibility features for users with various needs:

- **Enhanced Focus Indicator**: 
  - High-contrast focus outlines for keyboard navigation
  - Makes it clear which element has focus
  - Essential for keyboard-only users
  
- **Stop Animations**: 
  - Disables all CSS animations and transitions
  - Reduces motion for users with vestibular disorders
  - Helps prevent motion sickness
  
- **Underline All Links**: 
  - Makes all links clearly visible with underlines
  - Helps users identify clickable elements
  - Improves link visibility
  
- **Persistent Settings**: 
  - Uses browser localStorage to remember user preferences
  - Settings persist across page reloads
  - Per-domain storage
  
- **Keyboard Navigation**: 
  - Full keyboard support
  - Tab navigation through all controls
  - Enter/Space to activate buttons
  - Escape to close panels

### 🎯 Additional Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Configurable**: Easy to customize via config file
- **No Dependencies**: Pure JavaScript and CSS, no frameworks required
- **Lightweight**: Minimal performance impact
- **Cross-Browser**: Works on all modern browsers
- **Print-Friendly**: Widget is hidden when printing

## Installation

### Option 1: CDN (Recommended)

Use jsDelivr CDN for easy installation without hosting files yourself:

#### Via npm (Recommended)
```html
<!-- Include Boxicons for icons (required) -->
<link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css">

<!-- Include the CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/website-accessibility-filter@latest/accessibility-plugin.css">

<!-- Include the config (optional - customize as needed) -->
<script src="https://cdn.jsdelivr.net/npm/website-accessibility-filter@latest/accessibility-config.js"></script>

<!-- Include the plugin (must be loaded last) -->
<script src="https://cdn.jsdelivr.net/npm/website-accessibility-filter@latest/accessibility-plugin.js"></script>
```

#### Via GitHub
```html
<!-- Include Boxicons for icons (required) -->
<link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css">

<!-- Include the CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/airforcerp/Website-Accessibility-Widget@latest/accessibility-plugin.css">

<!-- Include the config (optional - customize as needed) -->
<script src="https://cdn.jsdelivr.net/gh/airforcerp/Website-Accessibility-Widget@latest/accessibility-config.js"></script>

<!-- Include the plugin (must be loaded last) -->
<script src="https://cdn.jsdelivr.net/gh/airforcerp/Website-Accessibility-Widget@latest/accessibility-plugin.js"></script>
```

**Note:** Replace `@latest` with a specific version tag (e.g., `@1.0.0`) for production use to ensure stability.

### Option 2: Manual Installation

1. Upload the following files to your web server:
   - `accessibility-plugin.js`
   - `accessibility-plugin.css`
   - `accessibility-config.js` 

2. Include the files in your HTML or PHP pages:

```html
<!-- Include Boxicons for icons (required) -->
<link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css">

<!-- Include the CSS -->
<link rel="stylesheet" href="path/to/accessibility-plugin.css">

<!-- Include the config -->
<script src="path/to/accessibility-config.js"></script>

<!-- Include the plugin (must be loaded last) -->
<script src="path/to/accessibility-plugin.js"></script>
```

## Configuration

Edit `accessibility-config.js` to customize the plugin:

```javascript
var AccessibilityConfig = {
    position: 'bottom-right',    // 'bottom-left' or 'bottom-right'
    buttonText: 'Accessibility', // Text on the toggle button
    showReset: true,             // Show reset button (true/false)
    fontSize: 100,               // Default font size percentage
    contrast: 'normal',          // 'normal', 'high', or 'dark'
    lineHeight: 'normal',       // 'normal' or 'large'
    letterSpacing: 'normal',    // 'normal' or 'wide'
    fontFamily: 'default',      // 'default', 'sans-serif', 'serif', 'monospace'
    colorBlindness: 'none',     // 'none', 'protanopia', 'deuteranopia','tritanopia', 'achromatopsia'
    focusIndicator: false,      // Enable focus indicator (true/false)
    readingGuide: false,         // Enable reading guide (true/false)
    stopAnimations: false,       // Stop animations (true/false)
    underlineLinks: false,      // Underline all links (true/false)
    showImageAlt: false,        // Show image alt text (true/false)
    ttsEnabled: false,          // Enable text-to-speech (true/false)
    ttsRate: 1.0,               // TTS speech rate (0.5 to 2.0)
    ttsPitch: 1.0,              // TTS pitch (0 to 2.0)
    ttsVolume: 1.0              // TTS volume (0 to 1.0)
};
```

If you don't include the config file, the plugin will use default settings.

## Usage Examples

### Basic HTML Page

```html
<!DOCTYPE html>
<html>
<head>
    <!-- Include Boxicons for icons (required) -->
    <link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css">
    
    <!-- Include the CSS -->
    <link rel="stylesheet" href="accessibility-plugin.css">
    
    <!-- Include the config -->
    <script src="accessibility-config.js"></script>
    
    <!-- Include the plugin (must be loaded last) -->
    <script src="accessibility-plugin.js"></script>
</head>
<body>
    <!-- Your content here -->
</body>
</html>
```

### PHP Page

```php
<!DOCTYPE html>
<html>
<head>
    <!-- Include Boxicons for icons (required) -->
    <link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css">
    
    <!-- Include the CSS -->
    <link rel="stylesheet" href="accessibility-plugin.css">
    
    <!-- Include the config -->
    <script src="accessibility-config.js"></script>
    
    <!-- Include the plugin (must be loaded last) -->
    <script src="accessibility-plugin.js"></script>
</head>
<body>
    <?php
    // Your PHP content here
    ?>
</body>
</html>
```

### WordPress Integration

Add to your theme's `functions.php`:

```php
function add_accessibility_plugin() {
    wp_enqueue_style('accessibility-plugin', get_template_directory_uri() . '/accessibility-plugin.css');
    wp_enqueue_script('accessibility-config', get_template_directory_uri() . '/accessibility-config.js', array(), '1.0', false);
    wp_enqueue_script('accessibility-plugin', get_template_directory_uri() . '/accessibility-plugin.js', array(), '1.0', true);
}
add_action('wp_enqueue_scripts', 'add_accessibility_plugin');
```

## 🔧 JavaScript API

The plugin exposes a global `AccessibilityPlugin` object for programmatic control. This allows you to integrate accessibility features into your own JavaScript code.

### API Methods

#### `AccessibilityPlugin.toggle()`
Opens or closes the accessibility panel.

```javascript
// Toggle the panel
AccessibilityPlugin.toggle();
```

#### `AccessibilityPlugin.reset()`
Resets all settings to their default values.

```javascript
// Reset to default settings
AccessibilityPlugin.reset();
```

#### `AccessibilityPlugin.getSettings()`
Returns an object containing all current accessibility settings.

```javascript
// Get current settings
const settings = AccessibilityPlugin.getSettings();
console.log(settings);
// Output: { fontSize: 100, contrast: 'normal', colorBlindness: 'none', ... }
```

#### `AccessibilityPlugin.setFontSize(size)`
Sets the font size percentage.

**Parameters:**
- `size` (number): Font size percentage. Valid values: 75, 100, 125, 150, or 200

```javascript
// Set font size to 150%
AccessibilityPlugin.setFontSize(150);

// Set font size to 200% (huge)
AccessibilityPlugin.setFontSize(200);
```

#### `AccessibilityPlugin.setContrast(mode)`
Sets the contrast mode.

**Parameters:**
- `mode` (string): Contrast mode. Valid values: 'normal', 'high', or 'dark'

```javascript
// Set high contrast mode
AccessibilityPlugin.setContrast('high');

// Set dark mode
AccessibilityPlugin.setContrast('dark');

// Return to normal contrast
AccessibilityPlugin.setContrast('normal');
```

#### `AccessibilityPlugin.setColorBlindness(type)`
Sets the color blindness filter.

**Parameters:**
- `type` (string): Color blindness type. Valid values: 'none', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'

```javascript
// Apply protanopia filter
AccessibilityPlugin.setColorBlindness('protanopia');

// Apply deuteranopia filter
AccessibilityPlugin.setColorBlindness('deuteranopia');

// Remove color blindness filter
AccessibilityPlugin.setColorBlindness('none');
```

#### `AccessibilityPlugin.speak(text)`
Speaks the provided text using text-to-speech.

**Parameters:**
- `text` (string): The text to be spoken

```javascript
// Speak custom text
AccessibilityPlugin.speak('Hello, this is text-to-speech');

// Speak page content
AccessibilityPlugin.speak(document.body.innerText);
```

#### `AccessibilityPlugin.stopSpeaking()`
Stops the current text-to-speech playback.

```javascript
// Stop speaking
AccessibilityPlugin.stopSpeaking();
```

### API Usage Examples

#### Example 1: Auto-adjust font size based on user preference

```javascript
// Check if user prefers larger text
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    AccessibilityPlugin.setFontSize(125);
}
```

#### Example 2: Apply high contrast for users with low vision

```javascript
// Detect if user prefers high contrast
if (window.matchMedia('(prefers-contrast: high)').matches) {
    AccessibilityPlugin.setContrast('high');
}
```

#### Example 3: Integrate with your own UI

```javascript
// Create a custom button that toggles accessibility
document.getElementById('myAccessibilityBtn').addEventListener('click', function() {
    AccessibilityPlugin.toggle();
});

// Create a button to increase font size
document.getElementById('increaseFontBtn').addEventListener('click', function() {
    const current = AccessibilityPlugin.getSettings();
    const sizes = [75, 100, 125, 150, 200];
    const currentIndex = sizes.indexOf(current.fontSize);
    if (currentIndex < sizes.length - 1) {
        AccessibilityPlugin.setFontSize(sizes[currentIndex + 1]);
    }
});
```

#### Example 4: Save and restore user preferences

```javascript
// Save user preferences
function savePreferences() {
    const settings = AccessibilityPlugin.getSettings();
    localStorage.setItem('accessibilityPrefs', JSON.stringify(settings));
}

// Restore user preferences
function restorePreferences() {
    const saved = localStorage.getItem('accessibilityPrefs');
    if (saved) {
        const settings = JSON.parse(saved);
        AccessibilityPlugin.setFontSize(settings.fontSize);
        AccessibilityPlugin.setContrast(settings.contrast);
        AccessibilityPlugin.setColorBlindness(settings.colorBlindness);
    }
}

// Call on page load
window.addEventListener('load', restorePreferences);
```

## 🌐 Browser Compatibility

The Accessibility Widget is tested and works on the following browsers:

### Desktop Browsers
- ✅ **Chrome** 90+ (Full support)
- ✅ **Edge** 90+ (Full support)
- ✅ **Firefox** 88+ (Full support)
- ✅ **Safari** 14+ (Full support)
- ⚠️ **Opera** 76+ (Full support, Chromium-based)

### Mobile Browsers
- ✅ **iOS Safari** 14+ (Full support)
- ✅ **Chrome Mobile** (Android) (Full support)
- ✅ **Samsung Internet** (Full support)
- ✅ **Firefox Mobile** (Full support)

### Feature Support Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Font Size | ✅ | ✅ | ✅ | ✅ |
| Contrast Modes | ✅ | ✅ | ✅ | ✅ |
| Color Blindness Filters | ✅ | ✅ | ✅ | ✅ |
| Text-to-Speech | ✅ | ✅ | ✅ | ✅ |
| Reading Guide | ✅ | ✅ | ✅ | ✅ |
| Reading Mask | ✅ | ✅ | ✅ | ✅ |
| Focus Indicator | ✅ | ✅ | ✅ | ✅ |
| Stop Animations | ✅ | ✅ | ✅ | ✅ |
| Persistent Settings | ✅ | ✅ | ✅ | ✅ |

### Known Browser Limitations

- **Text-to-Speech**: Requires browser support for Web Speech API. Best support in Chrome, Edge, and Safari. Firefox has limited TTS support.
- **Color Blindness Filters**: Uses SVG filters which may have slight performance impact on very large pages in older browsers.
- **localStorage**: All modern browsers support localStorage. Older browsers (IE10 and below) may not support it.

## 📁 File Structure

```
accessibility-plugin/
├── web/
│   ├── accessibility-plugin.js      # Main plugin logic (1618 lines)
│   ├── accessibility-plugin.css    # Plugin styles (885 lines)
│   ├── accessibility-config.js      # Configuration file
│   ├── example.html                  # HTML example
│   └── example-php.php              # PHP example
├── index.html                        # Demo/landing page
├── README.md                         # This file (main documentation)
├── RELEASE_NOTES.md                  # Release notes
├── CHANGELOG.md                      # Version changelog
└── JSDELIVR-SETUP.md                 # CDN setup instructions
```

### File Descriptions

- **accessibility-plugin.js**: Contains all the plugin logic, including widget creation, settings management, TTS functionality, and color blindness filters.
- **accessibility-plugin.css**: Contains all styles for the widget, panel, and accessibility features.
- **accessibility-config.js**: Configuration file that allows you to customize default settings.
- **example.html**: Complete HTML example showing how to integrate the plugin.
- **example-php.php**: Complete PHP example showing how to integrate the plugin in PHP pages.
- **index.html**: Beautiful demo/landing page showcasing all features.

## 🎨 Customization

### Changing Colors and Styling

You can customize the appearance of the widget by editing the CSS file or adding custom CSS:

#### Change Button Color

```css
.accessibility-toggle-btn {
    background: #0066cc; /* Change button color */
    color: #ffffff;       /* Change text color */
}

.accessibility-toggle-btn:hover {
    background: #0052a3;  /* Change hover color */
}
```

#### Change Panel Header Color

```css
.accessibility-panel-header {
    background: #0066cc;  /* Change header color */
    color: #ffffff;      /* Change header text color */
}
```

#### Change Panel Background

```css
.accessibility-panel {
    background: #ffffff;  /* Change panel background */
}

.accessibility-panel-content {
    background: #f9f9f9; /* Change content background */
}
```

#### Change Widget Position

You can change the widget position via CSS:

```css
/* Move to top-right */
.accessibility-widget {
    top: 20px !important;
    right: 20px !important;
    bottom: auto !important;
}

/* Move to top-left */
.accessibility-widget {
    top: 20px !important;
    left: 20px !important;
    right: auto !important;
    bottom: auto !important;
}
```

### Customizing Default Settings

Edit `accessibility-config.js` to change default settings:

```javascript
var AccessibilityConfig = {
    position: 'bottom-right',    // Widget position
    buttonText: 'Accessibility', // Button text
    showReset: true,             // Show reset button
    fontSize: 125,               // Default to larger text
    contrast: 'high',            // Default to high contrast
    // ... more options
};
```

### Adding Custom Options

To add custom accessibility options, you'll need to modify `accessibility-plugin.js`:

1. **Add to defaultSettings**:
```javascript
const defaultSettings = {
    // ... existing settings
    myCustomOption: false,  // Add your custom option
};
```

2. **Add to currentState**:
```javascript
let currentState = {
    // ... existing state
    myCustomOption: settings.myCustomOption,
};
```

3. **Add UI control in createWidget()**:
```javascript
// Add your control to the widget panel
const myControl = createControl('My Custom Option', 'myCustomOption', [
    { value: false, label: 'Off' },
    { value: true, label: 'On' }
], currentState.myCustomOption);
```

4. **Implement logic in applySettings()**:
```javascript
function applySettings() {
    // ... existing settings
    if (currentState.myCustomOption) {
        // Your custom logic here
        document.body.classList.add('my-custom-class');
    } else {
        document.body.classList.remove('my-custom-class');
    }
}
```

### Theming

You can create custom themes by overriding CSS variables (if supported) or by directly modifying the CSS classes:

```css
/* Custom theme example */
.accessibility-widget {
    --primary-color: #8b5cf6;
    --primary-hover: #7c3aed;
}

.accessibility-toggle-btn {
    background: var(--primary-color);
}

.accessibility-toggle-btn:hover {
    background: var(--primary-hover);
}
```

## 💡 Usage Tips & Best Practices

### Text-to-Speech

**For Users:**
1. Enable TTS in the plugin panel by toggling the "Text-to-Speech" option
2. Select any text on the page and click "Read Selected Text" to hear it
3. Click "Read Selected Text" without selecting text to read the entire page (first 5000 characters)
4. Click "Stop Reading" to stop the current speech
5. Adjust speech rate, pitch, and volume in the TTS settings

**For Developers:**
- TTS works best in Chrome, Edge, and Safari
- Firefox has limited TTS support
- TTS requires user interaction (can't auto-play)
- Maximum text length is 5000 characters for full page reading

### Reading Guide

**For Users:**
- Enable the reading guide to get a visual line that follows your cursor
- Helps with tracking while reading long passages
- Particularly useful for users with dyslexia or attention disorders
- The guide line is customizable in height and color

**For Developers:**
- The reading guide uses CSS transforms for smooth movement
- It's positioned absolutely and follows mouse movement
- Can be disabled via CSS if needed

### Color Blindness Filters

**For Users:**
- Choose from different color blindness types to see how the page appears
- Useful for understanding how color-dependent content looks
- Filters are applied in real-time
- Can be combined with other accessibility features

**For Developers:**
- Filters use SVG filters which may impact performance on very large pages
- Consider testing your site with different filters during development
- Ensure important information doesn't rely solely on color
- Use patterns, icons, or text labels in addition to color

### Font Size Adjustment

**Best Practices:**
- Test your layout with all font sizes (75% to 200%)
- Ensure text doesn't overflow containers at larger sizes
- Use relative units (em, rem) instead of fixed pixels
- Test responsive breakpoints with different font sizes

### Contrast Modes

**High Contrast Mode:**
- Increases contrast between text and background
- Essential for users with low vision
- Test your site in high contrast mode during development

**Dark Mode:**
- Reduces eye strain in low-light conditions
- Popular among users with light sensitivity
- Ensure your content is readable in dark mode

### Performance Tips

1. **Lazy Loading**: The plugin loads on page load. For better performance, consider lazy loading on user interaction.
2. **CDN Usage**: Use the CDN version for better caching and performance.
3. **Minification**: For production, consider minifying the JavaScript and CSS files.
4. **Filter Performance**: Color blindness filters may impact performance on pages with many images. Consider optimizing images.

### Accessibility Best Practices

1. **Don't Rely on Color Alone**: Use color in combination with icons, patterns, or text.
2. **Keyboard Navigation**: Ensure all functionality is accessible via keyboard.
3. **Focus Indicators**: The plugin provides enhanced focus indicators - don't disable them.
4. **Alt Text**: Always provide meaningful alt text for images.
5. **Semantic HTML**: Use proper HTML semantics for better screen reader support.
6. **Testing**: Test your site with various accessibility features enabled.

## 📝 Important Notes

### Storage
- Settings are saved in browser localStorage
- Settings are per-domain (each website has its own settings)
- Users can clear settings by clearing browser data
- Settings persist across page reloads and browser sessions

### Compatibility
- The plugin works on any HTML/PHP page without server-side requirements
- All styles are scoped to avoid conflicts with existing page styles
- The widget is hidden when printing (via CSS media queries)
- TTS requires browser support for Web Speech API (Chrome, Edge, Safari)
- Color blindness filters use SVG filters and may have slight performance impact on very large pages

### Security
- The plugin uses only client-side JavaScript
- No data is sent to external servers
- All settings are stored locally in the browser
- The plugin is safe to use on any website

### Performance
- Minimal performance impact (< 50KB total file size)
- Lazy initialization (only loads when needed)
- Efficient CSS selectors
- Optimized JavaScript code

## 🔍 Troubleshooting

### Widget Not Appearing

**Problem**: The widget button doesn't appear on the page.

**Solutions**:
1. Check that all files are loaded correctly (check browser console for errors)
2. Ensure Boxicons CSS is loaded before the plugin CSS
3. Verify that `accessibility-plugin.js` is loaded last
4. Check for JavaScript errors in the browser console
5. Ensure no other scripts are conflicting

### Text-to-Speech Not Working

**Problem**: TTS doesn't speak or shows an error.

**Solutions**:
1. Check browser compatibility (Chrome, Edge, Safari work best)
2. Ensure TTS is enabled in the plugin panel
3. Check browser permissions for speech synthesis
4. Try selecting text before clicking "Read Selected Text"
5. Check browser console for error messages

### Settings Not Persisting

**Problem**: Settings reset when the page reloads.

**Solutions**:
1. Check if localStorage is enabled in the browser
2. Check browser console for localStorage errors
3. Ensure cookies/localStorage aren't blocked
4. Try in a different browser to isolate the issue

### Color Blindness Filter Not Working

**Problem**: Color blindness filter doesn't apply or causes issues.

**Solutions**:
1. Check browser compatibility (modern browsers required)
2. Ensure SVG filters are supported
3. Check for CSS conflicts
4. Try disabling other filters/effects
5. Check browser console for errors

### Widget Disappears with Filters

**Problem**: Widget disappears when color blindness filters are applied.

**Solutions**:
1. This is a known issue that has been fixed in recent versions
2. Ensure you're using the latest version of the plugin
3. Check that custom CSS isn't interfering
4. The widget should remain visible with proper CSS isolation

### Performance Issues

**Problem**: Page becomes slow with the plugin enabled.

**Solutions**:
1. Disable color blindness filters if not needed
2. Use CDN version for better caching
3. Check for conflicts with other scripts
4. Consider lazy loading the plugin
5. Optimize images on your page

## ❓ Frequently Asked Questions (FAQ)

### Q: Is this plugin free to use?
**A:** Yes! The plugin is completely free to use and modify for any purpose.

### Q: Do I need to host the files myself?
**A:** No, you can use the CDN version which doesn't require hosting the files yourself.

### Q: Does it work with WordPress?
**A:** Yes! See the WordPress integration section in the README.

### Q: Can I customize the appearance?
**A:** Yes! You can customize colors, position, and styling via CSS or the config file.

### Q: Does it work on mobile devices?
**A:** Yes! The plugin is fully responsive and works on all mobile devices.

### Q: Will it slow down my website?
**A:** No, the plugin is lightweight and has minimal performance impact.

### Q: Does it comply with WCAG guidelines?
**A:** Yes, the plugin helps websites comply with WCAG 2.1 guidelines.

### Q: Can I use it on multiple websites?
**A:** Yes, you can use it on as many websites as you want.

### Q: Does it require server-side configuration?
**A:** No, it's completely client-side and requires no server configuration.

### Q: Can I modify the code?
**A:** Yes! The code is open source and you're free to modify it.

### Q: How do I report bugs or request features?
**A:** Please open an issue on GitHub or email accessibility@airforcerp.com

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Report Bugs**: Open an issue on GitHub with detailed information
2. **Suggest Features**: Share your ideas for new features
3. **Submit Pull Requests**: Contribute code improvements
4. **Improve Documentation**: Help make the docs better
5. **Share**: Tell others about the plugin

### Development Setup

1. Clone the repository
2. Open `example.html` in a browser
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📚 Additional Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Accessibility Initiative](https://www.w3.org/WAI/)
- [Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Color Blindness Information](https://www.colourblindawareness.org/)

## 📄 License

Free to use and modify for any purpose.

This means you can:
- ✅ Use it commercially
- ✅ Modify it
- ✅ Distribute it
- ✅ Use it privately
- ✅ Use it in open source projects
- ✅ Use it in proprietary projects

No attribution required, but appreciated!

## 👨‍💻 Credits

**Created by:** [AirforceRP](https://github.com/airforcerp)

**GitHub Repository:** [https://github.com/airforcerp/Website-Accessibility-Widget](https://github.com/airforcerp/Website-Accessibility-Widget)

## 📧 Support

For issues, questions, or suggestions:

- **GitHub Issues**: [Open an issue](https://github.com/airforcerp/Website-Accessibility-Widget/issues)
- **Email**: accessibility@airforcerp.com
- **Documentation**: Check the code comments in the JavaScript file for detailed explanations

## 🌟 Star the Project

If you find this plugin useful, please consider giving it a star on GitHub! It helps others discover the project.

---

**Thank you for using the Accessibility Widget!**

Making the web accessible for everyone, one website at a time. 🌐♿

---

*Last updated: November 2025*



