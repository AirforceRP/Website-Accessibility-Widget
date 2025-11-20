

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Plugin Example - PHP</title>
    
    <!-- Include Boxicons -->
    <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
    
    <!-- Include the plugin CSS -->
    <link rel="stylesheet" href="accessibility-plugin.css">

    
    
    <style>
        /* Example page styles */
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        h1 {
            color: #0066cc;
            border-bottom: 2px solid #0066cc;
            padding-bottom: 10px;
        }
        
        .content {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .button {
            display: inline-block;
            padding: 10px 20px;
            background: #0066cc;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 5px;
        }
        
        .button:hover {
            background: #0052a3;
        }
    </style>
</head>
<body>
    <h1>Accessibility Plugin Example - PHP Page</h1>
    
    <div class="content">
        <h2>Welcome to the Accessibility Plugin Demo</h2>
        <p>
            This is a PHP example page demonstrating the Accessibility Plugin functionality. 
            Look for the accessibility button in the bottom-right corner of the screen.
        </p>
        
        <?php
        // Example PHP content
        $items = [
            'Font size adjustment (75% to 200%)',
            'Contrast modes (Normal, High Contrast, Dark Mode)',
            'Line height customization',
            'Letter spacing options',
            'Font family selection'
        ];
        ?>
        
        <p>The plugin allows users to customize:</p>
        <ul>
            <?php foreach ($items as $item): ?>
                <li><?php echo htmlspecialchars($item); ?></li>
            <?php endforeach; ?>
        </ul>
    </div>
    
    <div class="content">
        <h2>Sample Content</h2>
        <p>
            This content demonstrates how the accessibility plugin works with PHP-generated content.
            All text and elements on the page will be affected by the accessibility settings.
        </p>
        <p>
            The plugin uses localStorage to remember user preferences, so settings will persist
            across page reloads and visits.
        </p>
        <a href="#" class="button">Sample Button</a>
        <a href="#" class="button">Another Button</a>
    </div>
    
    <!-- Include the configuration file (optional - uses defaults if omitted) -->
    <script src="accessibility-config.js"></script>
    
    <!-- Include the plugin JavaScript (must be loaded last) -->
    <script src="accessibility-plugin.js"></script>
</body>
</html>

