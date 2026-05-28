const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure temp directory exists
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Cleanup old files periodically
setInterval(() => {
  fs.readdir(tempDir, (err, files) => {
    if (err) return;
    const now = Date.now();
    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        if (now - stats.mtime.getTime() > 60000) { // Delete files older than 1 minute
          fs.unlink(filePath, () => {});
        }
      });
    });
  });
}, 30000);

// Multer configuration
const storage = multer.diskStorage({
  destination: tempDir,
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /audio|video/;
    if (allowedTypes.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio and video files are allowed'));
    }
  }
});

// Helper function to identify song with AudD
async function identifyWithAudD(filePath) {
  let processedPath = filePath;
  
  // Convert webm/mp4 to mp3 for better AudD compatibility
  if (filePath.endsWith('.webm') || filePath.endsWith('.mp4')) {
    const mp3Path = filePath.replace(/\.[^.]+$/, '.mp3');
    try {
      console.log('Converting to mp3:', filePath);
      await execPromise(`ffmpeg -i "${filePath}" -vn -ar 44100 -ac 2 -b:a 192k -f mp3 "${mp3Path}" -y 2>&1`);
      
      // Verify conversion worked
      if (fs.existsSync(mp3Path)) {
        const stats = fs.statSync(mp3Path);
        console.log('Converted to mp3:', mp3Path, 'Size:', stats.size);
        if (stats.size > 1000) { // At least 1KB
          processedPath = mp3Path;
        } else {
          console.log('Converted file too small, using original');
        }
      }
    } catch (convError) {
      console.error('Conversion failed:', convError.message);
      console.log('Using original file instead');
    }
  }

  const formData = new FormData();
  formData.append('file', fs.createReadStream(processedPath));
  formData.append('api_token', process.env.AUDD_API_KEY);
  formData.append('return', 'apple_music,spotify');

  console.log('Sending to AudD:', processedPath);
  
  try {
    const response = await axios.post('https://api.audd.io/', formData, {
      headers: {
        ...formData.getHeaders()
      },
      maxBodyLength: Infinity,
      timeout: 30000
    });

    console.log('AudD response:', JSON.stringify(response.data));
    
    // Cleanup converted file
    if (processedPath !== filePath && fs.existsSync(processedPath)) {
      fs.unlink(processedPath, () => {});
    }
    
    return response.data;
  } catch (error) {
    console.error('AudD API error:', error.message);
    if (error.response) {
      console.error('AudD response data:', error.response.data);
    }
    
    // Cleanup on error
    if (processedPath !== filePath && fs.existsSync(processedPath)) {
      fs.unlink(processedPath, () => {});
    }
    
    throw error;
  }
}

// Helper function to download video from URL
async function downloadVideo(url) {
  const outputPath = path.join(tempDir, `${uuidv4()}.mp4`);
  
  // Validate URL first
  try {
    new URL(url);
  } catch {
    throw new Error('Invalid URL format');
  }
  
  try {
    // Try yt-dlp with additional options for TikTok/Instagram
    const command = `yt-dlp -o "${outputPath}" --no-playlist -f "best[filesize<50M]/best" --no-check-certificates --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "${url}"`;
    console.log('Running command:', command);
    
    const { stdout, stderr } = await execPromise(command);
    console.log('yt-dlp stdout:', stdout);
    if (stderr) console.log('yt-dlp stderr:', stderr);
    
    // Check if file was created
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log('Video downloaded successfully:', outputPath, 'Size:', stats.size);
      if (stats.size > 0) {
        return outputPath;
      }
    }
    throw new Error('Download completed but file is empty or not found');
  } catch (error) {
    console.error('yt-dlp error (attempt 1):', error.message);
    
    // Fallback: try with just best format
    try {
      const fallbackCommand = `yt-dlp -o "${outputPath}" --no-playlist -f "best" --no-check-certificates "${url}"`;
      console.log('Running fallback command:', fallbackCommand);
      
      const { stdout, stderr } = await execPromise(fallbackCommand);
      console.log('yt-dlp stdout (fallback):', stdout);
      if (stderr) console.log('yt-dlp stderr (fallback):', stderr);
      
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        if (stats.size > 0) {
          console.log('Video downloaded successfully (fallback):', outputPath, 'Size:', stats.size);
          return outputPath;
        }
      }
      throw new Error('Fallback download completed but file is empty');
    } catch (error2) {
      console.error('yt-dlp error (attempt 2):', error2.message);
      
      // Check if it's a TikTok/Instagram specific error
      if (error2.message.includes('blocked') || error2.message.includes('403') || error2.message.includes('Unauthorized')) {
        throw new Error('This platform is blocking downloads. Try using the Record or Upload feature instead.');
      }
      
      throw new Error('Could not download video. The link might be private, expired, or unsupported.');
    }
  }
}

