# FaceTime - Video Calling App

A modern, real-time video calling application built with Next.js 14, TypeScript, and Stream Video SDK. This application allows users to create or join meeting rooms instantly with high-quality video and audio streaming.

## 🚀 Live Demo

[facetime-jet.vercel.app](https://facetime-jet.vercel.app)

## ✨ Features

- **Instant Meetings:** Create or join a meeting simply by entering a unique room code.
- **High-Quality Video & Audio:** Powered by Stream's global edge network.
- **Real-time Controls:**
  - Toggle Microphone (Mute/Unmute)
  - Toggle Camera (Video On/Off)
  - Participant Grid View
  - Leave Call functionality
- **Responsive Design:** Fully responsive UI built with Tailwind CSS, working seamlessly on desktop and mobile.
- **Type Safety:** Built completely with TypeScript for robust and error-free code.
- **Secure Token Generation:** Server-side token generation using Next.js API Routes.

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Video/Audio SDK:** [Stream Video React SDK](https://getstream.io/video/docs/react/)
- **Icons:** [React Icons](https://react-icons.github.io/react-icons/)
- **Deployment:** [Vercel](https://vercel.com/)

## ⚙️ Environment Variables

To run this project locally, you need to set up the following environment variables. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_STREAM_KEY=your_stream_api_key
STREAMSECRET=your_stream_secret_key
