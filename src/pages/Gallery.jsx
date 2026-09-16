import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'

const DAY_LABELS = {
  1: '14th Sept 2026, Monday',
  2: '15th Sept 2026, Tuesday',
  3: '16th Sept 2026, Wednesday',
  4: '17th Sept 2026, Thursday',
  5: '18th Sept 2026, Friday',
  6: '19th Sept 2026, Saturday',
  7: '20th Sept 2026, Sunday',
  8: '21st Sept 2026, Monday',
  9: '22nd Sept 2026, Tuesday',
  10: '23rd Sept 2026, Wednesday',
  11: '24th Sept 2026, Thursday',
}

async function downloadFile(url, filename) {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(objectUrl)
  } catch (err) {
    console.error('Download failed:', err)
  }
}

function Thumbnail({ item, onTap }) {
  return (
    <div
      onClick={() => onTap(item)}
      style={{
        position: 'relative',
        width: '90px',
        height: '90px',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        border: '1px solid #eee',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {item.media_type === 'video' ? (
        <video
          src={item.media_url}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          muted
        />
      ) : (
        <img
          src={item.media_url}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}

      {item.media_type === 'video' && (
        <div
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: 'rgba(0,0,0,0.6)',
            color: '#fff',
            fontSize: '0.6rem',
            padding: '1px 5px',
            borderRadius: '4px',
          }}
        >
          ▶
        </div>
      )}
    </div>
  )
}

export default function Gallery() {
  const navigate = useNavigate()
  const { galleryItems, fetchGalleryItems } = useAppStore()

  const [openDay, setOpenDay] = useState(null)
  const [previewItem, setPreviewItem] = useState(null)

  useEffect(() => {
    fetchGalleryItems()
  }, [])

  const grouped = {}

  galleryItems.forEach(item => {
    if (!grouped[item.day_number]) {
      grouped[item.day_number] = []
    }
    grouped[item.day_number].push(item)
  })

  const dayNumbers = Object.keys(DAY_LABELS)
    .map(Number)
    .sort((a, b) => a - b)

  const currentItems = previewItem
    ? grouped[previewItem.day_number] || []
    : []

  const currentIndex = previewItem
    ? currentItems.findIndex(item => item.id === previewItem.id)
    : -1

  const showPrevious = () => {
    if (!currentItems.length) return

    const index =
      currentIndex <= 0
        ? currentItems.length - 1
        : currentIndex - 1

    setPreviewItem(currentItems[index])
  }

  const showNext = () => {
    if (!currentItems.length) return

    const index =
      currentIndex >= currentItems.length - 1
        ? 0
        : currentIndex + 1

    setPreviewItem(currentItems[index])
  }

  const handleDownload = () => {
    if (!previewItem) return

    const extension =
      previewItem.media_type === 'video' ? 'mp4' : 'jpg'

    downloadFile(
      previewItem.media_url,
      `day${previewItem.day_number}-${previewItem.id}.${extension}`
    )
  }

  return (
    <div
      className="container"
      style={{
        paddingTop: '5rem',
        paddingBottom: '3rem',
      }}
    >
      <div className="back-btn" onClick={() => navigate('/')}>
        <span className="back-circle">&#8592;</span> Back
      </div>

      <h1
        style={{
          color: '#fff',
          fontSize: '1.6rem',
          marginBottom: '1.5rem',
        }}
      >
        Gallery
      </h1>

      {dayNumbers.map(dayNum => {
        const items = grouped[dayNum] || []
        const isOpen = openDay === dayNum

        return (
          <div
            className="day-card"
            key={dayNum}
            style={{ marginBottom: '0.9rem' }}
          >
            <button
              className="day-toggle-header"
              style={{ width: '100%' }}
              onClick={() => setOpenDay(isOpen ? null : dayNum)}
            >
              <div>
                <div
                  className="day-number-title"
                  style={{ color: '#1a1a1a' }}
                >
                  Day {dayNum}
                </div>

                <div
                  style={{
                    color: '#6b6b6b',
                    fontSize: '0.78rem',
                  }}
                >
                  {DAY_LABELS[dayNum]}
                </div>
              </div>

              <span
                className="day-chevron-big"
                style={{
                  color: '#1a1a1a',
                  transform: isOpen ? 'rotate(90deg)' : 'none',
                }}
              >
                &#8250;
              </span>
            </button>

            {isOpen && (
              <div style={{ padding: '0 1.1rem 1.1rem' }}>
                {items.length === 0 && (
                  <p
                    style={{
                      color: '#9a9a9a',
                      fontSize: '0.85rem',
                    }}
                  >
                    No photos or videos yet.
                  </p>
                )}

                {items.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    {items.map(item => (
                      <Thumbnail
                        key={item.id}
                        item={item}
                        onTap={setPreviewItem}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {previewItem && (
        <div
          onClick={() => setPreviewItem(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          {/* Back */}
          <button
            onClick={() => setPreviewItem(null)}
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              fontSize: '1.5rem',
              cursor: 'pointer',
              zIndex: 3,
            }}
          >
            &#8592;
          </button>

          {/* Previous */}
          {currentItems.length > 1 && (
            <button
              onClick={e => {
                e.stopPropagation()
                showPrevious()
              }}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                fontSize: '2rem',
                cursor: 'pointer',
                zIndex: 2,
              }}
            >
              &#8592;
            </button>
          )}

          {/* Next */}
          {currentItems.length > 1 && (
            <button
              onClick={e => {
                e.stopPropagation()
                showNext()
              }}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                fontSize: '2rem',
                cursor: 'pointer',
                zIndex: 2,
              }}
            >
              &#8594;
            </button>
          )}

          <div
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '95vw',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            {previewItem.media_type === 'video' ? (
              <video
                src={previewItem.media_url}
                controls
                autoPlay
                style={{
                  maxWidth: '85vw',
                  maxHeight: '75vh',
                  borderRadius: '0.6rem',
                }}
              />
            ) : (
              <img
                src={previewItem.media_url}
                alt=""
                style={{
                  maxWidth: '85vw',
                  maxHeight: '75vh',
                  objectFit: 'contain',
                  borderRadius: '0.6rem',
                }}
              />
            )}

            <button
              className="btn"
              onClick={handleDownload}
              style={{ minWidth: '150px' }}
            >
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
