"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {

  const router = useRouter()
  const [meeting, setMeeting] = useState("")
  const handleSubmit = (e) => {
    e.preventDefault()
    if(meeting.trim()) {
    router.push(`/call/${meeting}`)
    }
  }


  return (
    <main className="min-w-screen min-h-screen">
      <div className="flex flex-col items-center gap-5 justify-center h-screen bg-neutral-800/95">
        <div className="flex flex-col items-center gap-10">
          <h1 className="font-bold text-8xl">Video Calling app</h1>
          <span className="text-4xl font-semibold text-neutral-200/60">Please put the meeting code</span>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-4">
        <input onChange={(e)=> setMeeting(e.target.value)} type="text" className="bg-neutral-400 text-3xl text-center shadow-none border-none rounded-2xl focus:outline-2 outline-offset-2 outline-neutral-400"/>
        <button type="submit" disabled={!meeting.trim()} className="bg-neutral-400/60 disabled:cursor-not-allowed hover:bg-neutral-400/50 cursor-pointer py-0.5 w-full rounded-full text-2xl transition-all duration-150">Enter in Call</button>
        </form>
      </div>
    </main>
  );
}