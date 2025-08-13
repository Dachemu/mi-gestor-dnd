import React, { Suspense, lazy } from 'react'

const iconCache = new Map()

const createLazyIcon = (iconName) => {
  if (!iconCache.has(iconName)) {
    iconCache.set(iconName, lazy(() => 
      import('lucide-react').then(module => ({ 
        default: module[iconName] 
      }))
    ))
  }
  return iconCache.get(iconName)
}

const LazyIcon = ({ name, fallback = '○', ...props }) => {
  const IconComponent = createLazyIcon(name)
  
  return (
    <Suspense fallback={<span style={{ display: 'inline-block', width: '1em', height: '1em', textAlign: 'center' }}>{fallback}</span>}>
      <IconComponent {...props} />
    </Suspense>
  )
}

export default LazyIcon

export const Eye = (props) => <LazyIcon name="Eye" fallback="👁" {...props} />
export const Edit = (props) => <LazyIcon name="Edit" fallback="✏" {...props} />
export const Trash2 = (props) => <LazyIcon name="Trash2" fallback="🗑" {...props} />
export const Link2 = (props) => <LazyIcon name="Link2" fallback="🔗" {...props} />
export const Bold = (props) => <LazyIcon name="Bold" fallback="B" {...props} />
export const Italic = (props) => <LazyIcon name="Italic" fallback="I" {...props} />
export const Underline = (props) => <LazyIcon name="Underline" fallback="U" {...props} />
export const List = (props) => <LazyIcon name="List" fallback="•" {...props} />
export const ListOrdered = (props) => <LazyIcon name="ListOrdered" fallback="1." {...props} />
export const Quote = (props) => <LazyIcon name="Quote" fallback="❝" {...props} />
export const Palette = (props) => <LazyIcon name="Palette" fallback="🎨" {...props} />
export const Download = (props) => <LazyIcon name="Download" fallback="⬇" {...props} />
export const Save = (props) => <LazyIcon name="Save" fallback="💾" {...props} />
export const SearchIcon = (props) => <LazyIcon name="Search" fallback="🔍" {...props} />
export const BackIcon = (props) => <LazyIcon name="ArrowLeft" fallback="←" {...props} />
export const MenuIcon = (props) => <LazyIcon name="Menu" fallback="≡" {...props} />
export const CloseIcon = (props) => <LazyIcon name="X" fallback="✕" {...props} />