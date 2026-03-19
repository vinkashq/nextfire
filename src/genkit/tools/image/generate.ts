import { bucket } from "@/firebase/server/storage"
import googleImagen from "@/genkit/google/imagen"
import { z } from "genkit"
import { getSharp } from "next/dist/server/image-optimizer"
import parseDataURL from 'data-urls'
import { Vibrant } from 'node-vibrant/node'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { generateId } from "@/firebase/server/firestore"

const colorSwatch = z.object({
  hex: z.string(),
  titleTextColor: z.string(),
  bodyTextColor: z.string(),
})

export const imageGenerateOutputSchema = z.object({
  imageId: z.string(),
  bucketName: z.string(),
  storagePath: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  width: z.number(),
  height: z.number(),
  aspectRatio: z.number(),
  colors: z.object({
    vibrant: colorSwatch.optional(),
    muted: colorSwatch.optional(),
    darkVibrant: colorSwatch.optional(),
    darkMuted: colorSwatch.optional(),
    lightVibrant: colorSwatch.optional(),
    lightMuted: colorSwatch.optional(),
  }).optional()
})

const generateImage = googleImagen.defineTool(
  {
    name: "imageGenerate",
    description: "Generate an image based on a prompt",
    inputSchema: z.object({ prompt: z.string() }),
    outputSchema: imageGenerateOutputSchema
  },
  async ({ prompt }) => {
    const result = await googleImagen.generate({
      prompt,
      config: {
        numberOfImages: 1,
      },
      output: { format: "media" }
    })

    const media = result?.media
    if (!media || !media.url) {
      throw new Error('Image generation failed to return media data.');
    }

    const parsedData = parseDataURL(media.url)

    if (!parsedData) {
      throw new Error('Failed to parse the data URL from image generation.');
    }

    const imageBuffer: Buffer = parsedData.body
    const mimeType = parsedData.mimeType.toString()
    const extension = mimeType.split('/')[1] || "png"

    const imageId = generateId()

    const sharp = getSharp(1)
    const imageMetadata = await sharp(imageBuffer).metadata()
    const { size, width, height } = imageMetadata
    const aspectRatio = width / height

    type ColorSwatch = {
      hex: string;
      titleTextColor: string;
      bodyTextColor: string;
    }

    const getColorSwatch = (color: unknown): ColorSwatch | undefined => {
      if (
        color &&
        typeof color === 'object' &&
        'hex' in color &&
        'titleTextColor' in color &&
        'bodyTextColor' in color
      ) {
        const swatch = color as Record<string, unknown>
        if (
          typeof swatch.hex === 'string' &&
          typeof swatch.titleTextColor === 'string' &&
          typeof swatch.bodyTextColor === 'string'
        ) {
          return {
            hex: swatch.hex,
            titleTextColor: swatch.titleTextColor,
            bodyTextColor: swatch.bodyTextColor,
          }
        }
      }
      return undefined
    }

    // Extract colors using node-vibrant
    let colors: {
      vibrant?: ColorSwatch;
      muted?: ColorSwatch;
      darkVibrant?: ColorSwatch;
      darkMuted?: ColorSwatch;
      lightVibrant?: ColorSwatch;
      lightMuted?: ColorSwatch;
    } = {}

    const tempFilePath = join(tmpdir(), `${imageId}.${extension}`)
    try {
      // node-vibrant v4 requires a file path in Node.js environment
      // Write buffer to temporary file
      await writeFile(tempFilePath, imageBuffer)

      const vibrant = new Vibrant(tempFilePath)
      const palette = await vibrant.getPalette()
      colors = {
        vibrant: getColorSwatch(palette.Vibrant),
        muted: getColorSwatch(palette.Muted),
        darkVibrant: getColorSwatch(palette.DarkVibrant),
        darkMuted: getColorSwatch(palette.DarkMuted),
        lightVibrant: getColorSwatch(palette.LightVibrant),
        lightMuted: getColorSwatch(palette.LightMuted),
      }
    } catch (error) {
      console.warn('Failed to extract colors from image:', error)
    } finally {
      // Clean up temporary file
      try {
        await unlink(tempFilePath)
      } catch (unlinkError) {
        // Ignore cleanup errors - file might not exist or already be deleted
        console.warn('Failed to clean up temporary file:', unlinkError)
      }
    }
    const fileName = `${imageId}.${extension}`
    const storagePath = `images/${fileName}`
    const file = bucket.file(storagePath)

    await file.save(imageBuffer, {
      contentType: mimeType,
      metadata: {
        aspectratio: aspectRatio.toString(),
        width: width?.toString() || '',
        height: height?.toString() || '',
      }
    })

    return {
      imageId,
      bucketName: bucket.name,
      storagePath,
      fileName,
      mimeType,
      aspectRatio,
      size,
      width,
      height,
      colors,
    }
  }
)

export default generateImage
