import {
  ANNOTATION_TAGS,
  type Annotation,
  type PageAnnotationsStore,
  type TargetSnapshot
} from "~src/features/annotations/types"

export const PAGE_ANNOTATIONS_STORAGE_PREFIX = "annotations:"
const PAGE_ANNOTATIONS_STORE_VERSION = 1
const SUPPORTED_PAGE_PROTOCOLS = new Set(["http:", "https:", "file:"])

export interface SaveAnnotationInput {
  id?: string
  target: TargetSnapshot
  tag: Annotation["tag"]
  feedback: string
}

const getDefaultBaseUrl = () => {
  if (typeof location !== "undefined" && location.href) {
    return location.href
  }

  return "https://example.invalid/"
}

const resolveInputUrl = (input?: string | URL) => {
  if (input instanceof URL) {
    return input
  }

  return new URL(input ?? getDefaultBaseUrl(), getDefaultBaseUrl())
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value)

const isValidTargetSnapshot = (value: unknown): value is TargetSnapshot => {
  if (!isRecord(value) || !isRecord(value.rect)) {
    return false
  }

  const rect = value.rect

  return (
    isFiniteNumber(rect.top) &&
    isFiniteNumber(rect.left) &&
    isFiniteNumber(rect.width) &&
    isFiniteNumber(rect.height) &&
    (typeof value.selector === "string" || value.selector === null) &&
    (typeof value.label === "string" || value.label === null) &&
    (typeof value.contextText === "string" || value.contextText === null)
  )
}

const toIsoTimestamp = (value: unknown, fallbackValue: string) => {
  if (typeof value !== "string") {
    return fallbackValue
  }

  const parsed = Date.parse(value)

  return Number.isNaN(parsed) ? fallbackValue : new Date(parsed).toISOString()
}

const createAnnotationId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `annotation_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

const getStorageArea = () => {
  if (typeof chrome === "undefined" || !chrome.storage?.local) {
    throw new Error("chrome.storage.local is not available in this context")
  }

  return chrome.storage.local
}

const annotationTags = new Set<string>(ANNOTATION_TAGS)

const isAnnotationTag = (value: unknown): value is Annotation["tag"] =>
  typeof value === "string" && annotationTags.has(value)

const sanitizeAnnotation = (value: unknown): Annotation | null => {
  if (!isRecord(value) || typeof value.id !== "string" || !isValidTargetSnapshot(value.target)) {
    return null
  }

  const feedback = typeof value.feedback === "string" ? value.feedback : ""
  const tag = isAnnotationTag(value.tag) ? value.tag : null
  const createdAtFallback = new Date().toISOString()
  const createdAt = toIsoTimestamp(value.createdAt, createdAtFallback)
  const updatedAt = toIsoTimestamp(value.updatedAt, createdAt)

  return {
    id: value.id,
    target: value.target,
    tag,
    feedback,
    createdAt,
    updatedAt
  }
}

const sanitizeStore = (value: unknown, pageUrl: string): PageAnnotationsStore => {
  const pageKey = getPageStorageKey(pageUrl)

  if (!pageKey) {
    throw new Error(`Cannot derive page storage key for ${pageUrl}`)
  }

  const emptyStore = createEmptyPageAnnotationsStore(pageUrl)

  if (!isRecord(value)) {
    return emptyStore
  }

  const annotations = Array.isArray(value.annotations)
    ? value.annotations
        .map((annotation) => sanitizeAnnotation(annotation))
        .filter((annotation): annotation is Annotation => annotation !== null)
    : []

  const updatedAt = toIsoTimestamp(value.updatedAt, emptyStore.updatedAt)

  return {
    version: PAGE_ANNOTATIONS_STORE_VERSION,
    pageKey,
    pageUrl,
    annotations,
    updatedAt
  }
}

const assertExactIdSet = (annotations: Annotation[], idsInOrder: string[]) => {
  const currentIds = annotations.map((annotation) => annotation.id)
  const currentIdSet = new Set(currentIds)
  const nextIdSet = new Set(idsInOrder)

  if (currentIds.length !== idsInOrder.length || nextIdSet.size !== idsInOrder.length) {
    throw new Error("Reorder input must include each annotation id exactly once")
  }

  for (const id of idsInOrder) {
    if (!currentIdSet.has(id)) {
      throw new Error(`Unknown annotation id in reorder input: ${id}`)
    }
  }

  if (currentIdSet.size !== nextIdSet.size) {
    throw new Error("Reorder input must exactly match existing annotation ids")
  }
}

export const normalizePageUrl = (input?: string | URL): string | null => {
  try {
    const url = resolveInputUrl(input)

    if (!SUPPORTED_PAGE_PROTOCOLS.has(url.protocol)) {
      return null
    }

    const pathname = url.pathname || "/"

    if (url.protocol === "file:") {
      return `file://${pathname}`
    }

    return `${url.origin}${pathname}`
  } catch {
    return null
  }
}

export const getPageStorageKey = (input?: string | URL): string | null => {
  const normalizedPageUrl = normalizePageUrl(input)

  return normalizedPageUrl
    ? `${PAGE_ANNOTATIONS_STORAGE_PREFIX}${normalizedPageUrl}`
    : null
}

