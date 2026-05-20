import { createClient } from './supabase/client'

export async function uploadFiles(files: File[], bucket: string): Promise<string[]> {
  const supabase = createClient()
  const uploadPromises = files.map(async (file) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `uploads/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return publicUrl
  })

  return Promise.all(uploadPromises)
}
