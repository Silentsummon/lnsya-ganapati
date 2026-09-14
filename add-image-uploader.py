#!/usr/bin/env python3
path = "src/pages/Dashboard.jsx"

with open(path, "r") as f:
    content = f.read()

marker = "function DayEditorCard({ day, isOpen, onToggle, updatePoojaDay, updateEvents }) {"

component = """function ImageUploader({ imageUrl, onUploaded }) {
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
}

"""

if marker not in content:
    print("WARNING: insertion point not found, no changes made.")
elif "function ImageUploader" in content:
    print("ImageUploader already exists, skipping insertion.")
else:
    content = content.replace(marker, component + marker)
    with open(path, "w") as f:
        f.write(content)
    print("ImageUploader component added.")
