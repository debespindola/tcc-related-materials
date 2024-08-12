
import axios from 'axios'
import fs from 'fs-extra'

const baseUrl = 'https://api.assemblyai.com/v2'

const headers = {
  authorization: "YOUR_API_KEY",
}

const path = './audio.m4a'
const audioData = await fs.readFile(path)
const uploadResponse = await axios.post(`${baseUrl}/upload`, audioData, {
  headers
})
const uploadUrl = uploadResponse.data.upload_url;

const data = {
  audio_url: uploadUrl,
  language_code: 'pt'
}

const url = `${baseUrl}/transcript`
const response = await axios.post(url, data, { headers: headers })

const transcriptId = response.data.id
const pollingEndpoint = `${baseUrl}/transcript/${transcriptId}`

while (true) {
  const pollingResponse = await axios.get(pollingEndpoint, {
    headers: headers
  })
  const transcriptionResult = pollingResponse.data

  if (transcriptionResult.status === 'completed') {
    fs.writeFileSync('./renata.txt', transcriptionResult.text)

    break
  } else if (transcriptionResult.status === 'error') {
    throw new Error(`Transcription failed: ${transcriptionResult.error}`)
  } else {
    await new Promise((resolve) => setTimeout(resolve, 3000))
  }
}