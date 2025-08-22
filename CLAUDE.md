# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Baukalkultor - A comprehensive renovation cost calculator built with React that helps users calculate material costs, labor costs, and opportunity costs for home renovation projects.

## Project Structure

```
Baukalkultor/
├── main.js         # React component for renovation calculator (RenovationCalculator)
└── CLAUDE.md       # This file
```

## Application Features

The RenovationCalculator component provides:

- **Room Management**: Add, edit, and remove rooms with customizable parameters
- **Cost Categories**:
  - Material costs (flooring, wall paint/tiles, grout)
  - Labor costs (heating, electrical, plumbing)
  - Opportunity costs (self-work valuation)
  - Disposal costs (containers, special waste)
- **Input Modes**: 
  - Direct area input (floor area, wall area)
  - Calculated from room dimensions (length × width × height)
- **Room Types**: Living room, bedroom, kitchen, bathroom, hallway, children's room, office, basement, custom
- **Project Settings**: Global settings for the entire renovation project
- **Cost Summary**: Detailed breakdown showing bank-relevant costs vs. total project value

## Technical Details

- **Framework**: React with Hooks (useState, useEffect)
- **UI Library**: Uses Lucide React for icons
- **Styling**: Tailwind CSS classes for responsive design
- **State Management**: Local component state with useState
- **Language**: German UI text (can be internationalized)

## Key Components and Functions

- `RenovationCalculator`: Main component at main.js:4
- `getRoomAreas()`: Calculates room areas based on input mode at main.js:199
- `calculateRoomCosts()`: Computes costs for individual rooms at main.js:285
- `updateProjectSettings()`: Updates global project settings at main.js:260
- `updateRoomSetting()`: Updates room-specific settings at main.js:267

## Development Commands

Since this is a standalone React component without build configuration:

```bash
# To use this component, you'll need to set up a React project:
npx create-react-app renovation-calculator
cd renovation-calculator

# Install required dependencies
npm install lucide-react

# Replace src/App.js with the RenovationCalculator component
# Add Tailwind CSS for styling
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Future Enhancements

Consider implementing:
1. Data persistence (localStorage or backend API)
2. PDF/Excel export functionality
3. Cost comparison between different scenarios
4. Integration with material supplier APIs for real-time pricing
5. Multi-language support
6. Unit tests for calculation functions