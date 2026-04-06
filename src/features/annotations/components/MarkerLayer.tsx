import type { CSSProperties } from "react"

import type { Annotation } from "~src/features/annotations/types"
import {
  Marker,
  type MarkerProps
} from "~src/features/annotations/components/Marker"
import type { ResolvedAnnotation } from "~src/features/annotations/hooks/useMarkerPositions"

const layerStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  pointerEvents: "none"
}

interface MarkerLayerProps {
  activeAnnotationId: string | null
  annotations: ResolvedAnnotation[]
  onEditAnnotation: (annotation: Annotation, anchorRect?: ResolvedAnnotation["rect"]) => void
}

export const MarkerLayer = ({
  activeAnnotationId,
  annotations,
  onEditAnnotation
}: MarkerLayerProps) => {
  return (
    <div aria-hidden style={layerStyle}>
      {annotations.map((resolvedAnnotation) => {
        if (!resolvedAnnotation.markerPosition) {
          return null
        }

        const markerProps: MarkerProps = {
          active: resolvedAnnotation.annotation.id === activeAnnotationId,
          label:
            resolvedAnnotation.displayLabel ??
            resolvedAnnotation.annotation.target.selector ??
            "Annotation target",
          number: resolvedAnnotation.index + 1,
          position: resolvedAnnotation.markerPosition,
          onClick: () =>
            onEditAnnotation(resolvedAnnotation.annotation, resolvedAnnotation.rect)
        }

        return <Marker key={resolvedAnnotation.annotation.id} {...markerProps} />
      })}
    </div>
  )
}