// Helper function to extract audio from video
async function extractAudio(videoPath) {
  const audioPath = videoPath.replace('.mp4', '.mp3');
  
  try {
    await execPromise(`ffmpeg -i "${videoPath}" -vn -ar 44100 -ac 2 -b:a 192k "${audioPath}" -y`);
    return audioPath;
  } catch (error) {
    throw new Error('Could not extract audio from video');
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Identify from file upload
app.post('/api/identify', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Processing file:', req.file.originalname, 'Type:', req.file.mimetype, 'Size:', req.file.size);
    
    try {
      const result = await identifyWithAudD(req.file.path);
      
      // Cleanup
      fs.unlink(req.file.path, () => {});

      if (result.result) {
        res.json({
          success: true,
          song: {
            title: result.result.title,
            artist: result.result.artist,
            album: result.result.album,
            release_date: result.result.release_date,
            apple_music_url: result.result.apple_music?.url,
            spotify_url: result.result.spotify?.external_urls?.spotify,
            song_link: result.result.song_link
          }
        });
      } else {
        console.log('AudD returned no result:', result);
        res.status(404).json({ 
          success: false, 
          error: 'Could not identify this song. Try: 1) Recording louder/clearer audio 2) A different song 3) Reducing background noise' 
        });
      }
    } catch (auddError) {
      console.error('AudD API error:', auddError.response?.data || auddError.message);
      // Cleanup
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      res.status(500).json({ 
        success: false, 
        error: auddError.response?.data?.error || 'Failed to identify song - API error' 
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    
    // Cleanup on error
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
});

// Identify from URL (TikTok, Instagram, YouTube)
app.post('/api/identify-from-url', async (req, res) => {
  let videoPath = null;
  let audioPath = null;

  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log('Downloading from URL:', url);

    // Download video
    videoPath = await downloadVideo(url);
    console.log('Video downloaded:', videoPath);

    // Extract audio
    audioPath = await extractAudio(videoPath);
    console.log('Audio extracted:', audioPath);

    // Identify song
    const result = await identifyWithAudD(audioPath);

    // Cleanup
    if (videoPath) fs.unlink(videoPath, () => {});
    if (audioPath) fs.unlink(audioPath, () => {});

    if (result.result) {
      res.json({
        success: true,
        song: {
          title: result.result.title,
          artist: result.result.artist,
          album: result.result.album,
          release_date: result.result.release_date,
          apple_music_url: result.result.apple_music?.url,
          spotify_url: result.result.spotify?.external_urls?.spotify,
          song_link: result.result.song_link
        }
      });
    } else {
      res.status(404).json({ 
        success: false, 
        error: 'Could not identify song from this video' 
      });
    }
  } catch (error) {
    console.error('URL identify error:', error.message);
    
    // Cleanup on error
    if (videoPath && fs.existsSync(videoPath)) fs.unlink(videoPath, () => {});
    if (audioPath && fs.existsSync(audioPath)) fs.unlink(audioPath, () => {});
    
    // Provide user-friendly error message
    let errorMessage = error.message || 'Failed to process URL';
    
    // Check if it's a platform blocking error
    if (errorMessage.includes('blocked') || errorMessage.includes('login required') || errorMessage.includes('rate-limit')) {
      errorMessage = 'Instagram/TikTok are blocking video downloads. Please use the Record feature instead, or download the video and upload it directly.';
    }
    
    res.status(500).json({ 
      success: false, 
      error: errorMessage 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    success: false, 
    error: error.message || 'Internal server error' 
  });
});

app.listen(PORT, () => {
  console.log(`🎵 SoundSnap API server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});
