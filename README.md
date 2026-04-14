# FarmHelp AI - Agricultural Guidance System

## Overview

FarmHelp is a digital solution helping farmers identify crop issues and receive educational guidance on potential causes and management strategies. This AI-powered web application serves as an educational tool for farmers and agricultural students, providing quick insights into crop symptoms without replacing professional diagnosis.

## Problem Statement

Farmers and agricultural students often face challenges in:
- Identifying crop diseases and pest issues from visual symptoms
- Knowing what to inspect next when problems arise
- Understanding when to escalate issues to agricultural experts
- Accessing reliable, educational information on crop management

## Solution

FarmHelp AI addresses these challenges through:
- **Interactive Symptom Assessment**: Users select crop type, affected plant parts, growth stage, and visible symptoms
- **AI-Powered Summarization**: In-browser NLP model generates educational briefs from symptom descriptions
- **Knowledge Base Integration**: Structured database maps symptoms to potential issue categories and inspection checklists
- **Educational Resources**: Comprehensive guides on common crops, best practices, and prevention strategies

## Key Features

### 1. Smart Diagnosis Tool
- Crop selection (Maize, Tomato, Cassava, Rice, Wheat, etc.)
- Plant part identification (Leaf, Stem, Root, Fruit, Whole plant)
- Growth stage assessment (Seedling, Vegetative, Flowering, Fruiting)
- Symptom checklist (Yellowing, Leaf spots, Wilting, Powdery coating, etc.)
- Free-text description field for additional details

### 2. AI Guidance Generation
- Generates educational summaries of possible issues
- Provides inspection checklists for next steps
- Suggests when to consult agricultural experts
- References included knowledge base sources

### 3. Educational Content
- **Crop Guides**: Detailed information on common crops and their typical issues
- **Best Practices**: Soil health, water management, integrated pest management
- **Prevention Tips**: Seasonal calendars and sustainable farming strategies

### 4. User Experience
- Responsive web design for mobile and desktop use
- Accessibility features (ARIA labels, skip links, keyboard navigation)
- Clear disclaimers about educational nature of guidance

## Technical Implementation

### Frontend
- **HTML5**: Semantic markup with accessibility considerations
- **CSS3**: Responsive design with modern styling
- **Vanilla JavaScript**: ES6 modules for functionality

### AI Component
- **In-browser NLP**: DistilBART model via Transformers.js for summarization
- **Knowledge Base**: JSON-structured database of symptom-issue mappings
- **Retrieval System**: Maps user inputs to relevant guidance categories

### Architecture
- Static web application (no backend required)
- Client-side processing for privacy and offline capability
- Modular code structure for maintainability

## Safety and Limitations

**Important Disclaimers:**
- This application provides **educational guidance only**
- **Does not perform medical diagnosis** on crops
- Results are based on prototype knowledge base and may not be comprehensive
- Always consult qualified agricultural experts for critical decisions
- Not suitable for commercial farming decisions without professional verification

## Supported Crops

Currently supports:
- Maize (Corn)
- Tomato
- Cassava
- Rice
- Wheat
- Sorghum
- Soybean
- Groundnut
- Potato
- Onion
- Banana
- Coffee
- Other (prototype category)

## Project Structure

```
├── index.html          # Main application interface
├── styles.css          # Application styling
├── app.js             # Core application logic and AI integration
├── knowledge-base.json # Symptom-to-guidance knowledge base
└── README.md          # Project documentation
```

## Local Development

To run the application locally:

```bash
# Start a local HTTP server (required for ES modules)
python -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

## Deployment

### GitHub Pages
1. Create a GitHub repository from this project
2. Go to repository Settings → Pages
3. Select "Deploy from a branch"
4. Choose your main branch and root folder
5. Access your deployed application via the provided GitHub Pages URL

## Educational Value

This project demonstrates:
- Practical application of AI in agriculture
- User-centered design for farming communities
- Importance of clear disclaimers in agricultural technology
- Integration of knowledge bases with AI summarization
- Accessibility considerations in web applications

## Future Enhancements

Potential improvements could include:
- Expanded knowledge base with more crops and issues
- Integration with agricultural extension services
- Offline capability for rural areas
- Multi-language support
- Integration with soil sensors and weather data
- Community feedback and validation system

## Contributing

This is an educational prototype. For improvements or feedback, please consult with agricultural extension services or educational institutions.

## License

Educational prototype - not for commercial use without proper validation and expert consultation.

