# Crucible Hackathon Website

A premium frontend concept for the 2026 Hackathon event. The app is built with React + Vite and uses a mock API layer so the UI is fully demoable without a backend.

## Setup
### Frontend (in one terminal)
```bash
npm install
npm run dev
```

### Backend (in a different terminal)
```bash
cd server
npm install
npm run dev
```

Then open http://localhost:5173

## Mock backend seam

The functions in `src/lib/mockApi.js` are the single integration layer that will later be replaced with real network calls. These are the ones intended to become REST or GraphQL calls:

- `login`
- `register`
- `getRegistrationStatus`
- `getTracks`
- `createTrack`
- `updateTrack`
- `deleteTrack`
- `getAnnouncements`
- `postAnnouncement`
- `uploadSubmission`
- `getMySubmission`
- `getAdminSubmissions`
- `stageShortlist`
- `releaseShortlist`
- `getShortlistStatus`
- `toggleRegistration`
- `changePassword`

The rest of the app reads and writes through this layer, so the UI does not need to change when a real backend is connected.
