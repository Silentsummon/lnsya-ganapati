#!/usr/bin/env python3
path = "src/pages/Dashboard.jsx"

with open(path, "r") as f:
    content = f.read()

old = """function ImageUploader({ imageUrl, onUploaded }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }

    setError('')
    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `announcement-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('announcement-images')
        .upload(fileName, file)

      if (uploadError) {
        setError('Upload failed: ' + uploadError.message)
        setUploading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('announcement-images')
        .getPublicUrl(fileName)

      onUploaded(urlData.publicUrl)
    } catch (err) {
      setError('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="section-box" style={{ marginBottom: '1.25rem' }}>
      <div className="section-label">Announcement Image</div>
      <input
        className="mini-input"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
      />
      {uploading && <div style={{ marginTop: '0.5rem' }}>Uploading...</div>}
      {error && <div style={{ marginTop: '0.5rem', color: 'red' }}>{error}</div>}
      {imageUrl && !uploading && (
        <div style={{ marginTop: '0.75rem' }}>
          <img src={imageUrl} alt="Announcement preview" style={{ maxWidth: '100%', borderRadius: '8px' }} />
        </div>
      )}
    </div>
  )
}"""

new = """function ImageUploader({ imageUrl, mediaType, onUploaded }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mp4')

    if (!isImage && !isVideo) {
      setError('Please select an image or video (mp4) file.')
      return
    }

    setError('')
    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `announcement-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('announcement-images')
        .upload(fileName, file)

      if (uploadError) {
        setError('Upload failed: ' + uploadError.message)
        setUploading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('announcement-images')
        .getPublicUrl(fileName)

      onUploaded(urlData.publicUrl, isVideo ? 'video' : 'image')
    } catch (err) {
      setError('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="section-box" style={{ marginBottom: '1.25rem' }}>
      <div className="section-label">Announcement Image or Video</div>
      <input
        className="mini-input"
        type="file"
        accept="image/*,video/mp4"
        onChange={handleFileSelect}
        disabled={uploading}
      />
      {uploading && <div style={{ marginTop: '0.5rem' }}>Uploading...</div>}
      {error && <div style={{ marginTop: '0.5rem', color: 'red' }}>{error}</div>}
      {imageUrl && !uploading && (
        <div style={{ marginTop: '0.75rem' }}>
          {mediaType === 'video' ? (
            <video src={imageUrl} controls style={{ maxWidth: '100%', borderRadius: '8px' }} />
          ) : (
            <img src={imageUrl} alt="Announcement preview" style={{ maxWidth: '100%', borderRadius: '8px' }} />
          )}
        </div>
      )}
    </div>
  )
}"""

if old not in content:
    print("WARNING: exact ImageUploader block not found, no changes made.")
else:
    content = content.replace(old, new)
    with open(path, "w") as f:
        f.write(content)
    print("ImageUploader updated to support video.")
