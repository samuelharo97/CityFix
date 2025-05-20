# CityFix

CityFix is a mobile application that allows citizens to report urban infrastructure problems to the competent authorities.

## Features

- User authentication (login/register with email or Google)
- Home screen showing recent or nearby reports
- Form to create a new report with:
  - Title
  - Description
  - Category (Lighting, Potholes, Trash, etc.)
  - Upload of photos/videos
  - Location via GPS
- My reports screen to track the status of submissions

## Technologies Used

- React Native
- Expo
- TypeScript
- React Navigation
- React Native Paper
- Expo Location
- Expo Image Picker
- Expo Camera
- Expo Auth Session

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- Expo CLI
- Expo Go app on mobile device

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/cityfix.git
cd cityfix
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the project:

```bash
npm start
# or
yarn start
```

4. Use the Expo Go app to scan the QR code and test the application

## Project Structure

```
src/
  ├── components/     # Reusable components
  ├── navigation/     # Navigation configuration
  ├── screens/        # Application screens
  ├── hooks/          # Hooks
  ├── services/       # Services and APIs
  ├── types/          # TypeScript type definitions
  ├── utils/          # Utility functions
```

## Contribution

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