export const createEmptyPageAnnotationsStore = (
  input?: string | URL,
  now = new Date().toISOString()
): PageAnnotationsStore => {
  const pageUrl = normalizePageUrl(input)
  const pageKey = getPageStorageKey(input)

  if (!pageUrl || !pageKey) {
    throw new Error(`Cannot create page annotation store for ${String(input ?? getDefaultBaseUrl())}`)
  }

  return {
    version: PAGE_ANNOTATIONS_STORE_VERSION,
    pageKey,
    pageUrl,
    annotations: [],
    updatedAt: now
  }
}

export const readPageAnnotationStore = async (
  input?: string | URL
): Promise<PageAnnotationsStore> => {
  const pageUrl = normalizePageUrl(input)
  const pageKey = getPageStorageKey(input)

  if (!pageUrl || !pageKey) {
    throw new Error(`Cannot read annotations for unsupported page URL: ${String(input ?? getDefaultBaseUrl())}`)
  }

  const storageArea = getStorageArea()
  const storedValue = await storageArea.get(pageKey)

  return sanitizeStore(storedValue[pageKey], pageUrl)
}

export const writePageAnnotationStore = async (store: PageAnnotationsStore): Promise<void> => {
  const pageUrl = normalizePageUrl(store.pageUrl)
  const pageKey = getPageStorageKey(store.pageUrl)

  if (!pageUrl || !pageKey) {
    throw new Error(`Cannot write annotations for unsupported page URL: ${store.pageUrl}`)
  }

  const storageArea = getStorageArea()
  const persistedStore: PageAnnotationsStore = {
    version: PAGE_ANNOTATIONS_STORE_VERSION,
    pageUrl,
    pageKey,
    annotations: store.annotations,
    updatedAt: toIsoTimestamp(store.updatedAt, new Date().toISOString())
  }

  await storageArea.set({ [pageKey]: persistedStore })
}

export const updatePageAnnotationStore = async (
  input: string | URL | undefined,
  updater: (store: PageAnnotationsStore) => PageAnnotationsStore
): Promise<PageAnnotationsStore> => {
  const currentStore = await readPageAnnotationStore(input)
  const nextStore = updater(currentStore)
  const normalizedPageUrl = normalizePageUrl(input ?? currentStore.pageUrl)

  if (!normalizedPageUrl) {
    throw new Error("Cannot update annotations for an unsupported page URL")
  }

  const sanitizedStore = sanitizeStore(
    {
      ...nextStore,
      pageUrl: normalizedPageUrl,
      updatedAt: new Date().toISOString()
    },
    normalizedPageUrl
  )

  await writePageAnnotationStore(sanitizedStore)

  return sanitizedStore
}

export const listPageAnnotations = async (input?: string | URL): Promise<Annotation[]> => {
  const store = await readPageAnnotationStore(input)

  return [...store.annotations]
}

export const savePageAnnotation = async (
  annotation: SaveAnnotationInput,
  input?: string | URL
): Promise<Annotation[]> => {
  const nextStore = await updatePageAnnotationStore(input, (store) => {
    const now = new Date().toISOString()
    const existingAnnotation = annotation.id
      ? store.annotations.find((candidate) => candidate.id === annotation.id)
      : null

    const nextAnnotation: Annotation = {
      id: existingAnnotation?.id ?? annotation.id ?? createAnnotationId(),
      target: annotation.target,
      tag: annotation.tag,
      feedback: annotation.feedback,
      createdAt: existingAnnotation?.createdAt ?? now,
      updatedAt: now
    }

    const nextAnnotations = existingAnnotation
      ? store.annotations.map((candidate) =>
          candidate.id === existingAnnotation.id ? nextAnnotation : candidate
        )
      : [...store.annotations, nextAnnotation]

    return {
      ...store,
      annotations: nextAnnotations,
      updatedAt: now
    }
  })

  return nextStore.annotations
}

export const deletePageAnnotation = async (
  id: string,
  input?: string | URL
): Promise<Annotation[]> => {
  const nextStore = await updatePageAnnotationStore(input, (store) => ({
    ...store,
    annotations: store.annotations.filter((annotation) => annotation.id !== id),
    updatedAt: new Date().toISOString()
  }))

  return nextStore.annotations
}

export const clearPageAnnotations = async (input?: string | URL): Promise<void> => {
  const emptyStore = createEmptyPageAnnotationsStore(input)

  await writePageAnnotationStore(emptyStore)
}

export const reorderPageAnnotations = async (
  idsInOrder: string[],
  input?: string | URL
): Promise<Annotation[]> => {
  const nextStore = await updatePageAnnotationStore(input, (store) => {
    assertExactIdSet(store.annotations, idsInOrder)

    const annotationsById = new Map(store.annotations.map((annotation) => [annotation.id, annotation]))
    const reorderedAnnotations = idsInOrder.map((id) => {
      const annotation = annotationsById.get(id)

      if (!annotation) {
        throw new Error(`Missing annotation for id ${id}`)
      }

      return annotation
    })

    return {
      ...store,
      annotations: reorderedAnnotations,
      updatedAt: new Date().toISOString()
    }
  })

  return nextStore.annotations
}
