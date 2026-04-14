// app/api/voice-dump/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminSupabase } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'
import path from 'path'
import os from 'os'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    console.log('Voice dump request received')

    // Validate API keys are available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not found in environment')
      return NextResponse.json({
        error: 'Service configuration error',
        details: 'OpenAI API key is not configured.'
      }, { status: 500 })
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment')
      return NextResponse.json({
        error: 'Service configuration error',
        details: 'Gemini API key is not configured.'
      }, { status: 500 })
    }

    const { userId } = await auth()
    if (!userId) {
      console.log('Unauthorized: No userId')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      console.log('No audio file provided')
      return NextResponse.json({ error: 'Audio file required' }, { status: 400 })
    }

    // Validate audio file
    if (audioFile.size === 0) {
      console.log('Empty audio file')
      return NextResponse.json({ error: 'Audio file is empty' }, { status: 400 })
    }

    if (audioFile.size < 1000) { // Less than 1KB
      console.log('Audio file too small:', audioFile.size, 'bytes')
      return NextResponse.json({
        error: 'Audio recording too short',
        details: 'Please record for at least a few seconds.'
      }, { status: 400 })
    }

    console.log(`Audio file received: ${audioFile.size} bytes, type: ${audioFile.type}`)

    const supabase = createAdminSupabase()

    // Get user
    const { data: dbUser } = await supabase
      .from('users').select('id').eq('clerk_id', userId).single()

    if (!dbUser) {
      console.log('User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('User found, proceeding with transcription...')

    // Transcribe with Whisper
    console.log('Starting OpenAI transcription...')
    let transcription
    try {
      // Write audio to temporary file for OpenAI SDK
      const tempDir = os.tmpdir()
      const tempFilePath = path.join(tempDir, `voice-dump-${Date.now()}.webm`)
      
      // Convert audio to buffer and write to file
      const audioBuffer = await audioFile.arrayBuffer()
      fs.writeFileSync(tempFilePath, Buffer.from(audioBuffer))
      
      console.log(`Audio written to temp file: ${tempFilePath}`)

      transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1',
        language: 'en',
        response_format: 'json',
      })

      // Clean up temp file
      fs.unlinkSync(tempFilePath)
      console.log('Temp file cleaned up')
    } catch (openaiError: any) {
      console.error('OpenAI transcription error:', openaiError)

      // Handle specific connection errors
      if (openaiError.message?.includes('ECONNRESET') || 
          openaiError.message?.includes('Connection error') ||
          openaiError.code === 'ECONNRESET') {
        return NextResponse.json({
          error: 'Network connection error',
          details: 'Unable to connect to speech recognition service. Please check your internet connection and API key configuration.'
        }, { status: 500 })
      }

      // Provide more specific error messages
      if (openaiError.code === 'invalid_file_format') {
        return NextResponse.json({
          error: 'Audio format not supported',
          details: 'Please try recording again. The audio format may not be compatible.'
        }, { status: 400 })
      }

      if (openaiError.code === 'unauthorized' || openaiError.status === 401) {
        return NextResponse.json({
          error: 'API key invalid',
          details: 'The OpenAI API key is not valid. Please check your configuration.'
        }, { status: 500 })
      }

      return NextResponse.json({
        error: 'Speech transcription failed',
        details: 'Could not process the audio file. Please try recording again with clear speech.'
      }, { status: 500 })
    }

    const transcript = transcription.text
    console.log(`Transcription completed: ${transcript.length} characters`)

    if (!transcript || transcript.trim().length === 0) {
      console.log('Empty transcript received')
      return NextResponse.json({
        transcript: 'No speech detected in the recording.',
        sentiment: 0,
        stress: 0,
        insights: 'Your voice recording was processed, but no clear speech was detected. Try speaking more clearly or closer to the microphone.'
      })
    }

    // Analyze sentiment and stress with Gemini
    console.log('Starting Gemini sentiment analysis...')
    let analysis
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const prompt = `Analyze this voice journal transcript for emotional state and stress levels. Provide:
1. Sentiment score (-1 to 1, where -1 is very negative, 0 neutral, 1 very positive)
2. Stress score (0-100, where 0 is no stress, 100 is extreme stress)
3. Brief insights and suggestions (2-3 sentences)

Transcript: "${transcript}"

Respond in JSON format: {"sentiment": number, "stress": number, "insights": "string"}`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const analysisText = response.text()

      console.log('Gemini response received:', analysisText.substring(0, 200) + '...')

      // Extract JSON from response - Gemini might add extra text
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : analysisText

      // Try to parse the JSON
      analysis = JSON.parse(jsonString)

      // Validate the structure
      if (typeof analysis.sentiment !== 'number' ||
          typeof analysis.stress !== 'number' ||
          typeof analysis.insights !== 'string') {
        throw new Error('Invalid response structure')
      }

      console.log('Gemini analysis successful:', { sentiment: analysis.sentiment, stress: analysis.stress })
    } catch (geminiError: any) {
      console.error('Gemini analysis error:', geminiError)
      // Fallback analysis
      analysis = {
        sentiment: 0,
        stress: 50,
        insights: 'Voice analysis completed. Your thoughts have been recorded and stored for your reference.'
      }
    }

    // Save to database
    console.log('Saving voice dump to database...')
    const { error } = await supabase
      .from('voice_dumps')
      .insert({
        user_id: dbUser.id,
        transcript,
        sentiment_score: analysis.sentiment,
        stress_score: analysis.stress,
        ai_insights: analysis.insights,
      })

    if (error) {
      console.error('Voice dump save error:', error)
      return NextResponse.json({
        error: 'Failed to save voice dump',
        details: 'Your voice was processed but could not be saved. Please try again.'
      }, { status: 500 })
    }

    console.log('Voice dump saved successfully')

    return NextResponse.json({
      transcript,
      sentiment: analysis.sentiment,
      stress: analysis.stress,
      insights: analysis.insights,
    })
  } catch (err: any) {
    console.error('Voice dump route error:', err)
    return NextResponse.json({
      error: 'Internal server error',
      details: 'Something went wrong processing your voice dump. Please try again.'
    }, { status: 500 })
  }
}